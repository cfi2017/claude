import React, { useState, useEffect } from 'react';

const PrometheusMetricsAnalyzer = () => {
  const [rawMetrics, setRawMetrics] = useState('');
  const [parsedMetrics, setParsedMetrics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetricType, setSelectedMetricType] = useState('all');
  const [metricTypes, setMetricTypes] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedMetrics, setExpandedMetrics] = useState({});

  useEffect(() => {
    if (rawMetrics) {
      try {
        parseMetrics(rawMetrics);
        setError('');
      } catch (err) {
        setError('Error parsing metrics data: ' + err.message);
      }
    }
  }, [rawMetrics]);

  const parseMetrics = (text) => {
    // Split the text by newlines
    const lines = text.split('\n');
    
    // Initialize containers
    const metrics = [];
    const types = new Set(['all']);
    let currentMetric = null;
    let currentHelp = '';
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Check if it's a HELP comment
      if (line.startsWith('# HELP ')) {
        const parts = line.substring(7).split(' ');
        const metricName = parts[0];
        const helpText = parts.slice(1).join(' ');
        currentHelp = helpText;
        currentMetric = metricName;
      }
      // Check if it's a TYPE comment
      else if (line.startsWith('# TYPE ')) {
        const parts = line.substring(7).split(' ');
        const metricName = parts[0];
        const metricType = parts[1];
        
        // Add to unique metric types
        types.add(metricType);
        
        // If we have a complete metric definition, add it
        if (currentMetric === metricName) {
          const existingMetric = metrics.find(m => m.name === metricName);
          if (!existingMetric) {
            metrics.push({
              name: metricName,
              help: currentHelp,
              type: metricType,
              samples: []
            });
          }
        }
      }
      // Must be a metric sample
      else if (!line.startsWith('#')) {
        // Only process if we have a current metric context
        if (currentMetric) {
          const existingMetric = metrics.find(m => m.name === currentMetric);
          if (existingMetric) {
            // Parse the sample line
            const sampleParts = line.split(' ');
            let name = sampleParts[0];
            let value = sampleParts[1];
            let timestamp = sampleParts[2];
            
            // Handle labels if present
            let labels = {};
            if (name.includes('{')) {
              const baseName = name.substring(0, name.indexOf('{'));
              const labelStr = name.substring(name.indexOf('{') + 1, name.indexOf('}'));
              const labelParts = labelStr.split(',');
              
              labelParts.forEach(lp => {
                if (lp.includes('=')) {
                  const [key, val] = lp.split('=');
                  labels[key] = val.replace(/"/g, '');
                }
              });
              
              name = baseName;
            }
            
            // Add sample if it's for the current metric
            if (name === currentMetric) {
              // Check for duplicate samples (same labels)
              const labelStr = JSON.stringify(labels);
              const hasDuplicate = existingMetric.samples.some(
                s => JSON.stringify(s.labels) === labelStr
              );
              
              if (!hasDuplicate) {
                existingMetric.samples.push({
                  labels,
                  value,
                  timestamp
                });
              }
            }
          }
        }
      }
    }
    
    // Update state
    setParsedMetrics(metrics);
    setMetricTypes(Array.from(types));
  };

  const handlePaste = (e) => {
    setRawMetrics(e.target.value);
  };

  const filterMetrics = () => {
    if (!parsedMetrics) return [];
    
    return parsedMetrics.filter(metric => {
      // Filter by search term
      const matchesSearch = 
        searchTerm === '' || 
        metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.help.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = 
        selectedMetricType === 'all' || 
        metric.type === selectedMetricType;
      
      return matchesSearch && matchesType;
    });
  };

  const copyMetricName = (name) => {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(name);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const toggleMetricExpand = (metricName) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [metricName]: !prev[metricName]
    }));
  };

  // Format labels for display
  const formatLabels = (labels) => {
    if (Object.keys(labels).length === 0) return '';
    
    return '{' + Object.entries(labels)
      .map(([key, value]) => `${key}="${value}"`)
      .join(', ') + '}';
  };
  
  // Extract unique labels across all samples for a metric
  const getUniqueLabels = (samples) => {
    const uniqueLabels = new Set();
    samples.forEach(sample => {
      Object.keys(sample.labels).forEach(label => uniqueLabels.add(label));
    });
    return Array.from(uniqueLabels).sort();
  };

  const filteredMetrics = filterMetrics();

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prometheus Metrics Analyzer</h1>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded"
          >
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>
        </div>
      </header>

      {/* Help Text */}
      {showHelp && (
        <div className="bg-blue-50 p-4 border-b border-blue-200">
          <h2 className="font-bold text-lg mb-2">How to use:</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Paste raw metrics from your Prometheus endpoint into the text area</li>
            <li>The tool will automatically parse and organize your metrics</li>
            <li>Use the search box to filter metrics by name or description</li>
            <li>Filter by metric type using the dropdown</li>
            <li>Click any metric name to copy it to your clipboard</li>
          </ol>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Panel - Input */}
        <div className="md:w-1/2 p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-2">Paste Prometheus Metrics</h2>
          <textarea 
            className="flex-1 p-3 border border-gray-300 rounded shadow-inner font-mono text-sm resize-none"
            placeholder="Paste raw metrics from your Prometheus endpoint here..."
            onChange={handlePaste}
            value={rawMetrics}
          />
          {error && <div className="mt-2 text-red-600">{error}</div>}
        </div>

        {/* Right Panel - Results */}
        <div className="md:w-1/2 p-4 flex flex-col overflow-hidden">
          <div className="mb-4 flex flex-col md:flex-row gap-2 md:items-center">
            <input
              type="text"
              placeholder="Search metrics..."
              className="p-2 border border-gray-300 rounded shadow-inner flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              className="p-2 border border-gray-300 rounded shadow-inner w-full md:w-auto"
              value={selectedMetricType}
              onChange={(e) => setSelectedMetricType(e.target.value)}
            >
              {metricTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-auto border border-gray-300 rounded shadow-inner bg-white">
            {filteredMetrics.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                {rawMetrics ? 'No metrics found matching your filters.' : 'Paste metrics data to see results.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredMetrics.map((metric, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <button 
                        className="font-mono text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer"
                        onClick={() => copyMetricName(metric.name)}
                        title="Click to copy metric name"
                      >
                        {metric.name}
                        {copied === metric.name && (
                          <span className="ml-2 text-green-600 text-xs font-normal">✓ Copied!</span>
                        )}
                      </button>
                      <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                        {metric.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{metric.help}</p>
                    
                    {/* Show available labels */}
                    {metric.samples.length > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500 italic mb-1">
                            {metric.samples.length} {metric.samples.length === 1 ? 'sample' : 'samples'} with {getUniqueLabels(metric.samples).length} label {getUniqueLabels(metric.samples).length === 1 ? 'type' : 'types'}
                          </div>
                          <button 
                            onClick={() => toggleMetricExpand(metric.name)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {expandedMetrics[metric.name] ? 'Hide Details' : 'Show Details'}
                          </button>
                        </div>
                        
                        {/* Display available labels */}
                        <div className="flex flex-wrap gap-1 my-1">
                          {getUniqueLabels(metric.samples).map(label => (
                            <span key={label} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-mono">
                              {label}
                            </span>
                          ))}
                        </div>
                        
                        {/* Show samples only when expanded */}
                        {expandedMetrics[metric.name] && (
                          <div className="max-h-32 overflow-auto text-xs bg-gray-50 p-1 rounded mt-1">
                            {metric.samples.slice(0, 5).map((sample, i) => (
                              <div key={i} className="font-mono">
                                {metric.name}{formatLabels(sample.labels)} = {sample.value}
                              </div>
                            ))}
                            {metric.samples.length > 5 && (
                              <div className="text-gray-500 italic">
                                ...and {metric.samples.length - 5} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {filteredMetrics.length > 0 && (
              <span>
                Showing {filteredMetrics.length} of {parsedMetrics.length} metrics
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrometheusMetricsAnalyzer;
