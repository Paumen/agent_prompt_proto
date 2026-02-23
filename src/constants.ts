import { FlowDef } from './types';

export const FLOWS: FlowDef[] = [
  {
    id: 'review_pr',
    title: 'Review PR',
    icon: 'GitPullRequest',
    defaultSteps: [
      { id: '1', operation: 'Read', object: 'PR Diff', lenses: ['Security', 'Performance', 'Style'], params: { pr_number: '' } },
      { id: '2', operation: 'Review', object: 'Code', lenses: [], params: {} },
      { id: '3', operation: 'Comment', object: 'PR', lenses: [], params: {} }
    ]
  },
  {
    id: 'implement_feature',
    title: 'Implement Feature',
    icon: 'Sparkles',
    defaultSteps: [
      { id: '1', operation: 'Read', object: 'Spec', lenses: [], params: { spec_description: '' } },
      { id: '2', operation: 'Create', object: 'Branch', lenses: [], params: {} },
      { id: '3', operation: 'Edit', object: 'Files', lenses: ['Logic', 'Tests'], params: {} },
      { id: '4', operation: 'Commit', object: 'Changes', lenses: [], params: {} },
      { id: '5', operation: 'Open', object: 'PR', lenses: [], params: {} }
    ]
  },
  {
    id: 'fix_bug',
    title: 'Fix Bug / Issue',
    icon: 'Bug',
    defaultSteps: [
      { id: '1', operation: 'Read', object: 'Issue', lenses: [], params: { issue_number: '' } },
      { id: '2', operation: 'Create', object: 'Branch', lenses: [], params: {} },
      { id: '3', operation: 'Edit', object: 'Files', lenses: ['Fix', 'Regression Test'], params: {} },
      { id: '4', operation: 'Commit', object: 'Changes', lenses: [], params: {} },
      { id: '5', operation: 'Open', object: 'PR', lenses: [], params: {} }
    ]
  },
  {
    id: 'refactor',
    title: 'Refactor',
    icon: 'Wrench',
    defaultSteps: [
      { id: '1', operation: 'Read', object: 'Files', lenses: [], params: {} },
      { id: '2', operation: 'Create', object: 'Branch', lenses: [], params: {} },
      { id: '3', operation: 'Edit', object: 'Files', lenses: ['Structure', 'Readability', 'Performance'], params: {} },
      { id: '4', operation: 'Commit', object: 'Changes', lenses: [], params: {} },
      { id: '5', operation: 'Open', object: 'PR', lenses: [], params: {} }
    ]
  },
  {
    id: 'write_tests',
    title: 'Write Tests',
    icon: 'TestTube',
    defaultSteps: [
      { id: '1', operation: 'Read', object: 'Files', lenses: [], params: {} },
      { id: '2', operation: 'Create', object: 'Branch', lenses: [], params: {} },
      { id: '3', operation: 'Create', object: 'Tests', lenses: ['Unit', 'Integration', 'Edge Cases'], params: {} },
      { id: '4', operation: 'Commit', object: 'Changes', lenses: [], params: {} },
      { id: '5', operation: 'Open', object: 'PR', lenses: [], params: {} }
    ]
  },
  {
    id: 'write_docs',
    title: 'Write Documentation',
    icon: 'FileText',
    defaultSteps: [
      { id: '1', operation: 'Read', object: 'Files', lenses: [], params: {} },
      { id: '2', operation: 'Create', object: 'Branch', lenses: [], params: {} },
      { id: '3', operation: 'Edit', object: 'Docs', lenses: ['Clarity', 'Examples', 'API'], params: {} },
      { id: '4', operation: 'Commit', object: 'Changes', lenses: [], params: {} },
      { id: '5', operation: 'Open', object: 'PR', lenses: [], params: {} }
    ]
  }
];
