import React, { useState } from 'react';
import { User } from '../types';
import { X, UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface UserManagementModalProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  onClose: () => void;
  currentUserId: string;
}

export function UserManagementModal({ users, onAddUser, onDeleteUser, onClose, currentUserId }: UserManagementModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user' | 'viewer'>('user');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    onAddUser({ username, password, role });
    setIsAdding(false);
    setUsername('');
    setPassword('');
    setRole('user');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h2>
              <p className="text-sm text-slate-500">Administra los accesos al sistema</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isAdding ? (
            <form onSubmit={handleAddSubmit} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-2">Nuevo Usuario</h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-sky-600 outline-none"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-sky-600 outline-none"
                  placeholder="Contraseña"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Rol</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user' | 'viewer')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-600 focus:border-sky-600 outline-none"
                >
                  <option value="user">Usuario Creador</option>
                  <option value="viewer">Usuario Visualizador</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-2 text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-sky-600 hover:bg-sky-700 rounded-lg font-medium transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 text-slate-500 rounded-2xl hover:border-sky-500 hover:text-sky-600 transition-colors mb-6 font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Agregar Nuevo Usuario
            </button>
          )}

          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-bold text-slate-700">Usuarios Registrados</h3>
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {user.role === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{user.username}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                {user.id !== currentUserId && (
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
