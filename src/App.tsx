/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PromptInput } from './types';
import { Card } from './components/Card';
import { ConfigurationCard } from './components/ConfigurationCard';
import { ScopeAndTasksCard } from './components/ScopeAndTasksCard';
import { StepsCard } from './components/StepsCard';
import { PromptCard } from './components/PromptCard';

export default function App() {
  const [promptInput, setPromptInput] = useState<PromptInput>({
    configuration: { owner: '', repo: '', branch: '', pat: '' },
    scope: { selected_folders: [] },
    context: { selected_files: [] },
    task: { flow_id: '' },
    steps: { enabled_steps: [] },
    notes: { user_text: '' },
    output: { destination: 'clipboard' }
  });

  const [expandedCards, setExpandedCards] = useState<number[]>([1]);

  // Load initial config from localStorage
  useEffect(() => {
    const savedOwner = localStorage.getItem('gh_username') || '';
    const savedPat = localStorage.getItem('gh_pat') || '';
    
    setPromptInput(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        owner: savedOwner,
        pat: savedPat
      }
    }));
  }, []);

  const toggleCard = (id: number) => {
    setExpandedCards(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleRepoSelect = () => {
    setExpandedCards(prev => [...new Set([...prev, 2])]);
  };

  const handleFlowSelect = () => {
    setExpandedCards(prev => [...new Set([...prev.filter(c => c !== 1), 3, 4])]);
  };

  return (
    <div className="min-h-screen bg-shell py-4 px-2 sm:px-4 lg:px-6">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-primary">LLM Task Configurator</h1>
          <p className="text-xs text-secondary mt-1">Configure agentic tasks and generate Claude-optimized prompts.</p>
        </div>

        <Card title="1. Configuration" expanded={expandedCards.includes(1)} onToggle={() => toggleCard(1)}>
          <ConfigurationCard 
            promptInput={promptInput} 
            setPromptInput={setPromptInput} 
            onNext={handleRepoSelect} 
          />
        </Card>

        <Card title="2. Scope & Tasks" expanded={expandedCards.includes(2)} onToggle={() => toggleCard(2)}>
          <ScopeAndTasksCard 
            promptInput={promptInput} 
            setPromptInput={setPromptInput} 
            onNext={handleFlowSelect} 
          />
        </Card>

        <Card title="3. Steps" expanded={expandedCards.includes(3)} onToggle={() => toggleCard(3)}>
          <StepsCard 
            promptInput={promptInput} 
            setPromptInput={setPromptInput} 
            onNext={() => {}} 
          />
        </Card>

        <Card title="4. Prompt" expanded={expandedCards.includes(4)} onToggle={() => toggleCard(4)}>
          <PromptCard 
            promptInput={promptInput} 
            setPromptInput={setPromptInput} 
          />
        </Card>
      </div>
    </div>
  );
}
