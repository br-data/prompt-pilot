export interface WelcomeProps {
    constant?: string;
}

export interface GenerationFeedbackProps {
    successCount: number;
    failureCount: number;
    totalGenerations: number;
    currentGenerations: number;
}

export type AverageEffortByVersion = Record<number, VersionStats>;

interface VersionStats {
  averageEffort: number;
  title: string | null;
}