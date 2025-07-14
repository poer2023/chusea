'use client';

import { AuthDemo } from './components/auth-demo';
import { DocumentDemo } from './components/document-demo';
import { WorkflowDemo } from './components/workflow-demo';
import { UIDemo } from './components/ui-demo';
import { useIsHydrated } from '../../lib/providers/hydration-provider';

export default function DemoPage() {
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading demo components...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          M0.2 Integration Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This demo showcases the complete M0.2 state management architecture for the ChUseA AI Writing Tool, 
          featuring Zustand stores, TanStack Query integration, theme management, and error handling.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">State Management</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Zustand v5 with persistence and TypeScript
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100">Server State</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              TanStack Query v5 with caching and error handling
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">UI System</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              Theme management, toasts, and error boundaries
            </p>
          </div>
        </div>
      </div>

      {/* Demo Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Authentication Demo */}
        <AuthDemo />
        
        {/* UI Controls Demo */}
        <UIDemo />
      </div>

      {/* Document Management Demo */}
      <DocumentDemo />

      {/* Workflow Demo */}
      <WorkflowDemo />

      {/* Technical Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Technical Architecture
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Frontend Stack</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Next.js 15 with App Router</li>
              <li>• React 19 with Concurrent Features</li>
              <li>• TypeScript with Strict Mode</li>
              <li>• Tailwind CSS for Styling</li>
              <li>• ESLint + Prettier for Code Quality</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">State Management</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Zustand v5 for Client State</li>
              <li>• TanStack Query v5 for Server State</li>
              <li>• LocalStorage Persistence</li>
              <li>• SSR/CSR Hydration Handling</li>
              <li>• Error Boundaries & Recovery</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Provider Architecture</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The application uses a layered provider architecture: ErrorBoundary → InitializationProvider → 
            QueryProvider → ThemeProvider → StoreProvider. This ensures proper error handling, state hydration, 
            and component isolation.
          </p>
        </div>
      </div>

      {/* Development Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Development Tools
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">React Query DevTools</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Inspect queries, mutations, and cache in development
              </p>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              {process.env.NODE_ENV === 'development' ? 'Active' : 'Production Build'}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Zustand DevTools</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Redux DevTools integration for state debugging
              </p>
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              Browser Extension
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Error Boundary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Graceful error handling with recovery options
              </p>
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
              Global Protection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}