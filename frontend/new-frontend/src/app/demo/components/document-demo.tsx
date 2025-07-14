'use client';

import { useState } from 'react';
import { useSimpleDocumentStore, useSimpleToast } from '../../../lib/stores/simple-stores';

export function DocumentDemo() {
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const {
    documents,
    currentDocument,
    createDocument,
    setCurrentDocument,
    updateDocument,
    deleteDocument
  } = useSimpleDocumentStore();
  
  const toast = useSimpleToast();

  const handleCreateDocument = async () => {
    if (!newTitle.trim()) {
      toast.error('Validation Error', 'Please enter a document title');
      return;
    }

    setIsCreating(true);
    try {
      const doc = createDocument(newTitle, newContent || 'Start writing your content here...');
      setNewTitle('');
      setNewContent('');
      toast.success('Document Created', `"${doc.title}" has been created successfully`);
    } catch (error) {
      toast.error('Creation Failed', 'Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectDocument = (doc: any) => {
    setCurrentDocument(doc);
    toast.info('Document Selected', `Now editing "${doc.title}"`);
  };

  const handleUpdateContent = (content: string) => {
    if (currentDocument) {
      updateDocument(currentDocument.id, { content });
    }
  };

  const handleDeleteDocument = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteDocument(id);
      toast.success('Document Deleted', `"${title}" has been deleted`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Document Management Demo
      </h2>

      {/* Document Creation */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Create New Document</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter document title"
              disabled={isCreating}
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Initial Content (Optional)
            </label>
            <textarea
              id="content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter initial content..."
              disabled={isCreating}
            />
          </div>
          
          <button
            onClick={handleCreateDocument}
            disabled={isCreating || !newTitle.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create Document'}
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
          Documents ({documents.length})
        </h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No documents yet. Create your first document above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  currentDocument?.id === doc.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                onClick={() => handleSelectDocument(doc)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {doc.metadata.wordCount} words • {doc.metadata.readingTime} min read
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusBadge(doc.status)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id, doc.title);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete document"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {documents.length > 5 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                ... and {documents.length - 5} more documents
              </p>
            )}
          </div>
        )}
      </div>

      {/* Current Document Editor */}
      {currentDocument && (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Editing: {currentDocument.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(currentDocument.updatedAt).toLocaleString()}
            </p>
          </div>
          
          <div className="p-4">
            <textarea
              value={currentDocument.content}
              onChange={(e) => handleUpdateContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Start writing your content here..."
            />
            
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>
                Word count: {currentDocument.metadata.wordCount}
              </span>
              <span>
                Reading time: {currentDocument.metadata.readingTime} minutes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}