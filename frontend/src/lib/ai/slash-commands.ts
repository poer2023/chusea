/**
 * Slash Command System for AI Writing Assistant
 * Provides structured command parsing, validation, and execution
 */

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  usage: string;
  category: SlashCommandCategory;
  parameters: SlashCommandParameter[];
  aliases: string[];
  requiresSelection: boolean;
  isAsync: boolean;
  icon: string;
  priority: number;
}

export interface SlashCommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  description: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validation?: (value: any) => boolean | string;
}

export type SlashCommandCategory = 
  | 'writing' 
  | 'editing' 
  | 'analysis' 
  | 'translation' 
  | 'formatting' 
  | 'research' 
  | 'workflow';

export interface SlashCommandContext {
  selectedText?: string;
  fullText: string;
  cursorPosition: number;
  documentId?: string;
  workflowId?: string;
  userId?: string;
}

export interface SlashCommandResult {
  success: boolean;
  data?: any;
  error?: string;
  shouldReplaceSelection?: boolean;
  shouldInsertText?: boolean;
  insertText?: string;
  replaceText?: string;
  showInChat?: boolean;
  chatMessage?: string;
  metadata?: Record<string, any>;
}

export interface ParsedCommand {
  command: string;
  args: Record<string, any>;
  rawArgs: string[];
  isValid: boolean;
  errors: string[];
  matchedCommand?: SlashCommand;
}

// Available slash commands
export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'rewrite',
    name: 'rewrite',
    description: 'Rewrite the selected text or entire document',
    usage: '/rewrite [style] [tone]',
    category: 'writing',
    parameters: [
      {
        name: 'style',
        type: 'select',
        required: false,
        description: 'Writing style',
        options: [
          { label: 'Academic', value: 'academic' },
          { label: 'Professional', value: 'professional' },
          { label: 'Casual', value: 'casual' },
          { label: 'Creative', value: 'creative' },
          { label: 'Technical', value: 'technical' }
        ]
      },
      {
        name: 'tone',
        type: 'select',
        required: false,
        description: 'Tone of voice',
        options: [
          { label: 'Formal', value: 'formal' },
          { label: 'Informal', value: 'informal' },
          { label: 'Friendly', value: 'friendly' },
          { label: 'Authoritative', value: 'authoritative' },
          { label: 'Persuasive', value: 'persuasive' }
        ]
      }
    ],
    aliases: ['rw', 'rewrite'],
    requiresSelection: true,
    isAsync: true,
    icon: '✏️',
    priority: 10
  },
  {
    id: 'expand',
    name: 'expand',
    description: 'Expand the selected text with more detail',
    usage: '/expand [type] [length]',
    category: 'writing',
    parameters: [
      {
        name: 'type',
        type: 'select',
        required: false,
        description: 'Type of expansion',
        options: [
          { label: 'Add Details', value: 'detail' },
          { label: 'Add Examples', value: 'examples' },
          { label: 'Add Context', value: 'context' },
          { label: 'Add Explanation', value: 'explanation' }
        ]
      },
      {
        name: 'length',
        type: 'select',
        required: false,
        description: 'Expansion length',
        options: [
          { label: 'Short', value: 'short' },
          { label: 'Medium', value: 'medium' },
          { label: 'Long', value: 'long' }
        ]
      }
    ],
    aliases: ['expand', 'elaborate'],
    requiresSelection: true,
    isAsync: true,
    icon: '📝',
    priority: 9
  },
  {
    id: 'summarize',
    name: 'summarize',
    description: 'Create a summary of the selected text',
    usage: '/summarize [length] [type]',
    category: 'analysis',
    parameters: [
      {
        name: 'length',
        type: 'select',
        required: false,
        description: 'Summary length',
        options: [
          { label: 'Brief', value: 'brief' },
          { label: 'Standard', value: 'standard' },
          { label: 'Detailed', value: 'detailed' }
        ]
      },
      {
        name: 'type',
        type: 'select',
        required: false,
        description: 'Summary type',
        options: [
          { label: 'Key Points', value: 'key_points' },
          { label: 'Abstract', value: 'abstract' },
          { label: 'Bullet Points', value: 'bullet_points' }
        ]
      }
    ],
    aliases: ['sum', 'summary'],
    requiresSelection: true,
    isAsync: true,
    icon: '📋',
    priority: 8
  },
  {
    id: 'translate',
    name: 'translate',
    description: 'Translate text to another language',
    usage: '/translate [language] [preserve_formatting]',
    category: 'translation',
    parameters: [
      {
        name: 'language',
        type: 'select',
        required: true,
        description: 'Target language',
        options: [
          { label: 'Chinese (Simplified)', value: 'zh-CN' },
          { label: 'Chinese (Traditional)', value: 'zh-TW' },
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Korean', value: 'ko' },
          { label: 'Russian', value: 'ru' },
          { label: 'Arabic', value: 'ar' }
        ]
      },
      {
        name: 'preserve_formatting',
        type: 'boolean',
        required: false,
        description: 'Preserve original formatting',
        defaultValue: true
      }
    ],
    aliases: ['tr', 'translate'],
    requiresSelection: true,
    isAsync: true,
    icon: '🌐',
    priority: 7
  },
  {
    id: 'grammar',
    name: 'grammar',
    description: 'Check and fix grammar issues',
    usage: '/grammar [fix_automatically]',
    category: 'editing',
    parameters: [
      {
        name: 'fix_automatically',
        type: 'boolean',
        required: false,
        description: 'Automatically fix grammar issues',
        defaultValue: false
      }
    ],
    aliases: ['grammar', 'check'],
    requiresSelection: false,
    isAsync: true,
    icon: '✅',
    priority: 6
  },
  {
    id: 'improve',
    name: 'improve',
    description: 'Improve clarity and readability',
    usage: '/improve [aspect]',
    category: 'editing',
    parameters: [
      {
        name: 'aspect',
        type: 'select',
        required: false,
        description: 'Aspect to improve',
        options: [
          { label: 'Clarity', value: 'clarity' },
          { label: 'Readability', value: 'readability' },
          { label: 'Conciseness', value: 'conciseness' },
          { label: 'Flow', value: 'flow' },
          { label: 'Engagement', value: 'engagement' }
        ]
      }
    ],
    aliases: ['improve', 'enhance'],
    requiresSelection: true,
    isAsync: true,
    icon: '⚡',
    priority: 5
  },
  {
    id: 'cite',
    name: 'cite',
    description: 'Generate citations or find sources',
    usage: '/cite [style] [search_query]',
    category: 'research',
    parameters: [
      {
        name: 'style',
        type: 'select',
        required: false,
        description: 'Citation style',
        options: [
          { label: 'APA', value: 'apa' },
          { label: 'MLA', value: 'mla' },
          { label: 'Chicago', value: 'chicago' },
          { label: 'Harvard', value: 'harvard' },
          { label: 'IEEE', value: 'ieee' }
        ]
      },
      {
        name: 'search_query',
        type: 'string',
        required: false,
        description: 'Search query for finding sources'
      }
    ],
    aliases: ['cite', 'reference'],
    requiresSelection: false,
    isAsync: true,
    icon: '📚',
    priority: 4
  },
  {
    id: 'format',
    name: 'format',
    description: 'Format text according to style guidelines',
    usage: '/format [style] [element]',
    category: 'formatting',
    parameters: [
      {
        name: 'style',
        type: 'select',
        required: false,
        description: 'Formatting style',
        options: [
          { label: 'Academic Paper', value: 'academic' },
          { label: 'Business Document', value: 'business' },
          { label: 'Blog Post', value: 'blog' },
          { label: 'Technical Document', value: 'technical' }
        ]
      },
      {
        name: 'element',
        type: 'select',
        required: false,
        description: 'Element to format',
        options: [
          { label: 'Headers', value: 'headers' },
          { label: 'Lists', value: 'lists' },
          { label: 'Quotes', value: 'quotes' },
          { label: 'Tables', value: 'tables' }
        ]
      }
    ],
    aliases: ['format', 'style'],
    requiresSelection: false,
    isAsync: true,
    icon: '📐',
    priority: 3
  },
  {
    id: 'analyze',
    name: 'analyze',
    description: 'Analyze text for insights',
    usage: '/analyze [type]',
    category: 'analysis',
    parameters: [
      {
        name: 'type',
        type: 'multiselect',
        required: false,
        description: 'Analysis types',
        options: [
          { label: 'Readability', value: 'readability' },
          { label: 'Sentiment', value: 'sentiment' },
          { label: 'Keywords', value: 'keywords' },
          { label: 'Topics', value: 'topics' },
          { label: 'Structure', value: 'structure' }
        ]
      }
    ],
    aliases: ['analyze', 'analysis'],
    requiresSelection: false,
    isAsync: true,
    icon: '📊',
    priority: 2
  },
  {
    id: 'help',
    name: 'help',
    description: 'Show help information',
    usage: '/help [command]',
    category: 'workflow',
    parameters: [
      {
        name: 'command',
        type: 'string',
        required: false,
        description: 'Command to get help for'
      }
    ],
    aliases: ['help', 'h'],
    requiresSelection: false,
    isAsync: false,
    icon: '❓',
    priority: 1
  }
];

// Command parser
export class SlashCommandParser {
  private commands: Map<string, SlashCommand> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor() {
    this.initializeCommands();
  }

  private initializeCommands(): void {
    SLASH_COMMANDS.forEach(command => {
      this.commands.set(command.name, command);
      command.aliases.forEach(alias => {
        this.aliases.set(alias, command.name);
      });
    });
  }

  /**
   * Parse a slash command input
   */
  parse(input: string): ParsedCommand {
    if (!input.startsWith('/')) {
      return {
        command: '',
        args: {},
        rawArgs: [],
        isValid: false,
        errors: ['Command must start with /']
      };
    }

    const parts = input.slice(1).split(' ');
    const commandName = parts[0].toLowerCase();
    const rawArgs = parts.slice(1);

    // Find command by name or alias
    const actualCommandName = this.aliases.get(commandName) || commandName;
    const matchedCommand = this.commands.get(actualCommandName);

    if (!matchedCommand) {
      return {
        command: commandName,
        args: {},
        rawArgs,
        isValid: false,
        errors: [`Unknown command: ${commandName}`],
      };
    }

    // Parse arguments
    const { args, errors } = this.parseArguments(matchedCommand, rawArgs);

    return {
      command: actualCommandName,
      args,
      rawArgs,
      isValid: errors.length === 0,
      errors,
      matchedCommand
    };
  }

  private parseArguments(command: SlashCommand, rawArgs: string[]): { args: Record<string, any>; errors: string[] } {
    const args: Record<string, any> = {};
    const errors: string[] = [];

    // Set default values
    command.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        args[param.name] = param.defaultValue;
      }
    });

    // Parse positional arguments
    command.parameters.forEach((param, index) => {
      if (index < rawArgs.length) {
        const value = rawArgs[index];
        const parsedValue = this.parseValue(param, value);
        
        if (parsedValue.isValid) {
          args[param.name] = parsedValue.value;
        } else {
          errors.push(`Invalid value for ${param.name}: ${parsedValue.error}`);
        }
      } else if (param.required) {
        errors.push(`Missing required parameter: ${param.name}`);
      }
    });

    // Validate all arguments
    command.parameters.forEach(param => {
      if (param.validation && args[param.name] !== undefined) {
        const validationResult = param.validation(args[param.name]);
        if (validationResult !== true) {
          errors.push(typeof validationResult === 'string' ? validationResult : `Invalid value for ${param.name}`);
        }
      }
    });

    return { args, errors };
  }

  private parseValue(param: SlashCommandParameter, value: string): { isValid: boolean; value: any; error?: string } {
    switch (param.type) {
      case 'string':
        return { isValid: true, value };

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return { isValid: false, error: 'Must be a number', value: null };
        }
        return { isValid: true, value: num };

      case 'boolean':
        const lowerValue = value.toLowerCase();
        if (['true', '1', 'yes', 'on'].includes(lowerValue)) {
          return { isValid: true, value: true };
        }
        if (['false', '0', 'no', 'off'].includes(lowerValue)) {
          return { isValid: true, value: false };
        }
        return { isValid: false, error: 'Must be true or false', value: null };

      case 'select':
        if (!param.options) {
          return { isValid: true, value };
        }
        const option = param.options.find(opt => opt.value === value || opt.label.toLowerCase() === value.toLowerCase());
        if (!option) {
          return { isValid: false, error: `Must be one of: ${param.options.map(opt => opt.label).join(', ')}`, value: null };
        }
        return { isValid: true, value: option.value };

      case 'multiselect':
        if (!param.options) {
          return { isValid: true, value: [value] };
        }
        const values = value.split(',').map(v => v.trim());
        const validValues = [];
        for (const val of values) {
          const option = param.options.find(opt => opt.value === val || opt.label.toLowerCase() === val.toLowerCase());
          if (option) {
            validValues.push(option.value);
          } else {
            return { isValid: false, error: `Invalid option: ${val}`, value: null };
          }
        }
        return { isValid: true, value: validValues };

      default:
        return { isValid: true, value };
    }
  }

  /**
   * Get command suggestions based on input
   */
  getSuggestions(input: string, context: SlashCommandContext): SlashCommand[] {
    if (!input.startsWith('/')) {
      return [];
    }

    const query = input.slice(1).toLowerCase();
    const suggestions: SlashCommand[] = [];

    // Exact matches first
    this.commands.forEach(command => {
      if (command.name.startsWith(query) || command.aliases.some(alias => alias.startsWith(query))) {
        // Check if command is applicable in current context
        if (!command.requiresSelection || context.selectedText) {
          suggestions.push(command);
        }
      }
    });

    // Sort by priority and relevance
    return suggestions.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, query, context);
      const bScore = this.calculateRelevanceScore(b, query, context);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(command: SlashCommand, query: string, context: SlashCommandContext): number {
    let score = command.priority;

    // Boost if name matches exactly
    if (command.name === query) {
      score += 100;
    }

    // Boost if alias matches exactly
    if (command.aliases.includes(query)) {
      score += 80;
    }

    // Boost if name starts with query
    if (command.name.startsWith(query)) {
      score += 50;
    }

    // Boost if alias starts with query
    if (command.aliases.some(alias => alias.startsWith(query))) {
      score += 40;
    }

    // Boost if command is applicable in current context
    if (!command.requiresSelection || context.selectedText) {
      score += 20;
    }

    return score;
  }

  /**
   * Get all commands for a specific category
   */
  getCommandsByCategory(category: SlashCommandCategory): SlashCommand[] {
    return Array.from(this.commands.values())
      .filter(command => command.category === category)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get command by name
   */
  getCommand(name: string): SlashCommand | undefined {
    const actualName = this.aliases.get(name.toLowerCase()) || name.toLowerCase();
    return this.commands.get(actualName);
  }

  /**
   * Validate command context
   */
  validateContext(command: SlashCommand, context: SlashCommandContext): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (command.requiresSelection && !context.selectedText) {
      errors.push('This command requires text to be selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
export const slashCommandParser = new SlashCommandParser();

// Helper functions
export const getCommandHelp = (commandName: string): string => {
  const command = slashCommandParser.getCommand(commandName);
  if (!command) {
    return `Unknown command: ${commandName}`;
  }

  let help = `**${command.name}** - ${command.description}\n`;
  help += `Usage: ${command.usage}\n`;
  
  if (command.parameters.length > 0) {
    help += '\nParameters:\n';
    command.parameters.forEach(param => {
      help += `  • ${param.name} (${param.type}${param.required ? ', required' : ', optional'}): ${param.description}\n`;
      if (param.options) {
        help += `    Options: ${param.options.map(opt => opt.label).join(', ')}\n`;
      }
    });
  }

  if (command.aliases.length > 1) {
    help += `\nAliases: ${command.aliases.join(', ')}\n`;
  }

  return help;
};

export const getAllCommandsHelp = (): string => {
  const categories: Record<SlashCommandCategory, SlashCommand[]> = {
    writing: [],
    editing: [],
    analysis: [],
    translation: [],
    formatting: [],
    research: [],
    workflow: []
  };

  // Group commands by category
  SLASH_COMMANDS.forEach(command => {
    categories[command.category].push(command);
  });

  let help = '# Available Commands\n\n';

  Object.entries(categories).forEach(([category, commands]) => {
    if (commands.length > 0) {
      help += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Commands\n\n`;
      commands.forEach(command => {
        help += `• **/${command.name}** - ${command.description}\n`;
      });
      help += '\n';
    }
  });

  help += 'Use `/help [command]` to get detailed help for a specific command.';

  return help;
};