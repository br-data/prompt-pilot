export interface Source {
    id: number;
    title?: string | null;
    content: string;
    createdAt: Date;
    sourcesId: number;
    sources?: Sources | null;
    generatedOutput: GeneratedOutput[];
  }
  
  export interface User {
    id: number;
    email: string;
    admin: boolean;
    createdAt: Date;
    feedback: Feedback[];
  }
  
  export interface Prompt {
    versionId: number;
    promptId: string;
    title: string;
    description: string;
    content: string;
    model: string;
    variance: number;
    createdAt: Date;
    generatedOutput: GeneratedOutput[];
    testset: String[];
    createdBy: User;
    public: boolean;
  }
  
  export interface Sources {
    id: number;
    title: string;
    description?: string | null;
    createdAt: Date;
    sources: Source[];
    createdBy: User;
    createdById?: number | null;
    public: boolean;
  }
  
  export interface AnnotationListType {
    id: number;
    title: string;
    description?: string | null;
    createdAt: Date;
    sources: string;
    sourcesName: string;
    prompts: Prompt[];
    generatedOutput: GeneratedOutput[];
    runs: number;
    createdBy: User;
    public: boolean;
  }
  
  export interface GeneratedOutput {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    source: string;
    sourceId: number;
    versionId: number;
    version: Prompt;
    annotationListId: number;
    annotationList: AnnotationListType;
    feedbacks: Feedback[];
    logs: Log[];
  }

  export type Log = {
    id: number;
    msg: string;
    status: string;
    start?: number | null;
    end?: number | null;
    attempt?: number | null;
    createdAt: string;
    response: string | null;
    generatedOutputId?: number | null;
    call: string | null;
  };
  
  export interface Feedback {
    id?: number;
    reviewEffortScale?: number;
    feedbackText?: string | null;
    feedbackTextPositive?: string | null;
    feedbackTextNegative?: string | null;
    userId?: number;
    user?: User;
    generatedOutputId?: number;
    generatedOutput?: GeneratedOutput;
    createdAt?: Date;
  }