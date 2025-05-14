// components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm = ({ onClose, onRegisterClick }) => {
  const { login } = useAuth();
  
  // State per il form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Handler per il submit del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      await login(username, password);
      onClose();
    } catch (err) {
      setError('Username o password non validi');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Accedi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Messaggio di errore */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
              <AlertCircle className="flex-shrink-0 mr-2" size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Pulsanti azioni */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-70"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </div>
          
          {/* Link per registrazione */}
          <div className="text-center">
            <span className="text-sm text-gray-600">Non hai un account? </span>
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Registrati
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};