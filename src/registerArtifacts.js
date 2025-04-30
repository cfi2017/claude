import React from 'react';
import { registerArtifact } from './artifactRegistry';

// Example of how to register artifacts
// In your actual application, you would replace these with your Claude artifacts

// Example 1: Simple Counter
registerArtifact({
  id: 'alert-rule-builder',
  name: 'Alert Rule Builder',
  title: 'Prometheus Alert Rule Builder',
  description: 'A component for building Prometheus Alert Rules',
  component: React.lazy(() => import('./components/AlertRuleBuilder.js')),
  tags: ['monitoring']
});

// Example 2: Data Chart
registerArtifact({
  id: 'argocd-rbac-config',
  name: 'ArgoCD RBAC Configurator',
  title: 'Visually create ArgoCD RBAC rules',
  description: 'ArgoCD RBAC Configurator',
  component: React.lazy(() => import('./components/ArgoRBACConfig.js')),
  tags: ['argocd']
});

// Example 3: Form Component
registerArtifact({
  id: 'metrics-analyzer',
  name: 'Prometheus Metrics Analyzer',
  title: 'Prometheus Metrics Analyzer',
  description: 'Analyze metrics from a prometheus metrics endpoint',
  component: React.lazy(() => import('./components/MetricsAnalyzer.js')),
  tags: ['monitoring']
});

// Here's where you should add YOUR Claude artifacts
// Example of how to register your actual Claude artifacts:

/*
registerArtifact({
  id: 'your-claude-artifact',
  name: 'Your Claude Artifact Name',
  title: 'Descriptive Title for the Artifact',
  description: 'Detailed description of what the artifact does',
  component: React.lazy(() => import('./components/YourClaudeArtifact')),
  tags: ['relevant', 'tags', 'for', 'categorization']
});
*/

// You can add as many artifacts as you want following the pattern above
