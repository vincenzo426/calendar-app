// src/components/Demo.jsx
import React from 'react';
import { Calendar, Clock, Users, Server, Database } from 'lucide-react';

export const Demo = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center">
          <Calendar className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Calendar App Demo</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Benvenuti nella Demo dell'App Calendario</h2>
            
            <p className="text-lg text-gray-700 mb-8">
              Questa è una versione dimostrativa dell'app calendario che mostra le funzionalità principali senza richiedere un backend reale. 
              Tutti i dati sono simulati e persistono solo nel browser.
            </p>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Funzionalità principali:</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Calendar className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Visualizzazione Calendario</span>
                    <p className="text-gray-600">Visualizza e gestisci i tuoi eventi mensili in un'interfaccia intuitiva</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Clock className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Gestione Eventi</span>
                    <p className="text-gray-600">Crea, modifica ed elimina eventi assegnando date, orari e categorie</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Users className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Account Utente</span>
                    <p className="text-gray-600">Registrati e accedi per sincronizzare i tuoi eventi</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Architettura del progetto completo:</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="h-6 w-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-md mt-0.5 mr-3 flex-shrink-0">F</div>
                  <div>
                    <span className="font-medium">Frontend React</span>
                    <p className="text-gray-600">Interfaccia utente costruita con React, TailwindCSS e componenti personalizzati</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Server className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Microservizi Java con Quarkus</span>
                    <p className="text-gray-600">Backend leggero e veloce con tre servizi separati (API Gateway, Auth Service, Event Service)</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Database className="h-6 w-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Database PostgreSQL</span>
                    <p className="text-gray-600">Database relazionale per l'archiviazione sicura dei dati</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="text-center">
              <button 
                onClick={onStart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md shadow-md transition-colors">
                Inizia la Demo
              </button>
              
              <p className="mt-4 text-sm text-gray-500">
                Nota: In questa demo puoi usare l'utente "demo" con password "password" per accedere, o creare un nuovo account.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Questo progetto è una demo per mostrare le funzionalità di un'applicazione calendario completa.</p>
          <p className="mt-2">
            La versione completa include microservizi backend con Java/Quarkus, database PostgreSQL e deployment con Kubernetes.
          </p>
        </div>
      </footer>
    </div>
  );
};