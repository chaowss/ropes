import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getAssessmentForCandidate, submitAssessment } from '../services/api'

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
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

function CandidateInterface(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [passwordRequired, setPasswordRequired] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [emailRequired, setEmailRequired] = useState<boolean>(false)
  const [candidateEmail, setCandidateEmail] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [assessmentStarted, setAssessmentStarted] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      loadAssessment()
    } else {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (assessmentStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      handleSubmit()
    }
  }, [timeRemaining, assessmentStarted])

  const loadAssessment = async (attemptPassword?: string) => {
    if (!id) return
    
    try {
      setPasswordError('')
      const data = await getAssessmentForCandidate(id, attemptPassword)
      setAssessment(data.assessment)
      setPasswordRequired(false)
      setEmailRequired(true) // Show email collection after successful authentication
    } catch (error: any) {
      console.error('Error loading assessment:', error)
      if (error.requiresPassword) {
        setPasswordRequired(true)
        setPasswordError(attemptPassword ? 'Incorrect password. Please try again.' : '')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) {
      setLoading(true)
      loadAssessment(password.trim())
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    
    if (!candidateEmail.trim()) {
      setEmailError('Email address is required')
      return
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(candidateEmail.trim())) {
      setEmailError('Please enter a valid email address')
      return
    }
    
    setEmailRequired(false)
    setAssessmentStarted(true)
    setTimeRemaining(assessment?.timeLimit ? assessment.timeLimit * 60 : null) // Start timer when assessment actually begins
  }

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    })
  }

  const handleSubmit = async () => {
    try {
      if (!id || !candidateEmail.trim()) return
      await submitAssessment(id, candidateEmail.trim(), answers)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting assessment:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="loading">Loading assessment...</div>
  }

  if (!id) {
    return (
      <div>
        <h1>Take Assessment</h1>
        <div className="card">
          <h3>Assessment Access</h3>
          <p>To take an assessment, you need a direct link from your interviewer.</p>
          <p>Assessment links look like: <code>/take-assessment/[assessment-id]</code></p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div>
        <h1>Assessment Submitted</h1>
        <div className="card">
          <h3>Thank you!</h3>
          <p>Your assessment has been submitted successfully.</p>
          <p>The hiring team will review your responses and get back to you soon.</p>
        </div>
      </div>
    )
  }

  if (passwordRequired) {
    return (
      <div>
        <h1>Password Required</h1>
        <div className="card">
          <h3>This assessment is password protected</h3>
          <p>Please enter the password provided by your interviewer to access this assessment.</p>
          
          {passwordError && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              border: '1px solid #f5c6cb'
            }}>
              {passwordError}
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Assessment Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn"
              disabled={!password.trim()}
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            >
              Access Assessment
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (emailRequired) {
    return (
      <div>
        <h1>Enter Your Email</h1>
        <div className="card">
          <h3>Please provide your email address to complete the assessment.</h3>
          
          {emailError && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              border: '1px solid #f5c6cb'
            }}>
              {emailError}
            </div>
          )}
          
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label>Email Address:</label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn"
              disabled={!candidateEmail.trim()}
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
            >
              Continue to Assessment
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div>
        <h1>Assessment Not Found</h1>
        <div className="card">
          <p>The assessment you're looking for doesn't exist or may have expired.</p>
          <p>Please check your assessment link or contact the hiring team.</p>
        </div>
      </div>
    )
  }

  if (!assessmentStarted) {
    return (
      <div>
        <h1>Assessment Not Started</h1>
        <div className="card">
          <p>The assessment has not yet started. Please wait for the interviewer to begin.</p>
        </div>
      </div>
    )
  }

  const currentQuestion = assessment.challenges?.[currentQuestionIndex]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{assessment.title}</h1>
        {timeRemaining !== null && (
          <div style={{ 
            background: timeRemaining < 300 ? '#ff6b6b' : '#007bff', 
            color: 'white', 
            padding: '10px 15px', 
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Time Remaining: {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Question {currentQuestionIndex + 1} of {assessment.challenges?.length || 0}</h3>
          <div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentQuestionIndex(Math.min((assessment.challenges?.length || 1) - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex >= (assessment.challenges?.length || 1) - 1}
            >
              Next
            </button>
          </div>
        </div>

        {currentQuestion ? (
          <div>
            <h4>{currentQuestion.question}</h4>
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Select your answer:</div>
              {currentQuestion.options && currentQuestion.options.map((option, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: answers[currentQuestion.id] === index ? '#e3f2fd' : 'white' }}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === index}
                      onChange={() => handleAnswerChange(currentQuestion.id, index)}
                      style={{ marginRight: '10px' }}
                    />
                    <span>{option}</span>
                  </label>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '14px', color: '#666' }}>
              <strong>Category:</strong> {currentQuestion.category} | <strong>Difficulty:</strong> {currentQuestion.difficulty}
            </div>
          </div>
        ) : (
          <p>No questions available in this assessment.</p>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>Progress</h4>
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          {assessment.challenges && assessment.challenges.map((_, index) => (
            <div
              key={index}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: answers[assessment.challenges![index]?.id] !== undefined ? '#28a745' : 
                                index === currentQuestionIndex ? '#007bff' : '#dee2e6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Answered: {Object.keys(answers).length} / {assessment.challenges?.length || 0}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          className="btn" 
          onClick={handleSubmit}
          style={{ fontSize: '16px', padding: '12px 30px' }}
        >
          Submit Assessment
        </button>
      </div>
    </div>
  )
}

export default CandidateInterface
