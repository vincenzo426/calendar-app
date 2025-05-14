// components/categories/CategoryManager.jsx
import React, { useState } from 'react';
import { X, Edit, Trash2, Tag } from 'lucide-react';
import { useCategory } from '../../contexts/CategoryContext';
import { CategoryModal } from './CategoryModal';
import { useToast } from '../ui/Toast';

export const CategoryManager = ({ onClose }) => {
  const { categories, deleteCategory } = useCategory();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const toast = useToast();

  // Gestisce il click sul pulsante di modifica
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  // Gestisce il click sul pulsante di eliminazione
  const handleDeleteClick = (category) => {
    if (window.confirm(`Sei sicuro di voler eliminare la categoria "${category.name}"? Tutti gli eventi associati a questa categoria perderanno il riferimento.`)) {
      try {
        deleteCategory(category.id);
        toast.success(`Categoria "${category.name}" eliminata con successo!`);
      } catch (error) {
        console.error('Errore nell\'eliminazione della categoria:', error);
        toast.error('Errore durante l\'eliminazione della categoria');
      }
    }
  };

  // Chiude il modal di modifica
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Gestione Categorie</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Lista delle categorie */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Tag className="mx-auto mb-2" size={32} />
              <p>Nessuna categoria disponibile.</p>
              <p className="text-sm">Aggiungi una nuova categoria per organizzare i tuoi eventi.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: category.color || '#c0c0c0' }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded transition"
                      title="Modifica categoria"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="p-1 text-red-600 hover:text-red-800 rounded transition"
                      title="Elimina categoria"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Chiudi
          </button>
        </div>
      </div>

      {/* Modal per la modifica della categoria */}
      {showEditModal && (
        <CategoryModal
          category={selectedCategory}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};