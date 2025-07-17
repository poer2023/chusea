// Literature management types for ChUseA application

export interface Literature {
  id: string;
  title: string;
  authors: Author[];
  abstract?: string;
  keywords?: string[];
  doi?: string;
  url?: string;
  publicationYear?: number;
  publicationDate?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  type: LiteratureType;
  language?: string;
  category?: LiteratureCategory;
  tags: LiteratureTag[];
  files: LiteratureFile[];
  notes?: string;
  summary?: string;
  status: LiteratureStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  metadata: LiteratureMetadata;
  analytics: LiteratureAnalytics;
  citations: Citation[];
  references: Reference[];
}

export interface Author {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  affiliation?: string;
  orcid?: string;
  order: number;
}

export interface LiteratureCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  children?: LiteratureCategory[];
}

export interface LiteratureTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  usageCount?: number;
}

export interface LiteratureFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'html' | 'epub' | 'other';
  uploadedAt: string;
  extractedText?: string;
  pageCount?: number;
}

export interface LiteratureMetadata {
  wordCount: number;
  pageCount?: number;
  readingTime: number;
  extractedAt?: string;
  lastIndexed?: string;
  source?: string;
  sourceId?: string;
  confidence?: number;
  quality?: number;
  completeness?: number;
  bibtexKey?: string;
  mendeley?: {
    id: string;
    groupId?: string;
  };
  zotero?: {
    id: string;
    groupId?: string;
  };
}

export interface LiteratureAnalytics {
  views: {
    totalViews: number;
    uniqueViews: number;
    recentViews: number;
    lastViewed?: string;
  };
  citations: {
    totalCitations: number;
    selfCitations: number;
    externalCitations: number;
  };
  downloads: {
    totalDownloads: number;
    recentDownloads: number;
  };
  interactions: {
    likes: number;
    bookmarks: number;
    shares: number;
    comments: number;
  };
}

export interface Citation {
  id: string;
  literatureId: string;
  style: CitationStyle;
  formatted: string;
  rawData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Reference {
  id: string;
  literatureId: string;
  referencedLiteratureId?: string;
  title: string;
  authors?: string[];
  year?: number;
  journal?: string;
  doi?: string;
  url?: string;
  formatted: string;
  confidence?: number;
  order: number;
  createdAt: string;
}

export type LiteratureType = 
  | 'article'
  | 'book'
  | 'chapter'
  | 'conference'
  | 'thesis'
  | 'dissertation'
  | 'report'
  | 'patent'
  | 'webpage'
  | 'dataset'
  | 'software'
  | 'other';

export type LiteratureStatus = 
  | 'unread'
  | 'reading'
  | 'read'
  | 'reviewed'
  | 'cited'
  | 'archived'
  | 'deleted';

export type CitationStyle = 
  | 'apa'
  | 'mla'
  | 'chicago'
  | 'harvard'
  | 'ieee'
  | 'vancouver'
  | 'nature'
  | 'science'
  | 'custom';

export type LiteratureSearchFilter = {
  query?: string;
  authors?: string[];
  categories?: string[];
  tags?: string[];
  types?: LiteratureType[];
  statuses?: LiteratureStatus[];
  yearRange?: {
    from?: number;
    to?: number;
  };
  dateRange?: {
    from?: string;
    to?: string;
  };
  journals?: string[];
  hasFiles?: boolean;
  hasNotes?: boolean;
  language?: string;
  isPublic?: boolean;
};

export type LiteratureSortBy = 
  | 'title'
  | 'createdAt'
  | 'updatedAt'
  | 'publicationDate'
  | 'publicationYear'
  | 'authors'
  | 'journal'
  | 'citations'
  | 'views'
  | 'relevance';

export type LiteratureSortOrder = 'asc' | 'desc';

// API request/response types
export interface CreateLiteratureRequest {
  title: string;
  authors: Omit<Author, 'id'>[];
  abstract?: string;
  keywords?: string[];
  doi?: string;
  url?: string;
  publicationYear?: number;
  publicationDate?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  type: LiteratureType;
  language?: string;
  categoryId?: string;
  tagIds?: string[];
  notes?: string;
  summary?: string;
  status?: LiteratureStatus;
  isPublic?: boolean;
  files?: File[];
}

export interface UpdateLiteratureRequest {
  title?: string;
  authors?: Omit<Author, 'id'>[];
  abstract?: string;
  keywords?: string[];
  doi?: string;
  url?: string;
  publicationYear?: number;
  publicationDate?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  type?: LiteratureType;
  language?: string;
  categoryId?: string;
  tagIds?: string[];
  notes?: string;
  summary?: string;
  status?: LiteratureStatus;
  isPublic?: boolean;
}

export interface LiteratureSearchRequest {
  query?: string;
  filters?: LiteratureSearchFilter;
  sortBy?: LiteratureSortBy;
  sortOrder?: LiteratureSortOrder;
  page?: number;
  pageSize?: number;
}

export interface LiteratureSearchResponse {
  literature: Literature[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
    facets?: {
      authors: Array<{ name: string; count: number }>;
      categories: Array<{ name: string; count: number }>;
      tags: Array<{ name: string; count: number }>;
      types: Array<{ type: LiteratureType; count: number }>;
      journals: Array<{ name: string; count: number }>;
      years: Array<{ year: number; count: number }>;
    };
  };
}

export interface ExtractReferencesRequest {
  text: string;
  format?: 'auto' | 'bibtex' | 'ris' | 'endnote' | 'plain';
  includeFullText?: boolean;
}

export interface ExtractReferencesResponse {
  references: Array<{
    title: string;
    authors: string[];
    year?: number;
    journal?: string;
    doi?: string;
    url?: string;
    confidence: number;
    rawText: string;
    startIndex: number;
    endIndex: number;
  }>;
  metadata: {
    totalFound: number;
    processingTime: number;
    format: string;
    confidence: number;
  };
}

export interface GenerateCitationRequest {
  literatureId: string;
  style: CitationStyle;
  format?: 'text' | 'html' | 'latex';
  includeUrl?: boolean;
  includeAccessed?: boolean;
}

export interface GenerateCitationResponse {
  citation: string;
  style: CitationStyle;
  format: string;
  metadata: {
    generatedAt: string;
    style: CitationStyle;
    format: string;
  };
}

export interface ImportLiteratureRequest {
  source: 'bibtex' | 'ris' | 'endnote' | 'csv' | 'json' | 'mendeley' | 'zotero';
  data: string | File;
  options?: {
    categoryId?: string;
    tagIds?: string[];
    isPublic?: boolean;
    extractText?: boolean;
    downloadFiles?: boolean;
  };
}

export interface ImportLiteratureResponse {
  imported: number;
  failed: number;
  errors: Array<{
    line: number;
    message: string;
    data?: any;
  }>;
  literature: Literature[];
}

export interface ExportLiteratureRequest {
  literatureIds: string[];
  format: 'bibtex' | 'ris' | 'endnote' | 'csv' | 'json' | 'pdf';
  options?: {
    includeFiles?: boolean;
    includeNotes?: boolean;
    citationStyle?: CitationStyle;
  };
}

export interface ExportLiteratureResponse {
  data: string | Blob;
  filename: string;
  format: string;
  size: number;
}

// UI component props types
export interface LiteratureListProps {
  literature?: Literature[];
  loading?: boolean;
  error?: string;
  filters?: LiteratureSearchFilter;
  onFiltersChange?: (filters: LiteratureSearchFilter) => void;
  onSort?: (sortBy: LiteratureSortBy, sortOrder: LiteratureSortOrder) => void;
  onSelect?: (literature: Literature) => void;
  onEdit?: (literature: Literature) => void;
  onDelete?: (literatureId: string) => void;
  onStatusChange?: (literatureId: string, status: LiteratureStatus) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (page: number) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export interface LiteratureCardProps {
  literature: Literature;
  onEdit?: (literature: Literature) => void;
  onDelete?: (literatureId: string) => void;
  onStatusChange?: (literatureId: string, status: LiteratureStatus) => void;
  onSelect?: (literature: Literature) => void;
  onCite?: (literature: Literature) => void;
  selected?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export interface LiteratureFormProps {
  literature?: Literature;
  onSubmit: (data: CreateLiteratureRequest | UpdateLiteratureRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  categories?: LiteratureCategory[];
  tags?: LiteratureTag[];
}

export interface CategoryManagerProps {
  categories?: LiteratureCategory[];
  onCreateCategory?: (category: Omit<LiteratureCategory, 'id'>) => Promise<void>;
  onUpdateCategory?: (id: string, category: Partial<LiteratureCategory>) => Promise<void>;
  onDeleteCategory?: (id: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface ReferenceExtractorProps {
  onExtract: (request: ExtractReferencesRequest) => Promise<ExtractReferencesResponse>;
  onImport?: (references: Reference[]) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface CitationFormatterProps {
  literature: Literature[];
  onGenerate: (request: GenerateCitationRequest) => Promise<GenerateCitationResponse>;
  onCopy?: (citation: string) => void;
  onInsert?: (citation: string) => void;
  loading?: boolean;
  error?: string;
}

export interface LiteratureSearchProps {
  onSearch: (request: LiteratureSearchRequest) => Promise<LiteratureSearchResponse>;
  onFiltersChange?: (filters: LiteratureSearchFilter) => void;
  onResultSelect?: (literature: Literature) => void;
  categories?: LiteratureCategory[];
  tags?: LiteratureTag[];
  loading?: boolean;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

// Literature management store types
export interface LiteratureState {
  literature: Literature[];
  selectedLiterature: Literature | null;
  categories: LiteratureCategory[];
  tags: LiteratureTag[];
  filters: LiteratureSearchFilter;
  sortBy: LiteratureSortBy;
  sortOrder: LiteratureSortOrder;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  loading: boolean;
  error: string | null;
  selectedIds: string[];
}

export interface LiteratureActions {
  // Literature CRUD
  fetchLiterature: (params?: LiteratureSearchRequest) => Promise<void>;
  createLiterature: (data: CreateLiteratureRequest) => Promise<Literature>;
  updateLiterature: (id: string, data: UpdateLiteratureRequest) => Promise<Literature>;
  deleteLiterature: (id: string) => Promise<void>;
  
  // Search and filtering
  searchLiterature: (request: LiteratureSearchRequest) => Promise<LiteratureSearchResponse>;
  setFilters: (filters: LiteratureSearchFilter) => void;
  setSorting: (sortBy: LiteratureSortBy, sortOrder: LiteratureSortOrder) => void;
  
  // Categories and tags
  fetchCategories: () => Promise<void>;
  createCategory: (data: Omit<LiteratureCategory, 'id'>) => Promise<LiteratureCategory>;
  updateCategory: (id: string, data: Partial<LiteratureCategory>) => Promise<LiteratureCategory>;
  deleteCategory: (id: string) => Promise<void>;
  
  fetchTags: () => Promise<void>;
  createTag: (data: Omit<LiteratureTag, 'id'>) => Promise<LiteratureTag>;
  updateTag: (id: string, data: Partial<LiteratureTag>) => Promise<LiteratureTag>;
  deleteTag: (id: string) => Promise<void>;
  
  // References and citations
  extractReferences: (request: ExtractReferencesRequest) => Promise<ExtractReferencesResponse>;
  generateCitation: (request: GenerateCitationRequest) => Promise<GenerateCitationResponse>;
  
  // Import/Export
  importLiterature: (request: ImportLiteratureRequest) => Promise<ImportLiteratureResponse>;
  exportLiterature: (request: ExportLiteratureRequest) => Promise<ExportLiteratureResponse>;
  
  // UI state
  selectLiterature: (literature: Literature | null) => void;
  setSelectedIds: (ids: string[]) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearError: () => void;
  reset: () => void;
}