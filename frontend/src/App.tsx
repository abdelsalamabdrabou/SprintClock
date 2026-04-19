import { useState } from 'react';
import SprintSetupPage from './pages/SprintSetupPage';
import EstimationPage from './pages/EstimationPage';
import StatisticsPage from './pages/StatisticsPage';
import HistoryPage from './pages/HistoryPage';
import type { SprintConfigDto, TeamMembers, CalculateResponse } from './types';
import './App.css';

type Step = 'setup' | 'estimation' | 'statistics' | 'history';

const FLOW_STEPS: Step[] = ['setup', 'estimation', 'statistics'];
const STEP_LABELS = ['Setup', 'Estimation', 'Statistics'];

function App() {
  const [step, setStep] = useState<Step>('setup');
  const [prevStep, setPrevStep] = useState<Step>('setup');
  const [config, setConfig] = useState<SprintConfigDto | null>(null);
  const [teams, setTeams] = useState<TeamMembers | null>(null);
  const [results, setResults] = useState<CalculateResponse | null>(null);

  const stepIdx = FLOW_STEPS.indexOf(step as Step);

  const goTo = (next: Step) => {
    setPrevStep(step);
    setStep(next);
  };

  const handleSetupNext = (cfg: SprintConfigDto, t: TeamMembers) => {
    setConfig(cfg);
    setTeams(t);
    goTo('estimation');
  };

  const handleResults = (res: CalculateResponse) => {
    setResults(res);
    goTo('statistics');
  };

  const handleViewSprintFromHistory = (res: CalculateResponse) => {
    setResults(res);
    goTo('statistics');
  };

  const handleReset = () => {
    setConfig(null);
    setTeams(null);
    setResults(null);
    goTo('setup');
  };

  const handleStatisticsBack = () => goTo(prevStep === 'history' ? 'history' : 'estimation');

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="app-logo">🕐</span>
          <span className="app-title">SprintClock</span>
        </div>
        {step !== 'history' && (
          <nav className="stepper">
            {FLOW_STEPS.map((s, i) => (
              <div
                key={s}
                className={`step ${step === s ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}
              >
                <span className="step-num">{i + 1}</span>
                <span className="step-label">{STEP_LABELS[i]}</span>
              </div>
            ))}
          </nav>
        )}
        <button
          className={`btn-secondary header-history-btn${step === 'history' ? ' active' : ''}`}
          onClick={() => goTo('history')}
        >
          📜 History
        </button>
      </header>

      <main>
        {step === 'setup' && <SprintSetupPage onNext={handleSetupNext} />}
        {step === 'estimation' && config && teams && (
          <EstimationPage
            config={config}
            teams={teams}
            onBack={() => goTo('setup')}
            onResults={handleResults}
          />
        )}
        {step === 'statistics' && results && (
          <StatisticsPage
            response={results}
            onBack={handleStatisticsBack}
            onReset={handleReset}
          />
        )}
        {step === 'history' && (
          <HistoryPage
            onViewSprint={handleViewSprintFromHistory}
            onBack={() => goTo(prevStep === 'history' ? 'setup' : prevStep)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
