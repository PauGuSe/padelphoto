import React, { useState } from 'react';
import { Checklist } from '../types';
import { X, Plus, CheckCircle2, Circle, Trash2, Edit2, Check } from 'lucide-react';

interface ChecklistModalProps {
  checklist: Checklist;
  onClose: () => void;
  onAdd: (checklistId: string, name: string) => void;
  onUpdate: (checklistId: string, itemId: string, updates: any) => void;
  onDelete: (checklistId: string, itemId: string) => void;
  onUpdateChecklist?: (id: string, title: string) => void;
  onDeleteChecklist?: (id: string) => void;
}

export function ChecklistModal({ checklist, onClose, onAdd, onUpdate, onDelete, onUpdateChecklist, onDeleteChecklist }: ChecklistModalProps) {
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(checklist.title);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAdd(checklist.id, newItemName.trim());
      setNewItemName('');
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate(checklist.id, editingId, { name: editName.trim() });
      setEditingId(null);
    }
  };

  const toggleStatus = (item: any) => {
    onUpdate(checklist.id, item.id, { 
      status: item.status === 'completed' ? 'pending' : 'completed' 
    });
  };

  const pendingItems = checklist.items.filter(i => i.status === 'pending');
  const completedItems = checklist.items.filter(i => i.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          {isEditingTitle ? (
            <div className="flex-1 flex items-center gap-2 mr-4">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editedTitle.trim()) {
                    onUpdateChecklist?.(checklist.id, editedTitle.trim());
                    setIsEditingTitle(false);
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setEditedTitle(checklist.title);
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (editedTitle.trim()) {
                    onUpdateChecklist?.(checklist.id, editedTitle.trim());
                    setIsEditingTitle(false);
                  }
                }}
                className="p-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">{checklist.title}</h3>
                {onUpdateChecklist && (
                  <button 
                    onClick={() => { setEditedTitle(checklist.title); setIsEditingTitle(true); }} 
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onDeleteChecklist && (
                  <button 
                    onClick={() => onDeleteChecklist(checklist.id)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">Registro de items</p>
            </div>
          )}
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Add Form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Nombre del item..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="bg-indigo-600 text-white px-4 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {/* Lists */}
          <div className="space-y-6">
            
            {/* Pending */}
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Pendientes</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{pendingItems.length}</span>
              </h4>
              
              {pendingItems.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No hay items pendientes
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors group">
                      <button 
                        onClick={() => toggleStatus(item)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors shrink-0"
                      >
                        <Circle className="w-6 h-6" />
                      </button>
                      
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          autoFocus
                          className="flex-1 bg-slate-50 border border-indigo-200 rounded px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none"
                        />
                      ) : (
                        <span className="flex-1 font-bold text-slate-700 truncate">{item.name}</span>
                      )}

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(checklist.id, item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed */}
            {completedItems.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Completados</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{completedItems.length}</span>
                </h4>
                <div className="space-y-2">
                  {completedItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                      <button 
                        onClick={() => toggleStatus(item)}
                        className="text-emerald-500 hover:text-slate-400 transition-colors shrink-0"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                      </button>
                      
                      <span className="flex-1 font-bold text-slate-500 line-through truncate">{item.name}</span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onDelete(checklist.id, item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
