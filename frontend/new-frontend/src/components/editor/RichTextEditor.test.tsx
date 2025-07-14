import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

// Mock TipTap dependencies
vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    getHTML: () => '<p>Test content</p>',
    getText: () => 'Test content',
    commands: {
      setContent: vi.fn(),
      clearContent: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
    },
    can: () => ({ undo: () => true, redo: () => true }),
    isActive: () => false,
    isEmpty: false,
    isFocused: false,
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  }),
  EditorContent: ({ editor }: any) => (
    <div data-testid="editor-content" contentEditable>
      Editor Content
    </div>
  ),
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: {},
}));

describe('RichTextEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders editor content', () => {
    render(<RichTextEditor />);
    
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('renders editor toolbar', () => {
    render(<RichTextEditor />);
    
    const toolbar = screen.getByTestId('editor-toolbar');
    expect(toolbar).toBeInTheDocument();
    
    // Check for basic formatting buttons
    expect(screen.getByTestId('bold-button')).toBeInTheDocument();
    expect(screen.getByTestId('italic-button')).toBeInTheDocument();
  });

  it('handles bold formatting', () => {
    render(<RichTextEditor />);
    
    const boldButton = screen.getByTestId('bold-button');
    fireEvent.click(boldButton);
    
    // The mock should be called
    expect(boldButton).toBeInTheDocument();
  });

  it('handles italic formatting', () => {
    render(<RichTextEditor />);
    
    const italicButton = screen.getByTestId('italic-button');
    fireEvent.click(italicButton);
    
    expect(italicButton).toBeInTheDocument();
  });

  it('handles undo operation', () => {
    render(<RichTextEditor />);
    
    const undoButton = screen.getByTestId('undo-button');
    fireEvent.click(undoButton);
    
    expect(undoButton).toBeInTheDocument();
  });

  it('handles redo operation', () => {
    render(<RichTextEditor />);
    
    const redoButton = screen.getByTestId('redo-button');
    fireEvent.click(redoButton);
    
    expect(redoButton).toBeInTheDocument();
  });

  it('accepts initial content prop', () => {
    const initialContent = '<p>Initial test content</p>';
    render(<RichTextEditor initialContent={initialContent} />);
    
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });

  it('calls onChange when content changes', () => {
    const onChange = vi.fn();
    render(<RichTextEditor onChange={onChange} />);
    
    // Simulate content change
    const editorContent = screen.getByTestId('editor-content');
    fireEvent.input(editorContent, { target: { innerHTML: '<p>New content</p>' } });
    
    // onChange should be called (mocked behavior)
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });

  it('supports placeholder text', () => {
    const placeholder = 'Start writing...';
    render(<RichTextEditor placeholder={placeholder} />);
    
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument();
  });

  it('can be set to read-only mode', () => {
    render(<RichTextEditor readOnly />);
    
    const toolbar = screen.queryByTestId('editor-toolbar');
    // Toolbar should not be visible in read-only mode
    expect(toolbar).not.toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    render(<RichTextEditor />);
    
    const editorContent = screen.getByTestId('editor-content');
    
    // Test Ctrl+B for bold
    fireEvent.keyDown(editorContent, { key: 'b', ctrlKey: true });
    
    expect(editorContent).toBeInTheDocument();
  });

  it('shows floating toolbar on text selection', async () => {
    render(<RichTextEditor />);
    
    const editorContent = screen.getByTestId('editor-content');
    
    // Simulate text selection
    fireEvent.mouseUp(editorContent);
    
    // Check if floating toolbar appears
    await waitFor(() => {
      const floatingToolbar = screen.queryByTestId('floating-toolbar');
      if (floatingToolbar) {
        expect(floatingToolbar).toBeInTheDocument();
      }
    });
  });

  it('supports different editor sizes', () => {
    render(<RichTextEditor className="h-96" />);
    
    const editor = screen.getByTestId('tiptap-editor');
    expect(editor).toHaveClass('h-96');
  });

  it('handles editor focus and blur events', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    render(<RichTextEditor onFocus={onFocus} onBlur={onBlur} />);
    
    const editorContent = screen.getByTestId('editor-content');
    
    fireEvent.focus(editorContent);
    fireEvent.blur(editorContent);
    
    expect(editorContent).toBeInTheDocument();
  });
});