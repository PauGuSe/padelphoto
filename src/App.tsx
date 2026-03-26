import { useAppState } from './hooks/useAppState';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { TournamentList } from './components/TournamentList';

const getContrastYIQ = (hexcolor: string) => {
  const hex = hexcolor.replace("#", "");
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? '#0f172a' : '#ffffff'; // slate-900 or white
};

export default function App() {
  const appState = useAppState();
  const activeTournament = appState.globalState.tournaments.find(t => t.id === appState.globalState.activeTournamentId);
  const themeColor = activeTournament?.themeColor || '#214ed3'; // Default to royal blue
  const contrastColor = getContrastYIQ(themeColor);

  return (
    <>
      <style>{`
        :root {
          --theme-color: ${themeColor};
          --theme-contrast: ${contrastColor};
        }
        .bg-sky-600, .bg-royal-blue { 
          background-color: var(--theme-color) !important; 
          color: var(--theme-contrast) !important;
        }
        .text-sky-600 { color: var(--theme-color) !important; }
        .border-sky-600, .border-blue-700 { border-color: var(--theme-color) !important; }
        .shadow-sky-600\\/20, .shadow-sky-600\\/30, .shadow-royal-blue\\/30 { 
          box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--theme-color) 30%, transparent), 0 4px 6px -4px color-mix(in srgb, var(--theme-color) 30%, transparent) !important; 
        }
        .hover\\:bg-sky-700:hover, .hover\\:bg-blue-700:hover { 
          background-color: color-mix(in srgb, var(--theme-color) 85%, black) !important; 
        }
        .bg-sky-100 { background-color: color-mix(in srgb, var(--theme-color) 15%, white) !important; }
      `}</style>
      
      {!appState.globalState.currentUser ? (
        <LoginScreen users={appState.globalState.users} onLogin={appState.login} />
      ) : !appState.globalState.activeTournamentId ? (
        <TournamentList appState={appState} />
      ) : !appState.state?.isSetupComplete ? (
        <SetupScreen onSetup={appState.setupCourts} onLogout={appState.exitTournament} />
      ) : (
        <Dashboard appState={appState as any} />
      )}
    </>
  );
}
