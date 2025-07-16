export interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface Assessment {
    id: string;
    title: string;
    description: string;
    selectedChallenges: string[];
    timeLimit: number;
    passingScore: number;
    password?: string;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface Submission {
    id: string;
    assessmentId: string;
    candidateEmail: string;
    answers: Record<string, number>;
    score: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
    submittedAt: string;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
  }
  
  export interface QuestionCreateRequest {
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
  }
  
  export interface AssessmentCreateRequest {
    title: string;
    description: string;
    selectedChallenges: string[];
    timeLimit: number;
    passingScore: number;
    password?: string;
  }
  
  export interface SubmissionRequest {
    candidateEmail: string;
    answers: Record<string, number>;
  }
  