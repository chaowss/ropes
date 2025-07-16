import React, { useState, useEffect } from 'react'
import { getSubmissions, getSubmission } from '../services/api'

interface DetailedAnswer {
  question: string;
  options: string[];
  correctAnswer: number;
  candidateAnswer: number;
  isCorrect: boolean;
}

interface Submission {
  id: string;
  assessmentId: string;
  answers: Record<string, number>;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  submittedAt: string;
  assessmentTitle?: string;
  assessmentDescription?: string;
  detailedAnswers?: Record<string, DetailedAnswer>;
}

function ResultsReview(): JSX.Element {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      const data = await getSubmissions()
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissionDetails = async (submissionId: string) => {
    setDetailsLoading(true)
    try {
      const data = await getSubmission(submissionId)
      setSelectedSubmission(data.submission)
    } catch (error) {
      console.error('Error loading submission details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#28a745'
    if (score >= 60) return '#ffc107'
    return '#dc3545'
  }

  const getPassStatusColor = (passed: boolean) => {
    return passed ? '#28a745' : '#dc3545'
  }

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true
    if (filter === 'passed') return submission.passed
    if (filter === 'failed') return !submission.passed
    return true
  })

  if (loading) {
    return <div className="loading">Loading submissions...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📊 Results & Analytics</h1>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '8px 16px', 
          borderRadius: '8px',
          color: '#1565c0',
          fontSize: '14px'
        }}>
          📈 {submissions.length} Total Submissions
        </div>
      </div>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Assessment Submissions</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', color: '#666' }}>Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ 
                padding: '6px 12px',
                border: '2px solid #e9ecef',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Submissions</option>
              <option value="passed">✅ Passed Only</option>
              <option value="failed">❌ Failed Only</option>
            </select>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#666'
          }}>
            <h4>📝 No Submissions Found</h4>
            <p>No candidates have completed assessments yet, or no submissions match your filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedSubmission ? '1fr 2fr' : '1fr', gap: '25px' }}>
            {/* Submissions List */}
            <div>
              <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>📋 Submissions ({filteredSubmissions.length})</h4>
              {filteredSubmissions.map((submission, index) => (
                <div 
                  key={submission.id} 
                  className="fade-in"
                  style={{ 
                    border: '2px solid #e0e0e0', 
                    padding: '18px', 
                    marginBottom: '12px', 
                    borderRadius: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedSubmission?.id === submission.id ? '#f0f8ff' : 'white',
                    borderColor: selectedSubmission?.id === submission.id ? '#007bff' : '#e0e0e0',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onClick={() => loadSubmissionDetails(submission.id)}
                  onMouseEnter={(e) => {
                    if (selectedSubmission?.id !== submission.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSubmission?.id !== submission.id) {
                      e.currentTarget.style.backgroundColor = 'white'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '18px' }}>
                    #{index + 1}
                  </div>
                  
                  <div>
                    <h5 style={{ color: '#2c3e50', marginBottom: '8px', fontSize: '16px' }}>
                      🎯 {submission.assessmentTitle || 'Unknown Assessment'}
                    </h5>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        backgroundColor: getPassStatusColor(submission.passed),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '10px'
                      }}>
                        {submission.passed ? '✅ PASSED' : '❌ FAILED'}
                      </div>
                      
                      <span style={{ 
                        backgroundColor: '#f8f9fa',
                        color: getScoreColor(submission.score),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: 'bold'
                      }}>
                        📊 {submission.score}% ({submission.correctCount}/{submission.totalQuestions})
                      </span>
                    </div>
                    
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      ⏰ {new Date(submission.submittedAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Results */}
            {selectedSubmission && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: '#2c3e50' }}>📋 Detailed Results</h4>
                  <button 
                    onClick={() => setSelectedSubmission(null)}
                    style={{
                      background: 'none',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ← Back to List
                  </button>
                </div>
                
                {detailsLoading ? (
                  <div className="loading">Loading detailed results...</div>
                ) : (
                  <div className="question-item">
                    {/* Header Summary */}
                    <div style={{ 
                      padding: '20px',
                      backgroundColor: selectedSubmission.passed ? '#d4edda' : '#f8d7da',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: `2px solid ${selectedSubmission.passed ? '#28a745' : '#dc3545'}`
                    }}>
                      <h5 style={{ 
                        color: selectedSubmission.passed ? '#155724' : '#721c24',
                        marginBottom: '10px',
                        fontSize: '18px'
                      }}>
                        🎯 {selectedSubmission.assessmentTitle}
                      </h5>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', fontSize: '14px' }}>
                        <div>
                          <strong>Final Score:</strong><br />
                          <span style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold',
                            color: getScoreColor(selectedSubmission.score)
                          }}>
                            {selectedSubmission.score}%
                          </span>
                        </div>
                        <div>
                          <strong>Questions:</strong><br />
                          <span style={{ fontSize: '16px' }}>
                            {selectedSubmission.correctCount} / {selectedSubmission.totalQuestions} correct
                          </span>
                        </div>
                        <div>
                          <strong>Status:</strong><br />
                          <span style={{ 
                            fontSize: '16px',
                            color: selectedSubmission.passed ? '#28a745' : '#dc3545',
                            fontWeight: 'bold'
                          }}>
                            {selectedSubmission.passed ? '✅ PASSED' : '❌ FAILED'}
                          </span>
                        </div>
                        <div>
                          <strong>Submitted:</strong><br />
                          <span style={{ fontSize: '13px' }}>
                            {new Date(selectedSubmission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Question-by-Question Results */}
                    <h6 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '16px' }}>
                      📝 Question-by-Question Analysis
                    </h6>
                    
                    {selectedSubmission.detailedAnswers ? (
                      <div>
                        {Object.entries(selectedSubmission.detailedAnswers).map(([questionId, details], index) => (
                          <div 
                            key={questionId} 
                            style={{ 
                              border: `2px solid ${details.isCorrect ? '#28a745' : '#dc3545'}`,
                              borderRadius: '12px',
                              padding: '20px',
                              marginBottom: '20px',
                              backgroundColor: details.isCorrect ? '#f8fff8' : '#fff8f8'
                            }}
                          >
                            {/* Question Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                              <div style={{ flex: 1 }}>
                                <h6 style={{ 
                                  color: '#2c3e50',
                                  marginBottom: '8px',
                                  fontSize: '15px'
                                }}>
                                  Question {index + 1}
                                </h6>
                                <p style={{ 
                                  fontSize: '16px', 
                                  fontWeight: '500',
                                  color: '#333',
                                  marginBottom: '0',
                                  lineHeight: '1.5'
                                }}>
                                  {details.question}
                                </p>
                              </div>
                              
                              <div style={{
                                backgroundColor: details.isCorrect ? '#28a745' : '#dc3545',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginLeft: '15px',
                                minWidth: '80px',
                                textAlign: 'center'
                              }}>
                                {details.isCorrect ? '✅ CORRECT' : '❌ WRONG'}
                              </div>
                            </div>

                            {/* Answer Options */}
                            <div style={{ marginTop: '15px' }}>
                              {details.options.map((option, optionIndex) => {
                                const isCorrectAnswer = optionIndex === details.correctAnswer
                                const isCandidateAnswer = optionIndex === details.candidateAnswer
                                
                                let backgroundColor = '#fff'
                                let borderColor = '#ddd'
                                let textColor = '#333'
                                
                                if (isCorrectAnswer && isCandidateAnswer) {
                                  // Correct answer selected
                                  backgroundColor = '#d4edda'
                                  borderColor = '#28a745'
                                  textColor = '#155724'
                                } else if (isCorrectAnswer) {
                                  // Correct answer (not selected)
                                  backgroundColor = '#e8f5e9'
                                  borderColor = '#4caf50'
                                  textColor = '#2e7d32'
                                } else if (isCandidateAnswer) {
                                  // Wrong answer selected
                                  backgroundColor = '#f8d7da'
                                  borderColor = '#dc3545'
                                  textColor = '#721c24'
                                }

                                return (
                                  <div
                                    key={optionIndex}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: '12px 16px',
                                      margin: '8px 0',
                                      borderRadius: '8px',
                                      backgroundColor,
                                      border: `2px solid ${borderColor}`,
                                      color: textColor,
                                      fontWeight: (isCorrectAnswer || isCandidateAnswer) ? 'bold' : 'normal'
                                    }}
                                  >
                                    <div style={{
                                      minWidth: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      backgroundColor: isCorrectAnswer ? '#28a745' : (isCandidateAnswer ? '#dc3545' : '#e0e0e0'),
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '14px',
                                      fontWeight: 'bold',
                                      marginRight: '12px'
                                    }}>
                                      {String.fromCharCode(65 + optionIndex)}
                                    </div>
                                    
                                    <span style={{ flex: 1 }}>{option}</span>
                                    
                                    <div style={{ marginLeft: '12px', fontSize: '16px' }}>
                                      {isCorrectAnswer && isCandidateAnswer && '✅'}
                                      {isCorrectAnswer && !isCandidateAnswer && '✓'}
                                      {!isCorrectAnswer && isCandidateAnswer && '❌'}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            
                            {/* Answer Summary */}
                            <div style={{ 
                              marginTop: '15px',
                              padding: '12px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}>
                              <strong>Candidate selected:</strong> Option {String.fromCharCode(65 + details.candidateAnswer)} | 
                              <strong> Correct answer:</strong> Option {String.fromCharCode(65 + details.correctAnswer)}
                              {details.isCorrect ? 
                                <span style={{ color: '#28a745', fontWeight: 'bold' }}> ✅ Match!</span> : 
                                <span style={{ color: '#dc3545', fontWeight: 'bold' }}> ❌ No match</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>
                        No detailed answer information available for this submission.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResultsReview
