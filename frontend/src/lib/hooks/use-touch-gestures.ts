import { useRef, useCallback } from 'react';

export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: (event: TouchEvent) => void;
  onDoubleTap?: (event: TouchEvent) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

export const useTouchGestures = (options: TouchGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onDoubleTap,
    swipeThreshold = 50,
    longPressDelay = 500
  } = options;

  const startTouch = useRef<Touch | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startTouch.current = e.touches[0];
    
    // Long press detection
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(e);
      }, longPressDelay);
    }

    // Double tap detection
    if (onDoubleTap) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        onDoubleTap(e);
      }
      lastTap.current = now;
    }
  }, [onLongPress, onDoubleTap, longPressDelay]);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const endTouch = e.changedTouches[0];
    if (startTouch.current && endTouch) {
      const deltaX = endTouch.clientX - startTouch.current.clientX;
      const deltaY = endTouch.clientY - startTouch.current.clientY;

      // Swipe detection
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    }

    startTouch.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeThreshold]);

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };

  return { handlers };
};