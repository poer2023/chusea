/**
 * Rich Text Editor Demo Page
 * 
 * Demonstrates the TipTap v2 rich text editor integration
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { RichTextEditor, RichTextEditorRef, EditorContent } from '@/components/editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { themeManager } from '@/styles/themes';
import { useDocumentStore } from '@/stores/document-store';

const DEMO_CONTENT = `
<h1>Welcome to the Rich Text Editor Demo</h1>

<p>This is a comprehensive demonstration of our TipTap v2 integration. Try out the various features:</p>

<h2>Text Formatting</h2>
<p>You can make text <strong>bold</strong>, <em>italic</em>, <u>underlined</u>, <s>strikethrough</s>, or <mark>highlighted</mark>. You can also create <code>inline code</code> snippets.</p>

<h2>Lists</h2>
<p>Create bullet lists:</p>
<ul>
  <li>First item</li>
  <li>Second item with <strong>formatting</strong></li>
  <li>Third item</li>
</ul>

<p>Or numbered lists:</p>
<ol>
  <li>Step one</li>
  <li>Step two</li>
  <li>Step three</li>
</ol>

<h2>Blockquotes</h2>
<blockquote>
  <p>This is a blockquote. Perfect for highlighting important information or quotes from other sources.</p>
</blockquote>

<h2>Code Blocks</h2>
<pre><code>function hello() {
  console.log("Hello, World!");
  return "Demo code block";
}</code></pre>

<h2>Links</h2>
<p>You can create <a href="https://example.com">links to external websites</a> easily.</p>

<h2>Alignment</h2>
<p style="text-align: center">This text is center-aligned.</p>
<p style="text-align: right">This text is right-aligned.</p>

<hr>

<p>Select any text to see the bubble menu, or click in an empty line to see the floating menu with quick block options!</p>
`;

export default function EditorDemoPage() {
  // State management
  const [content, setContent] = useState(DEMO_CONTENT);
  const [autoSave, setAutoSave] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [editorContent, setEditorContent] = useState<EditorContent | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Refs
  const editorRef = useRef<RichTextEditorRef>(null);

  // Document store
  const { createDocument, currentDocument, setCurrentDocument } = useDocumentStore();

  // Theme management
  const [theme, setTheme] = useState(themeManager.getResolvedTheme());

  // Handlers
  const handleContentChange = useCallback((content: EditorContent) => {
    setEditorContent(content);
  }, []);

  const handleSave = useCallback(async (content: EditorContent) => {
    setSaveStatus('saving');
    
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentDocument) {
        // Update existing document
        // In a real app, this would call the API
        console.log('Saving document:', currentDocument.id, content);
      } else {
        // Create new document
        const newDoc = await createDocument({
          title: 'Rich Text Editor Demo',
          content: content.html,
          tags: [
            { 
              id: '1', 
              name: 'demo', 
              slug: 'demo', 
              color: '#3B82F6',
              isSystem: false,
              usage: 1,
              createdAt: new Date().toISOString(),
              createdBy: 'demo-user'
            },
            { 
              id: '2', 
              name: 'editor', 
              slug: 'editor', 
              color: '#10B981',
              isSystem: false,
              usage: 1,
              createdAt: new Date().toISOString(),
              createdBy: 'demo-user'
            }
          ],
          metadata: {
            wordCount: content.wordCount,
            characterCount: content.characterCount,
            paragraphCount: 0,
            sentenceCount: 0,
            readingTime: Math.ceil(content.wordCount / 200),
            readabilityScore: 0,
            language: 'en',
            seoKeywords: [],
            contentType: 'other',
            format: 'html',
            encoding: 'utf-8',
            checksum: '',
            customFields: {},
          },
        });
        
        setCurrentDocument(newDoc);
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    }
  }, [currentDocument, createDocument, setCurrentDocument]);

  const handleToggleTheme = () => {
    themeManager.toggleLightDark();
    setTheme(themeManager.getResolvedTheme());
  };

  const handleClearContent = () => {
    if (editorRef.current) {
      editorRef.current.clearContent();
    }
  };

  const handleInsertSample = () => {
    if (editorRef.current) {
      editorRef.current.insertContent(`
        <h3>Inserted Content</h3>
        <p>This content was inserted programmatically at ${new Date().toLocaleTimeString()}.</p>
      `);
    }
  };

  const handleExportContent = () => {
    if (editorContent) {
      const blob = new Blob([editorContent.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'editor-content.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Rich Text Editor Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Experience our comprehensive TipTap v2 implementation with full feature support
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoSave"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="autoSave" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto-save (30s)
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="readonly"
                checked={readonly}
                onChange={(e) => setReadonly(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="readonly" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Read-only mode
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showSource"
                checked={showSource}
                onChange={(e) => setShowSource(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="showSource" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show HTML source
              </label>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <Button
                onClick={handleToggleTheme}
                variant="outline"
                size="sm"
              >
                {theme === 'light' ? '🌙' : '☀️'} Toggle Theme
              </Button>

              <Button
                onClick={handleClearContent}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>

              <Button
                onClick={handleInsertSample}
                variant="outline"
                size="sm"
              >
                Insert Sample
              </Button>

              <Button
                onClick={handleExportContent}
                variant="outline"
                size="sm"
                disabled={!editorContent}
              >
                Export HTML
              </Button>

              <Button
                onClick={() => editorContent && handleSave(editorContent)}
                variant="solid"
                colorScheme="primary"
                size="sm"
                disabled={!editorContent || saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'saved' ? 'Saved!' : 
                 saveStatus === 'error' ? 'Error' : 'Save'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <RichTextEditor
                ref={editorRef}
                content={content}
                placeholder="Start writing your amazing content here..."
                autoFocus={false}
                readonly={readonly}
                autoSave={autoSave}
                autoSaveInterval={30000}
                onChange={handleContentChange}
                onSave={handleSave}
                toolbar={{
                  groups: ['formatting', 'blocks', 'lists', 'alignment', 'links', 'advanced'],
                  position: 'top',
                }}
                maxHeight="600px"
                minHeight="400px"
                className="h-full"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Content Statistics
              </h3>
              {editorContent ? (
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium">{editorContent.wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-medium">{editorContent.characterCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading time:</span>
                    <span className="font-medium">{Math.ceil(editorContent.wordCount / 200)} min</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start typing to see statistics
                </p>
              )}
            </Card>

            {/* Features */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Features Included
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>✅ Rich text formatting</li>
                <li>✅ Headings and blocks</li>
                <li>✅ Lists (bullet & numbered)</li>
                <li>✅ Text alignment</li>
                <li>✅ Links and media</li>
                <li>✅ Code blocks</li>
                <li>✅ Floating menu</li>
                <li>✅ Bubble menu</li>
                <li>✅ Keyboard shortcuts</li>
                <li>✅ Theme integration</li>
                <li>✅ Document persistence</li>
                <li>✅ Auto-save</li>
                <li>✅ Error handling</li>
                <li>✅ TypeScript support</li>
              </ul>
            </Card>

            {/* Shortcuts */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Keyboard Shortcuts
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Bold:</span>
                  <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+B</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Italic:</span>
                  <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+I</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Underline:</span>
                  <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+U</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Undo:</span>
                  <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Z</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Redo:</span>
                  <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Y</kbd>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* HTML Source */}
        {showSource && editorContent && (
          <Card className="mt-6 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              HTML Source
            </h3>
            <pre className={clsx(
              'text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto',
              'text-gray-800 dark:text-gray-200'
            )}>
              <code>{editorContent.html}</code>
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}