'use client';

/**
 * Enhanced Chat Input Component
 * Modern input with autocomplete, slash commands, file uploads, and rich formatting
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ChatMessage, SlashCommand } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Square,
  ArrowUp,
  Command,
  Hash,
  FileText,
  Workflow
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, type?: 'text' | 'command') => Promise<void>;
  onTypingChange?: (isTyping: boolean) => void;
  onFileUpload?: (files: File[]) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  enableCommands?: boolean;
  enableFileUpload?: boolean;
  enableVoiceInput?: boolean;
  commands?: SlashCommand[];
  maxLength?: number;
  className?: string;
}

interface CommandSuggestion {
  command: SlashCommand;
  matches: boolean;
}

const CommandSuggestions: React.FC<{
  suggestions: CommandSuggestion[];
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}> = ({ suggestions, selectedIndex, onSelect, onClose }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
      <div className="p-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Command className="w-4 h-4" />
          <span>Commands</span>
        </div>
      </div>
      
      {suggestions.map((suggestion, index) => {
        const { command } = suggestion;
        return (
          <button
            key={command.name}
            onClick={() => onSelect(command)}
            className={cn(
              'w-full text-left p-3 hover:bg-gray-50 flex items-start space-x-3 transition-colors',
              index === selectedIndex && 'bg-blue-50 border-l-2 border-blue-500'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium',
              command.category === 'workflow' ? 'bg-blue-100 text-blue-600' :
              command.category === 'document' ? 'bg-green-100 text-green-600' :
              command.category === 'ai' ? 'bg-purple-100 text-purple-600' :
              'bg-gray-100 text-gray-600'
            )}>
              {command.category === 'workflow' && <Workflow className="w-4 h-4" />}
              {command.category === 'document' && <FileText className="w-4 h-4" />}
              {command.category === 'system' && <Hash className="w-4 h-4" />}
              {command.category === 'ai' && <span>AI</span>}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">/{command.name}</span>
                <Badge variant="outline" className="text-xs">
                  {command.category}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {command.description}
              </div>
              <div className="text-xs text-gray-400 mt-1 font-mono">
                {command.usage}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const FilePreview: React.FC<{
  files: File[];
  onRemove: (index: number) => void;
}> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t bg-gray-50">
      {files.map((file, index) => (
        <div key={index} className="flex items-center space-x-2 bg-white border rounded-lg px-3 py-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 truncate max-w-[120px]">
            {file.name}
          </span>
          <button
            onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

const VoiceRecorder: React.FC<{
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onVoiceMessage: (audioBlob: Blob) => void;
}> = ({ isRecording, onStartRecording, onStopRecording, onVoiceMessage }) => {
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setDuration(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <div className="flex items-center space-x-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-red-700">Recording {formatDuration(duration)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onStopRecording}
          className="text-red-600 hover:text-red-700"
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onStartRecording}
      className="text-gray-400 hover:text-gray-600"
    >
      <Mic className="w-4 h-4" />
    </Button>
  );
};

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTypingChange,
  onFileUpload,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
  enableCommands = true,
  enableFileUpload = true,
  enableVoiceInput = false,
  commands = [],
  maxLength = 4000,
  className,
}) => {
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Filter commands based on input
  const commandSuggestions = useMemo(() => {
    if (!enableCommands || !input.startsWith('/') || input.length < 2) {
      return [];
    }

    const query = input.slice(1).toLowerCase();
    return commands
      .map(command => ({
        command,
        matches: command.name.toLowerCase().includes(query) ||
                command.description.toLowerCase().includes(query)
      }))
      .filter(suggestion => suggestion.matches)
      .slice(0, 5);
  }, [input, commands, enableCommands]);

  // Show command suggestions
  useEffect(() => {
    setShowCommands(commandSuggestions.length > 0);
    setSelectedCommandIndex(0);
  }, [commandSuggestions]);

  // Handle typing indicators
  const handleTypingChange = useCallback((value: string) => {
    if (onTypingChange) {
      onTypingChange(value.length > 0);
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        onTypingChange(false);
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  }, [onTypingChange, typingTimeout]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setInput(value);
      handleTypingChange(value);
    }
  }, [maxLength, handleTypingChange]);

  const handleSendMessage = useCallback(async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading || disabled) return;

    const messageContent = input.trim();
    const isCommand = messageContent.startsWith('/') && enableCommands;
    
    // Handle file uploads first
    if (selectedFiles.length > 0 && onFileUpload) {
      try {
        await onFileUpload(selectedFiles);
        setSelectedFiles([]);
      } catch (error) {
        console.error('File upload failed:', error);
        return;
      }
    }

    // Send text message
    if (messageContent) {
      setInput('');
      setShowCommands(false);
      
      if (onTypingChange) {
        onTypingChange(false);
      }

      try {
        await onSendMessage(messageContent, isCommand ? 'command' : 'text');
      } catch (error) {
        console.error('Send message failed:', error);
        // Restore input on failure
        setInput(messageContent);
      }
    }
  }, [input, selectedFiles, isLoading, disabled, enableCommands, onFileUpload, onSendMessage, onTypingChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (showCommands && commandSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => 
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
        return;
      }
      
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = commandSuggestions[selectedCommandIndex];
        if (selectedCommand) {
          setInput(`/${selectedCommand.command.name} `);
          setShowCommands(false);
        }
        return;
      }
      
      if (e.key === 'Escape') {
        setShowCommands(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [showCommands, commandSuggestions, selectedCommandIndex, handleSendMessage]);

  const handleCommandSelect = useCallback((command: SlashCommand) => {
    setInput(`/${command.name} `);
    setShowCommands(false);
    inputRef.current?.focus();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Handle voice message
        console.log('Voice message recorded:', audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (mediaRecorderRef.current && isRecording) {
        handleStopRecording();
      }
    };
  }, [typingTimeout, isRecording, handleStopRecording]);

  const characterCount = input.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const canSend = (input.trim() || selectedFiles.length > 0) && !isLoading && !disabled;

  return (
    <div className={cn('relative', className)}>
      {/* Command Suggestions */}
      {showCommands && (
        <CommandSuggestions
          suggestions={commandSuggestions}
          selectedIndex={selectedCommandIndex}
          onSelect={handleCommandSelect}
          onClose={() => setShowCommands(false)}
        />
      )}

      {/* File Preview */}
      <FilePreview files={selectedFiles} onRemove={handleRemoveFile} />

      {/* Voice Recording */}
      {isRecording && (
        <div className="p-3 border-t bg-gray-50">
          <VoiceRecorder
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onVoiceMessage={(blob) => console.log('Voice message:', blob)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end space-x-2 p-4 border-t bg-white">
        {/* File Upload */}
        {enableFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Input Field */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              'pr-12 resize-none',
              isNearLimit && 'border-orange-300 focus:border-orange-500'
            )}
            style={{ minHeight: '40px' }}
          />
          
          {/* Character Count */}
          {isNearLimit && (
            <div className={cn(
              'absolute bottom-1 right-1 text-xs px-1 rounded',
              characterCount > maxLength ? 'text-red-600' : 'text-orange-600'
            )}>
              {characterCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Voice Input */}
        {enableVoiceInput && (
          <VoiceRecorder
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onVoiceMessage={(blob) => console.log('Voice message:', blob)}
          />
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          size="sm"
          className={cn(
            'h-10 px-4 transition-all',
            canSend 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-200 text-gray-400'
          )}
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Hints */}
      {enableCommands && !showCommands && input.length === 0 && (
        <div className="px-4 pb-2 text-xs text-gray-400">
          Type <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">/</kbd> for commands
        </div>
      )}
    </div>
  );
};

export default ChatInput;