// components/Sidebar.jsx
import React, { useState } from 'react';
import { Plus, Calendar, Tag, ChevronDown, Circle} from 'lucide-react';
import { useCategory } from '../contexts/CategoryContext';

export const Sidebar = ({ onAddEvent, onAddCategory }) => {
  const { categories } = useCategory();
  const [showCategories, setShowCategories] = useState(true);
  
  // Toggle per la visualizzazione delle categorie
  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Azione principale - Aggiungi evento */}
      <div className="p-4">
        <button 
          onClick={onAddEvent}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
        >
          <Plus size={18} className="mr-2" />
          <span>Nuovo Evento</span>
        </button>
      </div>
      
      {/* Separatore */}
      <div className="border-b border-gray-200 my-2"></div>
      
      {/* Sezione categorie */}
      <div className="flex-1 p-4">
        <div className="mb-2">
          <button 
            onClick={toggleCategories}
            className="flex items-center justify-between w-full text-left p-2 rounded-md hover:bg-gray-100"
          >
            <div className="flex items-center">
              <Tag size={18} className="mr-2 text-gray-600" />
              <span className="font-medium">Categorie</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`transform transition-transform ${
                showCategories ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
        
        {/* Lista categorie */}
        {showCategories && (
          <div className="space-y-1 ml-2">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: category.color || '#c0c0c0' }}
                />
                <span>{category.name}</span>
              </div>
            ))}
            
            {/* Aggiungi categoria */}
            <button 
              onClick={onAddCategory}
              className="flex items-center p-2 text-blue-600 hover:text-blue-800 w-full text-left"
            >
              <Circle size={18} className="mr-2" />
              <span>Aggiungi categoria</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};