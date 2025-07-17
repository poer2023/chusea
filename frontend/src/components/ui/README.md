# ChUseA UI Component Library

A comprehensive collection of React components built with Tailwind CSS v4.0, designed specifically for the ChUseA workflow automation platform.

## Features

- ✨ **Modern Design**: Built with the latest Tailwind CSS v4.0 and OKLCH color system
- 🎨 **Consistent Theming**: Unified design tokens and color schemes
- ♿ **Accessibility First**: WCAG 2.1 AA compliant with proper ARIA support
- 🔧 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🚀 **Performance**: Optimized with React best practices and minimal re-renders
- 📱 **Responsive**: Mobile-first design approach
- 🎭 **Customizable**: Flexible props and styling options
- 🔄 **Workflow-Ready**: Specialized components for workflow automation

## Installation

The components are already included in the ChUseA project. Import them from the UI components directory:

```tsx
import { Button, Input, Card, Badge } from '@/components/ui';
```

## Dependencies

- React 19+
- Tailwind CSS v4.0
- clsx for className merging

## Quick Start

```tsx
import { Button, Card, Badge } from '@/components/ui';

function MyComponent() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Welcome to ChUseA</Card.Title>
        <Badge status="success">Active</Badge>
      </Card.Header>
      <Card.Content>
        <p>Start building your workflow automation.</p>
      </Card.Content>
      <Card.Footer>
        <Button colorScheme="primary">Get Started</Button>
      </Card.Footer>
    </Card>
  );
}
```

## Components

### Core Components

#### Button
Versatile button component with multiple variants, sizes, and states.

```tsx
<Button 
  variant="solid" 
  colorScheme="primary" 
  size="md"
  loading={false}
  leftIcon={<PlusIcon />}
>
  Create Workflow
</Button>
```

**Props:**
- `variant`: 'solid' | 'outline' | 'ghost' | 'link'
- `colorScheme`: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode
- `fullWidth`: boolean

#### Input
Flexible input component with validation states and icon support.

```tsx
<Input
  label="Workflow Name"
  placeholder="Enter workflow name"
  state="default"
  helperText="This name will be visible to all team members"
  leftIcon={<SearchIcon />}
  required
/>
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `state`: 'default' | 'error' | 'warning' | 'success'
- `leftIcon`, `rightIcon`: React.ReactNode
- `label`, `helperText`: string
- `required`, `fullWidth`: boolean

#### Card
Flexible container component with header, content, and footer sections.

```tsx
<Card variant="elevated" interactive>
  <Card.Header withBorder>
    <Card.Title>Workflow Details</Card.Title>
    <Card.Description>Configure your automation</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card content goes here</p>
  </Card.Content>
  <Card.Footer withBorder>
    <Button>Save Changes</Button>
  </Card.Footer>
</Card>
```

**Props:**
- `variant`: 'default' | 'outline' | 'filled' | 'elevated'
- `size`: 'sm' | 'md' | 'lg'
- `interactive`: boolean

### Status & Display Components

#### Badge
Compact component for displaying status, labels, or metadata.

```tsx
<Badge variant="soft" colorScheme="success" size="md">
  Active
</Badge>

<StatusBadge status="running">
  Processing
</StatusBadge>
```

#### Avatar
Display user profile pictures with fallback initials and status indicators.

```tsx
<Avatar
  src="/profile.jpg"
  alt="John Doe"
  fallback="JD"
  size="md"
  status="online"
  showStatus
/>

<AvatarGroup max={3}>
  <Avatar fallback="A" />
  <Avatar fallback="B" />
  <Avatar fallback="C" />
  <Avatar fallback="D" />
</AvatarGroup>
```

### Interactive Components

#### Modal
Accessible modal dialog with focus management and keyboard navigation.

```tsx
<Modal open={isOpen} onClose={setIsOpen}>
  <Modal.Header>
    <Modal.Title>Confirm Action</Modal.Title>
    <Modal.CloseButton onClose={setIsOpen} />
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure you want to delete this workflow?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button colorScheme="error" onClick={handleDelete}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>
```

#### Tooltip
Contextual help and information display.

```tsx
<Tooltip content="This action cannot be undone" placement="top">
  <Button colorScheme="error">Delete</Button>
</Tooltip>
```

#### Dropdown
Menu component for actions and navigation.

```tsx
<Dropdown trigger={<Button>Actions</Button>}>
  <Dropdown.Label>Workflow Actions</Dropdown.Label>
  <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
  <Dropdown.Item onClick={handleDuplicate}>Duplicate</Dropdown.Item>
  <Dropdown.Separator />
  <Dropdown.Item destructive onClick={handleDelete}>
    Delete
  </Dropdown.Item>
</Dropdown>
```

### Progress Components

#### Progress
Linear and circular progress indicators.

```tsx
<Progress 
  value={75} 
  label="Workflow Progress"
  showValue 
  colorScheme="primary"
/>

<CircularProgress 
  value={60} 
  size="lg" 
  showValue 
  colorScheme="success"
/>
```

### Workflow Components

#### WorkflowNode
Specialized component for displaying workflow execution nodes.

```tsx
<WorkflowNode
  status="running"
  title="Data Processing"
  description="Processing user input data"
  type="Transform"
  progress={65}
  duration="2:30"
  metadata={{
    'Records': '1,234',
    'Speed': '500/sec'
  }}
  interactive
  onClick={handleNodeClick}
/>
```

**Status Options:**
- `pending`: Waiting to execute
- `running`: Currently executing
- `success`: Completed successfully
- `error`: Failed execution
- `idle`: Not scheduled

## Theming

The component library uses a comprehensive OKLCH-based color system with support for light and dark modes. Colors are defined in CSS custom properties and automatically adapt to the user's system preferences.

### Color Tokens

```css
/* Primary colors */
--primary-500: oklch(0.58 0.20 250);  /* Main brand color */

/* Semantic colors */
--success: oklch(0.58 0.18 140);      /* Success state */
--warning: oklch(0.64 0.18 60);       /* Warning state */
--error: oklch(0.58 0.18 20);         /* Error state */

/* Workflow node colors */
--node-pending: oklch(0.85 0.08 60);  /* Pending state */
--node-running: oklch(0.65 0.15 220); /* Running state */
--node-pass: oklch(0.65 0.15 140);    /* Success state */
--node-fail: oklch(0.65 0.15 20);     /* Error state */
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- ✅ Proper contrast ratios (4.5:1 for normal text, 3:1 for large text)
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility with ARIA labels
- ✅ Focus management and visible focus indicators
- ✅ Semantic HTML structure

## Customization

### Custom Styles

Use the `className` prop to add custom styles:

```tsx
<Button className="custom-button-style">
  Custom Button
</Button>
```

### Extending Components

Create your own components using the base components:

```tsx
function WorkflowButton({ children, ...props }) {
  return (
    <Button
      leftIcon={<WorkflowIcon />}
      colorScheme="primary"
      {...props}
    >
      {children}
    </Button>
  );
}
```

## Best Practices

1. **Consistent Sizing**: Use the provided size variants instead of custom sizing
2. **Semantic Colors**: Use appropriate color schemes for different actions (error for destructive actions, success for confirmations)
3. **Accessibility**: Always provide proper labels and ARIA attributes
4. **Loading States**: Use loading states for async operations
5. **Error Handling**: Provide clear error messages and recovery options

## Examples

For comprehensive examples of all components, see the `/src/components/ui/examples.tsx` file which contains:

- All component variants and sizes
- Interactive examples
- Best practice implementations
- Real-world usage patterns

## Development

### Adding New Components

1. Create the component file in `/src/components/ui/`
2. Follow the existing pattern with forwardRef and proper TypeScript types
3. Export from `/src/components/ui/index.ts`
4. Add examples to `/src/components/ui/examples.tsx`
5. Update this README

### Component Structure

```tsx
'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Define your props here
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'base-classes',
          className
        )}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';
```

## Support

For questions or issues with the component library, please refer to the ChUseA project documentation or contact the development team.