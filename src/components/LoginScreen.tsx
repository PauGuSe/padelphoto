import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export function LoginScreen({ users, onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A192F] px-4 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#214ed3] opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{ 
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/1/17/Mejorset_Full_Panoramic_Padel_Court_Delivered_by_SG_Padel.jpg')",
        }}
      >
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden">
        <div className="bg-slate-900/50 border-b border-slate-700/50 p-8 text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
            Padel<span className="text-[#214ed3]">Photo</span>
          </h1>
          <p className="text-slate-300 mt-2 font-medium">Acceso al Sistema</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wide">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-[#214ed3] focus:ring-4 focus:ring-[#214ed3]/20 outline-none transition-all font-medium"
                  placeholder="Ingrese su usuario"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:border-[#214ed3] focus:ring-4 focus:ring-[#214ed3]/20 outline-none transition-all font-medium"
                  placeholder="Ingrese su contraseña"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900/50 border-2 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 text-white text-xl font-black py-4 rounded-2xl transition-all active:scale-95 mt-4 uppercase tracking-wide"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
