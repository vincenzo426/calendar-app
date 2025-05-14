// components/categories/CategoryModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCategory } from '../../contexts/CategoryContext';

// Colori predefiniti per le categorie
const COLOR_OPTIONS = [
  '#ef4444', // Rosso
  '#f97316', // Arancione
  '#f59e0b', // Ambra
  '#10b981', // Verde
  '#3b82f6', // Blu
  '#6366f1', // Indaco
  '#8b5cf6', // Viola
  '#ec4899', // Rosa
  '#6b7280', // Grigio
];

export const CategoryModal = ({ category = null, onClose }) => {
  const { addCategory, updateCategory, deleteCategory } = useCategory();
  
  // State per il form
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  
  // Inizializza il form con i dati della categoria se esiste
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setColor(category.color || COLOR_OPTIONS[0]);
    }
  }, [category]);
  
  // Handler per il submit del form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Costruisci l'oggetto categoria
    const categoryData = {
      name,
      color
    };
    
    if (category) {
      // Modifica categoria esistente
      updateCategory(category.id, categoryData);
    } else {
      // Crea nuova categoria
      addCategory(categoryData);
    }
    
    onClose();
  };
  
  // Handler per eliminare una categoria
  const handleDelete = () => {
    if (category && window.confirm('Sei sicuro di voler eliminare questa categoria? Tutti gli eventi associati a questa categoria perderanno il riferimento.')) {
      deleteCategory(category.id);
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {category ? 'Modifica Categoria' : 'Nuova Categoria'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nome categoria */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Selezione colore */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colore
            </label>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-full h-10 rounded-md border ${
                    color === colorOption ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  aria-label={`Colore ${colorOption}`}
                />
              ))}
            </div>
          </div>
          
          {/* Esempio */}
          <div className="flex items-center p-3 rounded-md" style={{ backgroundColor: `${color}20` }}>
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }} />
            <span className="font-medium">{name || 'Esempio categoria'}</span>
          </div>
          
          {/* Pulsanti azioni */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {category && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition"
              >
                Elimina
              </button>
            )}
            <div className="flex space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {category ? 'Aggiorna' : 'Crea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};