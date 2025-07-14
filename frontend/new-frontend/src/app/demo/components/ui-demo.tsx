'use client';

import { useSimpleUIStore, useSimpleToast } from '../../../lib/stores/simple-stores';
import { useTheme, ThemeToggle } from '../../../lib/providers/theme-provider';

export function UIDemo() {
  const { theme, sidebarOpen, toggleSidebar } = useSimpleUIStore();
  const { theme: currentTheme, resolvedTheme, setTheme } = useTheme();
  const toast = useSimpleToast();

  const handleToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: {
        title: 'Operation Successful!',
        description: 'Your action was completed successfully.'
      },
      error: {
        title: 'Something went wrong',
        description: 'Please try again or contact support if the issue persists.'
      },
      warning: {
        title: 'Warning Notice',
        description: 'Please review your input before proceeding.'
      },
      info: {
        title: 'Information',
        description: 'Here\'s some helpful information for you.'
      }
    };

    toast[type](messages[type].title, messages[type].description);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    toast.info('Theme Changed', `Theme has been set to ${newTheme}`);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        UI Controls Demo
      </h2>

      {/* Theme Controls */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Theme Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Theme:</p>
              <p className="text-gray-900 dark:text-white">{currentTheme} (resolves to {resolvedTheme})</p>
            </div>
            <ThemeToggle />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Options:</p>
            <div className="flex space-x-2">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => handleThemeChange(themeOption)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentTheme === themeOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  }`}
                >
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The theme system supports light, dark, and system preferences. 
              System preference automatically detects your OS theme setting.
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Sidebar Controls</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sidebar Status:</p>
              <p className="text-gray-900 dark:text-white">
                {sidebarOpen ? 'Open' : 'Closed'}
              </p>
            </div>
            <button
              onClick={() => {
                toggleSidebar();
                toast.info('Sidebar Toggled', `Sidebar is now ${!sidebarOpen ? 'open' : 'closed'}`);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Toggle Sidebar
            </button>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sidebar state is persisted in localStorage and synced across the application.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Toast Notifications</h3>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click the buttons below to test different types of toast notifications:
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleToastDemo('success')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Success Toast
            </button>
            
            <button
              onClick={() => handleToastDemo('error')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Error Toast
            </button>
            
            <button
              onClick={() => handleToastDemo('warning')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              Warning Toast
            </button>
            
            <button
              onClick={() => handleToastDemo('info')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Info Toast
            </button>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toast notifications auto-dismiss after 5 seconds and can be manually closed. 
              They appear in the top-right corner of the screen.
            </p>
          </div>
        </div>
      </div>

      {/* Component State Display */}
      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Component State</h3>
        
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono overflow-x-auto">
{JSON.stringify({
  theme: {
    current: currentTheme,
    resolved: resolvedTheme,
    store: theme
  },
  sidebar: {
    open: sidebarOpen
  },
  toasts: {
    count: useSimpleUIStore.getState().toasts.length
  }
}, null, 2)}
            </pre>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This shows the current state of UI components in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}