import React, { useState } from 'react';
import { PromptInput } from '../types';
import { Copy, ExternalLink, Check } from 'lucide-react';

interface Props {
  promptInput: PromptInput;
  setPromptInput: React.Dispatch<React.SetStateAction<PromptInput>>;
}

export function PromptCard({ promptInput, setPromptInput }: Props) {
  const [copied, setCopied] = useState(false);
  const { configuration, scope, context, steps, notes } = promptInput;

  const generatePrompt = () => {
    let prompt = `<prompt>\n  <context>\n`;
    prompt += `    Execute the following steps for repository ${configuration.owner}/${configuration.repo} on branch ${configuration.branch}.\n`;
    
    if (scope.selected_folders.length > 0) {
      prompt += `    Scope: ${scope.selected_folders.map(f => `@${f}/`).join(', ')}.\n`;
    }
    
    prompt += `    Authenticate using PAT: ${configuration.pat || '[PAT value]'}.\n`;
    prompt += `  </context>\n  <steps>\n`;

    let stepCounter = 1;
    
    if (context.selected_files.length > 0) {
      prompt += `    Step ${stepCounter++}: Read: ${context.selected_files.map(f => `@${f}`).join(', ')}.\n`;
    }

    steps.enabled_steps.forEach(step => {
      let stepText = `    Step ${stepCounter++}: ${step.operation} ${step.object}`;
      
      const paramVals = Object.values(step.params).filter(v => v);
      if (paramVals.length > 0) {
        stepText += ` (${paramVals.join(', ')})`;
      }

      if (step.lenses.length > 0) {
        stepText += ` — focus on [${step.lenses.join(', ')}]`;
      }
      
      prompt += stepText + '\n';
    });

    prompt += `  </steps>\n</prompt>`;

    if (notes.user_text.trim()) {
      prompt += `\n<notes>\n  ${notes.user_text.trim()}\n</notes>`;
    }

    return prompt;
  };

  const generatedPrompt = generatePrompt();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <pre className="bg-surface-inset border border-border rounded-lg p-3 text-[10px] sm:text-xs font-mono text-primary whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
          {generatedPrompt}
        </pre>
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-surface border border-border rounded-md text-secondary hover:text-primary hover:bg-surface-raised transition-colors flex items-center space-x-1 shadow-sm"
        >
          {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          <span className="text-[10px] font-medium">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-secondary mb-1">Additional Notes (Optional)</label>
        <textarea 
          value={notes.user_text}
          onChange={(e) => setPromptInput(prev => ({ ...prev, notes: { user_text: e.target.value } }))}
          className="w-full bg-surface-inset border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-border-focus min-h-[60px]"
          placeholder="Add any specific instructions or context here..."
        />
      </div>

      <div className="flex justify-end">
        <a 
          href={`https://claude.ai/new?q=${encodeURIComponent(generatedPrompt)}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-accent text-white rounded-md text-xs font-medium hover:bg-accent-hover transition-colors shadow-sm"
        >
          <span>Open in Claude</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
