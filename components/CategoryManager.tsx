import React, { useState } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';

interface CategoryManagerProps {
  categories: string[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onUpdate: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onClose, onAdd, onUpdate, onDelete }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ old: string; new: string } | null>(null);

  const handleAdd = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      onAdd(trimmedName);
      setNewCategoryName('');
    } else if (trimmedName) {
      alert(`Category "${trimmedName}" already exists.`);
    }
  };
  
  const handleAddKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handleStartEdit = (category: string) => {
    setEditingCategory({ old: category, new: category });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleSaveEdit = () => {
    if (editingCategory) {
      const trimmedNew = editingCategory.new.trim();
      if (trimmedNew && editingCategory.old !== trimmedNew && !categories.some(c => c.toLowerCase() === trimmedNew.toLowerCase())) {
        onUpdate(editingCategory.old, trimmedNew);
      } else if (categories.some(c => c.toLowerCase() === trimmedNew.toLowerCase() && c.toLowerCase() !== editingCategory.old.toLowerCase())) {
        alert(`Category "${trimmedNew}" already exists.`);
        return; // Don't close editor on failed save
      }
    }
    setEditingCategory(null);
  };
  
  const handleEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onMouseDown={onClose}>
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4" onMouseDown={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-cyan-400">Manage Categories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={handleAddKeyPress}
            placeholder="New category name"
            className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <button onClick={handleAdd} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-white transition-colors">Add</button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {categories.map(category => (
            <div key={category} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
              {editingCategory?.old === category ? (
                <input
                  type="text"
                  value={editingCategory.new}
                  onChange={(e) => setEditingCategory({ ...editingCategory, new: e.target.value })}
                  onKeyDown={handleEditKeyPress}
                  className="flex-grow px-2 py-1 bg-gray-600 border border-gray-500 rounded-md focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              ) : (
                <span className="text-white">{category}</span>
              )}
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {editingCategory?.old === category ? (
                  <>
                    <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300" title="Save"><CheckIcon className="w-5 h-5"/></button>
                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-200" title="Cancel"><XIcon className="w-5 h-5"/></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleStartEdit(category)} className="text-gray-400 hover:text-cyan-400" title="Edit"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(category)} className="text-gray-400 hover:text-red-400" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
