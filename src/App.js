import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Import your artifact components here
import ArgoRBACConfig from './components/ArgoRBACConfig.js';
import PrometheusMetricsAnalyzer from './components/MetricsAnalyzer.js';
// Add more imports as needed

const Navigation = ({ artifacts }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Claude Artifacts</Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          {artifacts.map((artifact) => (
            <Link 
              key={artifact.id}
              to={`/artifact/${artifact.id}`} 
              className="hover:text-gray-300"
            >
              {artifact.name}
            </Link>
          ))}
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-gray-800 p-4 md:hidden z-10">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="hover:text-gray-300"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              {artifacts.map((artifact) => (
                <Link 
                  key={artifact.id}
                  to={`/artifact/${artifact.id}`} 
                  className="hover:text-gray-300"
                  onClick={() => setIsOpen(false)}
                >
                  {artifact.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const Home = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Claude AI React Artifacts</h1>
      <p className="mb-4">
        Welcome to my collection of React components created with Claude AI.
        Use the navigation to explore different artifacts.
      </p>
    </div>
  );
};

const ArtifactWrapper = ({ component: Component, title }) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <Component />
      </div>
    </div>
  );
};

function App() {
  // Define your artifacts here
  const artifacts = [
    { id: 'argo-rbac', name: 'ArgoCD RBAC Builder', component: ArgoRBACConfig, title: 'ArgoCD RBAC Builder' },
    { id: 'metrics-analyzer', name: 'Metrics Analyzer', component: PrometheusMetricsAnalyzer, title: 'Metrics Analyzer' },
    // Add more artifacts as needed
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation artifacts={artifacts} />
        <Routes>
          <Route path="/" element={<Home />} />
          {artifacts.map((artifact) => (
            <Route 
              key={artifact.id}
              path={`/artifact/${artifact.id}`} 
              element={<ArtifactWrapper component={artifact.component} title={artifact.title} />} 
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

