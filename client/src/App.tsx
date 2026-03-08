import { useState } from 'react'
import './App.css'

function App() {
  const [code, setCode] = useState('')
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReview = async () => {
    if (!code.trim()) return
    
    setLoading(true)
    setReview('')
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setReview(data.review)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>🔍 AI Code Reviewer</h1>
        <p>Paste your code and get instant AI-powered feedback</p>
      </header>

      <main>
        <div className="editor-section">
          <label>Your Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={15}
          />
          <button onClick={handleReview} disabled={loading || !code.trim()}>
            {loading ? 'Analyzing...' : '🚀 Review My Code'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {review && (
          <div className="review-section">
            <label>AI Review</label>
            <div className="review-content">
              <pre>{review}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App