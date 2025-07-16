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
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [copiedAssessmentId, setCopiedAssessmentId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [questionSearchTerm, setQuestionSearchTerm] = useState<string>('')
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>('')
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState<string>('')
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

  useEffect(() => {
    filterAssessments()
  }, [assessments, searchTerm, statusFilter, sortBy])

  useEffect(() => {
    filterQuestions()
  }, [questions, questionSearchTerm, questionCategoryFilter, questionDifficultyFilter])

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

  const filterAssessments = () => {
    let filtered = [...assessments]

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter === 'protected') {
      filtered = filtered.filter(a => a.password)
    } else if (statusFilter === 'public') {
      filtered = filtered.filter(a => !a.password)
    }

    // Sort assessments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'questions':
          return (b.selectedChallenges?.length || 0) - (a.selectedChallenges?.length || 0)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredAssessments(filtered)
  }

  const filterQuestions = () => {
    let filtered = [...questions]

    if (questionSearchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(questionSearchTerm.toLowerCase())
      )
    }

    if (questionCategoryFilter) {
      filtered = filtered.filter(q => q.category === questionCategoryFilter)
    }

    if (questionDifficultyFilter) {
      filtered = filtered.filter(q => q.difficulty === questionDifficultyFilter)
    }

    setFilteredQuestions(filtered)
  }

  const getUniqueQuestionCategories = () => {
    return [...new Set(questions.map(q => q.category))].sort()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#28a745'
      case 'medium': return '#ffc107'
      case 'hard': return '#dc3545'
      default: return '#6c757d'
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
      // Clear question filters when form is submitted
      setQuestionSearchTerm('')
      setQuestionCategoryFilter('')
      setQuestionDifficultyFilter('')
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
        <h1>Assessments</h1>
        <button 
          className="btn" 
          onClick={() => {
            if (showCreateForm) {
              // Clear form and question filters when canceling
              setFormData({
                title: '',
                description: '',
                selectedChallenges: [],
                timeLimit: 120,
                passingScore: 70,
                password: ''
              })
              setQuestionSearchTerm('')
              setQuestionCategoryFilter('')
              setQuestionDifficultyFilter('')
              setShowCreateForm(false)
            } else {
              setShowCreateForm(true)
            }
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create New Assessment'}
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Search & Filter</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Search Assessments:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
            />
          </div>
          
          <div className="form-group">
            <label>Access:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Assessments</option>
              <option value="public">Public (No Password)</option>
              <option value="protected">Password Protected</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
              <option value="questions">Most Questions</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '10px', color: '#666' }}>
          Showing {filteredAssessments.length} of {assessments.length} assessments
        </div>
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
                <div>
                  {/* Question Search and Filter */}
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{ marginBottom: '15px', fontSize: '16px', color: '#495057' }}>
                      🔍 Search & Filter Questions
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ fontSize: '14px' }}>Search Questions:</label>
                        <input
                          type="text"
                          value={questionSearchTerm}
                          onChange={(e) => setQuestionSearchTerm(e.target.value)}
                          placeholder="Search by question text..."
                          style={{ fontSize: '14px' }}
                        />
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ fontSize: '14px' }}>Category:</label>
                        <select
                          value={questionCategoryFilter}
                          onChange={(e) => setQuestionCategoryFilter(e.target.value)}
                          style={{ fontSize: '14px' }}
                        >
                          <option value="">All Categories</option>
                          {getUniqueQuestionCategories().map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label style={{ fontSize: '14px' }}>Difficulty:</label>
                        <select
                          value={questionDifficultyFilter}
                          onChange={(e) => setQuestionDifficultyFilter(e.target.value)}
                          style={{ fontSize: '14px' }}
                        >
                          <option value="">All Difficulties</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                      Showing {filteredQuestions.length} of {questions.length} questions
                      {formData.selectedChallenges.length > 0 && (
                        <span style={{ marginLeft: '15px', color: '#007bff', fontWeight: 'bold' }}>
                          • {formData.selectedChallenges.length} selected for assessment
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Questions List */}
                  <div style={{ border: '1px solid #ddd', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredQuestions.length === 0 ? (
                      <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#666',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <p>No questions match your search criteria.</p>
                        {(questionSearchTerm || questionCategoryFilter || questionDifficultyFilter) && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuestionSearchTerm('')
                              setQuestionCategoryFilter('')
                              setQuestionDifficultyFilter('')
                            }}
                            style={{
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredQuestions.map((question) => (
                        <div key={question.id} style={{ 
                          marginBottom: '0', 
                          padding: '12px', 
                          border: 'none',
                          borderBottom: '1px solid #eee', 
                          backgroundColor: formData.selectedChallenges.includes(question.id) ? '#e3f2fd' : '#fff',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <label style={{ 
                            alignItems: 'flex-start', 
                            fontWeight: 'normal', 
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0px'
                          }}>
                            <input
                              type="checkbox"
                              checked={formData.selectedChallenges.includes(question.id)}
                              onChange={() => handleQuestionToggle(question.id)}
                              style={{ 
                                marginTop: '2px', 
                                flexShrink: 0,
                                width: '16px',
                                height: '16px',
                                margin: '0 8px 0 0'
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              {/* Question badges */}
                              <div style={{ marginBottom: '6px', display: 'flex', gap: '6px' }}>
                                <span style={{ 
                                  backgroundColor: getDifficultyColor(question.difficulty),
                                  color: 'white',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  fontSize: '10px',
                                  textTransform: 'uppercase',
                                  fontWeight: 'bold'
                                }}>
                                  {question.difficulty}
                                </span>
                                <span style={{ 
                                  backgroundColor: '#6c757d',
                                  color: 'white',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  fontSize: '10px'
                                }}>
                                  {question.category}
                                </span>
                              </div>
                              
                              {/* Question text */}
                              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#333', lineHeight: '1.3', fontSize: '14px' }}>
                                {question.question}
                              </div>
                              
                              {/* Answer options preview */}
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                <strong>Options:</strong> {question.options && question.options.slice(0, 2).join(', ')}
                                {question.options && question.options.length > 2 && ` (+${question.options.length - 2} more)`}
                              </div>
                            </div>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
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
        <h3>Assessment Library</h3>
        {filteredAssessments.length === 0 ? (
          <p>
            {assessments.length === 0 
              ? 'No assessments created yet. Create your first assessment above!' 
              : 'No assessments match your current filters.'
            }
          </p>
        ) : (
          <div>
            {filteredAssessments.map((assessment) => (
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
