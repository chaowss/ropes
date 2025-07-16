interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    difficulty: "easy" | "medium" | "hard";
    category: string;
    createdAt: string;
    updatedAt?: string;
  }
  
  interface Assessment {
    id: string;
    title: string;
    description: string;
    selectedChallenges: string[];
    timeLimit: number;
    passingScore: number;
    password?: string;
    createdAt: string;
    challenges?: Question[];
  }
  
  interface Submission {
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
  
  interface ApiRequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  }
  
  interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
  }
  
  const API_BASE_URL = "http://localhost:8000/api";
  
  async function apiRequest(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`, options.body); // Debug log
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };
  
    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }
  
    try {
      const response = await fetch(url, config);
      console.log(`API Response: ${response.status} ${response.statusText}`); // Debug log

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          console.error(`API Error Response:`, errorText); // Debug log
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        console.error(`API Error Response:`, errorData); // Debug log
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        (error as any).requiresPassword = errorData.requiresPassword;
        throw error;
      }

      const result = await response.json();
      console.log(`API Result:`, result); // Debug log
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
  
  export async function getChallenges(): Promise<{
    challenges: Question[];
    message?: string;
    example?: Question;
  }> {
    return apiRequest("/challenges");
  }
  
  export async function createChallenge(
    questionData: Partial<Question>
  ): Promise<{ challenge: Question; message?: string }> {
    return apiRequest("/challenges", {
      method: "POST",
      body: questionData,
    });
  }
  
  export async function updateChallenge(
    id: string,
    questionData: Partial<Question>
  ): Promise<{ challenge: Question; message?: string }> {
    return apiRequest(`/challenges/${id}`, {
      method: "PUT",
      body: questionData,
    });
  }
  
  export async function deleteChallenge(
    id: string
  ): Promise<{ message: string }> {
    return apiRequest(`/challenges/${id}`, {
      method: "DELETE",
    });
  }
  
  export async function getChallenge(
    id: string
  ): Promise<{ challenge: Question; message?: string }> {
    return apiRequest(`/challenges/${id}`);
  }
  
  export async function getAssessments(): Promise<{
    assessments: Assessment[];
    message?: string;
    example?: Assessment;
  }> {
    return apiRequest("/assessments");
  }
  
  export async function createAssessment(
    assessmentData: Partial<Assessment>
  ): Promise<{ assessment: Assessment; message?: string }> {
    return apiRequest("/assessments", {
      method: "POST",
      body: assessmentData,
    });
  }
  
  export async function getAssessment(
    id: string
  ): Promise<{ assessment: Assessment; message?: string }> {
    return apiRequest(`/assessments/${id}`);
  }
  
  export async function getAssessmentForCandidate(
    id: string,
    password?: string
  ): Promise<{ assessment: Assessment; message?: string }> {
    const headers: Record<string, string> = {};
    if (password) {
      headers['x-assessment-password'] = password;
    }
    
    return apiRequest(`/assessments/${id}/take`, {
      headers
    });
  }
  
  export async function submitAssessment(
    assessmentId: string,
    candidateEmail: string,
    answers: Record<string, number>
  ): Promise<{ submission: any; message?: string }> {
    return apiRequest(`/assessments/${assessmentId}/submit`, {
      method: "POST",
      body: {
        candidateEmail,
        answers
      },
    });
  }
  
  export async function getSubmissions(): Promise<{
    submissions: Submission[];
    message?: string;
  }> {
    return apiRequest("/submissions");
  }
  
  export async function getSubmission(
    id: string
  ): Promise<{ submission: Submission; message?: string }> {
    return apiRequest(`/submissions/${id}`);
  }
  
  export async function getAssessmentResults(
    assessmentId: string
  ): Promise<{ assessment: Assessment; results: any; message?: string }> {
    return apiRequest(`/assessments/${assessmentId}/results`);
  }
  
  export async function healthCheck(): Promise<{
    status: string;
    message: string;
  }> {
    return apiRequest("/health");
  }
  