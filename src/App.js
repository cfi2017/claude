import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom';
import { Menu, X, Search, Tag, LayoutGrid, Bookmark } from 'lucide-react';
import { getAllArtifacts, getArtifactById, searchArtifacts, getArtifactsByTag } from './artifactRegistry';

// Import example artifacts - for development purposes
// In production, you'd register all your artifacts in artifactRegistry.js
import './registerArtifacts';

// Navigation component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const artifacts = getAllArtifacts();
  
  // Get all unique tags from artifacts
  const allTags = [...new Set(artifacts
    .flatMap(artifact => artifact.tags || [])
    .filter(tag => tag))];
  
  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Claude Artifacts</Link>
        
        {/* Desktop Search */}
        <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Search artifacts..."
            className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Link 
            to={`/search/${encodeURIComponent(searchQuery)}`}
            className="bg-blue-600 p-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Search size={20} />
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="flex md:hidden space-x-2">
          {showSearch ? (
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-700 text-white px-4 py-2 rounded-l-lg w-40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Link 
                to={`/search/${encodeURIComponent(searchQuery)}`}
                className="bg-blue-600 p-2 rounded-r-lg hover:bg-blue-700 transition"
                onClick={() => setShowSearch(false)}
              >
                <Search size={20} />
              </Link>
            </div>
          ) : (
            <>
              <button className="p-2" onClick={() => setShowSearch(true)}>
                <Search size={24} />
              </button>
              <button className="p-2" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/all" className="hover:text-gray-300">All Artifacts</Link>
          <Link to="/tags" className="hover:text-gray-300">Tags</Link>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="mt-4 md:hidden">
          <div className="flex flex-col space-y-2 pb-3">
            <Link 
              to="/" 
              className="hover:text-gray-300 px-2 py-1"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/all" 
              className="hover:text-gray-300 px-2 py-1"
              onClick={() => setIsOpen(false)}
            >
              All Artifacts
            </Link>
            <Link 
              to="/tags" 
              className="hover:text-gray-300 px-2 py-1"
              onClick={() => setIsOpen(false)}
            >
              Tags
            </Link>
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-400 text-sm px-2 mb-1">Popular Tags</p>
              <div className="flex flex-wrap gap-2 px-2">
                {allTags.slice(0, 5).map(tag => (
                  <Link 
                    key={tag} 
                    to={`/tag/${tag}`}
                    className="bg-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Home page
const Home = () => {
  const artifacts = getAllArtifacts();
  const featuredArtifacts = artifacts.slice(0, 3); // Show first 3 as featured
  
  // Get all unique tags
  const allTags = [...new Set(artifacts
    .flatMap(artifact => artifact.tags || [])
    .filter(tag => tag))];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-6">Claude AI React Artifacts</h1>
        <p className="mb-4 text-lg">
          Welcome to my collection of React components created with Claude AI.
          Explore different artifacts using the navigation or browse by tags.
        </p>
      </section>
      
      {featuredArtifacts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Bookmark className="mr-2" /> Featured Artifacts
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredArtifacts.map(artifact => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </section>
      )}
      
      {allTags.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Tag className="mr-2" /> Browse by Tags
          </h2>
          <div className="flex flex-wrap gap-3">
            {allTags.map(tag => (
              <Link 
                key={tag}
                to={`/tag/${tag}`}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm"
              >
                {tag} ({getArtifactsByTag(tag).length})
              </Link>
            ))}
          </div>
        </section>
      )}
      
      <section>
        <Link 
          to="/all"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          View All Artifacts
        </Link>
      </section>
    </div>
  );
};

// Artifact card component used across the app
const ArtifactCard = ({ artifact }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{artifact.name}</h3>
        {artifact.title && artifact.title !== artifact.name && (
          <p className="text-sm text-gray-700 mb-2">{artifact.title}</p>
        )}
        {artifact.description && (
          <p className="text-sm text-gray-600 mb-3">{artifact.description}</p>
        )}
        {artifact.tags && artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artifact.tags.map(tag => (
              <Link 
                key={tag} 
                to={`/tag/${tag}`}
                className="bg-gray-100 text-xs px-2 py-1 rounded hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
        <Link 
          to={`/artifact/${artifact.id}`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          View Artifact
        </Link>
      </div>
    </div>
  );
};

// All artifacts page
const AllArtifacts = () => {
  const artifacts = getAllArtifacts();
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <LayoutGrid className="mr-2" /> All Artifacts ({artifacts.length})
      </h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map(artifact => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </div>
      
      {artifacts.length === 0 && (
        <div className="text-center p-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No artifacts found. Add your artifacts in the artifactRegistry.js file.</p>
        </div>
      )}
    </div>
  );
};

// Tags page
const TagsPage = () => {
  const artifacts = getAllArtifacts();
  
  // Get all unique tags
  const allTags = [...new Set(artifacts
    .flatMap(artifact => artifact.tags || [])
    .filter(tag => tag))];
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Tag className="mr-2" /> All Tags ({allTags.length})
      </h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTags.map(tag => {
          const count = getArtifactsByTag(tag).length;
          return (
            <Link 
              key={tag}
              to={`/tag/${tag}`}
              className="border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{tag}</span>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {count} {count === 1 ? 'artifact' : 'artifacts'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      
      {allTags.length === 0 && (
        <div className="text-center p-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No tags found. Add tags to your artifacts in the artifactRegistry.js file.</p>
        </div>
      )}
    </div>
  );
};

// Tag page (shows artifacts with a specific tag)
const TagPage = () => {
  const { tag } = useParams();
  const artifacts = getArtifactsByTag(tag);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Tag className="mr-2" /> {tag} ({artifacts.length})
      </h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map(artifact => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </div>
      
      {artifacts.length === 0 && (
        <div className="text-center p-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No artifacts found with the tag "{tag}".</p>
        </div>
      )}
      
      <div className="mt-6">
        <Link 
          to="/tags"
          className="text-blue-600 hover:underline"
        >
          &larr; Back to all tags
        </Link>
      </div>
    </div>
  );
};

// Search results page
const SearchPage = () => {
  const { query } = useParams();
  const decodedQuery = decodeURIComponent(query || '');
  const artifacts = searchArtifacts(decodedQuery);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Search className="mr-2" /> Search Results: "{decodedQuery}" ({artifacts.length})
      </h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artifacts.map(artifact => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </div>
      
      {artifacts.length === 0 && (
        <div className="text-center p-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No artifacts found matching "{decodedQuery}".</p>
        </div>
      )}
      
      <div className="mt-6">
        <Link 
          to="/"
          className="text-blue-600 hover:underline"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
};

// Individual artifact page
const ArtifactPage = () => {
  const { id } = useParams();
  const artifact = getArtifactById(id);
  
  if (!artifact) {
    return <Navigate to="/not-found" />;
  }
  
  const ArtifactComponent = artifact.component;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">{artifact.name}</h1>
          {artifact.title && artifact.title !== artifact.name && (
            <p className="text-gray-700 mb-2">{artifact.title}</p>
          )}
          {artifact.description && (
            <p className="text-gray-600 mb-3">{artifact.description}</p>
          )}
          {artifact.tags && artifact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artifact.tags.map(tag => (
                <Link 
                  key={tag} 
                  to={`/tag/${tag}`}
                  className="bg-gray-100 text-xs px-2 py-1 rounded hover:bg-gray-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
        <Link 
          to="/"
          className="text-blue-600 hover:underline text-sm"
        >
          &larr; Back to home
        </Link>
      </div>
      
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <Suspense fallback={<div className="p-10 text-center">Loading artifact...</div>}>
          <ArtifactComponent />
        </Suspense>
      </div>
    </div>
  );
};

// Not found page
const NotFound = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
      <p className="mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        Go Home
      </Link>
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router basename="/claude">
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/all" element={<AllArtifacts />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tag/:tag" element={<TagPage />} />
          <Route path="/search/:query" element={<SearchPage />} />
          <Route path="/artifact/:id" element={<ArtifactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
