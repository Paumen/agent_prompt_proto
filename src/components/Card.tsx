import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CardProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Card({ title, expanded, onToggle, children }: CardProps) {
  return (
    <div className={`bg-surface border border-border rounded-xl overflow-hidden transition-colors ${expanded ? 'shadow-sm' : 'hover:bg-surface-raised'}`}>
      <button 
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center justify-between text-left focus:outline-none"
      >
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {expanded ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-border pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
