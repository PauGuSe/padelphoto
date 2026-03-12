import { useAppState } from './hooks/useAppState';
import { SetupScreen } from './components/SetupScreen';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const appState = useAppState();

  if (!appState.state.isSetupComplete) {
    return <SetupScreen onSetup={appState.setupCourts} />;
  }

  return <Dashboard appState={appState} />;
}
