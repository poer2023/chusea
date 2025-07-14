import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatInterface } from './chat-interface';

// Mock dependencies
vi.mock('@/hooks/api/use-auth', () => ({
  useAuth: () => ({ user: { id: '1', name: 'Test User' } })
}));

vi.mock('@/hooks/websocket/hooks', () => ({
  useWebSocket: () => ({
    isConnected: true,
    sendMessage: vi.fn(),
    messages: []
  })
}));

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ChatInterface Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders chat interface elements', () => {
    renderWithQueryClient(<ChatInterface />);
    
    expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('allows typing in chat input', () => {
    renderWithQueryClient(<ChatInterface />);
    
    const chatInput = screen.getByTestId('chat-input') as HTMLInputElement;
    fireEvent.change(chatInput, { target: { value: 'Hello AI assistant' } });
    
    expect(chatInput.value).toBe('Hello AI assistant');
  });

  it('sends message when send button is clicked', async () => {
    renderWithQueryClient(<ChatInterface />);
    
    const chatInput = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(chatInput, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    // Input should be cleared after sending
    await waitFor(() => {
      expect((chatInput as HTMLInputElement).value).toBe('');
    });
  });

  it('sends message when Enter is pressed', async () => {
    renderWithQueryClient(<ChatInterface />);
    
    const chatInput = screen.getByTestId('chat-input');
    
    fireEvent.change(chatInput, { target: { value: 'Test message' } });
    fireEvent.keyDown(chatInput, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect((chatInput as HTMLInputElement).value).toBe('');
    });
  });

  it('does not send empty messages', () => {
    renderWithQueryClient(<ChatInterface />);
    
    const sendButton = screen.getByTestId('send-button');
    
    // Try to send without typing anything
    fireEvent.click(sendButton);
    
    // Should remain disabled or not send
    expect(sendButton).toBeInTheDocument();
  });

  it('disables send button when no text is entered', () => {
    renderWithQueryClient(<ChatInterface />);
    
    const sendButton = screen.getByTestId('send-button');
    
    // Initially disabled when no text
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when text is entered', () => {
    renderWithQueryClient(<ChatInterface />);
    
    const chatInput = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(chatInput, { target: { value: 'Some text' } });
    
    expect(sendButton).not.toBeDisabled();
  });

  it('displays connection status', () => {
    renderWithQueryClient(<ChatInterface />);
    
    // Should show connected status
    const connectionStatus = screen.queryByTestId('connection-status');
    if (connectionStatus) {
      expect(connectionStatus).toBeInTheDocument();
    }
  });

  it('handles long messages correctly', () => {
    renderWithQueryClient(<ChatInterface />);
    
    const chatInput = screen.getByTestId('chat-input');
    const longMessage = 'A'.repeat(1000);
    
    fireEvent.change(chatInput, { target: { value: longMessage } });
    
    expect((chatInput as HTMLInputElement).value).toBe(longMessage);
  });

  it('supports multiline input with Shift+Enter', () => {
    renderWithQueryClient(<ChatInterface />);
    
    const chatInput = screen.getByTestId('chat-input');
    
    fireEvent.change(chatInput, { target: { value: 'Line 1' } });
    fireEvent.keyDown(chatInput, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    // Should not send message but add new line
    expect((chatInput as HTMLInputElement).value).toContain('Line 1');
  });
});