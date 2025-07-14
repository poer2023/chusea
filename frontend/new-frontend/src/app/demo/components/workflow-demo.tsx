'use client';

import { useSimpleWorkflowStore, useSimpleDocumentStore, useSimpleToast } from '../../../lib/stores/simple-stores';

export function WorkflowDemo() {
  const { activeWorkflow, startWorkflow, completeStep, cancelWorkflow } = useSimpleWorkflowStore();
  const { currentDocument, documents } = useSimpleDocumentStore();
  const toast = useSimpleToast();

  const handleStartWorkflow = async () => {
    if (!currentDocument) {
      toast.error('No Document Selected', 'Please select or create a document first');
      return;
    }

    try {
      await startWorkflow(currentDocument.id);
      toast.success('Workflow Started', `Writing workflow started for "${currentDocument.title}"`);
    } catch (error) {
      toast.error('Workflow Start Failed', 'Failed to start the writing workflow');
    }
  };

  const handleCompleteStep = (step: any) => {
    completeStep(step);
    toast.success('Step Completed', `${step.charAt(0).toUpperCase() + step.slice(1)} step has been completed`);
  };

  const handleCancelWorkflow = () => {
    if (window.confirm('Are you sure you want to cancel the current workflow?')) {
      cancelWorkflow();
      toast.info('Workflow Cancelled', 'The writing workflow has been cancelled');
    }
  };

  const getStepIcon = (step: string) => {
    const icons = {
      planning: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      research: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      outlining: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      writing: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      editing: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      review: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
    
    return icons[step as keyof typeof icons] || icons.planning;
  };

  const getStepStatus = (status: string) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      in_progress: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      skipped: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    };
    
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Writing Workflow Demo
      </h2>

      {/* Workflow Controls */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Workflow Controls</h3>
        
        {!activeWorkflow ? (
          <div className="space-y-3">
            {currentDocument ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Selected Document:</strong> {currentDocument.title}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Ready to start the AI writing workflow for this document.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  No document selected. Please select a document from the Document Demo section first.
                </p>
                {documents.length === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                    You'll need to create a document first.
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={handleStartWorkflow}
              disabled={!currentDocument}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Writing Workflow
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Active Workflow</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Document: {documents.find(d => d.id === activeWorkflow.documentId)?.title || 'Unknown'}
                </p>
              </div>
              <button
                onClick={handleCancelWorkflow}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel Workflow
              </button>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(Number(activeWorkflow.progress))}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Number(activeWorkflow.progress)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Steps */}
      {activeWorkflow && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Workflow Steps</h3>
          
          <div className="space-y-3">
            {activeWorkflow.steps.map((stepData) => (
              <div
                key={stepData.step}
                className={`p-4 border rounded-lg ${
                  stepData.status === 'in_progress'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : stepData.status === 'completed'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStepStatus(stepData.status)}`}>
                      {getStepIcon(stepData.step)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {stepData.step.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        Status: {stepData.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  {stepData.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteStep(stepData.step)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Complete Step
                    </button>
                  )}
                  
                  {stepData.status === 'completed' && (
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                </div>
                
                {stepData.status === 'in_progress' && (
                  <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
                    This step is currently active. Click "Complete Step" when finished.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Workflow Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Workflow Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Workflow ID:</span>
                <p className="font-mono text-gray-900 dark:text-white">{activeWorkflow.id}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Current Step:</span>
                <p className="text-gray-900 dark:text-white capitalize">{activeWorkflow.currentStep}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Started:</span>
                <p className="text-gray-900 dark:text-white">
                  {new Date(activeWorkflow.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <p className="text-gray-900 dark:text-white">
                  {new Date(activeWorkflow.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}