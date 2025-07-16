import fs from 'fs';
import path from 'path';
import { Question, Assessment, Submission } from './types';

interface Database {
  questions: Question[];
  assessments: Assessment[];
  submissions: Submission[];
}

class JSONDatabase {
  private dbPath: string;
  private data: Database;

  constructor(dbPath: string = './data') {
    this.dbPath = dbPath;
    this.ensureDataDirectory();
    this.data = this.loadData();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }
  }

  private getFilePath(collection: string): string {
    return path.join(this.dbPath, `${collection}.json`);
  }

  private loadData(): Database {
    const defaultData: Database = {
      questions: [],
      assessments: [],
      submissions: []
    };

    try {
      const questionsPath = this.getFilePath('questions');
      const assessmentsPath = this.getFilePath('assessments');
      const submissionsPath = this.getFilePath('submissions');

      const questions = fs.existsSync(questionsPath) 
        ? JSON.parse(fs.readFileSync(questionsPath, 'utf8'))
        : [];

      const assessments = fs.existsSync(assessmentsPath)
        ? JSON.parse(fs.readFileSync(assessmentsPath, 'utf8'))
        : [];

      const submissions = fs.existsSync(submissionsPath)
        ? JSON.parse(fs.readFileSync(submissionsPath, 'utf8'))
        : [];

      return {
        questions,
        assessments,
        submissions
      };
    } catch (error) {
      console.warn('Error loading database, using default data:', error);
      return defaultData;
    }
  }

  private saveCollection(collection: keyof Database): void {
    try {
      const filePath = this.getFilePath(collection);
      fs.writeFileSync(filePath, JSON.stringify(this.data[collection], null, 2));
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);
      throw new Error(`Failed to save ${collection}`);
    }
  }

  // Question operations
  getQuestions(): Question[] {
    return [...this.data.questions];
  }

  getQuestion(id: string): Question | undefined {
    return this.data.questions.find(q => q.id === id);
  }

  createQuestion(question: Omit<Question, 'id' | 'createdAt'>): Question {
    const newQuestion: Question = {
      ...question,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    this.data.questions.push(newQuestion);
    this.saveCollection('questions');
    return newQuestion;
  }

  updateQuestion(id: string, updates: Partial<Omit<Question, 'id' | 'createdAt'>>): Question | null {
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return null;

    this.data.questions[index] = {
      ...this.data.questions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveCollection('questions');
    return this.data.questions[index];
  }

  deleteQuestion(id: string): boolean {
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return false;

    this.data.questions.splice(index, 1);
    this.saveCollection('questions');
    return true;
  }

  // Assessment operations
  getAssessments(): Assessment[] {
    return [...this.data.assessments];
  }

  getAssessment(id: string): Assessment | undefined {
    return this.data.assessments.find(a => a.id === id);
  }

  createAssessment(assessment: Omit<Assessment, 'id' | 'createdAt'>): Assessment {
    const newAssessment: Assessment = {
      ...assessment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    this.data.assessments.push(newAssessment);
    this.saveCollection('assessments');
    return newAssessment;
  }

  updateAssessment(id: string, updates: Partial<Omit<Assessment, 'id' | 'createdAt'>>): Assessment | null {
    const index = this.data.assessments.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.data.assessments[index] = {
      ...this.data.assessments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveCollection('assessments');
    return this.data.assessments[index];
  }

  deleteAssessment(id: string): boolean {
    const index = this.data.assessments.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.data.assessments.splice(index, 1);
    this.saveCollection('assessments');
    return true;
  }

  // Submission operations
  getSubmissions(): Submission[] {
    return [...this.data.submissions];
  }

  getSubmission(id: string): Submission | undefined {
    return this.data.submissions.find(s => s.id === id);
  }

  getSubmissionsByAssessment(assessmentId: string): Submission[] {
    return this.data.submissions.filter(s => s.assessmentId === assessmentId);
  }

  createSubmission(submission: Omit<Submission, 'id' | 'submittedAt'>): Submission {
    const newSubmission: Submission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };

    this.data.submissions.push(newSubmission);
    this.saveCollection('submissions');
    return newSubmission;
  }

  // Utility methods
  getStats() {
    const submissions = this.data.submissions;
    const totalSubmissions = submissions.length;
    const averageScore = totalSubmissions > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions)
      : 0;
    const passedSubmissions = submissions.filter(s => s.passed).length;
    const passRate = totalSubmissions > 0 
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

    return {
      totalQuestions: this.data.questions.length,
      totalAssessments: this.data.assessments.length,
      totalSubmissions,
      averageScore,
      passRate
    };
  }

  // Backup and restore methods
  backup(): Database {
    return JSON.parse(JSON.stringify(this.data));
  }

  restore(data: Database): void {
    this.data = data;
    this.saveCollection('questions');
    this.saveCollection('assessments');
    this.saveCollection('submissions');
  }

  // Clear all data (for testing)
  clear(): void {
    this.data = {
      questions: [],
      assessments: [],
      submissions: []
    };
    this.saveCollection('questions');
    this.saveCollection('assessments');
    this.saveCollection('submissions');
  }
}

// Export singleton instance
export const db = new JSONDatabase();
export default db; 