import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import QuestionManagement from './pages/ChallengeManagement'
import AssessmentCreation from './pages/AssessmentCreation'
import CandidateInterface from './pages/CandidateInterface'
import ResultsReview from './pages/ResultsReview'
import Home from './pages/Home'

function Navigation(): JSX.Element {
  const location = useLocation()
  
  const isActive = (path: string): string => location.pathname === path ? 'active' : ''
  
  return (
    <nav className="nav">
      <div className="container">
        <ul>
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/challenges" className={isActive('/challenges')}>Question Management</Link></li>
          <li><Link to="/assessments" className={isActive('/assessments')}>Assessment Creation</Link></li>
          <li><Link to="/take-assessment" className={isActive('/take-assessment')}>Take Assessment</Link></li>
          <li><Link to="/results" className={isActive('/results')}>Results Review</Link></li>
        </ul>
      </div>
    </nav>
  )
}

function App(): JSX.Element {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/challenges" element={<QuestionManagement />} />
            <Route path="/assessments" element={<AssessmentCreation />} />
            <Route path="/take-assessment" element={<CandidateInterface />} />
            <Route path="/take-assessment/:id" element={<CandidateInterface />} />
            <Route path="/results" element={<ResultsReview />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
