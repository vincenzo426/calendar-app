#!/bin/bash

# Script per sincronizzare le chiavi JWT tra tutti i servizi

echo "====== Sincronizzazione delle chiavi JWT tra i servizi ======"

# 1. Genera nuove chiavi JWT
echo "1. Generazione di nuove chiavi JWT..."
mkdir -p jwt-keys
openssl genrsa -out jwt-keys/privateKey.pem 2048
openssl rsa -in jwt-keys/privateKey.pem -pubout -out jwt-keys/publicKey.pem

echo "Chiavi JWT generate:"
ls -la jwt-keys/

# 2. Crea un nuovo ConfigMap per le chiavi
echo "2. Creazione di un nuovo ConfigMap per le chiavi JWT..."
kubectl delete configmap jwt-keys -n calendar-app --ignore-not-found=true
kubectl create configmap jwt-keys --from-file=publicKey.pem=jwt-keys/publicKey.pem --from-file=privateKey.pem=jwt-keys/privateKey.pem -n calendar-app

# 3. Verifica che il ConfigMap sia stato creato
echo "3. Verifica del ConfigMap:"
kubectl get configmap jwt-keys -n calendar-app
kubectl describe configmap jwt-keys -n calendar-app

# 4. Assicurati che tutti i pod utilizzino lo stesso ConfigMap
echo "4. Aggiornamento dei pod per utilizzare lo stesso ConfigMap..."

# 4.1 Auth Service
echo "4.1 Aggiornamento dell'Auth Service..."
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

kubectl patch deployment auth-service -n calendar-app --patch "$(cat auth-service-patch.yaml)"

# 4.2 Event Service
echo "4.2 Aggiornamento dell'Event Service..."
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

kubectl patch deployment event-service -n calendar-app --patch "$(cat event-service-patch.yaml)"

# 4.3 API Gateway
echo "4.3 Aggiornamento dell'API Gateway..."
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

kubectl patch deployment api-gateway -n calendar-app --patch "$(cat api-gateway-patch.yaml)"

# 5. Riavvia i pod per applicare le modifiche
echo "5. Riavvio dei pod per applicare le modifiche..."
kubectl rollout restart deployment/auth-service -n calendar-app
kubectl rollout restart deployment/event-service -n calendar-app
kubectl rollout restart deployment/api-gateway -n calendar-app

echo "Attesa per il riavvio dei pod..."
sleep 10
kubectl rollout status deployment/auth-service -n calendar-app
kubectl rollout status deployment/event-service -n calendar-app
kubectl rollout status deployment/api-gateway -n calendar-app

# 6. Verifica che i pod abbiano le chiavi JWT
echo "6. Verifica che i pod abbiano le chiavi JWT..."

# 6.1 Auth Service
AUTH_POD=$(kubectl get pod -l app=auth-service -n calendar-app -o jsonpath='{.items[0].metadata.name}')
echo "Pod Auth Service: $AUTH_POD"
echo "Chiavi JWT nell'Auth Service:"
kubectl exec -n calendar-app $AUTH_POD -- ls -la /deployments/config/jwt/ 2>/dev/null

# 6.2 Event Service
EVENT_POD=$(kubectl get pod -l app=event-service -n calendar-app -o jsonpath='{.items[0].metadata.name}')
echo "Pod Event Service: $EVENT_POD"
echo "Chiavi JWT nell'Event Service:"
kubectl exec -n calendar-app $EVENT_POD -- ls -la /deployments/config/jwt/ 2>/dev/null

# 6.3 API Gateway
API_GATEWAY_POD=$(kubectl get pod -l app=api-gateway -n calendar-app -o jsonpath='{.items[0].metadata.name}')
echo "Pod API Gateway: $API_GATEWAY_POD"
echo "Chiavi JWT nell'API Gateway:"
kubectl exec -n calendar-app $API_GATEWAY_POD -- ls -la /deployments/config/jwt/ 2>/dev/null

echo "====== Sincronizzazione completata ======"
echo "Ora effettua nuovamente il login per ottenere un nuovo token JWT:"
echo "curl -X POST -H 'Content-Type: application/json' -d '{\"username\":\"tuo_username\",\"password\":\"tua_password\"}' http://172.28.238.82/api/auth/login"
echo "Poi testa la creazione di una categoria con il nuovo token."