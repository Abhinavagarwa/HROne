import React, { useState} from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const createNewField = (type = 'String') => ({
  id: generateId(),
  key: '',
  type,
  children: type === 'Nested' ? [] : undefined,
  collapsed: false
});

const convertToJSON = (fields) => {
  const result = {};
  
  fields.forEach(field => {
    if (field.type === 'String') {
      result[field.key] = 'string';
    } else if (field.type === 'Number') {
      result[field.key] = 42;
    } else if (field.type === 'Nested' && field.children) {
      result[field.key] = convertToJSON(field.children);
    }
  });
  
  return result;
};

// Individual field component
const SchemaFieldComponent = ({ field, onUpdate, onDelete, level }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.key);

  const handleKeyUpdate = () => {
    if (editValue.trim()) {
      onUpdate({ ...field, key: editValue.trim() });
    } else {
      setEditValue(field.key);
    }
    setIsEditing(false);
  };

  const handleTypeChange = (newType) => {
    const updatedField = { ...field, type: newType };
    if (newType === 'Nested') {
      updatedField.children = [];
      updatedField.collapsed = false;
    } else {
      delete updatedField.children;
      delete updatedField.collapsed;
    }
    onUpdate(updatedField);
  };

  const handleAddNestedField = () => {
    if (field.type === 'Nested') {
      const newChildren = [...(field.children || []), createNewField()];
      onUpdate({ ...field, children: newChildren });
    }
  };

  const handleNestedFieldUpdate = (index, updatedChild) => {
    if (field.children) {
      const newChildren = [...field.children];
      newChildren[index] = updatedChild;
      onUpdate({ ...field, children: newChildren });
    }
  };

  const handleNestedFieldDelete = (index) => {
    if (field.children) {
      const newChildren = field.children.filter((_, i) => i !== index);
      onUpdate({ ...field, children: newChildren });
    }
  };

  const toggleCollapsed = () => {
    onUpdate({ ...field, collapsed: !field.collapsed });
  };

  const indentLevel = level * 24;

  return (
    <div className="border-l-2 border-gray-200">
      <div 
        className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        style={{ marginLeft: `${indentLevel}px` }}
      >
        {/* Collapse/Expand button for nested fields */}
        {field.type === 'Nested' && (
          <button
            onClick={toggleCollapsed}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            title={field.collapsed ? "Expand" : "Collapse"}
          >
            {field.collapsed ? (
              <ChevronRight size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>
        )}

        {/* Field key input */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleKeyUpdate}
              onKeyPress={(e) => e.key === 'Enter' && handleKeyUpdate()}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              placeholder="Enter field name"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-left px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded transition-colors truncate"
              title="Click to edit field name"
            >
              {field.key || 'Click to edit'}
            </button>
          )}
        </div>

        {/* Type selector */}
        <select
          value={field.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="String">String</option>
          <option value="Number">Number</option>
          <option value="Nested">Nested</option>
        </select>

        {/* Add nested field button */}
        {field.type === 'Nested' && (
          <button
            onClick={handleAddNestedField}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
            title="Add nested field"
          >
            <Plus size={16} />
          </button>
        )}

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="Delete field"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Nested fields */}
      {field.type === 'Nested' && field.children && !field.collapsed && (
        <div className="mt-2 space-y-2">
          {field.children.map((child, index) => (
            <SchemaFieldComponent
              key={child.id}
              field={child}
              onUpdate={(updatedChild) => handleNestedFieldUpdate(index, updatedChild)}
              onDelete={() => handleNestedFieldDelete(index)}
              level={level + 1}
            />
          ))}
          
          {field.children.length === 0 && (
            <div 
              className="text-gray-500 text-sm italic p-3 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50"
              style={{ marginLeft: `${(level + 1) * 24}px` }}
            >
              No nested fields yet. Add one using the + button above.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SchemaBuilder = ({ fields, onFieldsChange, level = 0 }) => {
  const handleFieldUpdate = (index, updatedField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    onFieldsChange(newFields);
  };

  const handleFieldDelete = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    onFieldsChange(newFields);
  };

  const handleAddField = () => {
    onFieldsChange([...fields, createNewField()]);
  };

  const addFieldWithType = (type) => {
    onFieldsChange([...fields, createNewField(type)]);
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <SchemaFieldComponent
          key={field.id}
          field={field}
          onUpdate={(updatedField) => handleFieldUpdate(index, updatedField)}
          onDelete={() => handleFieldDelete(index)}
          level={level}
        />
      ))}
      
      {/* Add field buttons */}
      <div className="flex gap-2 flex-wrap" style={{ marginLeft: `${level * 24}px` }}>
        <button
          onClick={handleAddField}
          className="flex items-center gap-2 px-4 py-3 text-blue-600 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus size={20} />
          Add String Field
        </button>
        
        <button
          onClick={() => addFieldWithType('Number')}
          className="flex items-center gap-2 px-4 py-3 text-purple-600 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Plus size={20} />
          Add Number Field
        </button>
        
        <button
          onClick={() => addFieldWithType('Nested')}
          className="flex items-center gap-2 px-4 py-3 text-green-600 bg-green-50 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Plus size={20} />
          Add Nested Field
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium mb-2">No fields yet</h3>
          <p className="text-sm">Start building your schema by adding your first field above</p>
        </div>
      )}
    </div>
  );
};
const JSONPreview = ({ jsonData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">JSON Preview</h3>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-lg transition-colors ${
            copied 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy JSON'}
        </button>
      </div>
      
      <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-auto">
        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-700">
          <strong>Default Values:</strong>
          <ul className="mt-1 space-y-1">
            <li>• String fields: "string"</li>
            <li>• Number fields: 42</li>
            <li>• Nested fields: Object with child fields</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
const JSONSchemaBuilder = () => {
  const [fields, setFields] = useState([createNewField('String')]);
  const [activeTab, setActiveTab] = useState('builder');

  const jsonPreview = convertToJSON(fields);

  const handleReset = () => {
    setFields([createNewField('String')]);
    setActiveTab('builder');
  };

  const handleImportJSON = () => {
    alert('Import functionality would be implemented here');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">JSON Schema Builder</h1>
              <p className="text-blue-100 mt-2">Build your JSON schema dynamically with nested support</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                Reset
              </button>
              <button
                onClick={handleImportJSON}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
              >
                Import JSON
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'builder'
                ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            🏗️ Schema Builder
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'json'
                ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            📄 JSON Preview
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'builder' ? (
            <div>
              
              <SchemaBuilder
                fields={fields}
                onFieldsChange={setFields}
              />
            </div>
          ) : (
            <JSONPreview jsonData={jsonPreview} />
          )}
        </div>

        {/* Footer stats */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Total fields: {fields.length} | 
              Nested fields: {fields.filter(f => f.type === 'Nested').length} |
              String fields: {fields.filter(f => f.type === 'String').length} |
              Number fields: {fields.filter(f => f.type === 'Number').length}
            </div>
            <div className="text-xs">
              Built for HROne Frontend Intern Task
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONSchemaBuilder;