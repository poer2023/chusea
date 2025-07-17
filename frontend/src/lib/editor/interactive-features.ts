/**
 * Interactive Features Hook
 * 
 * Provides advanced interaction utilities for the editor including
 * hover effects, animations, and gesture support.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';

export interface InteractionConfig {
  /** Enable hover effects */
  hover?: boolean;
  /** Enable smooth animations */
  animations?: boolean;
  /** Enable drag and drop */
  dragDrop?: boolean;
  /** Enable gesture support */
  gestures?: boolean;
  /** Enable keyboard shortcuts */
  keyboardShortcuts?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Hover delay in ms */
  hoverDelay?: number;
}

export interface InteractionState {
  /** Currently hovered element */
  hoveredElement: Element | null;
  /** Active drag operation */
  isDragging: boolean;
  /** Active gesture */
  activeGesture: string | null;
  /** Animation state */
  animating: boolean;
  /** Last interaction time */
  lastInteractionTime: number;
}

export interface HoverInfo {
  /** Hovered element */
  element: Element;
  /** Element type */
  type: string;
  /** Element content */
  content: string;
  /** Position */
  position: DOMRect;
  /** Suggested actions */
  suggestedActions: string[];
}

export interface GestureInfo {
  /** Gesture type */
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch';
  /** Gesture position */
  position: { x: number; y: number };
  /** Gesture data */
  data?: any;
  /** Timestamp */
  timestamp: number;
}

export const useInteractiveFeatures = (
  editor: Editor | null,
  config: InteractionConfig = {}
) => {
  const {
    hover = true,
    animations = true,
    dragDrop = true,
    gestures = true,
    keyboardShortcuts = true,
    animationDuration = 200,
    hoverDelay = 300,
  } = config;

  const [state, setState] = useState<InteractionState>({
    hoveredElement: null,
    isDragging: false,
    activeGesture: null,
    animating: false,
    lastInteractionTime: 0,
  });

  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const gestureTimeoutRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();

  // Hover effects
  const handleMouseEnter = useCallback((event: MouseEvent) => {
    if (!hover || !editor) return;

    const target = event.target as Element;
    const isEditorElement = editor.view.dom.contains(target);
    
    if (!isEditorElement) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        hoveredElement: target,
        lastInteractionTime: Date.now(),
      }));

      // Add hover effects
      target.classList.add('editor-hover');
      
      // Animate hover effect
      if (animations) {
        target.style.transition = `all ${animationDuration}ms ease`;
        target.style.transform = 'scale(1.02)';
      }
    }, hoverDelay);
  }, [hover, editor, hoverDelay, animations, animationDuration]);

  const handleMouseLeave = useCallback((event: MouseEvent) => {
    if (!hover || !editor) return;

    const target = event.target as Element;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setState(prev => ({ 
      ...prev, 
      hoveredElement: null,
      lastInteractionTime: Date.now(),
    }));

    // Remove hover effects
    target.classList.remove('editor-hover');
    
    if (animations) {
      target.style.transform = 'scale(1)';
    }
  }, [hover, editor, animations]);

  // Gesture support
  const handleGesture = useCallback((info: GestureInfo) => {
    // Handle gesture events here
    if (animations) {
      // Add feedback for gestures
    }
  }, [animations]);

  // Drag and drop
  const handleDragStart = useCallback((event: DragEvent) => {
    if (!dragDrop || !editor) return;

    setState(prev => ({ 
      ...prev, 
      isDragging: true,
      lastInteractionTime: Date.now(),
    }));

    const target = event.target as Element;
    target.classList.add('editor-dragging');

    // Set drag data
    const selection = editor.state.selection;
    if (!selection.empty) {
      const text = editor.state.doc.textBetween(selection.from, selection.to);
      event.dataTransfer?.setData('text/plain', text);
      event.dataTransfer?.setData('text/html', text);
    }
  }, [dragDrop, editor]);

  const handleDragEnd = useCallback((event: DragEvent) => {
    if (!dragDrop) return;

    setState(prev => ({ 
      ...prev, 
      isDragging: false,
      lastInteractionTime: Date.now(),
    }));

    const target = event.target as Element;
    target.classList.remove('editor-dragging');
  }, [dragDrop]);

  const handleDragOver = useCallback((event: DragEvent) => {
    if (!dragDrop) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }, [dragDrop]);

  const handleDrop = useCallback((event: DragEvent) => {
    if (!dragDrop || !editor) return;

    event.preventDefault();
    
    const text = event.dataTransfer?.getData('text/plain');
    if (text) {
      const coords = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });
      
      if (coords) {
        editor.chain().focus().insertContentAt(coords.pos, text).run();
      }
    }
  }, [dragDrop, editor]);

  // Gesture support
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!gestures || !editor) return;

    const touch = event.touches[0];
    const gestureData = {
      startTime: Date.now(),
      startX: touch.clientX,
      startY: touch.clientY,
      touchCount: event.touches.length,
    };

    setState(prev => ({ 
      ...prev, 
      activeGesture: 'touch-start',
      lastInteractionTime: Date.now(),
    }));

    // Store gesture data
    (event.target as any).__gestureData = gestureData;

    gestureTimeoutRef.current = setTimeout(() => {
      handleGesture({ type: 'long-press', position: { x: gestureData.startX, y: gestureData.startY }, timestamp: Date.now() });
    }, 500);
  }, [gestures, editor, handleGesture]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!gestures || !editor) return;

    const touch = event.touches[0];
    const gestureData = (event.target as any).__gestureData;
    
    if (gestureData) {
      const deltaX = touch.clientX - gestureData.startX;
      const deltaY = touch.clientY - gestureData.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 10) {
        setState(prev => ({ 
          ...prev, 
          activeGesture: 'swipe',
          lastInteractionTime: Date.now(),
        }));
      }
    }

    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }
  }, [gestures, editor]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!gestures || !editor) return;

    const touch = event.changedTouches[0];
    const gestureData = (event.target as any).__gestureData;
    const duration = Date.now() - gestureData.startTime;

    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }
    
    if (duration < 200) {
      // Handle tap/double-tap
      const lastTap = (event.target as any).__lastTap || 0;
      if (Date.now() - lastTap < 300) {
        handleGesture({ type: 'double-tap', position: { x: gestureData.startX, y: gestureData.startY }, timestamp: Date.now() });
      } else {
        handleGesture({ type: 'tap', position: { x: gestureData.startX, y: gestureData.startY }, timestamp: Date.now() });
      }
      (event.target as any).__lastTap = Date.now();
    }
    
    setState(prev => ({ 
      ...prev, 
      activeGesture: null,
      lastInteractionTime: Date.now(),
    }));
  }, [gestures, editor, handleGesture]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!keyboardShortcuts || !editor) return;

    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;

    // Advanced shortcuts
    if (isCtrl && isShift) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          editor.chain().focus().selectParentNode().run();
          break;
        case 'ArrowDown':
          event.preventDefault();
          editor.chain().focus().selectAll().run();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          editor.chain().focus().selectTextblockStart().run();
          break;
        case 'ArrowRight':
          event.preventDefault();
          editor.chain().focus().selectTextblockEnd().run();
          break;
      }
    } else if (isCtrl && isAlt) {
      switch (event.key) {
        case 'h':
          event.preventDefault();
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case 'l':
          event.preventDefault();
          editor.chain().focus().toggleBulletList().run();
          break;
        case 'o':
          event.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
          break;
        case 'q':
          event.preventDefault();
          editor.chain().focus().toggleBlockquote().run();
          break;
      }
    }

    // Example shortcut: Ctrl + B for bold
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      editor.chain().focus().toggleBold().run();
    }
  }, [keyboardShortcuts, editor]);

  // Animation utilities
  const animate = useCallback((element: Element, animation: string) => {
    if (!animations) return;

    setState(prev => ({ ...prev, animating: true }));
    
    element.classList.add(`editor-${animation}`);
    
    const cleanup = () => {
      element.classList.remove(`editor-${animation}`);
      setState(prev => ({ ...prev, animating: false }));
    };

    setTimeout(cleanup, animationDuration);
  }, [animations, animationDuration]);

  // Smooth scroll to element
  const scrollToElement = useCallback((element: Element) => {
    if (!animations) {
      element.scrollIntoView();
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  }, [animations]);

  // Highlight element temporarily
  const highlightElement = useCallback((element: Element, duration = 1000) => {
    if (!animations) return;

    element.classList.add('editor-highlight');
    setTimeout(() => {
      element.classList.remove('editor-highlight');
    }, duration);
  }, [animations]);

  // Get hover information
  const getHoverInfo = useCallback((element: Element): HoverInfo | null => {
    if (!editor || !element) return null;

    const type = element.tagName.toLowerCase();
    const content = element.textContent || '';
    const position = element.getBoundingClientRect();
    
    const suggestedActions = [];
    
    switch (type) {
      case 'h1':
      case 'h2':
      case 'h3':
        suggestedActions.push('Change level', 'Convert to paragraph', 'Add ID');
        break;
      case 'p':
        suggestedActions.push('Format text', 'Convert to heading', 'Add link');
        break;
      case 'li':
        suggestedActions.push('Indent', 'Outdent', 'Convert to paragraph');
        break;
      default:
        suggestedActions.push('Format', 'Edit', 'Remove');
    }

    return {
      element,
      type,
      content,
      position,
      suggestedActions,
    };
  }, [editor]);

  // Effects to add and remove event listeners
  useEffect(() => {
    const el = editor?.view.dom;
    if (!el) return;

    if (hover) {
      el.addEventListener('mouseover', handleMouseEnter);
      el.addEventListener('mouseout', handleMouseLeave);
    }

    if (dragDrop) {
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
      el.addEventListener('dragover', handleDragOver);
      el.addEventListener('drop', handleDrop);
    }

    if (gestures) {
      el.addEventListener('touchstart', handleTouchStart);
      el.addEventListener('touchmove', handleTouchMove);
      el.addEventListener('touchend', handleTouchEnd);
    }

    if (keyboardShortcuts) {
      el.addEventListener('keydown', handleKeyDown);
    }

    const cleanup = () => {
      if (hover) {
        el.removeEventListener('mouseover', handleMouseEnter);
        el.removeEventListener('mouseout', handleMouseLeave);
      }
      if (dragDrop) {
        el.removeEventListener('dragstart', handleDragStart);
        el.removeEventListener('dragend', handleDragEnd);
        el.removeEventListener('dragover', handleDragOver);
        el.removeEventListener('drop', handleDrop);
      }
      if (gestures) {
        el.removeEventListener('touchstart', handleTouchStart);
        el.removeEventListener('touchmove', handleTouchMove);
        el.removeEventListener('touchend',handleTouchEnd);
      }
      if (keyboardShortcuts) {
        el.removeEventListener('keydown', handleKeyDown);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    return cleanup;
  }, [
    editor, 
    hover, 
    dragDrop, 
    gestures, 
    keyboardShortcuts, 
    handleMouseEnter, 
    handleMouseLeave, 
    handleDragStart, 
    handleDragEnd, 
    handleDragOver, 
    handleDrop, 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd, 
    handleKeyDown
  ]);

  return {
    state,
    animate,
    scrollToElement,
    highlightElement,
    getHoverInfo,
    handleGesture,
  };
};

export default useInteractiveFeatures;