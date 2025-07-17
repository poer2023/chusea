'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  Badge,
  Avatar,
  Tooltip,
  Modal,
  Dropdown,
  Progress,
  CircularProgress,
  WorkflowNode,
  StatusBadge,
  AvatarGroup,
  SearchInput,
  PasswordInput,
  EmailInput,
} from './index';

/**
 * Component Examples and Documentation
 * 
 * This file contains comprehensive examples of all UI components
 * in the ChUseA component library. Use these examples as references
 * for implementing components in your application.
 */

// Button Examples
export const ButtonExamples = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Button Examples</h2>
      
      {/* Sizes */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex items-center gap-2">
          <Button variant="solid">Solid</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Color Schemes</h3>
        <div className="flex items-center gap-2">
          <Button colorScheme="primary">Primary</Button>
          <Button colorScheme="secondary">Secondary</Button>
          <Button colorScheme="success">Success</Button>
          <Button colorScheme="warning">Warning</Button>
          <Button colorScheme="error">Error</Button>
        </div>
      </div>

      {/* States */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">States</h3>
        <div className="flex items-center gap-2">
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={handleLoadingClick}>
            {loading ? 'Loading...' : 'Click for Loading'}
          </Button>
        </div>
      </div>

      {/* With Icons */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">With Icons</h3>
        <div className="flex items-center gap-2">
          <Button leftIcon={<span>←</span>}>Back</Button>
          <Button rightIcon={<span>→</span>}>Next</Button>
          <Button leftIcon={<span>+</span>} rightIcon={<span>↗</span>}>
            Add New
          </Button>
        </div>
      </div>
    </div>
  );
};

// Input Examples
export const InputExamples = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Input Examples</h2>
      
      {/* Basic Inputs */}
      <div className="space-y-4">
        <Input label="Basic Input" placeholder="Enter text..." />
        <Input label="Required Input" required placeholder="This field is required" />
        <Input 
          label="With Helper Text" 
          placeholder="Enter your name"
          helperText="This will be displayed publicly"
        />
      </div>

      {/* States */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">States</h3>
        <Input state="default" placeholder="Default state" />
        <Input state="success" placeholder="Success state" helperText="Looks good!" />
        <Input state="warning" placeholder="Warning state" helperText="Please check this field" />
        <Input state="error" placeholder="Error state" helperText="This field is required" />
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <Input size="sm" placeholder="Small input" />
        <Input size="md" placeholder="Medium input" />
        <Input size="lg" placeholder="Large input" />
      </div>

      {/* Specialized Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Specialized Inputs</h3>
        <SearchInput placeholder="Search..." />
        <EmailInput label="Email" placeholder="user@example.com" />
        <PasswordInput label="Password" placeholder="••••••••" />
      </div>

      {/* With Icons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Icons</h3>
        <Input 
          leftIcon={<span>👤</span>} 
          placeholder="Username" 
        />
        <Input 
          rightIcon={<span>📧</span>} 
          placeholder="Email address" 
        />
      </div>
    </div>
  );
};

// Card Examples
export const CardExamples = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Card Examples</h2>
      
      {/* Basic Card */}
      <Card>
        <Card.Header>
          <Card.Title>Basic Card</Card.Title>
          <Card.Description>This is a basic card with header and content</Card.Description>
        </Card.Header>
        <Card.Content>
          <p>This is the main content of the card. You can put any content here.</p>
        </Card.Content>
      </Card>

      {/* Interactive Card */}
      <Card interactive onClick={() => alert('Card clicked!')}>
        <Card.Header>
          <Card.Title>Interactive Card</Card.Title>
          <Card.Description>Click this card to see the interaction</Card.Description>
        </Card.Header>
        <Card.Content>
          <p>This card is clickable and shows hover effects.</p>
        </Card.Content>
      </Card>

      {/* Card with Footer */}
      <Card>
        <Card.Header withBorder>
          <Card.Title>Card with Footer</Card.Title>
          <Card.Description>This card includes a footer section</Card.Description>
        </Card.Header>
        <Card.Content>
          <p>Main content goes here.</p>
        </Card.Content>
        <Card.Footer withBorder className="justify-between">
          <span className="text-sm text-muted-foreground">Last updated: 2 hours ago</span>
          <Button size="sm">Edit</Button>
        </Card.Footer>
      </Card>

      {/* Card Variants */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="default">
          <Card.Content>
            <p>Default variant</p>
          </Card.Content>
        </Card>
        <Card variant="outline">
          <Card.Content>
            <p>Outline variant</p>
          </Card.Content>
        </Card>
        <Card variant="filled">
          <Card.Content>
            <p>Filled variant</p>
          </Card.Content>
        </Card>
        <Card variant="elevated">
          <Card.Content>
            <p>Elevated variant</p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

// Badge Examples
export const BadgeExamples = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Badge Examples</h2>
      
      {/* Basic Badges */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic Badges</h3>
        <div className="flex items-center gap-2">
          <Badge>Default</Badge>
          <Badge colorScheme="success">Success</Badge>
          <Badge colorScheme="warning">Warning</Badge>
          <Badge colorScheme="error">Error</Badge>
        </div>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex items-center gap-2">
          <Badge variant="solid">Solid</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="soft">Soft</Badge>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex items-center gap-2">
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
        </div>
      </div>

      {/* Status Badges */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Status Badges</h3>
        <div className="flex items-center gap-2">
          <StatusBadge status="pending">Pending</StatusBadge>
          <StatusBadge status="running">Running</StatusBadge>
          <StatusBadge status="success">Success</StatusBadge>
          <StatusBadge status="error">Error</StatusBadge>
          <StatusBadge status="warning">Warning</StatusBadge>
          <StatusBadge status="idle">Idle</StatusBadge>
        </div>
      </div>

      {/* Removable Badges */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Removable Badges</h3>
        <div className="flex items-center gap-2">
          <Badge removable onRemove={() => alert('Badge removed!')}>
            Removable
          </Badge>
          <Badge removable colorScheme="success" onRemove={() => console.log('Removed!')}>
            Click X to remove
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Avatar Examples
export const AvatarExamples = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Avatar Examples</h2>
      
      {/* Sizes */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex items-center gap-2">
          <Avatar size="xs" fallback="XS" />
          <Avatar size="sm" fallback="SM" />
          <Avatar size="md" fallback="MD" />
          <Avatar size="lg" fallback="LG" />
          <Avatar size="xl" fallback="XL" />
          <Avatar size="2xl" fallback="2XL" />
        </div>
      </div>

      {/* With Images */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">With Images</h3>
        <div className="flex items-center gap-2">
          <Avatar 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
            alt="John Doe"
            fallback="JD"
          />
          <Avatar 
            src="invalid-url" 
            alt="Jane Smith"
            fallback="JS"
          />
        </div>
      </div>

      {/* Shapes */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Shapes</h3>
        <div className="flex items-center gap-2">
          <Avatar shape="circle" fallback="C" />
          <Avatar shape="square" fallback="S" />
        </div>
      </div>

      {/* With Status */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">With Status</h3>
        <div className="flex items-center gap-2">
          <Avatar fallback="ON" status="online" showStatus />
          <Avatar fallback="OF" status="offline" showStatus />
          <Avatar fallback="AW" status="away" showStatus />
          <Avatar fallback="BY" status="busy" showStatus />
        </div>
      </div>

      {/* Avatar Group */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Avatar Group</h3>
        <AvatarGroup max={3}>
          <Avatar fallback="A" />
          <Avatar fallback="B" />
          <Avatar fallback="C" />
          <Avatar fallback="D" />
          <Avatar fallback="E" />
        </AvatarGroup>
      </div>
    </div>
  );
};

// Interactive Components Examples
export const InteractiveExamples = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Interactive Components</h2>
      
      {/* Tooltip */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Tooltip</h3>
        <div className="flex items-center gap-4">
          <Tooltip content="This is a tooltip" placement="top">
            <Button>Hover me (top)</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" placement="bottom">
            <Button>Hover me (bottom)</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" placement="left">
            <Button>Hover me (left)</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" placement="right">
            <Button>Hover me (right)</Button>
          </Tooltip>
        </div>
      </div>

      {/* Modal */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Modal</h3>
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Modal.Header>
            <Modal.Title>Example Modal</Modal.Title>
            <Modal.CloseButton onClose={() => setModalOpen(false)} />
          </Modal.Header>
          <Modal.Body>
            <p>This is an example modal dialog. You can put any content here.</p>
            <p className="mt-2">Click outside, press ESC, or use the close button to close.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Dropdown */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Dropdown</h3>
        <Dropdown trigger={<Button>Open Menu</Button>}>
          <Dropdown.Label>Actions</Dropdown.Label>
          <Dropdown.Item onClick={() => alert('Edit clicked')}>
            Edit
          </Dropdown.Item>
          <Dropdown.Item onClick={() => alert('Copy clicked')}>
            Copy
          </Dropdown.Item>
          <Dropdown.Separator />
          <Dropdown.Item destructive onClick={() => alert('Delete clicked')}>
            Delete
          </Dropdown.Item>
        </Dropdown>
      </div>
    </div>
  );
};

// Progress Examples
export const ProgressExamples = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Progress Examples</h2>
      
      {/* Linear Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Linear Progress</h3>
        <Progress value={25} label="25% Complete" showValue />
        <Progress value={50} colorScheme="success" />
        <Progress value={75} colorScheme="warning" size="lg" />
        <Progress value={100} colorScheme="error" showValue />
        <Progress value={0} indeterminate label="Loading..." />
      </div>

      {/* Circular Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Circular Progress</h3>
        <div className="flex items-center gap-4">
          <CircularProgress value={25} size="sm" showValue />
          <CircularProgress value={50} size="md" colorScheme="success" showValue />
          <CircularProgress value={75} size="lg" colorScheme="warning" showValue />
          <CircularProgress value={0} size="xl" indeterminate />
        </div>
      </div>
    </div>
  );
};

// Workflow Examples
export const WorkflowExamples = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Workflow Components</h2>
      
      {/* Workflow Nodes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Workflow Nodes</h3>
        <div className="grid grid-cols-2 gap-4">
          <WorkflowNode
            status="pending"
            title="Initialize Process"
            description="Setting up the workflow environment"
            type="Setup"
            duration="Waiting..."
          />
          <WorkflowNode
            status="running"
            title="Data Processing"
            description="Processing input data"
            type="Processing"
            progress={65}
            duration="2:30"
            metadata={{
              'Records': '1,234',
              'Speed': '500/sec'
            }}
          />
          <WorkflowNode
            status="success"
            title="Validation Complete"
            description="All data validated successfully"
            type="Validation"
            duration="1:45"
            metadata={{
              'Validated': '1,234',
              'Errors': '0'
            }}
          />
          <WorkflowNode
            status="error"
            title="Export Failed"
            description="Failed to export results"
            type="Export"
            duration="0:23"
            metadata={{
              'Error': 'Connection timeout'
            }}
          />
        </div>
      </div>

      {/* Interactive Workflow Node */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Interactive Workflow Node</h3>
        <WorkflowNode
          status="idle"
          title="Click to Start"
          description="This node is interactive"
          type="Manual"
          interactive
          onClick={() => alert('Workflow node clicked!')}
        />
      </div>
    </div>
  );
};

// Complete Examples Component
export const ComponentExamples = () => {
  return (
    <div className="container mx-auto p-6 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ChUseA UI Component Library</h1>
        <p className="text-lg text-muted-foreground">
          A comprehensive collection of React components built with Tailwind CSS v4.0
        </p>
      </div>
      
      <ButtonExamples />
      <InputExamples />
      <CardExamples />
      <BadgeExamples />
      <AvatarExamples />
      <InteractiveExamples />
      <ProgressExamples />
      <WorkflowExamples />
    </div>
  );
};