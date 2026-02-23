import React, { useState, useEffect } from 'react';
import { PromptInput } from '../types';
import { fetchTree } from '../github';
import { FLOWS } from '../constants';
import * as Icons from 'lucide-react';

interface Props {
  promptInput: PromptInput;
  setPromptInput: React.Dispatch<React.SetStateAction<PromptInput>>;
  onNext: () => void;
}

export function ScopeAndTasksCard({ promptInput, setPromptInput, onNext }: Props) {
  const { owner, repo, branch, pat } = promptInput.configuration;
  const { selected_folders } = promptInput.scope;
  const { selected_files } = promptInput.context;
  const { flow_id } = promptInput.task;

  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [treeUpdated, setTreeUpdated] = useState(false);

  useEffect(() => {
    if (owner && repo && branch) {
      loadTree(owner, repo, branch, pat);
    }
  }, [owner, repo, branch, pat]);

  const loadTree = async (o: string, r: string, b: string, p: string) => {
    try {
      setLoading(true);
      const { data, promise } = await fetchTree(o, r, b, p);
      if (data.tree) setTree(data.tree);
      promise.then(newData => {
        if (newData.tree) {
          setTree(newData.tree);
          setTreeUpdated(true);
          setTimeout(() => setTreeUpdated(false), 2000);
        }
      }).catch(console.error).finally(() => setLoading(false));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const toggleFolder = (path: string) => {
    setPromptInput(prev => {
      const folders = prev.scope.selected_folders.includes(path)
        ? prev.scope.selected_folders.filter(f => f !== path)
        : [...prev.scope.selected_folders, path];
      return { ...prev, scope: { ...prev.scope, selected_folders: folders } };
    });
    onNext();
  };

  const toggleFile = (path: string) => {
    setPromptInput(prev => {
      const files = prev.context.selected_files.includes(path)
        ? prev.context.selected_files.filter(f => f !== path)
        : [...prev.context.selected_files, path];
      return { ...prev, context: { ...prev.context, selected_files: files } };
    });
    onNext();
  };

  const selectFlow = (id: string) => {
    const flow = FLOWS.find(f => f.id === id);
    if (flow) {
      setPromptInput(prev => ({
        ...prev,
        task: { flow_id: id },
        steps: { enabled_steps: JSON.parse(JSON.stringify(flow.defaultSteps)) } // deep copy
      }));
      onNext();
    }
  };

  const folders = tree.filter(item => item.type === 'tree').sort((a, b) => a.path.localeCompare(b.path));
  const files = tree.filter(item => item.type === 'blob').sort((a, b) => a.path.localeCompare(b.path));
  const allItems = [...folders, ...files];

  return (
    <div className="space-y-4">
      {!repo ? (
        <div className="text-xs text-tertiary italic">Select a repository first.</div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-semibold text-primary">Scope & Context (Folders & Files)</h3>
              {treeUpdated && <span className="text-[10px] text-success flex items-center"><Icons.RefreshCw className="w-3 h-3 mr-1" /> Updated</span>}
            </div>
            <p className="text-[10px] text-secondary">Select folders for scope, files for context.</p>
            {loading && tree.length === 0 ? (
              <div className="h-24 rounded-md shimmer w-full"></div>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-border rounded-md bg-surface-inset py-0.5 space-y-0">
                {allItems.map(item => {
                  const isFolder = item.type === 'tree';
                  const isChecked = isFolder 
                    ? selected_folders.includes(item.path)
                    : selected_files.includes(item.path);
                  const Icon = isFolder ? Icons.Folder : Icons.File;
                  
                  return (
                    <label key={item.path} className="flex items-center space-x-2 text-[10px] cursor-pointer hover:bg-surface py-0.5 px-1.5 rounded mx-0.5">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => isFolder ? toggleFolder(item.path) : toggleFile(item.path)}
                        className="rounded border-border text-accent focus:ring-accent w-3 h-3"
                      />
                      <Icon className="w-3 h-3 text-secondary shrink-0" />
                      <span className="text-primary truncate">{item.path}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="text-xs font-semibold text-primary">Tasks</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FLOWS.map(flow => {
                const Icon = (Icons as any)[flow.icon];
                const isSelected = flow.id === flow_id;
                return (
                  <button
                    key={flow.id}
                    onClick={() => selectFlow(flow.id)}
                    className={`p-2 rounded-lg border flex items-center space-x-2 transition-colors text-left
                      ${isSelected 
                        ? 'bg-accent-subtle border-accent border-l-4 border-l-accent' 
                        : 'bg-surface-raised border-border hover:border-border-focus hover:bg-surface'
                      }`}
                  >
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-accent text-white' : 'bg-surface text-secondary'}`}>
                      {Icon && <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                      {flow.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
