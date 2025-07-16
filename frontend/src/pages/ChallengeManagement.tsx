import React, { useState, useEffect } from 'react'
import { getChallenges, createChallenge, deleteChallenge, updateChallenge } from '../services/api'

/* UPDATED: Fixed input field sizing and functionality - v2.0 */
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

interface FormData {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

function QuestionManagement(): JSX.Element {
  const [questions, setQuestions] = useState<Question[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium',
    category: 'General'
  })
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<string>('')

  useEffect(() => {
    loadQuestions()
    testApiConnection() // Test connection on component mount
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, categoryFilter, difficultyFilter])

  const loadQuestions = async () => {
    try {
      console.log('Loading questions from API...'); // Debug log
      const data = await getChallenges()
      console.log('Questions loaded:', data); // Debug log
      setQuestions(data.challenges || [])
    } catch (error) {
      console.error('Error loading questions:', error)
      // Show error to user but don't crash the app
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const filterQuestions = () => {
    let filtered = questions

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.options.some(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter(q => q.category === categoryFilter)
    }

    if (difficultyFilter) {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter)
    }

    setFilteredQuestions(filtered)
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.question.trim()) {
      errors.push('Question text is required')
    }

    if (formData.options.some(option => !option.trim())) {
      errors.push('All answer options must be filled')
    }

    if (formData.options.filter(option => option.trim()).length < 2) {
      errors.push('At least 2 answer options are required')
    }

    if (!formData.category.trim()) {
      errors.push('Category is required')
    }

    setFormErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      console.log('Submitting question data:', formData); // Debug log
      
      if (editingQuestion) {
        const result = await updateChallenge(editingQuestion.id, formData)
        console.log('Update result:', result); // Debug log
        setEditingQuestion(null)
      } else {
        const result = await createChallenge(formData)
        console.log('Create result:', result); // Debug log
      }
      
      resetForm()
      setShowCreateForm(false)
      await loadQuestions() // Ensure we await the reload
    } catch (error) {
      console.error('Error saving question:', error)
      // Add user-friendly error message
      setFormErrors(['Failed to save question. Please check your connection and try again.'])
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      category: 'General'
    })
    setFormErrors([])
  }

  const handleEdit = (question: Question) => {
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      category: question.category
    })
    setEditingQuestion(question)
    setShowCreateForm(true)
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
    setShowCreateForm(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteChallenge(id)
        loadQuestions()
      } catch (error) {
        console.error('Error deleting question:', error)
      }
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData({ 
        ...formData, 
        options: [...formData.options, ''] 
      })
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ 
        ...formData, 
        options: newOptions,
        correctAnswer: formData.correctAnswer >= index ? 
          Math.max(0, formData.correctAnswer - 1) : formData.correctAnswer
      })
    }
  }

  const getUniqueCategories = () => {
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

  const testApiConnection = async () => {
    try {
      setConnectionStatus('Testing connection...')
      const response = await fetch('http://localhost:8000/api/health')
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus('✅ Connected to backend')
        console.log('API Health check:', data)
      } else {
        setConnectionStatus('❌ Backend connection failed')
      }
    } catch (error) {
      setConnectionStatus('❌ Cannot reach backend server')
      console.error('Connection test failed:', error)
    }
  }

  if (loading) {
    return <div className="loading">Loading questions...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>Question Management</h1>
          {connectionStatus && (
            <div style={{ 
              fontSize: '14px', 
              color: connectionStatus.includes('✅') ? '#28a745' : '#dc3545',
              marginTop: '5px'
            }}>
              {connectionStatus}
            </div>
          )}
        </div>
        <button 
          className="btn" 
          onClick={() => {
            if (showCreateForm) {
              handleCancelEdit()
            } else {
              setShowCreateForm(true)
            }
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create New Question'}
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Search & Filter</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
          <div className="form-group">
            <label>Search Questions:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by question text or answer options..."
            />
          </div>
          
          <div className="form-group">
            <label>Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Difficulty:</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        
        <div style={{ marginTop: '10px', color: '#666' }}>
          Showing {filteredQuestions.length} of {questions.length} questions
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card">
          <h3>{editingQuestion ? 'Edit Question' : 'Create New Multiple Choice Question'}</h3>
          
          {formErrors.length > 0 && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Question: *</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                placeholder="Enter your multiple choice question here..."
                required
              />
            </div>
            
            <div className="form-group question-form-container">
              <label>Answer Options: *</label>
              <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                Select the radio button next to the correct answer
              </div>
              {formData.options.map((option, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '16px',
                  padding: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: formData.correctAnswer === index ? '#f0f8ff' : '#fff',
                  minHeight: '60px'
                }}>
                  <div style={{ 
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: formData.correctAnswer === index ? '#007bff' : '#e0e0e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginRight: '12px'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === index}
                    onChange={() => setFormData({...formData, correctAnswer: index})}
                    style={{ marginRight: '12px' }}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Enter option ${String.fromCharCode(65 + index)} text...`}
                    required
                    className="option-input"
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      style={{ 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        minWidth: '32px',
                        marginLeft: '8px'
                      }}
                      title="Remove this option"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                {formData.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="btn btn-secondary"
                    style={{ fontSize: '14px', padding: '8px 16px' }}
                  >
                    + Add Option
                  </button>
                )}
                <small style={{ color: '#666' }}>
                  You can have 2-6 answer options. Click the radio button to select the correct answer.
                </small>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Difficulty: *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Category: *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="e.g., JavaScript, React, General Knowledge"
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn">
                {editingQuestion ? 'Update Question' : 'Create Question'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      <div className="card">
        <h3>Questions Library</h3>
        {filteredQuestions.length === 0 ? (
          <p>
            {questions.length === 0 
              ? 'No questions created yet. Create your first multiple choice question above!' 
              : 'No questions match your current filters.'
            }
          </p>
        ) : (
          <div>
            {filteredQuestions.map((question) => (
              <div key={question.id} style={{ 
                border: '1px solid #e0e0e0', 
                padding: '20px', 
                marginBottom: '15px', 
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ 
                        backgroundColor: getDifficultyColor(question.difficulty),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginRight: '10px',
                        textTransform: 'uppercase'
                      }}>
                        {question.difficulty}
                      </span>
                      <span style={{ 
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {question.category}
                      </span>
                    </div>
                    
                    <h4 style={{ marginBottom: '15px', color: '#333' }}>{question.question}</h4>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Answer Options:</strong>
                      <div style={{ marginTop: '8px', marginLeft: '10px' }}>
                        {question.options && question.options.map((option, index) => (
                          <div key={index} style={{ 
                            padding: '8px 12px',
                            margin: '4px 0',
                            borderRadius: '4px',
                            backgroundColor: index === question.correctAnswer ? '#d4edda' : '#fff',
                            border: `1px solid ${index === question.correctAnswer ? '#28a745' : '#ddd'}`,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <span style={{ 
                              marginRight: '10px', 
                              fontWeight: 'bold',
                              color: index === question.correctAnswer ? '#28a745' : '#666'
                            }}>
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span style={{ 
                              color: index === question.correctAnswer ? '#155724' : 'inherit',
                              fontWeight: index === question.correctAnswer ? 'bold' : 'normal'
                            }}>
                              {option}
                            </span>
                            {index === question.correctAnswer && (
                              <span style={{ marginLeft: 'auto', color: '#28a745', fontWeight: 'bold' }}>
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <small style={{ color: '#666' }}>
                      Created: {new Date(question.createdAt).toLocaleDateString()}
                      {question.updatedAt && ` | Updated: ${new Date(question.updatedAt).toLocaleDateString()}`}
                    </small>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '20px' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEdit(question)}
                      style={{ fontSize: '14px', padding: '6px 12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn"
                      onClick={() => handleDelete(question.id)}
                      style={{ 
                        fontSize: '14px', 
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        borderColor: '#dc3545'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionManagement
