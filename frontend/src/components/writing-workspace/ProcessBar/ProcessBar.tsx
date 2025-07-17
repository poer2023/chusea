import { CheckCircle, Circle, AlertCircle, Loader2, FileText, Edit, Quote, CheckCircle2, Eye, Play, Pause, SkipForward, RotateCcw, Settings, TrendingUp, Star, Clock, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WorkflowStep, WorkflowStatus } from '@/types/layout';
import type { QualityMetrics } from '@/lib/workflow/quality-checker';

interface ProcessBarProps {
  currentStep: WorkflowStep;
  stepProgress: number;
  overallProgress: number;
  isProcessing: boolean;
  
  // Quality metrics
  qualityMetrics?: QualityMetrics;
  qualityThresholds?: Record<string, number>;
  
  // Workflow control
  workflowStatus: WorkflowStatus;
  canSkipStep?: boolean;
  canRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
  
  // Step results
  stepResults?: Record<string, any>;
  stepErrors?: Record<string, string>;
  
  // Interactive controls
  onStepClick?: (step: WorkflowStep) => void;
  onPlayPause?: () => void;
  onSkipStep?: () => void;
  onRetryStep?: () => void;
  onStepSettings?: (step: WorkflowStep) => void;
  
  // Configuration
  showQualityMetrics?: boolean;
  showDetailedProgress?: boolean;
  showStepControls?: boolean;
  
  className?: string;
}

interface StepConfig {
  key: WorkflowStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  isOptional?: boolean;
}

const WORKFLOW_STEPS: StepConfig[] = [
  {
    key: 'planning',
    label: 'Plan',
    icon: FileText,
    description: 'Generate writing outline and structure',
    color: 'blue'
  },
  {
    key: 'drafting',
    label: 'Draft',
    icon: Edit,
    description: 'Create first draft content',
    color: 'green'
  },
  {
    key: 'citation',
    label: 'Citation',
    icon: Quote,
    description: 'Validate and format citations',
    color: 'purple',
    isOptional: true
  },
  {
    key: 'grammar',
    label: 'Grammar',
    icon: CheckCircle2,
    description: 'Check grammar and style',
    color: 'orange'
  },
  {
    key: 'readability',
    label: 'Readability',
    icon: Eye,
    description: 'Optimize for readability',
    color: 'indigo'
  }
];

export const ProcessBar: React.FC<ProcessBarProps> = ({
  currentStep,
  stepProgress,
  overallProgress,
  isProcessing,
  workflowStatus,
  qualityMetrics,
  qualityThresholds,
  canSkipStep = false,
  canRetry = false,
  retryCount = 0,
  maxRetries = 3,
  stepResults = {},
  stepErrors = {},
  onStepClick,
  onPlayPause,
  onSkipStep,
  onRetryStep,
  onStepSettings,
  showQualityMetrics = true,
  showDetailedProgress = true,
  showStepControls = true,
  className
}) => {
  
  const getStepStatus = (step: WorkflowStep): 'pending' | 'active' | 'completed' | 'failed' | 'skipped' => {
    if (stepErrors[step]) return 'failed';
    if (stepResults[step]?.skipped) return 'skipped';
    if (stepResults[step]?.completedAt) return 'completed';
    
    const stepIndex = WORKFLOW_STEPS.findIndex(s => s.key === step);
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.key === currentStep);
    
    if (stepIndex === currentIndex) return 'active';
    if (stepIndex < currentIndex) return 'completed';
    return 'pending';
  };

  const getStepIcon = (step: StepConfig, status: string) => {
    const { icon: Icon, color } = step;
    
    if (status === 'completed') {
      return <CheckCircle className={`w-5 h-5 text-${color}-600`} />;
    } else if (status === 'failed') {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    } else if (status === 'skipped') {
      return <SkipForward className="w-5 h-5 text-gray-400" />;
    } else if (status === 'active' && isProcessing) {
      return <Loader2 className={`w-5 h-5 text-${color}-500 animate-spin`} />;
    } else {
      return <Icon className={cn(
        'w-5 h-5',
        status === 'active' ? `text-${color}-500` : 'text-muted-foreground'
      )} />;
    }
  };

  const getStepColor = (step: StepConfig, status: string) => {
    const { color } = step;
    
    switch (status) {
      case 'completed': return `border-${color}-500 bg-${color}-50`;
      case 'active': return `border-${color}-500 bg-${color}-50 ring-2 ring-${color}-200`;
      case 'failed': return 'border-red-500 bg-red-50';
      case 'skipped': return 'border-gray-300 bg-gray-50';
      default: return 'border-muted bg-background';
    }
  };

  const getQualityScore = (step: WorkflowStep): number | null => {
    if (!qualityMetrics || !stepResults[step]) return null;
    return stepResults[step]?.metrics?.overallScore || null;
  };

  const getQualityColor = (score: number | null): string => {
    if (score === null) return 'gray';
    if (score >= 0.8) return 'green';
    if (score >= 0.6) return 'yellow';
    return 'red';
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEstimatedTime = (step: WorkflowStep): string => {
    const estimates = {
      planning: '2-3 min',
      drafting: '5-8 min',
      citation: '3-5 min',
      grammar: '2-4 min',
      readability: '3-6 min'
    };
    return estimates[step] || '~5 min';
  };

  return (
    <div className={cn('process-bar space-y-4', className)}>
      {/* Header with overall progress and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Writing Progress</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {Math.round(overallProgress)}% Complete
          </Badge>
        </div>
        
        {showStepControls && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPlayPause}
              className="p-2 rounded-md hover:bg-muted/50 transition-colors"
              disabled={!onPlayPause}
            >
              {workflowStatus === 'running' ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            
            {canSkipStep && (
              <button
                onClick={onSkipStep}
                className="p-2 rounded-md hover:bg-muted/50 transition-colors"
                disabled={!onSkipStep}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}
            
            {canRetry && retryCount < maxRetries && (
              <button
                onClick={onRetryStep}
                className="p-2 rounded-md hover:bg-muted/50 transition-colors"
                disabled={!onRetryStep}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => onStepSettings?.(currentStep)}
              className="p-2 rounded-md hover:bg-muted/50 transition-colors"
              disabled={!onStepSettings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={overallProgress} 
          className="h-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Started</span>
          <span>{Math.round(overallProgress)}%</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step.key);
          const isActive = step.key === currentStep;
          const qualityScore = getQualityScore(step.key);
          const hasError = stepErrors[step.key];
          const completedAt = stepResults[step.key]?.completedAt;
          
          return (
            <div key={step.key} className="flex items-center gap-2">
              {/* Step Node */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.key)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 px-4 py-3 rounded-lg border-2',
                    'hover:bg-muted/50 transition-all duration-200',
                    'min-w-[120px] text-center',
                    getStepColor(step, status),
                    onStepClick && 'cursor-pointer'
                  )}
                  disabled={!onStepClick}
                >
                  {/* Step Icon */}
                  <div className="relative">
                    {getStepIcon(step, status)}
                    {step.isOptional && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{step.label}</span>
                    {showDetailedProgress && (
                      <div className="text-xs text-muted-foreground">
                        {status === 'active' && isProcessing && (
                          <span>Processing...</span>
                        )}
                        {status === 'completed' && completedAt && (
                          <span>{formatTime(completedAt)}</span>
                        )}
                        {status === 'pending' && (
                          <span>~{getEstimatedTime(step.key)}</span>
                        )}
                        {status === 'failed' && (
                          <span className="text-red-500">Error</span>
                        )}
                        {status === 'skipped' && (
                          <span className="text-gray-500">Skipped</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Step Progress Bar for active step */}
                  {isActive && stepProgress > 0 && (
                    <div className="w-full mt-1">
                      <Progress 
                        value={stepProgress} 
                        className="h-1"
                        size="sm"
                      />
                    </div>
                  )}
                  
                  {/* Quality Score */}
                  {showQualityMetrics && qualityScore !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className={`w-3 h-3 text-${getQualityColor(qualityScore)}-500`} />
                      <span className={`text-xs text-${getQualityColor(qualityScore)}-600`}>
                        {Math.round(qualityScore * 100)}%
                      </span>
                    </div>
                  )}
                  
                  {/* Retry indicator */}
                  {retryCount > 0 && status === 'active' && (
                    <div className="absolute -top-1 -left-1">
                      <Badge variant="secondary" className="text-xs px-1">
                        {retryCount}
                      </Badge>
                    </div>
                  )}
                </button>
              </div>

              {/* Connection Line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className={cn(
                  'w-6 h-0.5 bg-muted transition-colors',
                  status === 'completed' && `bg-${step.color}-500`
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Details */}
      {currentStep !== 'idle' && currentStep !== 'completed' && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Current Step
              </Badge>
              <span className="font-medium">
                {WORKFLOW_STEPS.find(s => s.key === currentStep)?.label}
              </span>
              {isProcessing && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
            
            {showQualityMetrics && qualityMetrics && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  Quality: {Math.round(qualityMetrics.overallScore * 100)}%
                </span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {WORKFLOW_STEPS.find(s => s.key === currentStep)?.description}
          </p>
          
          {/* Error Display */}
          {stepErrors[currentStep] && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>{stepErrors[currentStep]}</span>
            </div>
          )}
          
          {/* Quality Suggestions */}
          {showQualityMetrics && qualityMetrics?.suggestions && qualityMetrics.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quality Suggestions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {qualityMetrics.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Step Progress */}
          {stepProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step Progress</span>
                <span>{Math.round(stepProgress)}%</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
          )}
        </div>
      )}
      
      {/* Workflow Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>Status: {workflowStatus}</span>
        </div>
        
        {retryCount > 0 && (
          <div className="flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            <span>Retries: {retryCount}/{maxRetries}</span>
          </div>
        )}
      </div>
    </div>
  );
};