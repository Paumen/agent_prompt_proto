import React, { useState, useEffect } from 'react';
import { PromptInput } from '../types';
import { fetchRepos, fetchBranches } from '../github';
import { Eye, EyeOff, Check, RefreshCw } from 'lucide-react';

interface Props {
  promptInput: PromptInput;
  setPromptInput: React.Dispatch<React.SetStateAction<PromptInput>>;
  onNext: () => void;
}

export function ConfigurationCard({ promptInput, setPromptInput, onNext }: Props) {
  const [showPat, setShowPat] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [error, setError] = useState('');
  const [reposUpdated, setReposUpdated] = useState(false);
  const [branchesUpdated, setBranchesUpdated] = useState(false);

  const { owner, repo, branch, pat } = promptInput.configuration;

  useEffect(() => {
    if (owner) {
      loadRepos(owner, pat);
    }
  }, [owner, pat]);

  useEffect(() => {
    if (owner && repo) {
      loadBranches(owner, repo, pat);
    }
  }, [owner, repo, pat]);

  const loadRepos = async (username: string, token: string) => {
    try {
      setLoadingRepos(true);
      setError('');
      const { data, promise } = await fetchRepos(username, token);
      setRepos(data);
      promise.then(newData => {
        setRepos(newData);
        setReposUpdated(true);
        setTimeout(() => setReposUpdated(false), 2000);
      }).catch(e => {
        if (!data) setError(e.message);
      }).finally(() => setLoadingRepos(false));
    } catch (e: any) {
      setError(e.message);
      setLoadingRepos(false);
    }
  };

  const loadBranches = async (owner: string, repo: string, token: string) => {
    try {
      setLoadingBranches(true);
      const { data, promise } = await fetchBranches(owner, repo, token);
      setBranches(data);
      if (data.length > 0 && !branch) {
        const defaultBranch = data.find((b: any) => b.name === 'main' || b.name === 'master')?.name || data[0].name;
        setPromptInput(prev => ({ ...prev, configuration: { ...prev.configuration, branch: defaultBranch } }));
      }
      promise.then(newData => {
        setBranches(newData);
        setBranchesUpdated(true);
        setTimeout(() => setBranchesUpdated(false), 2000);
      }).catch(console.error).finally(() => setLoadingBranches(false));
    } catch (e: any) {
      console.error(e);
      setLoadingBranches(false);
    }
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOwner = e.target.value;
    setPromptInput(prev => ({ ...prev, configuration: { ...prev.configuration, owner: newOwner, repo: '', branch: '' } }));
    localStorage.setItem('gh_username', newOwner);
  };

  const handlePatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPat = e.target.value;
    setPromptInput(prev => ({ ...prev, configuration: { ...prev.configuration, pat: newPat } }));
    localStorage.setItem('gh_pat', newPat);
  };

  const clearPat = () => {
    setPromptInput(prev => ({ ...prev, configuration: { ...prev.configuration, pat: '' } }));
    localStorage.removeItem('gh_pat');
  };

  const selectRepo = (r: string) => {
    setPromptInput(prev => ({ ...prev, configuration: { ...prev.configuration, repo: r, branch: '' } }));
    onNext();
  };

  const selectBranch = (b: string) => {
    setPromptInput(prev => ({ ...prev, configuration: { ...prev.configuration, branch: b } }));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col w-1/3">
          <label className="text-xs font-medium text-secondary mb-1">GitHub Username</label>
          <input 
            type="text" 
            value={owner} 
            onChange={handleOwnerChange}
            className="w-full bg-surface-inset border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-border-focus"
            placeholder="e.g. octocat"
          />
        </div>
        
        <div className="flex flex-col w-2/3">
          <label className="text-xs font-medium text-secondary mb-1">Personal Access Token (PAT)</label>
          <div className="relative flex items-center">
            <input 
              type={showPat ? "text" : "password"} 
              value={pat} 
              onChange={handlePatChange}
              className="w-full bg-surface-inset border border-border rounded-md pl-2 pr-16 py-1.5 text-xs focus:outline-none focus:border-border-focus"
              placeholder="ghp_..."
            />
            <div className="absolute right-1 flex items-center space-x-1">
              <button onClick={() => setShowPat(!showPat)} className="p-1 text-secondary hover:text-primary">
                {showPat ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
              {pat && (
                <button onClick={clearPat} className="text-[10px] text-danger hover:underline px-1">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-danger bg-danger/10 p-2 rounded-md">
          {error}
        </div>
      )}

      {owner && (
        <div className="flex items-start gap-2">
          <div className="flex items-center space-x-2 mt-1 shrink-0 w-20">
            <label className="block text-xs font-medium text-secondary">Repositories:</label>
            {reposUpdated && <span className="text-[10px] text-success flex items-center" title="Updated"><RefreshCw className="w-3 h-3" /></span>}
          </div>
          {loadingRepos && repos.length === 0 ? (
            <div className="h-6 rounded-md shimmer flex-1"></div>
          ) : repos.length === 0 ? (
            <div className="text-xs text-tertiary italic mt-1">No repositories found.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-0.5 flex-1">
              {repos.map(r => {
                const isSelected = r.name === repo;
                return (
                  <button
                    key={r.id}
                    onClick={() => selectRepo(r.name)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors flex items-center space-x-1.5
                      ${isSelected 
                        ? 'bg-accent-subtle border-accent text-primary border-l-4 border-l-accent' 
                        : 'bg-surface-raised border-border text-secondary hover:border-border-focus hover:bg-surface'
                      }`}
                  >
                    <span>{r.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {repo && (
        <div className="flex items-start gap-2">
          <div className="flex items-center space-x-2 mt-1 shrink-0 w-20">
            <label className="block text-xs font-medium text-secondary">Branch:</label>
            {branchesUpdated && <span className="text-[10px] text-success flex items-center" title="Updated"><RefreshCw className="w-3 h-3" /></span>}
          </div>
          {loadingBranches && branches.length === 0 ? (
            <div className="h-6 rounded-md shimmer flex-1"></div>
          ) : branches.length === 0 ? (
            <div className="text-xs text-tertiary italic mt-1">No branches found.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-0.5 flex-1">
              {branches.map(b => {
                const isSelected = b.name === branch;
                return (
                  <button
                    key={b.name}
                    onClick={() => selectBranch(b.name)}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors flex items-center space-x-1.5
                      ${isSelected 
                        ? 'bg-accent-subtle border-accent text-primary border-l-4 border-l-accent' 
                        : 'bg-surface-raised border-border text-secondary hover:border-border-focus hover:bg-surface'
                      }`}
                  >
                    <span>{b.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
