# ChUseA Animation System Guide

## Overview

The ChUseA animation system provides a comprehensive set of animation components and utilities built on top of Tailwind CSS v4 and tw-animate-css. It includes performance optimizations, accessibility features, and workflow-specific animations.

## Installation and Setup

The animation system is already configured in your project with the following dependencies:

- `tw-animate-css` - Extended animation library for Tailwind CSS
- `@tailwindcss/typography` - Typography plugin for enhanced text animations
- `clsx` & `tailwind-merge` - Utility libraries for conditional class names

## Basic Animation Components

### FadeIn Component

Provides smooth fade-in animations with directional options.

```tsx
import { FadeIn } from '@/components/animations';

// Basic fade in
<FadeIn>
  <div>Content appears smoothly</div>
</FadeIn>

// Fade in from specific direction
<FadeIn direction="up" duration="slow" delay="short">
  <div>Content slides up and fades in</div>
</FadeIn>
```

**Props:**
- `direction`: 'up' | 'down' | 'left' | 'right' | 'none'
- `duration`: 'fast' | 'normal' | 'slow'
- `delay`: 'none' | 'short' | 'medium' | 'long'

### SlideIn Component

Creates sliding animations from any direction.

```tsx
import { SlideIn } from '@/components/animations';

<SlideIn direction="right" duration="normal">
  <div>Slides in from the right</div>
</SlideIn>
```

### ScaleIn Component

Provides scaling animations with different scale factors.

```tsx
import { ScaleIn } from '@/components/animations';

<ScaleIn scale="medium" duration="fast">
  <div>Scales up smoothly</div>
</ScaleIn>
```

### BounceIn Component

Adds bouncy entrance animations.

```tsx
import { BounceIn } from '@/components/animations';

<BounceIn intensity="gentle" duration="normal">
  <div>Bounces in with style</div>
</BounceIn>
```

## Loading Components

### LoadingSpinner

Versatile loading spinner with multiple variants.

```tsx
import { LoadingSpinner } from '@/components/animations';

// Spinner variant
<LoadingSpinner size="medium" variant="spinner" speed="normal" />

// Dots variant
<LoadingSpinner variant="dots" size="large" />

// Pulse variant
<LoadingSpinner variant="pulse" size="small" />

// Bars variant
<LoadingSpinner variant="bars" size="medium" />
```

### ProgressBar

Animated progress bars for data loading and processes.

```tsx
import { ProgressBar } from '@/components/animations';

// Determinate progress
<ProgressBar value={75} showValue color="primary" />

// Indeterminate progress
<ProgressBar variant="indeterminate" color="success" />
```

## Workflow-Specific Animations

### WorkflowNode

Animated nodes for workflow visualization with status-based styling.

```tsx
import { WorkflowNode } from '@/components/animations';

<WorkflowNode 
  status="running" 
  animateStatusChange 
  className="w-32 h-20"
>
  <div>Processing...</div>
</WorkflowNode>
```

**Status Types:**
- `pending` - Gray, no animation
- `running` - Blue with pulse animation
- `pass` - Green with success animation
- `fail` - Red with shake animation

### WorkflowProgress

Step-by-step progress indicator for workflows.

```tsx
import { WorkflowProgress } from '@/components/animations';

const steps = [
  { id: '1', label: 'Initialize', status: 'completed' },
  { id: '2', label: 'Process', status: 'current' },
  { id: '3', label: 'Complete', status: 'pending' }
];

<WorkflowProgress 
  steps={steps} 
  orientation="horizontal" 
  showLabels 
/>
```

### ConnectionLine

Animated connection lines between workflow nodes.

```tsx
import { ConnectionLine } from '@/components/animations';

<ConnectionLine
  from={{ x: 100, y: 50 }}
  to={{ x: 300, y: 150 }}
  status="active"
  animated
/>
```

### DataLoading

Loading states for data fetching operations.

```tsx
import { DataLoading } from '@/components/animations';

// Skeleton loading
<DataLoading variant="skeleton" lines={3} />

// Shimmer effect
<DataLoading variant="shimmer" lines={5} />

// Pulse effect
<DataLoading variant="pulse" lines={4} />
```

## Interactive Animations

### AnimatedButton

Enhanced button component with hover and click animations.

```tsx
import { AnimatedButton } from '@/components/animations';

<AnimatedButton 
  variant="primary" 
  size="medium" 
  loading={isLoading}
  onClick={handleClick}
>
  Submit
</AnimatedButton>
```

### AnimatedCard

Card component with hover effects and smooth transitions.

```tsx
import { AnimatedCard } from '@/components/animations';

<AnimatedCard hoverable clickable onClick={handleCardClick}>
  <div>Card content with smooth hover effects</div>
</AnimatedCard>
```

### Modal

Animated modal with smooth enter/exit transitions.

```tsx
import { Modal } from '@/components/animations';

<Modal 
  isOpen={isModalOpen} 
  onClose={closeModal} 
  size="medium"
>
  <div className="p-6">
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </div>
</Modal>
```

### Toast

Animated toast notifications.

```tsx
import { Toast } from '@/components/animations';

<Toast 
  isVisible={showToast} 
  type="success"
>
  Operation completed successfully!
</Toast>
```

### PageTransition

Smooth page transitions for routing.

```tsx
import { PageTransition } from '@/components/animations';

<PageTransition>
  <div>Page content appears smoothly</div>
</PageTransition>
```

### StaggerContainer

Animates children with sequential delays.

```tsx
import { StaggerContainer } from '@/components/animations';

<StaggerContainer staggerDelay={100}>
  <div>Item 1 (animated first)</div>
  <div>Item 2 (animated 100ms later)</div>
  <div>Item 3 (animated 200ms later)</div>
</StaggerContainer>
```

## Performance Optimization

### OptimizedAnimation

High-performance animation wrapper that respects user preferences.

```tsx
import { OptimizedAnimation } from '@/components/animations';

<OptimizedAnimation 
  animation="animate-fade-in" 
  duration={300}
  fallback={<div>Static content for reduced motion</div>}
>
  <div>Animated content</div>
</OptimizedAnimation>
```

### GPUAccelerated

Forces GPU acceleration for complex animations.

```tsx
import { GPUAccelerated } from '@/components/animations';

<GPUAccelerated transform="translateZ(0)" willChange="transform">
  <div className="complex-animation">Heavy animation content</div>
</GPUAccelerated>
```

### LazyAnimation

Only animates when element comes into view.

```tsx
import { LazyAnimation } from '@/components/animations';

<LazyAnimation animation="animate-slide-in-up" threshold={0.1}>
  <div>Animates when scrolled into view</div>
</LazyAnimation>
```

## Animation Hooks

### useReducedMotion

Respects user's motion preferences.

```tsx
import { useReducedMotion } from '@/components/animations';

const MyComponent = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-bounce'}>
      Content
    </div>
  );
};
```

### useInView

Triggers animations when elements enter viewport.

```tsx
import { useInView } from '@/components/animations';

const MyComponent = () => {
  const [ref, isInView] = useInView(0.1);
  
  return (
    <div 
      ref={ref} 
      className={isInView ? 'animate-fade-in' : 'opacity-0'}
    >
      Content
    </div>
  );
};
```

### useAnimationPerformance

Monitors animation performance.

```tsx
import { useAnimationPerformance } from '@/components/animations';

const MyComponent = () => {
  const { frameRate, isLowPerformance } = useAnimationPerformance();
  
  if (isLowPerformance) {
    return <div>Static content for better performance</div>;
  }
  
  return <div className="animate-complex">Animated content</div>;
};
```

### usePerformantAnimation

Creates performance-aware animations.

```tsx
import { usePerformantAnimation } from '@/components/animations';

const MyComponent = () => {
  const animation = usePerformantAnimation('animate-bounce', {
    duration: 500,
    fallback: 'animate-fade-in'
  });
  
  if (!animation.shouldAnimate) {
    return <div>Static content</div>;
  }
  
  return (
    <div 
      className={animation.animation}
      style={{
        animationDuration: `${animation.duration}ms`,
        animationDelay: `${animation.delay}ms`
      }}
    >
      Content
    </div>
  );
};
```

## Performance Best Practices

### 1. Use CSS Transforms

Prefer CSS transforms over changing layout properties:

```css
/* Good - triggers composite layer */
.animate-slide {
  transform: translateX(100px);
}

/* Bad - triggers layout */
.animate-slide {
  left: 100px;
}
```

### 2. Enable GPU Acceleration

Use `will-change` and `transform3d` for complex animations:

```tsx
<div 
  className="animate-complex"
  style={{ 
    willChange: 'transform',
    transform: 'translateZ(0)' 
  }}
>
  Content
</div>
```

### 3. Respect Reduced Motion

Always check for user motion preferences:

```tsx
const prefersReducedMotion = useReducedMotion();

<div className={prefersReducedMotion ? 'static' : 'animate-bounce'}>
  Content
</div>
```

### 4. Use Intersection Observer

Only animate elements when they're visible:

```tsx
const [ref, isInView] = useInView();

<div 
  ref={ref}
  className={isInView ? 'animate-fade-in' : 'opacity-0'}
>
  Content
</div>
```

### 5. Optimize Animation Timing

Use appropriate durations for different screen sizes:

```tsx
const { getAnimationConfig } = useResponsiveAnimation();

const config = getAnimationConfig({
  duration: 300,
  delay: 100
});
```

## Accessibility Considerations

1. **Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`
2. **Focus Management**: Interactive elements maintain proper focus states
3. **Screen Readers**: Animations don't interfere with assistive technology
4. **Keyboard Navigation**: All interactive components support keyboard navigation

## Troubleshooting

### Animations Not Working

1. Check that Tailwind CSS is properly configured
2. Ensure animation classes are included in your build
3. Verify that `prefers-reduced-motion` isn't disabling animations
4. Check browser console for JavaScript errors

### Performance Issues

1. Use `useAnimationPerformance` hook to monitor FPS
2. Enable GPU acceleration for complex animations
3. Reduce animation complexity on mobile devices
4. Consider using `LazyAnimation` for off-screen content

### CSS Conflicts

1. Ensure proper class name specificity
2. Use `cn()` utility for conditional classes
3. Check for conflicting CSS rules
4. Verify Tailwind CSS purging isn't removing needed classes

## Examples and Demos

Check the `/demo` page for live examples of all animation components and their various configurations.

```tsx
// Navigate to see animations in action
<Link href="/demo">View Animation Demos</Link>
```

## Custom Animations

To create custom animations, add them to `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        'custom-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'custom-bounce': 'custom-bounce 1s ease-in-out infinite'
      }
    }
  }
}
```

Then use it in your components:

```tsx
<div className="animate-custom-bounce">
  Custom bouncing content
</div>
```