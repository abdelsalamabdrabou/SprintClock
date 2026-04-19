import { useState } from 'react';
import SprintSetupPage from './pages/SprintSetupPage';
import EstimationPage from './pages/EstimationPage';
import StatisticsPage from './pages/StatisticsPage';
import type { SprintConfigDto, TeamMembers, CalculateResponse } from './types';
import './App.css';

type Step = 'setup' | 'estimation' | 'statistics';

const STEPS: Step[] = ['setup', 'estimation', 'statistics'];
const STEP_LABELS = ['Setup', 'Estimation', 'Statistics'];

function App() {
  const [step, setStep] = useState<Step>('setup');
  const [config, setConfig] = useState<SprintConfigDto | null>(null);
  const [teams, setTeams] = useState<TeamMembers | null>(null);
  const [results, setResults] = useState<CalculateResponse | null>(null);

  const stepIdx = STEPS.indexOf(step);

  const handleSetupNext = (cfg: SprintConfigDto, t: TeamMembers) => {
    setConfig(cfg);
    setTeams(t);
    setStep('estimation');
  };

  const handleResults = (res: CalculateResponse) => {
    setResults(res);
    setStep('statistics');
  };

  const handleReset = () => {
    setConfig(null);
    setTeams(null);
    setResults(null);
    setStep('setup');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="app-logo">🕐</span>
          <span className="app-title">SprintClock</span>
        </div>
        <nav className="stepper">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`step ${step === s ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}
            >
              <span className="step-num">{i + 1}</span>
              <span className="step-label">{STEP_LABELS[i]}</span>
            </div>
          ))}
        </nav>
      </header>

      <main>
        {step === 'setup' && <SprintSetupPage onNext={handleSetupNext} />}
        {step === 'estimation' && config && teams && (
          <EstimationPage
            config={config}
            teams={teams}
            onBack={() => setStep('setup')}
            onResults={handleResults}
          />
        )}
        {step === 'statistics' && results && (
          <StatisticsPage
            response={results}
            onBack={() => setStep('estimation')}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

export default App;
