import React from 'react';

// This is where you'll register all your artifacts
// Format: { id, name, title, description, component }
const artifactRegistry = [
  /*
  Example:
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    title: 'Interactive Data Visualization Dashboard',
    description: 'A responsive dashboard with multiple interactive charts',
    component: React.lazy(() => import('./components/DataVisualization')),
    tags: ['chart', 'dashboard', 'interactive']
  }
  */
];

// Helper function to register a new artifact
export function registerArtifact(artifact) {
  if (!artifact.id || !artifact.name || !artifact.component) {
    console.error('Artifact must have id, name, and component properties');
    return false;
  }
  
  // Check for duplicate ID
  if (artifactRegistry.some(a => a.id === artifact.id)) {
    console.error(`Artifact with ID "${artifact.id}" already exists`);
    return false;
  }
  
  artifactRegistry.push(artifact);
  return true;
}

// Helper function to get all artifacts
export function getAllArtifacts() {
  return [...artifactRegistry];
}

// Helper function to get an artifact by ID
export function getArtifactById(id) {
  return artifactRegistry.find(artifact => artifact.id === id) || null;
}

// Helper function to filter artifacts by tag
export function getArtifactsByTag(tag) {
  return artifactRegistry.filter(artifact => 
    artifact.tags && artifact.tags.includes(tag)
  );
}

// Helper function to search artifacts
export function searchArtifacts(query) {
  if (!query) {
    return getAllArtifacts();
  }
  
  const lowerQuery = query.toLowerCase();
  return artifactRegistry.filter(artifact => {
    return (
      (artifact.name && artifact.name.toLowerCase().includes(lowerQuery)) ||
      (artifact.title && artifact.title.toLowerCase().includes(lowerQuery)) ||
      (artifact.description && artifact.description.toLowerCase().includes(lowerQuery)) ||
      (artifact.tags && artifact.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  });
}

// Load all artifacts from components directory
// This is where you'll register your artifacts
// You can do this manually or automatically
// For now, we'll add a few examples manually

// Import your artifacts here
// Example:
// import DataVisualization from './components/DataVisualization';
// registerArtifact({
//   id: 'data-visualization',
//   name: 'Data Visualization',
//   title: 'Interactive Data Visualization Dashboard',
//   description: 'A responsive dashboard with multiple interactive charts',
//   component: React.lazy(() => import('./components/DataVisualization')),
//   tags: ['chart', 'dashboard', 'interactive']
// });

export default artifactRegistry;
