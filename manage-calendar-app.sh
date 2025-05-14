#!/bin/bash

# Script di gestione completa per l'applicazione Calendar App
# Combina funzionalità di clean-and-deploy.sh, sync-jwt-keys.sh, 
# verify-jwt-configuration.sh e clean-and-deploy-frontend.sh

set -e  # Termina lo script se un comando fallisce

echo "====== GESTIONE COMPLETA CALENDAR APP ======"

# Funzione per la richiesta di conferma
confirm() {
    read -p "$1 [y/N]: " response
    case $response in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Funzione per verificare la configurazione JWT
verify_jwt_config() {
    echo "====== Verifica della configurazione JWT ======"
    
    # Ottieni i nomi dei pod
    AUTH_POD=$(sudo kubectl get pod -l app=auth-service -n calendar-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    EVENT_POD=$(sudo kubectl get pod -l app=event-service -n calendar-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    API_GATEWAY_POD=$(sudo kubectl get pod -l app=api-gateway -n calendar-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [ -z "$AUTH_POD" ] || [ -z "$EVENT_POD" ] || [ -z "$API_GATEWAY_POD" ]; then
        echo "AVVISO: Uno o più pod non trovati. Impossibile verificare la configurazione JWT."
        return 1
    fi
    
    echo "Pod trovati:"
    echo "- Auth Service: $AUTH_POD"
    echo "- Event Service: $EVENT_POD"
    echo "- API Gateway: $API_GATEWAY_POD"
    
    # Verifica la configurazione JWT in ciascun servizio
    for POD in "$AUTH_POD" "$EVENT_POD" "$API_GATEWAY_POD"; do
        SERVICE_NAME=$(sudo kubectl get pod $POD -n calendar-app -o jsonpath='{.metadata.labels.app}')
        echo "===== Configurazione JWT in $SERVICE_NAME ====="
        
        # Verifica SHA-256 delle chiavi pubbliche
        echo "SHA-256 della chiave pubblica:"
        sudo kubectl exec -n calendar-app $POD -- find /deployments -name "publicKey.pem" -exec sha256sum {} \; 2>/dev/null
        
        # Verifica se le chiavi esistono
        KEY_FOUND=$(sudo kubectl exec -n calendar-app $POD -- find /deployments -name "publicKey.pem" 2>/dev/null)
        if [ -z "$KEY_FOUND" ]; then
            echo "ERRORE: Chiave pubblica non trovata in $SERVICE_NAME!"
            KEYS_VALID=false
        fi
    done
    
    echo "====== Verifica JWT completata ======"
}

# Funzione per generare e sincronizzare le chiavi JWT
sync_jwt_keys() {
    echo "====== Sincronizzazione delle chiavi JWT ======"
    
    # 1. Genera nuove chiavi JWT
    echo "1. Generazione di nuove chiavi JWT..."
    mkdir -p jwt-keys
    openssl genrsa -out jwt-keys/privateKey.pem 2048
    openssl rsa -in jwt-keys/privateKey.pem -pubout -out jwt-keys/publicKey.pem
    
    echo "Chiavi JWT generate:"
    ls -la jwt-keys/
    
    # 2. Crea un nuovo ConfigMap per le chiavi
    echo "2. Creazione di un nuovo ConfigMap per le chiavi JWT..."
    sudo kubectl delete configmap jwt-keys -n calendar-app --ignore-not-found=true
    sudo kubectl create configmap jwt-keys --from-file=publicKey.pem=jwt-keys/publicKey.pem --from-file=privateKey.pem=jwt-keys/privateKey.pem -n calendar-app
    
    # 3. Aggiornamento dei pod per utilizzare lo stesso ConfigMap
    echo "3. Aggiornamento dei pod per utilizzare lo stesso ConfigMap..."
    
    # 3.1 Auth Service
    echo "3.1 Aggiornamento dell'Auth Service..."
    cat <<EOF > auth-service-patch.yaml
spec:
  template:
    spec:
      volumes:
      - name: jwt-keys
        configMap:
          name: jwt-keys
      containers:
      - name: auth-service
        volumeMounts:
        - name: jwt-keys
          mountPath: /deployments/config/jwt
        env:
        - name: MP_JWT_VERIFY_PUBLICKEY_LOCATION
          value: /deployments/config/jwt/publicKey.pem
        - name: SMALLRYE_JWT_SIGN_KEY_LOCATION
          value: /deployments/config/jwt/privateKey.pem
        - name: MP_JWT_VERIFY_ISSUER
          value: https://calendar-app.example.com
EOF
    
    sudo kubectl patch deployment auth-service -n calendar-app --patch "$(cat auth-service-patch.yaml)" 2>/dev/null || echo "AVVISO: Impossibile aggiornare auth-service"
    
    # 3.2 Event Service
    echo "3.2 Aggiornamento dell'Event Service..."
    cat <<EOF > event-service-patch.yaml
spec:
  template:
    spec:
      volumes:
      - name: jwt-keys
        configMap:
          name: jwt-keys
      containers:
      - name: event-service
        volumeMounts:
        - name: jwt-keys
          mountPath: /deployments/config/jwt
        env:
        - name: MP_JWT_VERIFY_PUBLICKEY_LOCATION
          value: /deployments/config/jwt/publicKey.pem
        - name: MP_JWT_VERIFY_ISSUER
          value: https://calendar-app.example.com
EOF
    
    sudo kubectl patch deployment event-service -n calendar-app --patch "$(cat event-service-patch.yaml)" 2>/dev/null || echo "AVVISO: Impossibile aggiornare event-service"
    
    # 3.3 API Gateway
    echo "3.3 Aggiornamento dell'API Gateway..."
    cat <<EOF > api-gateway-patch.yaml
spec:
  template:
    spec:
      volumes:
      - name: jwt-keys
        configMap:
          name: jwt-keys
      containers:
      - name: api-gateway
        volumeMounts:
        - name: jwt-keys
          mountPath: /deployments/config/jwt
        env:
        - name: MP_JWT_VERIFY_PUBLICKEY_LOCATION
          value: /deployments/config/jwt/publicKey.pem
        - name: MP_JWT_VERIFY_ISSUER
          value: https://calendar-app.example.com
EOF
    
    sudo kubectl patch deployment api-gateway -n calendar-app --patch "$(cat api-gateway-patch.yaml)" 2>/dev/null || echo "AVVISO: Impossibile aggiornare api-gateway"
    
    echo "====== Sincronizzazione JWT completata ======"
}

# Funzione per il deploy dei backend services
deploy_backend() {
    echo "====== Deployment Backend Services ======"
    
    # Verifica che il namespace esista
    sudo kubectl get namespace calendar-app >/dev/null 2>&1 || sudo kubectl create namespace calendar-app
    
    # Pulizia delle risorse K3s
    echo "1. Pulizia dei deployment precedenti..."
    sudo kubectl delete svc api-gateway auth-service event-service -n calendar-app --ignore-not-found=true
    sudo kubectl delete deployment api-gateway auth-service event-service -n calendar-app --ignore-not-found=true
    
    # Attendi la rimozione completa
    echo "2. Attesa per la rimozione completa dei pod..."
    sleep 5
    
    # Costruisci e importa le immagini Docker
    echo "3. Costruzione e importazione delle immagini Docker..."
    for service in auth-service event-service api-gateway; do
        echo "  - Costruzione immagine per $service..."
        cd $service
        
        # Costruisci l'immagine Docker
        sudo docker build -f src/main/docker/Dockerfile.jvm -t calendar-app/$service:latest .
        
        # Salva ed importa l'immagine in K3s
        sudo docker save calendar-app/$service:latest | sudo k3s ctr images import -
        
        cd ..
    done
    
    # Verifica le immagini in K3s
    echo "4. Verifica immagini importate in K3s:"
    sudo k3s ctr images ls | grep calendar-app
    
    # Applica le configurazioni K8s
    echo "5. Applicazione delle configurazioni K8s..."
    sudo kubectl apply -f k8s/auth-service.yaml
    sudo kubectl apply -f k8s/event-service.yaml
    sudo kubectl apply -f k8s/api-gateway.yaml
    
    echo "6. Attesa per l'avvio dei pod..."
    sleep 10
    sudo kubectl get pods -n calendar-app
    
    echo "====== Backend Services Deployment completato ======"
}

# Funzione per il deploy del frontend
deploy_frontend() {
    echo "====== Deployment Frontend ======"
    
    # Verifica che il namespace esista
    sudo kubectl get namespace calendar-app >/dev/null 2>&1 || sudo kubectl create namespace calendar-app
    
    # Pulizia delle risorse K3s
    echo "1. Pulizia del deployment frontend precedente..."
    sudo kubectl delete svc frontend -n calendar-app --ignore-not-found=true
    sudo kubectl delete deployment frontend -n calendar-app --ignore-not-found=true
    sudo kubectl delete ingress calendar-app-ingress -n calendar-app --ignore-not-found=true
    
    # Attendi la rimozione completa
    echo "2. Attesa per la rimozione completa dei pod..."
    sleep 5
    
    echo "3. Navigazione alla directory del frontend..."
    cd calendar-app-frontend
    
    # Costruisci e importa l'immagine Docker per il frontend
    echo "4. Costruzione immagine per frontend..."
    sudo docker build -t calendar-app/frontend:latest .
    
    # Salva ed importa l'immagine in K3s
    echo "5. Importazione dell'immagine in K3s..."
    sudo docker save calendar-app/frontend:latest | sudo k3s ctr images import -
    
    # Verifica le immagini in K3s
    echo "6. Verifica immagini importate in K3s:"
    sudo k3s ctr images ls | grep calendar-app/frontend
    
    # Torna alla directory principale
    cd ..
    
    # Applica le configurazioni K8s
    echo "7. Applicazione delle configurazioni K8s aggiornate..."
    sudo kubectl apply -f calendar-app-frontend/k8s/frontend.yaml
    
    # Verifica lo stato dei pod e ingress
    echo "8. Verifica stato dei pod e ingress (dopo 10 secondi)..."
    sleep 10
    sudo kubectl get pods -n calendar-app | grep frontend
    sudo kubectl get svc -n calendar-app | grep frontend
    sudo kubectl get ingress -n calendar-app
    
    echo "====== Frontend Deployment completato ======"
}

# Funzione di verifica finale dello stato dell'applicazione
verify_app_status() {
    echo "====== Verifica Stato Applicazione ======"
    
    echo "1. Verifica pod attivi:"
    sudo kubectl get pods -n calendar-app
    
    echo "2. Verifica servizi:"
    sudo kubectl get svc -n calendar-app
    
    echo "3. Verifica ingress:"
    sudo kubectl get ingress -n calendar-app
    
    # Ottieni l'IP dell'ingress
    INGRESS_IP=$(sudo kubectl get ingress calendar-app-ingress -n calendar-app -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Nessun IP trovato")
    
    echo "====== Verifica completata ======"
    echo "L'applicazione dovrebbe essere accessibile all'indirizzo: http://$INGRESS_IP"
    echo "Per effettuare il login, usa il seguente comando:"
    echo "curl -X POST -H 'Content-Type: application/json' -d '{\"username\":\"tuo_username\",\"password\":\"tua_password\"}' http://$INGRESS_IP/api/auth/login"
}

# ===== Menu principale =====
while true; do
    echo
    echo "===== CALENDAR APP MANAGEMENT ====="
    echo "1) Deploy completo (backend + jwt + frontend)"
    echo "2) Deploy solo backend"
    echo "3) Sincronizza chiavi JWT"
    echo "4) Deploy solo frontend"
    echo "5) Verifica configurazione JWT"
    echo "6) Verifica stato applicazione"
    echo "q) Esci"
    echo
    
    read -p "Seleziona un'opzione [1-6/q]: " option
    
    case $option in
        1)
            # Deploy completo
            if confirm "Vuoi procedere con il deploy completo?"; then
                deploy_backend
                sync_jwt_keys
                sudo kubectl rollout restart deployment/auth-service deployment/event-service deployment/api-gateway -n calendar-app
                sleep 10
                deploy_frontend
                verify_app_status
            fi
            ;;
        2)
            # Deploy solo backend
            if confirm "Vuoi procedere con il deploy del backend?"; then
                deploy_backend
            fi
            ;;
        3)
            # Sincronizza chiavi JWT
            if confirm "Vuoi sincronizzare le chiavi JWT?"; then
                sync_jwt_keys
                sudo kubectl rollout restart deployment/auth-service deployment/event-service deployment/api-gateway -n calendar-app
                echo "Riavvio dei pod in corso..."
                sleep 10
                verify_jwt_config
            fi
            ;;
        4)
            # Deploy solo frontend
            if confirm "Vuoi procedere con il deploy del frontend?"; then
                deploy_frontend
            fi
            ;;
        5)
            # Verifica configurazione JWT
            verify_jwt_config
            ;;
        6)
            # Verifica stato applicazione
            verify_app_status
            ;;
        q|Q)
            echo "Uscita dallo script."
            exit 0
            ;;
        *)
            echo "Opzione non valida. Riprova."
            ;;
    esac
done