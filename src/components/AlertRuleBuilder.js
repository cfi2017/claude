import React, { useState } from 'react';
import { AlertTriangle, X, Plus, Upload, Download, Save, Edit2, Trash2 } from 'lucide-react';

const PrometheusAlertBuilder = () => {
  const [alerts, setAlerts] = useState([
    {
      alert: 'HighCPUUsage',
      expr: 'avg(node_cpu_seconds_total{mode="idle"}) by (instance) < 0.2',
      for: '5m',
      labels: {
        severity: 'warning',
        team: 'platform',
      },
      annotations: {
        summary: 'High CPU usage detected',
        description: 'CPU usage is above 80% for 5 minutes',
      },
    },
  ]);
  
  const [currentAlert, setCurrentAlert] = useState(null);
  const [yamlOutput, setYamlOutput] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  
  // Label and annotation editing
  const [currentLabelKey, setCurrentLabelKey] = useState('');
  const [currentLabelValue, setCurrentLabelValue] = useState('');
  const [currentAnnotationKey, setCurrentAnnotationKey] = useState('');
  const [currentAnnotationValue, setCurrentAnnotationValue] = useState('');
  
  const resetForm = () => {
    setCurrentAlert({
      alert: '',
      expr: '',
      for: '5m',
      labels: {},
      annotations: {},
    });
    setEditMode(false);
    setEditIndex(null);
  };
  
  const handleAlertChange = (field, value) => {
    setCurrentAlert({
      ...currentAlert,
      [field]: value,
    });
  };
  
  const addLabel = () => {
    if (currentLabelKey.trim() === '') return;
    
    setCurrentAlert({
      ...currentAlert,
      labels: {
        ...currentAlert.labels,
        [currentLabelKey]: currentLabelValue,
      },
    });
    
    setCurrentLabelKey('');
    setCurrentLabelValue('');
  };
  
  const removeLabel = (key) => {
    const newLabels = { ...currentAlert.labels };
    delete newLabels[key];
    
    setCurrentAlert({
      ...currentAlert,
      labels: newLabels,
    });
  };
  
  const addAnnotation = () => {
    if (currentAnnotationKey.trim() === '') return;
    
    setCurrentAlert({
      ...currentAlert,
      annotations: {
        ...currentAlert.annotations,
        [currentAnnotationKey]: currentAnnotationValue,
      },
    });
    
    setCurrentAnnotationKey('');
    setCurrentAnnotationValue('');
  };
  
  const removeAnnotation = (key) => {
    const newAnnotations = { ...currentAlert.annotations };
    delete newAnnotations[key];
    
    setCurrentAlert({
      ...currentAlert,
      annotations: newAnnotations,
    });
  };
  
  const addOrUpdateAlert = () => {
    if (!currentAlert.alert || !currentAlert.expr) {
      return;
    }
    
    if (editMode && editIndex !== null) {
      const newAlerts = [...alerts];
      newAlerts[editIndex] = currentAlert;
      setAlerts(newAlerts);
    } else {
      setAlerts([...alerts, currentAlert]);
    }
    
    resetForm();
    generateYaml([...alerts, currentAlert]);
  };
  
  const editAlert = (index) => {
    setCurrentAlert(JSON.parse(JSON.stringify(alerts[index])));
    setEditMode(true);
    setEditIndex(index);
  };
  
  const deleteAlert = (index) => {
    const newAlerts = alerts.filter((_, i) => i !== index);
    setAlerts(newAlerts);
    generateYaml(newAlerts);
  };
  
  const generateYaml = (alertsToGenerate = alerts) => {
    if (alertsToGenerate.length === 0) {
      setYamlOutput('');
      return;
    }
    
    let yaml = 'groups:\n- name: example\n  rules:\n';
    
    alertsToGenerate.forEach((alert) => {
      yaml += `  - alert: ${alert.alert}\n`;
      yaml += `    expr: ${alert.expr}\n`;
      if (alert.for) yaml += `    for: ${alert.for}\n`;
      
      if (Object.keys(alert.labels).length > 0) {
        yaml += '    labels:\n';
        Object.entries(alert.labels).forEach(([key, value]) => {
          yaml += `      ${key}: ${value}\n`;
        });
      }
      
      if (Object.keys(alert.annotations).length > 0) {
        yaml += '    annotations:\n';
        Object.entries(alert.annotations).forEach(([key, value]) => {
          yaml += `      ${key}: "${value}"\n`;
        });
      }
      
      yaml += '\n';
    });
    
    setYamlOutput(yaml);
  };

  const downloadYaml = () => {
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prometheus-alerts.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <AlertTriangle className="mr-2 text-yellow-500" size={24} />
        Prometheus Alert Rule Builder
      </h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Alert Configuration Panel */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editMode ? 'Edit Alert Rule' : 'New Alert Rule'}
          </h2>
          
          {!currentAlert ? (
            <button 
              onClick={resetForm} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" /> Create New Alert
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Name
                </label>
                <input
                  type="text"
                  value={currentAlert.alert}
                  onChange={(e) => handleAlertChange('alert', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., HighCPUUsage"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PromQL Expression
                </label>
                <textarea
                  value={currentAlert.expr}
                  onChange={(e) => handleAlertChange('expr', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g., avg(node_cpu_seconds_total{mode='idle'}) by (instance) < 0.2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (for)
                </label>
                <input
                  type="text"
                  value={currentAlert.for}
                  onChange={(e) => handleAlertChange('for', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5m"
                />
              </div>
              
              {/* Labels Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labels
                </label>
                
                <div className="mb-2">
                  {Object.entries(currentAlert.labels || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center mb-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex-1">
                        {key}: {value}
                      </span>
                      <button
                        onClick={() => removeLabel(key)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentLabelKey}
                    onChange={(e) => setCurrentLabelKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Key"
                  />
                  <input
                    type="text"
                    value={currentLabelValue}
                    onChange={(e) => setCurrentLabelValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Value"
                  />
                  <button
                    onClick={addLabel}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* Annotations Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annotations
                </label>
                
                <div className="mb-2">
                  {Object.entries(currentAlert.annotations || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center mb-1">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex-1">
                        {key}: {value}
                      </span>
                      <button
                        onClick={() => removeAnnotation(key)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentAnnotationKey}
                    onChange={(e) => setCurrentAnnotationKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Key (e.g., summary)"
                  />
                  <input
                    type="text"
                    value={currentAnnotationValue}
                    onChange={(e) => setCurrentAnnotationValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Value"
                  />
                  <button
                    onClick={addAnnotation}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={addOrUpdateAlert}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editMode ? 'Update Alert' : 'Add Alert'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Alerts List */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Alert Rules</h2>
          
          {alerts.length === 0 ? (
            <div className="text-gray-500 italic">No alert rules defined yet</div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="border border-gray-200 rounded p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-blue-600">{alert.alert}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editAlert(index)}
                        className="text-gray-600 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteAlert(index)}
                        className="text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="font-mono bg-gray-100 p-2 rounded">
                      {alert.expr}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      for: {alert.for}
                    </span>
                    
                    {Object.entries(alert.labels || {}).map(([key, value]) => (
                      <span key={key} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <button 
              onClick={() => generateYaml()}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              disabled={alerts.length === 0}
            >
              <Save size={16} className="mr-2" /> Generate YAML
            </button>
          </div>
        </div>
      </div>
      
      {/* YAML Output */}
      {yamlOutput && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Generated YAML</h2>
            <button
              onClick={downloadYaml}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center text-sm"
            >
              <Download size={14} className="mr-1" /> Download YAML
            </button>
          </div>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
            {yamlOutput}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PrometheusAlertBuilder;
