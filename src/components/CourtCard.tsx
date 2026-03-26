import { Court, Match } from '../types';
import { LiveTimer } from './LiveTimer';
import { Camera, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface CourtCardProps {
  key?: number | string;
  court: Court;
  activeMatch?: Match;
  onClick: (court: Court) => void;
}

export function CourtCard({ court, activeMatch, onClick }: CourtCardProps) {
  const isAvailable = court.status === 'available';

  return (
    <button
      onClick={() => onClick(court)}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-2xl text-left transition-all active:scale-95 shadow-sm border min-h-[120px]",
        isAvailable 
          ? "bg-white/80 backdrop-blur-md border-emerald-100 hover:border-emerald-300" 
          : "bg-royal-blue/90 backdrop-blur-md border-blue-700 text-white shadow-royal-blue/30 shadow-lg"
      )}
    >
      <div className="flex justify-between w-full items-center mb-3">
        <span className={cn("text-xl font-bold", isAvailable ? "text-slate-800" : "text-white")}>
          {court.name}
        </span>
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
          isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-blue-700 text-blue-50"
        )}>
          {isAvailable ? 'Disponible' : 'En Uso'}
        </div>
      </div>

      {isAvailable ? (
        <div className="mt-auto text-slate-400 text-sm flex items-center gap-1 font-medium">
          <span>Toca para iniciar</span>
        </div>
      ) : (
        <div className="w-full space-y-2 flex-1 flex flex-col">
          {activeMatch?.players && (
            <p className="text-blue-50 font-medium truncate text-sm">
              {activeMatch.players}
            </p>
          )}
          <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-blue-400/50">
            <div className="flex items-center gap-1.5 text-blue-50 font-semibold">
              <Clock className="w-4 h-4" />
              <LiveTimer startTime={activeMatch!.startTime} />
            </div>
            {activeMatch!.photoBursts > 0 && (
              <div className="flex items-center gap-1 bg-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                <Camera className="w-3 h-3" />
                {activeMatch!.photoBursts}
              </div>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
