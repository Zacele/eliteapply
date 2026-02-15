/** Shared types for EliteApply extension */

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface CoverLetterDraft {
  model: string;
  modelLabel: string;
  content: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  durationMs?: number;
  questionAnswers?: QuestionAnswer[];
}

export interface GenerationResult {
  jobDescription: string;
  drafts: CoverLetterDraft[];
  timestamp: number;
  screeningQuestions: string[];
}

export interface ExtensionSettings {
  openrouterApiKey: string;
}

/** Messages passed between popup, background, and content script */
export type ExtensionMessage =
  | { type: 'EXTRACT_JOB_DESCRIPTION' }
  | { type: 'JOB_DESCRIPTION_RESULT'; data: string | null; error?: string; questions?: string[] }
  | { type: 'GENERATE_COVER_LETTERS'; jobDescription: string; screeningQuestions?: string[] }
  | { type: 'GENERATION_RESULT'; result: GenerationResult }
  | { type: 'GENERATION_ERROR'; error: string };

/** OpenRouter model configuration */
export const AI_MODELS = [
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
] as const;
