import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getChallenges, getAssessments, getSubmissions } from '../services/api'

interface DashboardStats {
  totalQuestions: number;
  totalAssessments: number;
  totalSubmissions: number;
  averageScore: number;
}

function Home(): JSX.Element {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    totalAssessments: 0,
    totalSubmissions: 0,
    averageScore: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const [questionsData, assessmentsData, submissionsData] = await Promise.all([
        getChallenges(),
        getAssessments(),
        getSubmissions()
      ])

      const submissions = submissionsData.submissions || []
      const averageScore = submissions.length > 0 
        ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length)
        : 0

      setStats({
        totalQuestions: questionsData.challenges?.length || 0,
        totalAssessments: assessmentsData.assessments?.length || 0,
        totalSubmissions: submissions.length,
        averageScore
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      title: 'Question Management',
      description: 'Create, edit, and organize multiple choice questions with different difficulty levels and categories.',
      icon: '📝',
      link: '/challenges',
      color: '#007bff'
    },
    {
      title: 'Assessments',
      description: 'Create, manage, and organize assessments with multiple questions, time limits, and password protection.',
      icon: '📋',
      link: '/assessments',
      color: '#28a745'
    },
    {
      title: 'Candidate Interface',
      description: 'Provide a smooth, user-friendly experience for candidates taking assessments.',
      icon: '👤',
      link: '/take-assessment',
      color: '#17a2b8'
    },
    {
      title: 'Results & Analytics',
      description: 'Review performance data, analyze results, and get insights into candidate performance.',
      icon: '📊',
      link: '/results',
      color: '#ffc107'
    }
  ]

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5em', color: '#2c3e50', marginBottom: '10px' }}>
          🎯 Assessment Platform
        </h1>
        <p style={{ fontSize: '1.2em', color: '#6c757d', maxWidth: '600px', margin: '0 auto' }}>
          A comprehensive platform for creating, managing, and analyzing multiple choice assessments for candidate evaluation.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5em', margin: '0 0 10px 0', color: 'white' }}>{stats.totalQuestions}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Total Questions</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5em', margin: '0 0 10px 0', color: 'white' }}>{stats.totalAssessments}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Assessments Created</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #17a2b8 0%, #117a8b 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5em', margin: '0 0 10px 0', color: 'white' }}>{stats.totalSubmissions}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Submissions</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #ffc107 0%, #d39e00 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5em', margin: '0 0 10px 0', color: 'white' }}>{stats.averageScore}%</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Average Score</p>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🚀 Quick Start Guide</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: '20px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>1️⃣</div>
            <h4>Create Questions</h4>
            <p style={{ fontSize: '0.9em', color: '#6c757d' }}>Start by adding multiple choice questions</p>
          </div>
          <div>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>2️⃣</div>
            <h4>Build Assessment</h4>
            <p style={{ fontSize: '0.9em', color: '#6c757d' }}>Combine questions into an assessment</p>
          </div>
          <div>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>3️⃣</div>
            <h4>Share with Candidates</h4>
            <p style={{ fontSize: '0.9em', color: '#6c757d' }}>Send assessment link to candidates</p>
          </div>
          <div>
            <div style={{ fontSize: '2em', marginBottom: '10px' }}>4️⃣</div>
            <h4>Review Results</h4>
            <p style={{ fontSize: '0.9em', color: '#6c757d' }}>Analyze performance and scores</p>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '30px', textAlign: 'center' }}>Platform Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {features.map((feature, index) => (
            <Link 
              key={index}
              to={feature.link} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div 
                className="card" 
                style={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: `2px solid ${feature.color}20`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = `0 10px 25px ${feature.color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)'
                }}
              >
                <div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: feature.color
                  }}
                />
                <div style={{ fontSize: '3em', marginBottom: '15px' }}>{feature.icon}</div>
                <h3 style={{ color: feature.color, marginBottom: '15px' }}>{feature.title}</h3>
                <p style={{ color: '#6c757d', lineHeight: 1.6 }}>{feature.description}</p>
                <div 
                  style={{ 
                    marginTop: '20px',
                    color: feature.color,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  Get Started →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Status and Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
        <div className="card">
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>📈 Platform Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Question Library</span>
              <span style={{ 
                backgroundColor: stats.totalQuestions > 0 ? '#28a745' : '#6c757d',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {stats.totalQuestions > 0 ? 'Active' : 'Empty'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Assessment System</span>
              <span style={{ 
                backgroundColor: stats.totalAssessments > 0 ? '#28a745' : '#6c757d',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {stats.totalAssessments > 0 ? 'Active' : 'Setup Required'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Results Tracking</span>
              <span style={{ 
                backgroundColor: stats.totalSubmissions > 0 ? '#28a745' : '#6c757d',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {stats.totalSubmissions > 0 ? 'Tracking' : 'No Data'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎯 Next Steps</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stats.totalQuestions === 0 && (
              <Link to="/challenges" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  padding: '12px 16px',
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '8px',
                  color: '#1565c0',
                  cursor: 'pointer'
                }}>
                  ➕ Create your first question
                </div>
              </Link>
            )}
            {stats.totalQuestions > 0 && stats.totalAssessments === 0 && (
              <Link to="/assessments" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  padding: '12px 16px',
                  backgroundColor: '#e8f5e8',
                  border: '1px solid #4caf50',
                  borderRadius: '8px',
                  color: '#2e7d32',
                  cursor: 'pointer'
                }}>
                  📋 Build your first assessment
                </div>
              </Link>
            )}
            {stats.totalAssessments > 0 && stats.totalSubmissions === 0 && (
              <Link to="/take-assessment" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  padding: '12px 16px',
                  backgroundColor: '#fff3e0',
                  border: '1px solid #ff9800',
                  borderRadius: '8px',
                  color: '#ef6c00',
                  cursor: 'pointer'
                }}>
                  🎯 Test candidate experience
                </div>
              </Link>
            )}
            {stats.totalSubmissions > 0 && (
              <Link to="/results" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  padding: '12px 16px',
                  backgroundColor: '#f3e5f5',
                  border: '1px solid #9c27b0',
                  borderRadius: '8px',
                  color: '#7b1fa2',
                  cursor: 'pointer'
                }}>
                  📊 Review latest results
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
