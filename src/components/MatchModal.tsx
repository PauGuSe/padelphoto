import { useState, useRef, useEffect } from 'react';
import { Court, Match } from '../types';
import { X, Camera, Save, Trash2, Clock, Mic } from 'lucide-react';
import { LiveTimer } from './LiveTimer';

interface MatchModalProps {
  court: Court;
  activeMatch?: Match;
  categories: string[];
  colors: string[];
  onClose: () => void;
  onStart: (courtId: number, data: any) => void;
  onUpdate: (matchId: string, data: Partial<Match>) => void;
  onEnd: (courtId: number, matchId: string) => void;
  onCancel: (courtId: number, matchId: string) => void;
}

const parseInitialPlayers = (raw: string) => {
  const defaultState = {
    t1p1: { name: 'Jugador 1', color: '' },
    t1p2: { name: 'Jugador 2', color: '' },
    t2p1: { name: 'Jugador 3', color: '' },
    t2p2: { name: 'Jugador 4', color: '' },
  };
  
  if (!raw) return defaultState;

  const parsePlayer = (str: string | undefined, defaultName: string) => {
    if (!str) return { name: defaultName, color: '' };
    const match = str.trim().match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const parsedName = match?.[1]?.trim();
    return {
      name: parsedName || defaultName,
      color: match?.[2]?.trim() || ''
    };
  };

  const teams = raw.split(' vs ');
  if (teams.length === 2) {
    const t1 = teams[0].split('/');
    const t2 = teams[1].split('/');
    return {
      t1p1: parsePlayer(t1[0], 'Jugador 1'),
      t1p2: parsePlayer(t1[1], 'Jugador 2'),
      t2p1: parsePlayer(t2[0], 'Jugador 3'),
      t2p2: parsePlayer(t2[1], 'Jugador 4'),
    };
  }
  
  return { ...defaultState, t1p1: parsePlayer(raw, 'Jugador 1') };
};

const buildPlayersString = (data: ReturnType<typeof parseInitialPlayers>) => {
  const formatPlayer = (p: {name: string, color: string}, defaultName: string) => {
    const finalName = p.name.trim() || defaultName;
    return p.color ? `${finalName} (${p.color})` : finalName;
  };

  const t1p1 = formatPlayer(data.t1p1, 'Jugador 1');
  const t1p2 = formatPlayer(data.t1p2, 'Jugador 2');
  const t2p1 = formatPlayer(data.t2p1, 'Jugador 3');
  const t2p2 = formatPlayer(data.t2p2, 'Jugador 4');

  return `${t1p1}/${t1p2} vs ${t2p1}/${t2p2}`;
};

export function MatchModal({ court, activeMatch, categories, colors, onClose, onStart, onUpdate, onEnd, onCancel }: MatchModalProps) {
  const isNew = !activeMatch;
  
  const [playersData, setPlayersData] = useState(() => parseInitialPlayers(activeMatch?.players || ''));
  const [category, setCategory] = useState(activeMatch?.category || '');
  const [notes, setNotes] = useState(activeMatch?.notes || '');
  const [photoBursts, setPhotoBursts] = useState(activeMatch?.photoBursts || 0);

  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const activeMatchIdRef = useRef(activeMatch?.id);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    activeMatchIdRef.current = activeMatch?.id;
    onUpdateRef.current = onUpdate;
  }, [activeMatch?.id, onUpdate]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setNotes(prev => {
            const trimmedFinal = finalTranscript.trim();
            const newNotes = prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + trimmedFinal;
            if (activeMatchIdRef.current) {
              onUpdateRef.current(activeMatchIdRef.current, { notes: newNotes });
            }
            return newNotes;
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getPlayersString = () => buildPlayersString(playersData);

  const handleStart = () => {
    onStart(court.id, { players: getPlayersString(), category, notes, photoBursts });
    onClose();
  };

  const handleUpdate = () => {
    if (activeMatch) {
      onUpdate(activeMatch.id, { players: getPlayersString(), category, notes, photoBursts });
    }
  };

  const updatePlayersData = (field: keyof typeof playersData, key: 'name' | 'color', value: string) => {
    const newData = { ...playersData, [field]: { ...playersData[field], [key]: value } };
    setPlayersData(newData);
    if (activeMatch && key === 'color') {
      onUpdate(activeMatch.id, { players: buildPlayersString(newData) });
    }
  };

  // Auto-save when modifying active match
  const handlePhotoChange = (delta: number) => {
    const newVal = Math.max(0, photoBursts + delta);
    setPhotoBursts(newVal);
    if (activeMatch) {
      onUpdate(activeMatch.id, { photoBursts: newVal });
    }
  };

  const handleEnd = () => {
    if (activeMatch) {
      onUpdate(activeMatch.id, { players: getPlayersString(), category, notes, photoBursts }); // Final save
      onEnd(court.id, activeMatch.id);
      onClose();
    }
  };

  const handleCancel = () => {
    if (activeMatch) {
      onCancel(court.id, activeMatch.id);
      onClose();
    }
  };

  const renderPlayerInput = (field: keyof typeof playersData, placeholder: string) => (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder={placeholder}
        value={playersData[field].name}
        onChange={(e) => updatePlayersData(field, 'name', e.target.value)}
        onBlur={handleUpdate}
        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
      />
      <select
        value={playersData[field].color}
        onChange={(e) => updatePlayersData(field, 'color', e.target.value)}
        className="w-28 p-2.5 bg-white border border-slate-200 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none text-sm font-medium text-slate-700"
      >
        <option value="">Color...</option>
        {colors.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{court.name}</h2>
            {activeMatch && (
              <div className="flex items-center gap-1.5 text-sky-600 font-semibold mt-1">
                <Clock className="w-4 h-4" />
                <LiveTimer startTime={activeMatch.startTime} />
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 active:scale-95">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {/* Players */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Jugadores / Equipos</label>
            <div className="flex flex-col gap-2">
              {/* Team 1 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                {renderPlayerInput('t1p1', 'Jugador 1')}
                {renderPlayerInput('t1p2', 'Jugador 2')}
              </div>
              
              {/* VS Badge */}
              <div className="flex justify-center -my-3 relative z-10">
                <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1 rounded-full border-4 border-white tracking-wider">VS</span>
              </div>

              {/* Team 2 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                {renderPlayerInput('t2p1', 'Jugador 3')}
                {renderPlayerInput('t2p2', 'Jugador 4')}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    if (activeMatch) onUpdate(activeMatch.id, { category: cat });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    category === cat 
                      ? 'bg-sky-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photos Counter */}
          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
            <label className="block text-sm font-semibold text-sky-900 mb-3 text-center">Ráfagas de Fotos Tomadas</label>
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => handlePhotoChange(-1)}
                className="w-14 h-14 rounded-full bg-white text-sky-600 font-bold text-2xl shadow-sm border border-sky-200 active:scale-90 flex items-center justify-center"
              >-</button>
              <div className="flex flex-col items-center w-20">
                <span className="text-4xl font-black text-sky-700">{photoBursts}</span>
                <Camera className="w-5 h-5 text-sky-400 mt-1" />
              </div>
              <button 
                onClick={() => handlePhotoChange(1)}
                className="w-14 h-14 rounded-full bg-sky-600 text-white font-bold text-2xl shadow-md shadow-sky-600/30 active:scale-90 flex items-center justify-center"
              >+</button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">Notas del Fotógrafo</label>
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-600 animate-pulse' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title={isListening ? "Detener dictado" : "Dictar nota"}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="Ej. Final muy buena, tomar más fotos al de rojo..."
                value={notes + (isListening && interimTranscript ? (notes ? ' ' : '') + interimTranscript : '')}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (isListening) toggleListening(); // Stop listening if user types manually
                }}
                onBlur={handleUpdate}
                className={`w-full p-3 bg-slate-50 border rounded-xl focus:outline-none resize-none transition-colors ${
                  isListening 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                }`}
              />
              {isListening && (
                <span className="absolute bottom-3 right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-slate-50 flex flex-col gap-3 pb-safe shrink-0">
          {isNew ? (
            <button
              onClick={handleStart}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
            >
              Iniciar Cobertura
            </button>
          ) : (
            <>
              <button
                onClick={handleEnd}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-slate-800/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Finalizar y Guardar
              </button>
              <button
                onClick={handleCancel}
                className="w-full bg-white border border-red-200 text-red-600 text-base font-bold py-3 rounded-xl hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Cancelar Registro
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
