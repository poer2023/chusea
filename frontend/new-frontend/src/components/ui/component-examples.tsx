'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  Badge,
  StatusBadge,
  Loading,
  LoadingSpinner,
  LoadingDots,
  LoadingOverlay,
  ActionButton,
  CreateButton,
  UpdateButton,
  DeleteButton,
  ConfirmButton,
  RetryButton,
  ProgressIndicator,
  WorkflowProgress,
  WorkflowNode,
  Modal,
  Dropdown,
  Tooltip,
  Progress,
  CircularProgress,
} from './index';

export const ComponentExamples = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(30);

  const workflowSteps = [
    {
      id: '1',
      title: 'Initialize',
      description: 'Setting up workflow',
      status: 'success' as const,
    },
    {
      id: '2',
      title: 'Process Data',
      description: 'Processing input data',
      status: 'running' as const,
      progress: 75,
    },
    {
      id: '3',
      title: 'Validate Results',
      description: 'Checking output quality',
      status: 'pending' as const,
    },
    {
      id: '4',
      title: 'Deploy',
      description: 'Deploying to production',
      status: 'pending' as const,
    },
  ];

  const handleActionDemo = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">ChUseA Component Library</h1>
        <p className="text-muted-foreground">
          Comprehensive UI components built with Tailwind CSS v4.0 and TypeScript
        </p>
      </div>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="solid" colorScheme="primary">Primary</Button>
            <Button variant="solid" colorScheme="secondary">Secondary</Button>
            <Button variant="solid" colorScheme="success">Success</Button>
            <Button variant="solid" colorScheme="warning">Warning</Button>
            <Button variant="solid" colorScheme="error">Error</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" colorScheme="primary">Outline</Button>
            <Button variant="ghost" colorScheme="primary">Ghost</Button>
            <Button variant="link" colorScheme="primary">Link</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button loading={loading} onClick={handleActionDemo}>
              {loading ? 'Loading...' : 'Load Data'}
            </Button>
            <Button disabled>Disabled</Button>
            <Button
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              With Icon
            </Button>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Action Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <CreateButton>Create Item</CreateButton>
          <UpdateButton>Update Item</UpdateButton>
          <DeleteButton>Delete Item</DeleteButton>
          <ConfirmButton>Confirm Action</ConfirmButton>
          <RetryButton>Retry Failed</RetryButton>
          <ActionButton action="skip">Skip Step</ActionButton>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
        <div className="space-y-4 max-w-md">
          <Input placeholder="Default input" />
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            required
          />
          <Input
            label="Search"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            placeholder="Search items..."
          />
          <Input
            label="Password"
            type="password"
            state="error"
            helperText="Password must be at least 8 characters"
          />
          <Input
            label="Verification Code"
            state="success"
            helperText="Code verified successfully"
          />
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <Card.Header>
              <Card.Title>Default Card</Card.Title>
              <Card.Description>A simple card with header and content</Card.Description>
            </Card.Header>
            <Card.Content>
              <p>This is the card content area.</p>
            </Card.Content>
          </Card>

          <Card variant="elevated" interactive>
            <Card.Header withBorder>
              <Card.Title>Interactive Card</Card.Title>
            </Card.Header>
            <Card.Content>
              <p>This card is clickable and has elevation.</p>
            </Card.Content>
            <Card.Footer withBorder>
              <Button size="sm">Action</Button>
            </Card.Footer>
          </Card>

          <Card variant="outline">
            <Card.Content>
              <h3 className="font-semibold mb-2">Outline Card</h3>
              <p>This card has an outline variant.</p>
            </Card.Content>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Badges</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge colorScheme="primary">Primary</Badge>
            <Badge colorScheme="secondary">Secondary</Badge>
            <Badge colorScheme="success">Success</Badge>
            <Badge colorScheme="warning">Warning</Badge>
            <Badge colorScheme="error">Error</Badge>
            <Badge colorScheme="neutral">Neutral</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" colorScheme="primary">Outline</Badge>
            <Badge variant="soft" colorScheme="success">Soft</Badge>
            <Badge removable onRemove={() => console.log('Removed')}>Removable</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status="pending">Pending</StatusBadge>
            <StatusBadge status="running">Running</StatusBadge>
            <StatusBadge status="success">Success</StatusBadge>
            <StatusBadge status="error">Error</StatusBadge>
            <StatusBadge status="idle">Idle</StatusBadge>
          </div>
        </div>
      </section>

      {/* Loading Components */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Loading Components</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Loading Spinners</h3>
            <div className="flex items-center gap-6">
              <Loading variant="spinner" size="sm" />
              <Loading variant="spinner" size="md" />
              <Loading variant="spinner" size="lg" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Loading Variants</h3>
            <div className="flex items-center gap-6">
              <Loading variant="dots" colorScheme="primary" />
              <Loading variant="pulse" colorScheme="secondary" />
              <Loading variant="bounce" colorScheme="secondary" />
              <Loading variant="bars" colorScheme="neutral" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Loading with Text</h3>
            <Loading variant="spinner" text="Loading data..." />
          </div>
        </div>
      </section>

      {/* Progress */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Progress</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Linear Progress</span>
              <Button 
                size="sm" 
                onClick={() => setProgress(p => Math.min(100, p + 10))}
              >
                +10%
              </Button>
            </div>
            <Progress value={progress} showValue />
          </div>

          <div className="space-y-2">
            <span>Circular Progress</span>
            <div className="flex gap-4">
              <CircularProgress value={progress} showValue />
              <CircularProgress value={75} colorScheme="primary" />
              <CircularProgress value={45} colorScheme="primary" />
            </div>
          </div>

          <div className="space-y-2">
            <span>Workflow Progress</span>
            <WorkflowProgress
              totalSteps={4}
              currentStep={2}
              currentStepTitle="Processing Data"
            />
          </div>
        </div>
      </section>

      {/* Progress Indicator */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Progress Indicator</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Horizontal Steps</h3>
            <ProgressIndicator
              steps={workflowSteps}
              currentStep={1}
              orientation="horizontal"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Vertical Steps</h3>
            <ProgressIndicator
              steps={workflowSteps}
              currentStep={1}
              orientation="vertical"
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* Workflow Node */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Workflow Node</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WorkflowNode
            status="success"
            title="Data Processing"
            description="Successfully processed 1,000 records"
            type="Transform"
            duration="2m 30s"
            metadata={{ records: 1000, errors: 0 }}
          />

          <WorkflowNode
            status="running"
            title="Model Training"
            description="Training machine learning model"
            type="ML"
            progress={65}
            metadata={{ epoch: '12/20', accuracy: '0.94' }}
          />

          <WorkflowNode
            status="error"
            title="API Call"
            description="Failed to connect to external service"
            type="Integration"
            metadata={{ retries: 3, timeout: '30s' }}
          />
        </div>
      </section>

      {/* Interactive Components */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Interactive Components</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setShowModal(true)}>Open Modal</Button>
          
          <Dropdown
            trigger={<Button variant="outline">Dropdown Menu</Button>}
          >
            <Dropdown.Label>Actions</Dropdown.Label>
            <Dropdown.Item>Edit Item</Dropdown.Item>
            <Dropdown.Item>Duplicate</Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item destructive>Delete Item</Dropdown.Item>
          </Dropdown>

          <Tooltip content="This is a helpful tooltip">
            <Button variant="ghost">Hover for Tooltip</Button>
          </Tooltip>
        </div>
      </section>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Example Modal</Modal.Title>
          <Modal.CloseButton onClose={() => setShowModal(false)} />
        </Modal.Header>
        <Modal.Body>
          <p>This is an example modal dialog. It demonstrates the modal component with proper accessibility features.</p>
          <div className="mt-4">
            <Input label="Name" placeholder="Enter your name" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowModal(false)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ComponentExamples;