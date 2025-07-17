/**
 * ChUseA Stores Usage Examples
 * This file demonstrates how to use all the Zustand stores in React components
 */

import React, { useEffect, useState } from 'react';
import {
  useAuth,
  useAuthActions,
  usePermissions,
  useDocuments,
  useCurrentDocument,
  useDocumentActions,
  useDocumentFilters,
  useDocumentSelection,
  useWorkflow,
  useWorkflowActions,
  useWorkflowSteps,
  useWorkflowAI,
  useWorkflowConfig,
  useTheme,
  useLayout,
  useToasts,
  useModals,
  useScreenInfo,
  useUIPreferences,
  initializeStores,
} from './index';

// Initialize stores when app starts
export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const cleanup = initializeStores({
      enableDevtools: process.env.NODE_ENV === 'development',
      enablePersistence: true,
      persistenceStorage: 'localStorage'
    });

    return cleanup;
  }, []);

  return <>{children}</>;
};

// Auth Examples
export const AuthExample: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const { login, logout } = useAuthActions();
  const { hasPermission, isSubscriptionActive } = usePermissions();

  const handleLogin = async () => {
    try {
      await login({
        email: 'demo@chusea.com',
        password: 'demo123',
        rememberMe: true
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading authentication...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication</h3>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isAuthenticated ? (
        <div>
          <p className="mb-4">Please log in to continue</p>
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login as Demo User
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h4 className="font-medium">Welcome, {user?.name}!</h4>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">
              Subscription: {isSubscriptionActive() ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="mb-4">
            <h5 className="font-medium mb-2">Permissions:</h5>
            <div className="space-y-1">
              <div>Admin Access: {hasPermission('admin') ? '✅' : '❌'}</div>
              <div>Write Access: {hasPermission('write') ? '✅' : '❌'}</div>
              <div>Read Access: {hasPermission('read') ? '✅' : '❌'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// Document Examples
export const DocumentExample: React.FC = () => {
  const { documents, isLoading, error } = useDocuments();
  const { currentDocument, setCurrentDocument } = useCurrentDocument();
  const { loadDocuments, createDocument, updateDocument } = useDocumentActions();
  const { searchQuery, setSearchQuery, filters, setFilters } = useDocumentFilters();
  const { selectedDocuments, isSelectMode, toggleSelectMode, selectDocument } = useDocumentSelection();

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateDocument = async () => {
    try {
      await createDocument({
        title: `New Document ${Date.now()}`,
        content: '',
        metadata: {
          wordCount: 0,
          readingTime: 0,
          language: 'en',
        },
        status: 'draft',
        tags: ['demo'],
        userId: 'user-123',
      });
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Documents</h3>

      {/* Search and Controls */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleCreateDocument}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Document
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleSelectMode}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            {isSelectMode ? 'Exit Select' : 'Select Mode'}
          </button>
          
          <select
            value={filters.status?.[0] || ''}
            onChange={(e) => setFilters({ status: e.target.value ? [e.target.value as any] : undefined })}
            className="p-1 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div>Loading documents...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : (
        <div className="space-y-2">
          {documents.length === 0 ? (
            <div className="text-gray-500">No documents found</div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-3 border rounded cursor-pointer ${
                  currentDocument?.id === doc.id ? 'bg-blue-100' : 'hover:bg-gray-50'
                } ${
                  selectedDocuments.includes(doc.id) ? 'bg-yellow-100' : ''
                }`}
                onClick={() => {
                  if (isSelectMode) {
                    selectDocument(doc.id);
                  } else {
                    setCurrentDocument(doc);
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{doc.title}</h4>
                    <p className="text-sm text-gray-600">
                      {doc.metadata.wordCount} words • {doc.status} • {doc.tags.join(', ')}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Current Document Editor */}
      {currentDocument && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">Editing: {currentDocument.title}</h4>
          <input
            type="text"
            value={currentDocument.title}
            onChange={(e) => setCurrentDocument({ ...currentDocument, title: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            value={currentDocument.content}
            onChange={(e) => setCurrentDocument({ ...currentDocument, content: e.target.value })}
            className="w-full p-2 border rounded h-32"
            placeholder="Document content..."
          />
          <button
            onClick={() => updateDocument(currentDocument.id, currentDocument)}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

// Workflow Examples
export const WorkflowExample: React.FC = () => {
  const { currentWorkflow: _, status, error, progress } = useWorkflow();
  const { startWorkflow, stopWorkflow, resumeWorkflow: __, goToStep, resetWorkflow } = useWorkflowActions();
  const { steps, currentStep } = useWorkflowSteps();
  const { aiSuggestions, isGenerating, generateWithAI } = useWorkflowAI();
  const { config, updateConfig } = useWorkflowConfig();

  const handleStartWorkflow = async () => {
    try {
      await startWorkflow('demo-document-id', {
        writingStyle: 'professional',
        targetLength: 'medium',
        includeResearch: true,
      });
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
  };

  const handleGenerateAI = async () => {
    try {
      await generateWithAI({
        prompt: `Generate content for the ${currentStep} step`,
        style: config.writingStyle,
        length: config.targetLength,
      });
    } catch (error) {
      console.error('AI generation failed:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">AI Writing Workflow</h3>

      {/* Workflow Configuration */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Writing Style</label>
            <select
              value={config.writingStyle}
              onChange={(e) => updateConfig({ writingStyle: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="professional">Professional</option>
              <option value="academic">Academic</option>
              <option value="casual">Casual</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Length</label>
            <select
              value={config.targetLength}
              onChange={(e) => updateConfig({ targetLength: e.target.value as any })}
              className="w-full p-2 border rounded"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>
        </div>
        
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.includeResearch}
              onChange={(e) => updateConfig({ includeResearch: e.target.checked })}
              className="mr-2"
            />
            Include Research Step
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.autoAdvance}
              onChange={(e) => updateConfig({ autoAdvance: e.target.checked })}
              className="mr-2"
            />
            Auto-advance Steps
          </label>
        </div>
      </div>

      {/* Workflow Status */}
      {!status ? (
        <div>
          <p className="mb-4">No active workflow</p>
          <button
            onClick={handleStartWorkflow}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start AI Writing Workflow
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Current Step: {currentStep?.name}</h4>
              <span className="text-sm text-gray-600">Progress: {progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => goToStep(steps[steps.indexOf(currentStep) - 1]?.id)}
              className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
              disabled={steps.indexOf(currentStep) === 0}
            >
              Previous
            </button>
            <button
              onClick={() => goToStep(steps[steps.indexOf(currentStep) + 1]?.id)}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={steps.indexOf(currentStep) === steps.length - 1}
            >
              Next
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
            <button
              onClick={stopWorkflow}
              className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
            >
              Pause
            </button>
            <button
              onClick={resetWorkflow}
              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {currentStep && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium">Current Step: {currentStep.name}</h4>
          <p>Status: {currentStep.status}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => goToStep(steps[steps.indexOf(currentStep) + 1]?.id)}
              className="bg-gray-200 px-3 py-1 rounded"
              disabled={steps.indexOf(currentStep) === steps.length - 1}
            >
              Next Step
            </button>
            <button
              onClick={handleGenerateAI}
              className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          {aiSuggestions.length > 0 && (
            <div className="mt-2 p-2 bg-purple-50 rounded">
              <h5 className="font-medium">AI Suggestions:</h5>
              <ul className="list-disc list-inside text-sm">
                {aiSuggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// UI Examples
export const UIExample: React.FC = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { sidebarOpen, toggleSidebar, sidebarCollapsed, setSidebarCollapsed } = useLayout();
  const { addToast, clearAllToasts } = useToasts();
  const { openModal, closeAllModals } = useModals();
  const { screenSize, isMobile, isTablet, isDesktop } = useScreenInfo();
  const { preferences, updatePreferences } = useUIPreferences();

  const showToastExample = (type: 'success' | 'error' | 'warning' | 'info') => {
    addToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Message`,
      description: `This is a ${type} toast notification example`,
      duration: 3000,
    });
  };

  const showModalExample = () => {
    openModal({
      id: 'example-modal',
      title: 'Example Modal',
      content: (
        <div className="p-4">
          <p>This is an example modal content.</p>
          <button
            onClick={() => closeAllModals()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Close Modal
          </button>
        </div>
      ),
      size: 'md',
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">UI Controls</h3>

      {/* Theme Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Theme</h4>
        <div className="flex gap-2">
          <button
            onClick={toggleTheme}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            Toggle Theme (Current: {theme})
          </button>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Layout Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Layout</h4>
        <div className="space-y-2">
          <button
            onClick={toggleSidebar}
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
          >
            {sidebarOpen ? 'Hide' : 'Show'} Sidebar
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 ml-2"
          >
            {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
          </button>
        </div>
      </div>

      {/* Screen Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Screen Info</h4>
        <div className="text-sm space-y-1">
          <div>Size: {screenSize}</div>
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
          <div>Desktop: {isDesktop ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Toast Examples */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Toast Notifications</h4>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => showToastExample('success')}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Success
          </button>
          <button
            onClick={() => showToastExample('error')}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Error
          </button>
          <button
            onClick={() => showToastExample('warning')}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Warning
          </button>
          <button
            onClick={() => showToastExample('info')}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Info
          </button>
          <button
            onClick={clearAllToasts}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Modal Example */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Modal</h4>
        <div className="flex gap-2">
          <button
            onClick={showModalExample}
            className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
          >
            Open Modal
          </button>
          <button
            onClick={closeAllModals}
            className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600"
          >
            Close All Modals
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Preferences</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.animations}
              onChange={(e) => updatePreferences({ animations: e.target.checked })}
              className="mr-2"
            />
            Enable Animations
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.autoSave}
              onChange={(e) => updatePreferences({ autoSave: e.target.checked })}
              className="mr-2"
            />
            Auto Save
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.compactMode}
              onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
              className="mr-2"
            />
            Compact Mode
          </label>
        </div>
      </div>
    </div>
  );
};

// Complete Example App
export const StoreExamplesApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'auth' | 'documents' | 'workflow' | 'ui'>('auth');

  const tabs = [
    { key: 'auth', label: 'Authentication' },
    { key: 'documents', label: 'Documents' },
    { key: 'workflow', label: 'Workflow' },
    { key: 'ui', label: 'UI Controls' },
  ] as const;

  return (
    <AppInitializer>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">ChUseA Stores Examples</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'auth' && <AuthExample />}
          {activeTab === 'documents' && <DocumentExample />}
          {activeTab === 'workflow' && <WorkflowExample />}
          {activeTab === 'ui' && <UIExample />}
        </div>
      </div>
    </AppInitializer>
  );
};

export default StoreExamplesApp;