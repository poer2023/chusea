# ChUseA UI Component Library API Reference

This document provides comprehensive API documentation for all components in the ChUseA UI library.

## Core Components

### Button

A versatile button component with multiple variants, sizes, and states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Button size variant |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | Button visual variant |
| `colorScheme` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Button color scheme |
| `loading` | `boolean` | `false` | Loading state |
| `leftIcon` | `React.ReactNode` | - | Icon element to display before text |
| `rightIcon` | `React.ReactNode` | - | Icon element to display after text |
| `fullWidth` | `boolean` | `false` | Full width button |
| `aria-label` | `string` | - | ARIA label for accessibility |
| `aria-describedby` | `string` | - | ARIA describedby for accessibility |

#### Usage

```tsx
import { Button } from '@/components/ui';

<Button variant="solid" colorScheme="primary" size="md">
  Click me
</Button>

<Button 
  loading={isLoading}
  leftIcon={<PlusIcon />}
  onClick={handleSubmit}
>
  Create Item
</Button>
```

### Input

A comprehensive input component with labels, states, and icons.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size variant |
| `state` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | Visual state of the input |
| `leftIcon` | `React.ReactNode` | - | Icon element to display on the left side |
| `rightIcon` | `React.ReactNode` | - | Icon element to display on the right side |
| `helperText` | `string` | - | Helper text displayed below the input |
| `label` | `string` | - | Label for the input |
| `required` | `boolean` | `false` | Whether the input is required |
| `fullWidth` | `boolean` | `false` | Full width input |

#### Specialized Components

- `PasswordInput` - Pre-configured for password input
- `EmailInput` - Pre-configured for email input  
- `NumberInput` - Pre-configured for number input
- `SearchInput` - Pre-configured with search icon

#### Usage

```tsx
import { Input, SearchInput, PasswordInput } from '@/components/ui';

<Input
  label="Full Name"
  placeholder="Enter your name"
  required
  helperText="This field is required"
/>

<SearchInput placeholder="Search items..." />

<PasswordInput
  label="Password"
  state="error"
  helperText="Password must be at least 8 characters"
/>
```

### Card

A flexible card component with header, content, and footer sections.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outline' \| 'filled' \| 'elevated'` | `'default'` | Card visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Card size variant |
| `interactive` | `boolean` | `false` | Whether the card is interactive (clickable) |
| `disabled` | `boolean` | `false` | Whether the card is disabled |

#### Sub-components

- `Card.Header` - Card header with optional border
- `Card.Title` - Styled card title
- `Card.Description` - Styled card description
- `Card.Content` - Card content area
- `Card.Footer` - Card footer with optional border

#### Usage

```tsx
import { Card } from '@/components/ui';

<Card variant="elevated" interactive>
  <Card.Header withBorder>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card content goes here.</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Badge

Small status and labeling component with multiple variants.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'solid' \| 'outline' \| 'soft'` | `'solid'` | Badge visual variant |
| `colorScheme` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'neutral'` | `'primary'` | Badge color scheme |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| `leftIcon` | `React.ReactNode` | - | Icon element to display before text |
| `rightIcon` | `React.ReactNode` | - | Icon element to display after text |
| `removable` | `boolean` | `false` | Whether the badge is removable |
| `onRemove` | `() => void` | - | Callback when badge is removed |

#### StatusBadge

Specialized badge for workflow states.

| Prop | Type | Description |
|------|------|-------------|
| `status` | `'pending' \| 'running' \| 'success' \| 'error' \| 'warning' \| 'idle'` | Status type that maps to predefined colors |

#### Usage

```tsx
import { Badge, StatusBadge } from '@/components/ui';

<Badge colorScheme="success" removable onRemove={handleRemove}>
  Active
</Badge>

<StatusBadge status="running">
  Processing
</StatusBadge>
```

## Loading Components

### Loading

Comprehensive loading component with multiple variants and animations.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Loading spinner size |
| `variant` | `'spinner' \| 'dots' \| 'pulse' \| 'bounce' \| 'bars'` | `'spinner'` | Loading spinner variant |
| `colorScheme` | `'primary' \| 'secondary' \| 'neutral'` | `'primary'` | Color scheme |
| `text` | `string` | - | Text to display with the loading spinner |
| `overlay` | `boolean` | `false` | Whether to show as overlay (fixed position) |
| `speed` | `number` | `1` | Custom speed (in seconds) |

#### Specialized Components

- `LoadingSpinner` - Default spinner variant
- `LoadingDots` - Animated dots variant
- `LoadingOverlay` - Overlay variant
- `InlineLoading` - For inline loading states

#### Usage

```tsx
import { Loading, LoadingOverlay, InlineLoading } from '@/components/ui';

<Loading variant="spinner" text="Loading data..." />

<LoadingOverlay text="Processing..." />

<InlineLoading loading={isLoading}>
  <Button>Submit</Button>
</InlineLoading>
```

## Progress Components

### Progress

Linear and circular progress indicators.

#### Progress Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Progress value (0-100) |
| `max` | `number` | `100` | Maximum value |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Progress size |
| `colorScheme` | `'primary' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Color scheme |
| `showValue` | `boolean` | `false` | Whether to show value as text |
| `label` | `string` | - | Custom label |
| `indeterminate` | `boolean` | `false` | Whether the progress is indeterminate |

#### CircularProgress Props

Similar to Progress with additional:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `thickness` | `number` | - | Thickness of the progress ring |

#### Usage

```tsx
import { Progress, CircularProgress } from '@/components/ui';

<Progress value={75} showValue label="Upload Progress" />

<CircularProgress value={60} showValue colorScheme="success" />
```

### ProgressIndicator

Multi-step progress indicator for workflows.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `ProgressStep[]` | - | Array of progress steps |
| `currentStep` | `number` | `0` | Current active step index |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation of the progress indicator |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `showProgress` | `boolean` | `true` | Whether to show progress percentage |
| `showDescriptions` | `boolean` | `true` | Whether to show step descriptions |
| `showCompletionStatus` | `boolean` | `true` | Whether to show completion indicators |

#### ProgressStep Type

```tsx
interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  progress?: number;
  icon?: React.ReactNode;
  errorMessage?: string;
  optional?: boolean;
}
```

#### Usage

```tsx
import { ProgressIndicator } from '@/components/ui';

const steps = [
  { id: '1', title: 'Setup', status: 'success' },
  { id: '2', title: 'Process', status: 'running', progress: 50 },
  { id: '3', title: 'Finish', status: 'pending' },
];

<ProgressIndicator
  steps={steps}
  currentStep={1}
  orientation="horizontal"
/>
```

## Action Components

### ActionButton

Enhanced button for specific actions with confirmation and state management.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `action` | `'create' \| 'update' \| 'delete' \| 'cancel' \| 'confirm' \| 'retry' \| 'skip'` | - | Action type that determines styling and behavior |
| `loading` | `boolean \| string` | `false` | Loading state with optional text |
| `success` | `boolean` | `false` | Success state |
| `error` | `boolean` | `false` | Error state |
| `requireConfirmation` | `boolean` | `false` | Confirmation required before action |
| `confirmationMessage` | `string` | - | Confirmation message |
| `onConfirm` | `() => void` | - | Callback when action is confirmed |
| `autoReset` | `number` | - | Auto-reset success/error state after delay (in ms) |
| `successMessage` | `string` | - | Success message to show briefly |
| `errorMessage` | `string` | - | Error message to show briefly |

#### Predefined Action Buttons

- `CreateButton` - Pre-configured for create actions
- `UpdateButton` - Pre-configured for update actions
- `DeleteButton` - Pre-configured for delete actions (with confirmation)
- `ConfirmButton` - Pre-configured for confirm actions
- `RetryButton` - Pre-configured for retry actions
- `SkipButton` - Pre-configured for skip actions

#### Usage

```tsx
import { ActionButton, CreateButton, DeleteButton } from '@/components/ui';

<CreateButton 
  loading={isCreating}
  onConfirm={handleCreate}
>
  Create Item
</CreateButton>

<DeleteButton
  requireConfirmation
  confirmationMessage="Are you sure you want to delete this item?"
  onConfirm={handleDelete}
>
  Delete
</DeleteButton>

<ActionButton
  action="update"
  success={updateSuccess}
  error={updateError}
  autoReset={3000}
  successMessage="Updated successfully!"
>
  Update Item
</ActionButton>
```

## Workflow Components

### WorkflowNode

Specialized component for displaying workflow step information.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'pending' \| 'running' \| 'success' \| 'error' \| 'idle'` | - | Node status |
| `title` | `string` | - | Node title |
| `description` | `string` | - | Node description |
| `type` | `string` | - | Node type/category |
| `selected` | `boolean` | `false` | Whether the node is selected |
| `interactive` | `boolean` | `false` | Whether the node is clickable |
| `onClick` | `() => void` | - | Callback when node is clicked |
| `icon` | `React.ReactNode` | - | Icon to display in the node |
| `metadata` | `Record<string, string \| number>` | - | Additional metadata to display |
| `duration` | `string` | - | Duration or timestamp information |
| `progress` | `number` | - | Progress percentage (0-100) for running nodes |

#### Usage

```tsx
import { WorkflowNode } from '@/components/ui';

<WorkflowNode
  status="running"
  title="Data Processing"
  description="Processing customer data"
  type="Transform"
  progress={75}
  metadata={{
    records: 1000,
    errors: 2
  }}
  duration="2m 30s"
  interactive
  onClick={handleNodeClick}
/>
```

## Interactive Components

### Modal

Accessible modal dialog component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Whether the modal is open |
| `onClose` | `() => void` | - | Callback when modal should close |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal size |
| `closeOnOverlayClick` | `boolean` | `true` | Whether clicking overlay closes modal |
| `closeOnEscape` | `boolean` | `true` | Whether ESC key closes modal |
| `contentClassName` | `string` | - | Custom class for modal content |

#### Sub-components

- `Modal.Header` - Modal header
- `Modal.Title` - Modal title
- `Modal.CloseButton` - Modal close button
- `Modal.Body` - Modal body content
- `Modal.Footer` - Modal footer

#### Usage

```tsx
import { Modal } from '@/components/ui';

<Modal open={isOpen} onClose={handleClose}>
  <Modal.Header>
    <Modal.Title>Confirm Action</Modal.Title>
    <Modal.CloseButton onClose={handleClose} />
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure you want to proceed?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="outline" onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </Modal.Footer>
</Modal>
```

### Dropdown

Accessible dropdown menu component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Whether the dropdown is open |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when dropdown open state changes |
| `placement` | `'bottom-start' \| 'bottom-end' \| 'top-start' \| 'top-end'` | `'bottom-start'` | Position of the dropdown |
| `trigger` | `React.ReactNode` | - | Trigger element |
| `closeOnClickOutside` | `boolean` | `true` | Whether to close dropdown when clicking outside |
| `closeOnEscape` | `boolean` | `true` | Whether to close dropdown when pressing escape |

#### Sub-components

- `Dropdown.Item` - Dropdown menu item
- `Dropdown.Separator` - Dropdown separator
- `Dropdown.Label` - Dropdown label

#### Usage

```tsx
import { Dropdown } from '@/components/ui';

<Dropdown trigger={<Button>Menu</Button>}>
  <Dropdown.Label>Actions</Dropdown.Label>
  <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
  <Dropdown.Item onClick={handleDuplicate}>Duplicate</Dropdown.Item>
  <Dropdown.Separator />
  <Dropdown.Item destructive onClick={handleDelete}>
    Delete
  </Dropdown.Item>
</Dropdown>
```

### Tooltip

Accessible tooltip component.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `React.ReactNode` | - | Content to show in the tooltip |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Position of the tooltip |
| `delay` | `number` | `300` | Delay before showing tooltip (in ms) |
| `disabled` | `boolean` | `false` | Whether tooltip is disabled |

#### Usage

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip content="This is helpful information" placement="top">
  <Button>Hover me</Button>
</Tooltip>
```

## Accessibility Features

All components include comprehensive accessibility features:

- **ARIA attributes**: Proper roles, labels, and descriptions
- **Keyboard navigation**: Full keyboard support where applicable
- **Focus management**: Proper focus handling and visual indicators
- **Screen reader support**: Optimized for assistive technologies
- **High contrast mode**: Support for high contrast preferences
- **Reduced motion**: Respects user motion preferences

## Performance Optimizations

- **React.memo**: Components are memoized for performance
- **CSS-in-JS optimization**: Efficient className generation
- **Animation optimization**: GPU-accelerated animations
- **Tree shaking**: Only import what you use
- **TypeScript**: Full type safety and IntelliSense support

## Theming

All components integrate with the Tailwind CSS v4.0 theme system using OKLCH color space for better color consistency and accessibility.

### Custom Theme Variables

```css
:root {
  --color-primary: oklch(0.55 0.18 250);
  --color-secondary: oklch(0.62 0.1 200);
  --color-success: oklch(0.54 0.2 140);
  --color-warning: oklch(0.6 0.2 60);
  --color-error: oklch(0.6 0.2 20);
}
```

Components automatically adapt to light/dark themes and respect user preferences.