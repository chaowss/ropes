import React, { useState, useEffect } from 'react'
import { getAssessments, createAssessment, getChallenges } from '../services/api'

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
}

interface FormData {
  title: string;
  description: string;
  selectedChallenges: string[];
  timeLimit: number;
  passingScore: number;
  password: string;
}

function AssessmentCreation(): JSX.Element {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [copiedAssessmentId, setCopiedAssessmentId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    selectedChallenges: [],
    timeLimit: 120,
    passingScore: 70,
    password: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [assessmentData, questionData] = await Promise.all([
        getAssessments(),
        getChallenges()
      ])
      setAssessments(assessmentData.assessments || [])
      setQuestions(questionData.challenges || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        password: formData.password || undefined // Convert empty string to undefined
      }
      await createAssessment(submitData)
      setFormData({
        title: '',
        description: '',
        selectedChallenges: [],
        timeLimit: 120,
        passingScore: 70,
        password: ''
      })
      setShowCreateForm(false)
      loadData()
    } catch (error) {
      console.error('Error creating assessment:', error)
    }
  }

  const shareAssessment = async (assessmentId: string, assessmentTitle: string) => {
    try {
      // Generate the assessment URL
      const assessmentUrl = `${window.location.origin}/take-assessment/${assessmentId}`
      
      // Copy to clipboard
      await navigator.clipboard.writeText(assessmentUrl)
      
      // Show success feedback
      setCopiedAssessmentId(assessmentId)
      
      // Reset feedback after 3 seconds
      setTimeout(() => {
        setCopiedAssessmentId(null)
      }, 3000)
      
      console.log(`Assessment link copied: ${assessmentUrl}`)
    } catch (error) {
      console.error('Failed to copy assessment link:', error)
      
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = `${window.location.origin}/take-assessment/${assessmentId}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      // Show success feedback
      setCopiedAssessmentId(assessmentId)
      setTimeout(() => {
        setCopiedAssessmentId(null)
      }, 3000)
    }
  }

  const handleQuestionToggle = (questionId: string) => {
    const isSelected = formData.selectedChallenges.includes(questionId)
    if (isSelected) {
      setFormData({
        ...formData,
        selectedChallenges: formData.selectedChallenges.filter(id => id !== questionId)
      })
    } else {
      setFormData({
        ...formData,
        selectedChallenges: [...formData.selectedChallenges, questionId]
      })
    }
  }

  if (loading) {
    return <div className="loading">Loading assessments...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Assessment Creation</h1>
        <button 
          className="btn" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Assessment'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h3>Create New Assessment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Assessment Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Select Questions:</label>
              {questions.length === 0 ? (
                <p>No questions available. Create questions first in Question Management.</p>
              ) : (
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                  {questions.map((question) => (
                    <div key={question.id} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                      <label style={{ alignItems: 'flex-start', fontWeight: 'normal', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.selectedChallenges.includes(question.id)}
                          onChange={() => handleQuestionToggle(question.id)}
                          style={{ marginRight: '8px', marginTop: '2px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {question.question}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            {question.difficulty} | {question.category}
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            Options: {question.options && question.options.join(', ')}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Total Time Limit (minutes):</label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Passing Score (%):</label>
              <input
                type="number"
                value={formData.passingScore}
                onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                min="0"
                max="100"
                required
              />
            </div>
            <div className="form-group">
              <label>Password (optional):</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Leave empty for no password protection"
              />
              <small style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                If set, candidates will need this password to access the assessment
              </small>
            </div>
            <button type="submit" className="btn" disabled={formData.selectedChallenges.length === 0}>
              Create Assessment
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Existing Assessments</h3>
        {assessments.length === 0 ? (
          <p>No assessments created yet. Create your first assessment above!</p>
        ) : (
          <div>
            {assessments.map((assessment) => (
              <div key={assessment.id} style={{ 
                border: '1px solid #e0e0e0', 
                padding: '20px', 
                marginBottom: '15px', 
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#2c3e50', marginBottom: '8px' }}>{assessment.title}</h4>
                    <p style={{ color: '#666', marginBottom: '12px' }}>{assessment.description}</p>
                    
                    <div style={{ display: 'flex', gap: '20px', fontSize: '14px', marginBottom: '12px' }}>
                      <span style={{ 
                        backgroundColor: '#e3f2fd', 
                        color: '#1565c0', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        📝 {assessment.selectedChallenges?.length || 0} Questions
                      </span>
                      <span style={{ 
                        backgroundColor: '#fff3e0', 
                        color: '#ef6c00', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        ⏱️ {assessment.timeLimit} min
                      </span>
                      <span style={{ 
                        backgroundColor: '#e8f5e8', 
                        color: '#2e7d32', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        🎯 {assessment.passingScore}% to pass
                      </span>
                      {assessment.password ? (
                        <span style={{ 
                          backgroundColor: '#fff8e1', 
                          color: '#f57c00', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          border: '1px solid #ffcc02'
                        }}>
                          🔒 Password: <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '2px' }}>{assessment.password}</code>
                        </span>
                      ) : (
                        <span style={{ 
                          backgroundColor: '#f8f9fa', 
                          color: '#6c757d', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          border: '1px solid #dee2e6'
                        }}>
                          🔓 No password required
                        </span>
                      )}
                    </div>

                    {copiedAssessmentId === assessment.id && (
                      <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginBottom: '12px',
                        border: '1px solid #c3e6cb'
                      }}>
                        🔗 Assessment link copied to clipboard! Share this URL with candidates:
                        <br />
                        <code style={{ 
                          fontSize: '12px', 
                          backgroundColor: '#fff', 
                          padding: '2px 4px', 
                          borderRadius: '2px',
                          marginTop: '4px',
                          display: 'inline-block'
                        }}>
                          {window.location.origin}/take-assessment/{assessment.id}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => shareAssessment(assessment.id, assessment.title)}
                    style={{
                      backgroundColor: copiedAssessmentId === assessment.id ? '#28a745' : '#007bff',
                      borderColor: copiedAssessmentId === assessment.id ? '#28a745' : '#007bff',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      fontSize: '14px',
                      padding: '8px 16px'
                    }}
                  >
                    {copiedAssessmentId === assessment.id ? (
                      <>
                        ✅ Link Copied!
                      </>
                    ) : (
                      <>
                        📋 Share Assessment Link
                      </>
                    )}
                  </button>
                  
                  <small style={{ color: '#666' }}>
                    Created: {new Date(assessment.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentCreation
