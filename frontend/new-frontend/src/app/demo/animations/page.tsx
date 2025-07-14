'use client';

import React, { useState } from 'react';
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  BounceIn,
  LoadingSpinner,
  ProgressBar,
  WorkflowNode,
  WorkflowProgress,
  AnimatedButton,
  AnimatedCard,
  Modal,
  Toast,
  PageTransition,
  StaggerContainer,
  // Enhanced animations
  FadeAnimation,
  ScaleAnimation,
  EnhancedStaggerContainer,
  MicroInteraction,
  LoadingAnimation,
  AnimationPerformanceMonitor,
} from '@/components/animations';

export default function AnimationsDemo() {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<'pending' | 'running' | 'pass' | 'fail'>('pending');
  const [progress, setProgress] = useState(25);

  const workflowSteps = [
    { id: '1', label: 'Initialize', status: 'completed' as const },
    { id: '2', label: 'Process', status: 'current' as const },
    { id: '3', label: 'Validate', status: 'pending' as const },
    { id: '4', label: 'Complete', status: 'pending' as const },
  ];

  return (
    <AnimationPerformanceMonitor enableAnalytics>
      <PageTransition>
        <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <FadeIn>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                ChUseA Animation System Demo
              </h1>
              <p className="text-lg text-muted-foreground">
                Interactive demonstration of all animation components
              </p>
            </div>
          </FadeIn>

          {/* Basic Animations */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Basic Animations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FadeIn delay="short">
                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-2">Fade In</h3>
                  <p className="text-sm text-muted-foreground">
                    Smooth opacity transition
                  </p>
                </AnimatedCard>
              </FadeIn>

              <SlideIn direction="up" delay="medium">
                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-2">Slide In</h3>
                  <p className="text-sm text-muted-foreground">
                    Slides from any direction
                  </p>
                </AnimatedCard>
              </SlideIn>

              <ScaleIn delay="long">
                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-2">Scale In</h3>
                  <p className="text-sm text-muted-foreground">
                    Scales up smoothly
                  </p>
                </AnimatedCard>
              </ScaleIn>

              <BounceIn>
                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-2">Bounce In</h3>
                  <p className="text-sm text-muted-foreground">
                    Bouncy entrance effect
                  </p>
                </AnimatedCard>
              </BounceIn>
            </div>
          </section>

          {/* Loading Components */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Loading Components</h2>
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Spinner</h3>
                  <div className="flex justify-center">
                    <LoadingSpinner variant="spinner" size="large" />
                  </div>
                </AnimatedCard>

                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Dots</h3>
                  <div className="flex justify-center">
                    <LoadingSpinner variant="dots" size="medium" />
                  </div>
                </AnimatedCard>

                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Pulse</h3>
                  <div className="flex justify-center">
                    <LoadingSpinner variant="pulse" size="large" />
                  </div>
                </AnimatedCard>

                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Bars</h3>
                  <div className="flex justify-center">
                    <LoadingSpinner variant="bars" size="medium" />
                  </div>
                </AnimatedCard>
              </div>
            </FadeIn>

            <FadeIn delay="short">
              <AnimatedCard>
                <h3 className="text-lg font-medium mb-4">Progress Bars</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Determinate Progress: {progress}%
                    </label>
                    <ProgressBar value={progress} showValue />
                    <div className="flex gap-2 mt-2">
                      <AnimatedButton
                        size="small"
                        onClick={() => setProgress(Math.max(0, progress - 10))}
                      >
                        -10%
                      </AnimatedButton>
                      <AnimatedButton
                        size="small"
                        onClick={() => setProgress(Math.min(100, progress + 10))}
                      >
                        +10%
                      </AnimatedButton>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Indeterminate Progress
                    </label>
                    <ProgressBar variant="indeterminate" color="success" />
                  </div>
                </div>
              </AnimatedCard>
            </FadeIn>
          </section>

          {/* Workflow Animations */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Workflow Components</h2>
            <FadeIn>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Workflow Node</h3>
                  <div className="space-y-4">
                    <WorkflowNode 
                      status={nodeStatus}
                      animateStatusChange
                      className="text-center"
                    >
                      <div>
                        <div className="font-medium">Processing Node</div>
                        <div className="text-sm text-muted-foreground">
                          Status: {nodeStatus}
                        </div>
                      </div>
                    </WorkflowNode>
                    <div className="flex gap-2 flex-wrap">
                      {(['pending', 'running', 'pass', 'fail'] as const).map((status) => (
                        <AnimatedButton
                          key={status}
                          size="small"
                          variant={nodeStatus === status ? 'primary' : 'outline'}
                          onClick={() => setNodeStatus(status)}
                        >
                          {status}
                        </AnimatedButton>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Workflow Progress</h3>
                  <div className="space-y-4">
                    <WorkflowProgress steps={workflowSteps} showLabels />
                    <div className="text-sm text-muted-foreground">
                      Step-by-step progress visualization
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </FadeIn>
          </section>

          {/* Interactive Components */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Interactive Components</h2>
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Animated Buttons</h3>
                  <div className="space-y-3">
                    <AnimatedButton variant="primary">Primary</AnimatedButton>
                    <AnimatedButton variant="secondary">Secondary</AnimatedButton>
                    <AnimatedButton variant="outline">Outline</AnimatedButton>
                    <AnimatedButton variant="ghost">Ghost</AnimatedButton>
                  </div>
                </AnimatedCard>

                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Modal & Toast</h3>
                  <div className="space-y-3">
                    <AnimatedButton onClick={() => setShowModal(true)}>
                      Open Modal
                    </AnimatedButton>
                    <AnimatedButton 
                      variant="outline" 
                      onClick={() => {
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                      }}
                    >
                      Show Toast
                    </AnimatedButton>
                  </div>
                </AnimatedCard>

                <AnimatedCard>
                  <h3 className="text-lg font-medium mb-4">Hover Effects</h3>
                  <p className="text-sm text-muted-foreground">
                    This card has hover animations. Try hovering over it!
                  </p>
                </AnimatedCard>
              </div>
            </FadeIn>
          </section>

          {/* Enhanced Animations */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Enhanced Animation Components</h2>
            
            {/* Fade Animations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Directional Fade Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FadeAnimation direction="up" triggerOnView>
                  <MicroInteraction type="lift">
                    <AnimatedCard className="text-center">
                      <p className="font-medium">Fade Up</p>
                    </AnimatedCard>
                  </MicroInteraction>
                </FadeAnimation>
                
                <FadeAnimation direction="down" triggerOnView delay={100}>
                  <MicroInteraction type="scale">
                    <AnimatedCard className="text-center">
                      <p className="font-medium">Fade Down</p>
                    </AnimatedCard>
                  </MicroInteraction>
                </FadeAnimation>
                
                <FadeAnimation direction="left" triggerOnView delay={200}>
                  <MicroInteraction type="glow">
                    <AnimatedCard className="text-center">
                      <p className="font-medium">Fade Left</p>
                    </AnimatedCard>
                  </MicroInteraction>
                </FadeAnimation>
                
                <FadeAnimation direction="right" triggerOnView delay={300}>
                  <MicroInteraction type="bounce">
                    <AnimatedCard className="text-center">
                      <p className="font-medium">Fade Right</p>
                    </AnimatedCard>
                  </MicroInteraction>
                </FadeAnimation>
              </div>
            </div>
            
            {/* Scale Animations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scale Animation Variants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ScaleAnimation variant="in" triggerOnView>
                  <AnimatedCard className="text-center">
                    <p className="font-medium">Scale In</p>
                  </AnimatedCard>
                </ScaleAnimation>
                
                <ScaleAnimation variant="bounce" triggerOnView delay={100}>
                  <AnimatedCard className="text-center">
                    <p className="font-medium">Bounce Scale</p>
                  </AnimatedCard>
                </ScaleAnimation>
                
                <ScaleAnimation variant="pulse" triggerOnView delay={200}>
                  <AnimatedCard className="text-center">
                    <p className="font-medium">Pulse Scale</p>
                  </AnimatedCard>
                </ScaleAnimation>
                
                <div className="flex justify-center items-center">
                  <LoadingAnimation variant="spinner" size="medium" />
                </div>
              </div>
            </div>
            
            {/* Enhanced Loading Animations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Enhanced Loading Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <AnimatedCard className="text-center p-4">
                  <h4 className="font-medium mb-3">Spinner</h4>
                  <LoadingAnimation variant="spinner" size="medium" />
                </AnimatedCard>
                
                <AnimatedCard className="text-center p-4">
                  <h4 className="font-medium mb-3">Dots</h4>
                  <LoadingAnimation variant="dots" size="medium" />
                </AnimatedCard>
                
                <AnimatedCard className="text-center p-4">
                  <h4 className="font-medium mb-3">Pulse</h4>
                  <LoadingAnimation variant="pulse" size="medium" />
                </AnimatedCard>
                
                <AnimatedCard className="text-center p-4">
                  <h4 className="font-medium mb-3">Wave</h4>
                  <LoadingAnimation variant="wave" size="medium" />
                </AnimatedCard>
                
                <AnimatedCard className="p-4">
                  <h4 className="font-medium mb-3">Skeleton</h4>
                  <LoadingAnimation variant="skeleton" />
                </AnimatedCard>
              </div>
            </div>
          </section>
          
          {/* Micro Interactions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Micro Interactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MicroInteraction type="lift" intensity="subtle">
                <AnimatedCard className="text-center cursor-pointer">
                  <p className="font-medium">Subtle Lift</p>
                  <p className="text-sm text-muted-foreground mt-1">Hover me</p>
                </AnimatedCard>
              </MicroInteraction>
              
              <MicroInteraction type="scale" intensity="normal">
                <AnimatedCard className="text-center cursor-pointer">
                  <p className="font-medium">Scale Effect</p>
                  <p className="text-sm text-muted-foreground mt-1">Hover me</p>
                </AnimatedCard>
              </MicroInteraction>
              
              <MicroInteraction type="glow" intensity="strong">
                <AnimatedCard className="text-center cursor-pointer">
                  <p className="font-medium">Glow Effect</p>
                  <p className="text-sm text-muted-foreground mt-1">Hover me</p>
                </AnimatedCard>
              </MicroInteraction>
              
              <MicroInteraction type="bounce">
                <AnimatedCard className="text-center cursor-pointer">
                  <p className="font-medium">Bounce Effect</p>
                  <p className="text-sm text-muted-foreground mt-1">Hover me</p>
                </AnimatedCard>
              </MicroInteraction>
            </div>
          </section>
          
          {/* Enhanced Staggered Animation */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Enhanced Staggered Animation</h2>
            <EnhancedStaggerContainer staggerDelay={150} triggerOnView maxItems={8}>
              {Array.from({ length: 8 }).map((_, i) => (
                <MicroInteraction key={i} type="lift">
                  <AnimatedCard className="mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">Enhanced Staggered Item {i + 1}</h4>
                        <p className="text-sm text-muted-foreground">
                          GPU accelerated with {i * 150}ms delay
                        </p>
                      </div>
                    </div>
                  </AnimatedCard>
                </MicroInteraction>
              ))}
            </EnhancedStaggerContainer>
          </section>
        </div>

        {/* Modal */}
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          size="medium"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Animated Modal</h3>
            <p className="text-muted-foreground mb-6">
              This modal appears with smooth scale and fade animations. It also includes
              a backdrop blur effect for better visual separation.
            </p>
            <div className="flex gap-3">
              <AnimatedButton onClick={() => setShowModal(false)}>
                Close
              </AnimatedButton>
              <AnimatedButton variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </AnimatedButton>
            </div>
          </div>
        </Modal>

        {/* Toast */}
        <Toast isVisible={showToast} type="success">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Animation system is working perfectly!</span>
          </div>
        </Toast>
        </div>
      </PageTransition>
    </AnimationPerformanceMonitor>
  );
}