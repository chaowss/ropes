import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Question, Assessment, Submission, QuestionCreateRequest, AssessmentCreateRequest, SubmissionRequest } from './types';
import db from './database';

const app = express();
const PORT = parseInt(process.env.PORT || '8000');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Assessment Platform API is running' });
});

app.get('/api/challenges', (req: Request, res: Response) => {
  try {
    const questions = db.getQuestions();
    res.json({ 
      challenges: questions, 
      message: 'Questions retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving questions:', error);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});

app.post('/api/challenges', (req: Request<{}, {}, QuestionCreateRequest>, res: Response) => {
  try {
    const questionData = {
      question: req.body.question || '',
      options: req.body.options || [],
      correctAnswer: req.body.correctAnswer || 0,
      difficulty: req.body.difficulty || 'medium',
      category: req.body.category || 'General'
    };
    
    const question = db.createQuestion(questionData);
    res.status(201).json({ 
      challenge: question, 
      message: 'Question created successfully' 
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.get('/api/challenges/:id', (req: Request, res: Response) => {
  try {
    const question = db.getQuestion(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ challenge: question, message: 'Question retrieved successfully' });
  } catch (error) {
    console.error('Error retrieving question:', error);
    res.status(500).json({ error: 'Failed to retrieve question' });
  }
});

app.put('/api/challenges/:id', (req: Request, res: Response) => {
  try {
    const updates = {
      question: req.body.question,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
      difficulty: req.body.difficulty,
      category: req.body.category
    };
    
    const question = db.updateQuestion(req.params.id, updates);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ 
      challenge: question, 
      message: 'Question updated successfully' 
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

app.delete('/api/challenges/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteQuestion(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

app.get('/api/assessments', (req: Request, res: Response) => {
  try {
    const assessments = db.getAssessments();
    // Include passwords for administrative access
    res.json({ 
      assessments, 
      message: 'Assessments retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
});

app.post('/api/assessments', (req: Request<{}, {}, AssessmentCreateRequest>, res: Response) => {
  try {
    const assessmentData = {
      title: req.body.title || '',
      description: req.body.description || '',
      selectedChallenges: req.body.selectedChallenges || [],
      timeLimit: req.body.timeLimit || 30,
      passingScore: req.body.passingScore || 70,
      password: req.body.password || undefined
    };
    
    const assessment = db.createAssessment(assessmentData);
    
    // Remove password from response for security
    const responseAssessment = { ...assessment };
    delete responseAssessment.password;
    
    res.status(201).json({ 
      assessment: responseAssessment, 
      message: 'Assessment created successfully' 
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.get('/api/assessments/:id', (req: Request, res: Response) => {
  try {
    const assessment = db.getAssessment(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const assessmentQuestions = db.getQuestions().filter(q => 
      assessment.selectedChallenges && assessment.selectedChallenges.includes(q.id)
    );
    
    res.json({ 
      assessment: {
        ...assessment,
        challenges: assessmentQuestions
      }, 
      message: 'Assessment retrieved successfully' 
    });
  } catch (error) {
    console.error('Error retrieving assessment:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment' });
  }
});

app.get('/api/assessments/:id/take', (req: Request, res: Response) => {
  try {
    const assessment = db.getAssessment(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    // If assessment has a password, require password verification
    const providedPassword = req.headers['x-assessment-password'] as string;
    if (assessment.password && assessment.password !== providedPassword) {
      return res.status(401).json({ 
        error: 'Password required',
        requiresPassword: true
      });
    }
    
    const assessmentQuestions = db.getQuestions().filter(q => 
      assessment.selectedChallenges && assessment.selectedChallenges.includes(q.id)
    ).map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      category: q.category
    }));
    
    res.json({ 
      assessment: {
        ...assessment,
        // Don't send password to frontend
        password: undefined,
        challenges: assessmentQuestions
      },
      message: 'Assessment ready for candidate' 
    });
  } catch (error) {
    console.error('Error preparing assessment for candidate:', error);
    res.status(500).json({ error: 'Failed to prepare assessment' });
  }
});

app.post('/api/assessments/:id/submit', (req: Request<{ id: string }, {}, SubmissionRequest>, res: Response) => {
  try {
    const assessment = db.getAssessment(req.params.id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const answers = req.body.answers || {};
    const candidateEmail = req.body.candidateEmail || '';
    
    if (!candidateEmail.trim()) {
      return res.status(400).json({ error: 'Candidate email is required' });
    }
    
    let correctCount = 0;
    const totalQuestions = assessment.selectedChallenges ? assessment.selectedChallenges.length : 0;
    
    if (assessment.selectedChallenges) {
      assessment.selectedChallenges.forEach(questionId => {
        const question = db.getQuestion(questionId);
        if (question && answers[questionId] === question.correctAnswer) {
          correctCount++;
        }
      });
    }
    
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= (assessment.passingScore || 70);
    
    const submissionData = {
      assessmentId: req.params.id,
      candidateEmail: candidateEmail.trim(),
      answers: answers,
      score: score,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      passed: passed
    };
    
    const submission = db.createSubmission(submissionData);
    res.status(201).json({ 
      submission, 
      message: 'Assessment submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

app.get('/api/submissions', (req: Request, res: Response) => {
  try {
    const submissions = db.getSubmissions();
    const enrichedSubmissions = submissions.map(submission => {
      const assessment = db.getAssessment(submission.assessmentId);
      return {
        ...submission,
        assessmentTitle: assessment?.title || 'Unknown Assessment',
        assessmentDescription: assessment?.description || ''
      };
    });
    
    res.json({ 
      submissions: enrichedSubmissions, 
      message: 'Submissions retrieved successfully' 
    });
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    res.status(500).json({ error: 'Failed to retrieve submissions' });
  }
});

app.get('/api/submissions/:id', (req: Request, res: Response) => {
  try {
    const submission = db.getSubmission(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const assessment = db.getAssessment(submission.assessmentId);
    const detailedAnswers: any = {};
    
    if (assessment && assessment.selectedChallenges) {
      assessment.selectedChallenges.forEach(questionId => {
        const question = db.getQuestion(questionId);
        if (question) {
          detailedAnswers[questionId] = {
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            candidateAnswer: submission.answers[questionId],
            isCorrect: submission.answers[questionId] === question.correctAnswer
          };
        }
      });
    }
    
    res.json({ 
      submission: {
        ...submission,
        assessmentTitle: assessment?.title || 'Unknown Assessment',
        detailedAnswers: detailedAnswers
      }, 
      message: 'Submission details retrieved successfully' 
    });
  } catch (error) {
    console.error('Error retrieving submission details:', error);
    res.status(500).json({ error: 'Failed to retrieve submission details' });
  }
});

app.get('/api/assessments/:id/results', (req: Request, res: Response) => {
  try {
    const assessmentSubmissions = db.getSubmissionsByAssessment(req.params.id);
    const assessment = db.getAssessment(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const stats = {
      totalSubmissions: assessmentSubmissions.length,
      averageScore: assessmentSubmissions.length > 0 
        ? Math.round(assessmentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / assessmentSubmissions.length)
        : 0,
      passRate: assessmentSubmissions.length > 0
        ? Math.round((assessmentSubmissions.filter(s => s.passed).length / assessmentSubmissions.length) * 100)
        : 0,
      submissions: assessmentSubmissions
    };
    
    res.json({ 
      assessment,
      results: stats,
      message: 'Assessment results retrieved successfully' 
    });
  } catch (error) {
    console.error('Error retrieving assessment results:', error);
    res.status(500).json({ error: 'Failed to retrieve assessment results' });
  }
});

// New endpoint for dashboard stats
app.get('/api/stats', (req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ 
      stats,
      message: 'Dashboard stats retrieved successfully' 
    });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Assessment Platform API server running on http://0.0.0.0:${PORT}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`Database initialized: ${db.getStats().totalQuestions} questions, ${db.getStats().totalAssessments} assessments, ${db.getStats().totalSubmissions} submissions`);
});

export default app;
