import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'M0.2 Integration Demo | ChUseA',
  description: 'Demonstration of ChUseA M0.2 state management and component integration',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ChUseA M0.2 Demo
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                State Management & Component Integration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                ← Back to Home
              </a>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Next.js 15 + React 19
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              ChUseA AI Writing Tool - M0.2 Integration Demo
            </p>
            <p className="mt-1">
              Powered by Next.js 15, React 19, Zustand, and TanStack Query
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}