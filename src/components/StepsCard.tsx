import React, { useState, useEffect } from 'react';
import { PromptInput } from '../types';
import { Trash2 } from 'lucide-react';
import { fetchPRs, fetchIssues, fetchTree } from '../github';

interface Props {
  promptInput: PromptInput;
  setPromptInput: React.Dispatch<React.SetStateAction<PromptInput>>;
  onNext: () => void;
}

export function StepsCard({ promptInput, setPromptInput, onNext }: Props) {
  const { enabled_steps } = promptInput.steps;
  const { owner, repo, branch, pat } = promptInput.configuration;

  const [prs, setPrs] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (owner && repo) {
      if (enabled_steps.some(s => 'pr_number' in s.params)) {
        fetchPRs(owner, repo, pat).then(({ data }) => setPrs(data)).catch(console.error);
      }
      if (enabled_steps.some(s => 'issue_number' in s.params)) {
        fetchIssues(owner, repo, pat).then(({ data }) => setIssues(data)).catch(console.error);
      }
      if (branch && enabled_steps.some(s => Object.keys(s.params).some(k => k === 'file' || k === 'files' || k === 'file_name'))) {
        fetchTree(owner, repo, branch, pat).then(({ data }) => {
          if (data.tree) {
            setFiles(data.tree.filter((t: any) => t.type === 'blob').map((t: any) => t.path));
          }
        }).catch(console.error);
      }
    }
  }, [owner, repo, branch, pat, promptInput.task.flow_id]);

  if (enabled_steps.length === 0) {
    return <div className="text-xs text-tertiary italic">Select a task flow first.</div>;
  }

  const removeStep = (index: number) => {
    setPromptInput(prev => {
      const newSteps = [...prev.steps.enabled_steps];
      newSteps.splice(index, 1);
      return { ...prev, steps: { enabled_steps: newSteps } };
    });
  };

  const toggleLens = (stepIndex: number, lens: string) => {
    setPromptInput(prev => {
      const newSteps = [...prev.steps.enabled_steps];
      const step = { ...newSteps[stepIndex] };
      if (step.lenses.includes(lens)) {
        step.lenses = step.lenses.filter(l => l !== lens);
      } else {
        step.lenses = [...step.lenses, lens];
      }
      newSteps[stepIndex] = step;
      return { ...prev, steps: { enabled_steps: newSteps } };
    });
  };

  const updateParam = (stepIndex: number, key: string, value: string) => {
    setPromptInput(prev => {
      const newSteps = [...prev.steps.enabled_steps];
      const step = { ...newSteps[stepIndex] };
      step.params = { ...step.params, [key]: value };
      newSteps[stepIndex] = step;
      return { ...prev, steps: { enabled_steps: newSteps } };
    });
  };

  const AVAILABLE_LENSES: Record<string, string[]> = {
    'PR Diff': ['Security', 'Performance', 'Style', 'Logic'],
    'Code': ['Security', 'Performance', 'Style', 'Logic', 'Readability'],
    'Files': ['Logic', 'Tests', 'Fix', 'Regression Test', 'Structure', 'Readability', 'Performance'],
    'Tests': ['Unit', 'Integration', 'Edge Cases'],
    'Docs': ['Clarity', 'Examples', 'API'],
    'Spec': ['Edge Cases', 'Architecture', 'Data Model'],
    'Issue': ['Reproduction', 'Root Cause', 'Workaround']
  };

  return (
    <div className="space-y-3">
      {enabled_steps.map((step, index) => {
        const availableLenses = Array.from(new Set([...(AVAILABLE_LENSES[step.object] || []), ...step.lenses]));
        
        return (
          <div key={`${step.id}-${index}`} className="p-2.5 bg-surface-raised border border-border rounded-lg relative group">
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-secondary bg-surface px-1.5 py-0.5 rounded">Step {index + 1}</span>
                <span className="text-xs font-semibold text-primary">{step.operation} {step.object}</span>
              </div>
              <button 
                onClick={() => removeStep(index)}
                className="text-tertiary hover:text-danger p-1 rounded transition-colors"
                title="Remove step"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Params inputs */}
            {Object.keys(step.params).map(key => {
              const isFile = key === 'file' || key === 'files' || key === 'file_name';
              
              return (
                <div key={key} className="mt-2 flex items-center space-x-2">
                  <label className="text-[10px] font-medium text-secondary capitalize w-24 shrink-0 truncate">
                    {key.replace('_', ' ')} <span className="text-danger">*</span>
                  </label>
                  
                  {key === 'pr_number' ? (
                    <select 
                      value={step.params[key]}
                      onChange={(e) => updateParam(index, key, e.target.value)}
                      className="flex-1 bg-surface-inset border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-border-focus"
                    >
                      <option value="">-- Select PR --</option>
                      {prs.map(pr => (
                        <option key={pr.number} value={pr.number}>#{pr.number} - {pr.title}</option>
                      ))}
                    </select>
                  ) : key === 'issue_number' ? (
                    <select 
                      value={step.params[key]}
                      onChange={(e) => updateParam(index, key, e.target.value)}
                      className="flex-1 bg-surface-inset border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-border-focus"
                    >
                      <option value="">-- Select Issue --</option>
                      {issues.map(issue => (
                        <option key={issue.number} value={issue.number}>#{issue.number} - {issue.title}</option>
                      ))}
                    </select>
                  ) : isFile ? (
                    <select 
                      value={step.params[key]}
                      onChange={(e) => updateParam(index, key, e.target.value)}
                      className="flex-1 bg-surface-inset border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-border-focus"
                    >
                      <option value="">-- Select File --</option>
                      {files.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      value={step.params[key]}
                      onChange={(e) => updateParam(index, key, e.target.value)}
                      className="flex-1 bg-surface-inset border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:border-border-focus"
                      placeholder={`Enter ${key.replace('_', ' ')}...`}
                    />
                  )}
                </div>
              );
            })}

            {/* Lenses */}
            {availableLenses.length > 0 && (
              <div className="mt-2.5 flex items-start gap-2">
                <div className="text-[10px] font-medium text-secondary mt-1 shrink-0">Focus Lenses:</div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {availableLenses.map(lens => {
                    const isActive = step.lenses.includes(lens);
                    return (
                      <button
                        key={lens}
                        onClick={() => toggleLens(index, lens)}
                        className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors
                          ${isActive 
                            ? 'bg-accent-subtle border-accent text-accent' 
                            : 'bg-surface border-border text-secondary hover:border-border-focus'
                          }`}
                      >
                        {lens}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
