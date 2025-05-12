#!/bin/bash

# Script per verificare in dettaglio la configurazione JWT nei servizi

echo "====== Verifica dettagliata della configurazione JWT ======"

# Ottieni i nomi dei pod
AUTH_POD=$(kubectl get pod -l app=auth-service -n calendar-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
EVENT_POD=$(kubectl get pod -l app=event-service -n calendar-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
API_GATEWAY_POD=$(kubectl get pod -l app=api-gateway -n calendar-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$AUTH_POD" ] || [ -z "$EVENT_POD" ] || [ -z "$API_GATEWAY_POD" ]; then
  echo "Errore: Uno o più pod non trovati."
  exit 1
fi

echo "Pod trovati:"
echo "- Auth Service: $AUTH_POD"
echo "- Event Service: $EVENT_POD"
echo "- API Gateway: $API_GATEWAY_POD"

# Funzione per verificare la configurazione JWT in un pod
verify_jwt_config() {
  local pod=$1
  local service_name=$2
  
  echo "===== Configurazione JWT in $service_name ====="
  
  # 1. Verifica le variabili d'ambiente
  echo "1. Variabili d'ambiente JWT:"
  kubectl exec -n calendar-app $pod -- env | grep -i "jwt\|mp.jwt\|smallrye"
  
  # 2. Verifica i file delle chiavi
  echo "2. File delle chiavi JWT:"
  kubectl exec -n calendar-app $pod -- find /deployments -name "*.pem" 2>/dev/null
  
  # 3. Verifica il contenuto dei file
  echo "3. Contenuto della chiave pubblica (prime 3 righe):"
  kubectl exec -n calendar-app $pod -- find /deployments -name "publicKey.pem" -exec head -3 {} \; 2>/dev/null
  
  # 4. Verifica SHA-256 delle chiavi per confronto
  echo "4. SHA-256 della chiave pubblica:"
  kubectl exec -n calendar-app $pod -- find /deployments -name "publicKey.pem" -exec sha256sum {} \; 2>/dev/null
  
  # 5. Verifica la configurazione nell'application.properties
  echo "5. Configurazione JWT in application.properties:"
  kubectl exec -n calendar-app $pod -- cat /deployments/config/application.properties 2>/dev/null | grep -i "jwt\|mp.jwt\|smallrye"
}

# Verifica la configurazione in tutti i servizi
verify_jwt_config $AUTH_POD "Auth Service"
verify_jwt_config $EVENT_POD "Event Service"
verify_jwt_config $API_GATEWAY_POD "API Gateway"

echo "====== Verifica completata ======"
echo "Se i digest SHA-256 delle chiavi pubbliche sono diversi tra i servizi,"
echo "esegui lo script 'sync-jwt-keys.sh' per sincronizzarle."