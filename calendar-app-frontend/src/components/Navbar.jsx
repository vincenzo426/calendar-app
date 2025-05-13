// components/Navbar.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Calendar, User, LogOut } from 'lucide-react';

export const Navbar = ({ onLoginClick, onRegisterClick, onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo e controllo sidebar */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleSidebar}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-800">Calendario</span>
          </div>
        </div>

        {/* Controlli utente */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <span className="ml-2 font-medium">{user.username}</span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center text-gray-700 hover:text-red-600 transition"
              >
                <LogOut size={18} className="mr-1" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-x-2">
              <button 
                onClick={onLoginClick}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
              >
                Accedi
              </button>
              <button 
                onClick={onRegisterClick}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Registrati
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};