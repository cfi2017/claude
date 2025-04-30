import React, { useState } from 'react';
import { Trash2, Plus, Save, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const ArgoRBACConfig = () => {
  // Default roles with sample permissions
  const defaultRoles = [
    { id: 1, name: 'deny-all', description: 'No access (default deny)', permissions: [] },
    { id: 2, name: 'admin', description: 'Full access to all resources', permissions: ['*'] },
    { id: 3, name: 'readonly', description: 'Read-only access to all resources', permissions: ['get', 'list'] },
    { id: 4, name: 'readwrite', description: 'Read and write access without admin privileges', permissions: ['get', 'list', 'create', 'update', 'sync'] },
    { id: 5, name: 'developer', description: 'Basic application deployment access', permissions: ['get', 'list', 'sync', 'create'] }
  ];
  
  // Default policies
  const defaultPolicies = [
    { id: 1, description: 'Admin team access', role: 'admin', subjects: ['admin-team'], projects: ['*'] },
    { id: 2, description: 'DevOps readonly access', role: 'readonly', subjects: ['devops-team'], projects: ['production'] },
    { id: 3, description: 'DevOps readwrite access', role: 'readwrite', subjects: ['devops-write-team'], projects: ['staging'] },
    { id: 4, description: 'Developer team access', role: 'developer', subjects: ['dev-team'], projects: ['development'] },
    { id: 5, description: 'Default deny example', role: 'deny-all', subjects: ['guest-users'], projects: ['*'] }
  ];

  // State management
  const [roles, setRoles] = useState(defaultRoles);
  const [policies, setPolicies] = useState(defaultPolicies);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
  const [newPolicy, setNewPolicy] = useState({ description: '', role: '', subjects: [], projects: [] });
  const [currentTab, setCurrentTab] = useState('roles');
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRole, setEditingRole] = useState({});
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState({});
  const [showPermissionsHelp, setShowPermissionsHelp] = useState(false);
  
  // Common permission options for ArgoCD
  const permissionOptions = [
    'get', 'list', 'create', 'update', 'delete', 'sync', 'override', 'action/*', '*'
  ];

  // Handle role actions
  const addRole = () => {
    if (newRole.name && newRole.permissions.length > 0) {
      setRoles([...roles, { id: roles.length + 1, ...newRole }]);
      setNewRole({ name: '', description: '', permissions: [] });
    }
  };

  const startEditRole = (role) => {
    setEditingRoleId(role.id);
    setEditingRole({ ...role });
  };

  const saveEditedRole = () => {
    setRoles(roles.map(role => role.id === editingRoleId ? editingRole : role));
    setEditingRoleId(null);
  };

  const deleteRole = (id) => {
    setRoles(roles.filter(role => role.id !== id));
    // Also update policies that might reference this role
    const deletedRole = roles.find(r => r.id === id);
    setPolicies(policies.filter(policy => policy.role !== deletedRole.name));
  };

  const togglePermission = (permission, targetState) => {
    if (targetState === 'new') {
      if (newRole.permissions.includes(permission)) {
        setNewRole({
          ...newRole,
          permissions: newRole.permissions.filter(p => p !== permission)
        });
      } else {
        setNewRole({
          ...newRole,
          permissions: [...newRole.permissions, permission]
        });
      }
    } else if (targetState === 'edit') {
      if (editingRole.permissions.includes(permission)) {
        setEditingRole({
          ...editingRole,
          permissions: editingRole.permissions.filter(p => p !== permission)
        });
      } else {
        setEditingRole({
          ...editingRole,
          permissions: [...editingRole.permissions, permission]
        });
      }
    }
  };

  // Handle policy actions
  const addPolicy = () => {
    if (newPolicy.description && newPolicy.role && newPolicy.subjects.length > 0 && newPolicy.projects.length > 0) {
      setPolicies([...policies, { id: policies.length + 1, ...newPolicy }]);
      setNewPolicy({ description: '', role: '', subjects: [], projects: [] });
    }
  };

  const startEditPolicy = (policy) => {
    setEditingPolicyId(policy.id);
    setEditingPolicy({ ...policy });
  };

  const saveEditedPolicy = () => {
    setPolicies(policies.map(policy => policy.id === editingPolicyId ? editingPolicy : policy));
    setEditingPolicyId(null);
  };

  const deletePolicy = (id) => {
    setPolicies(policies.filter(policy => policy.id !== id));
  };

  const handleSubjectsChange = (e, targetState) => {
    const subjectsText = e.target.value;
    const subjectsArray = subjectsText.split(',').map(s => s.trim()).filter(s => s);
    
    if (targetState === 'new') {
      setNewPolicy({ ...newPolicy, subjects: subjectsArray });
    } else if (targetState === 'edit') {
      setEditingPolicy({ ...editingPolicy, subjects: subjectsArray });
    }
  };

  const handleProjectsChange = (e, targetState) => {
    const projectsText = e.target.value;
    const projectsArray = projectsText.split(',').map(s => s.trim()).filter(s => s);
    
    if (targetState === 'new') {
      setNewPolicy({ ...newPolicy, projects: projectsArray });
    } else if (targetState === 'edit') {
      setEditingPolicy({ ...editingPolicy, projects: projectsArray });
    }
  };

  // Generate YAML output for roles
  const generateRolesYAML = () => {
    let yaml = 'policy.csv:\n';
    
    // Add default deny rule first
    yaml += `p, role:default, *, *, *, deny\n\n`;
    
    // Add role definitions
    roles.forEach(role => {
      if (role.permissions.length === 0) {
        // Special case for deny-all role (explicitly showing it has no permissions)
        yaml += `# role:${role.name} has no allowed permissions\n`;
      } else {
        role.permissions.forEach(permission => {
          yaml += `p, role:${role.name}, *, ${permission}, *, allow\n`;
        });
      }
      
      // Add separator between roles for readability
      yaml += '\n';
    });
    
    return yaml;
  };

  // Generate YAML for policies
  const generatePoliciesYAML = () => {
    let yaml = 'policy.csv:\n';
    
    // Add g role bindings
    policies.forEach(policy => {
      policy.subjects.forEach(subject => {
        policy.projects.forEach(project => {
          yaml += `g, ${subject}, role:${policy.role}, ${project}\n`;
        });
      });
    });
    
    return yaml;
  };

  const generateCompleteYAML = () => {
    let rolesYaml = '';
    
    // Add default deny rule first
    rolesYaml += `p, role:default, *, *, *, deny\n\n`;
    
    // Add role definitions
    roles.forEach(role => {
      if (role.permissions.length === 0) {
        // Special case for deny-all role (explicitly showing it has no permissions)
        rolesYaml += `# role:${role.name} has no allowed permissions\n`;
      } else {
        role.permissions.forEach(permission => {
          rolesYaml += `p, role:${role.name}, *, ${permission}, *, allow\n`;
        });
      }
      
      // Add separator between roles for readability
      rolesYaml += '\n';
    });
    
    let policiesYaml = '';
    // Add g role bindings
    policies.forEach(policy => {
      policy.subjects.forEach(subject => {
        policy.projects.forEach(project => {
          policiesYaml += `g, ${subject}, role:${policy.role}, ${project}\n`;
        });
      });
    });
    
    return `policy.csv:\n${rolesYaml}\n${policiesYaml}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">ArgoCD RBAC Configuration</h1>
          <p className="text-gray-600 mt-2">Visual editor for ArgoCD role-based access control</p>
        </header>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow">
          <button
            className={`px-4 py-2 rounded-md ${currentTab === 'roles' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setCurrentTab('roles')}
          >
            Roles
          </button>
          <button
            className={`px-4 py-2 rounded-md ${currentTab === 'policies' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setCurrentTab('policies')}
          >
            Policies
          </button>
          <button
            className={`px-4 py-2 rounded-md ${currentTab === 'yaml' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setCurrentTab('yaml')}
          >
            YAML Output
          </button>
        </div>

        {/* Roles Tab */}
        {currentTab === 'roles' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Roles Configuration</h2>
              <div>
                <button 
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  onClick={() => setShowPermissionsHelp(!showPermissionsHelp)}
                >
                  {showPermissionsHelp ? (
                    <>Hide permissions help <ChevronUp className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Show permissions help <ChevronDown className="w-4 h-4 ml-1" /></>
                  )}
                </button>
              </div>
            </div>

            {showPermissionsHelp && (
              <div className="bg-blue-50 p-4 rounded-md mb-6 text-sm">
                <h3 className="font-semibold text-blue-800 mb-2">ArgoCD Permission Types:</h3>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">get:</span>
                    <span className="text-blue-800">View resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">list:</span>
                    <span className="text-blue-800">List collections of resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">create:</span>
                    <span className="text-blue-800">Create new resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">update:</span>
                    <span className="text-blue-800">Modify existing resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">delete:</span>
                    <span className="text-blue-800">Delete resources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">sync:</span>
                    <span className="text-blue-800">Sync applications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">action/*:</span>
                    <span className="text-blue-800">Run custom actions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium text-blue-700 mr-2">*:</span>
                    <span className="text-blue-800">All permissions</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Add New Role Form */}
            <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Role</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRole.name}
                    onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="e.g., project-admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRole.description}
                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="e.g., Project administration rights"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="flex flex-wrap gap-2">
                  {permissionOptions.map(permission => (
                    <button
                      key={permission}
                      className={`px-3 py-1 text-sm rounded-full ${
                        newRole.permissions.includes(permission)
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                      onClick={() => togglePermission(permission, 'new')}
                    >
                      {permission}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center ml-auto"
                  onClick={addRole}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Role
                </button>
              </div>
            </div>

            {/* Roles List */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Existing Roles</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map(role => (
                      <tr key={role.id}>
                        {editingRoleId === role.id ? (
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={editingRole.name}
                                onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={editingRole.description}
                                onChange={e => setEditingRole({ ...editingRole, description: e.target.value })}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {permissionOptions.map(permission => (
                                  <button
                                    key={permission}
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      editingRole.permissions.includes(permission)
                                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                                    }`}
                                    onClick={() => togglePermission(permission, 'edit')}
                                  >
                                    {permission}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                className="text-green-600 hover:text-green-800 mr-3"
                                onClick={saveEditedRole}
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => setEditingRoleId(null)}
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 font-medium text-gray-900">{role.name}</td>
                            <td className="px-4 py-3 text-gray-600">{role.description}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {role.permissions.map(permission => (
                                  <span
                                    key={permission}
                                    className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                                  >
                                    {permission}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                className="text-indigo-600 hover:text-indigo-800 mr-3"
                                onClick={() => startEditRole(role)}
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => deleteRole(role.id)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {currentTab === 'policies' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Policies Configuration</h2>
            </div>

            {/* Add New Policy Form */}
            <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Policy</h3>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPolicy.description}
                    onChange={e => setNewPolicy({ ...newPolicy, description: e.target.value })}
                    placeholder="e.g., Team A access to project X"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPolicy.role}
                    onChange={e => setNewPolicy({ ...newPolicy, role: e.target.value })}
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPolicy.subjects.join(', ')}
                    onChange={e => handleSubjectsChange(e, 'new')}
                    placeholder="e.g., user:alice, group:developers"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projects (comma separated, use * for all)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPolicy.projects.join(', ')}
                    onChange={e => handleProjectsChange(e, 'new')}
                    placeholder="e.g., project-a, project-b, *"
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center ml-auto"
                  onClick={addPolicy}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Policy
                </button>
              </div>
            </div>

            {/* Policies List */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Existing Policies</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map(policy => (
                      <tr key={policy.id}>
                        {editingPolicyId === policy.id ? (
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={editingPolicy.description}
                                onChange={e => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={editingPolicy.role}
                                onChange={e => setEditingPolicy({ ...editingPolicy, role: e.target.value })}
                              >
                                {roles.map(role => (
                                  <option key={role.id} value={role.name}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={editingPolicy.subjects.join(', ')}
                                onChange={e => handleSubjectsChange(e, 'edit')}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                value={editingPolicy.projects.join(', ')}
                                onChange={e => handleProjectsChange(e, 'edit')}
                              />
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                className="text-green-600 hover:text-green-800 mr-3"
                                onClick={saveEditedPolicy}
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => setEditingPolicyId(null)}
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3">{policy.description}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{policy.role}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {policy.subjects.map((subject, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                                  >
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {policy.projects.map((project, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                                  >
                                    {project}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button
                                className="text-indigo-600 hover:text-indigo-800 mr-3"
                                onClick={() => startEditPolicy(policy)}
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => deletePolicy(policy.id)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* YAML Output Tab */}
        {currentTab === 'yaml' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">YAML Output</h2>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                onClick={() => {
                  // In a real app, this would copy to clipboard
                  alert('YAML copied to clipboard (simulated)');
                }}
              >
                <Save className="w-4 h-4 mr-1" /> Copy YAML
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Complete RBAC Configuration</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                {generateCompleteYAML()}
              </pre>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Roles Definitions</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono h-64">
                  {generateRolesYAML()}
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Policy Bindings</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono h-64">
                  {generatePoliciesYAML()}
                </pre>
              </div>
            </div>

            <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
              <h3 className="text-md font-medium text-yellow-800 mb-2">How to Apply This Configuration</h3>
              <ol className="list-decimal pl-5 text-yellow-700 space-y-2">
                <li>Copy the YAML above</li>
                <li>Save it as <code className="bg-yellow-100 px-1 rounded">policy.csv</code> in your ArgoCD installation</li>
                <li>Update your ArgoCD ConfigMap to include this policy file</li>
                <li>Restart the ArgoCD server component</li>
              </ol>
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>ArgoCD RBAC Configuration Tool</p>
      </footer>
    </div>
  );
};

export default ArgoRBACConfig;
