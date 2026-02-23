export type Step = {
  id: string;
  operation: string;
  object: string;
  lenses: string[];
  params: Record<string, any>;
};

export type PromptInput = {
  configuration: {
    owner: string;
    repo: string;
    branch: string;
    pat: string;
  };
  scope: {
    selected_folders: string[];
  };
  context: {
    selected_files: string[];
  };
  task: {
    flow_id: string;
  };
  steps: {
    enabled_steps: Step[];
  };
  notes: {
    user_text: string;
  };
  output: {
    destination: 'clipboard';
  };
};

export type FlowDef = {
  id: string;
  title: string;
  icon: string;
  defaultSteps: Step[];
};
