import request from 'supertest';
import app from '../server';

describe('Assessment Platform API (Multiple Choice)', () => {
  test('GET /api/health should return OK status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Assessment Platform API is running');
  });

  describe('Question Management (Multiple Choice)', () => {
    test('GET /api/challenges should return questions list with example', async () => {
      const response = await request(app).get('/api/challenges');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('challenges');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('example');
      expect(response.body.example).toHaveProperty('question');
      expect(response.body.example).toHaveProperty('options');
      expect(response.body.example).toHaveProperty('correctAnswer');
    });

    test('POST /api/challenges should create a new multiple choice question', async () => {
      const questionData = {
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        difficulty: 'easy',
        category: 'Math'
      };

      const response = await request(app)
        .post('/api/challenges')
        .send(questionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('challenge');
      expect(response.body.challenge.question).toBe(questionData.question);
      expect(response.body.challenge.options).toEqual(questionData.options);
      expect(response.body.challenge.correctAnswer).toBe(questionData.correctAnswer);
    });
  });

  describe('Assessment Creation (Multiple Choice)', () => {
    test('GET /api/assessments should return assessments list with example', async () => {
      const response = await request(app).get('/api/assessments');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assessments');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('example');
      expect(response.body.example).toHaveProperty('selectedChallenges');
    });

    test('POST /api/assessments should create a new multiple choice assessment', async () => {
      const assessmentData = {
        title: 'JavaScript Quiz',
        description: 'Test your JavaScript knowledge',
        selectedChallenges: ['1', '2'],
        timeLimit: 30,
        passingScore: 70
      };

      const response = await request(app)
        .post('/api/assessments')
        .send(assessmentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('assessment');
      expect(response.body.assessment.title).toBe(assessmentData.title);
      expect(response.body.assessment.selectedChallenges).toEqual(assessmentData.selectedChallenges);
    });
  });

  describe('Candidate Interface (Multiple Choice)', () => {
    test('GET /api/assessments/:id/take should return assessment without correct answers', async () => {
      const assessmentData = {
        title: 'JavaScript Quiz',
        description: 'Test your JavaScript knowledge',
        selectedChallenges: [],
        timeLimit: 30,
        passingScore: 70
      };

      const createResponse = await request(app)
        .post('/api/assessments')
        .send(assessmentData);

      const assessmentId = createResponse.body.assessment.id;

      const response = await request(app).get(`/api/assessments/${assessmentId}/take`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('assessment');
      expect(response.body).toHaveProperty('message');
    });

    test('POST /api/assessments/:id/submit should calculate score automatically', async () => {
      const assessmentData = {
        title: 'Math Quiz',
        description: 'Basic math questions',
        selectedChallenges: [],
        timeLimit: 15,
        passingScore: 80
      };

      const createResponse = await request(app)
        .post('/api/assessments')
        .send(assessmentData);

      const assessmentId = createResponse.body.assessment.id;

      const submissionData = {
        answers: { '1': 2, '2': 0 }
      };

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/submit`)
        .send(submissionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('submission');
      expect(response.body.submission).toHaveProperty('score');
      expect(response.body.submission).toHaveProperty('correctCount');
      expect(response.body.submission).toHaveProperty('totalQuestions');
      expect(response.body.submission).toHaveProperty('passed');
    });
  });
});
