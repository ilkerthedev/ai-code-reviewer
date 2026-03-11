import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Trash2, Info, Bug, ShieldAlert, Zap, Cpu, CheckCircle2, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import logoUrl from './assets/logo.svg';
import './App.css';

interface Issue {
  type: 'bug' | 'security' | 'performance' | 'best-practice';
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface ReviewResult {
  language: string;
  issues: Issue[];
  improvedCode: string;
}

/**
 * Main Application Component mapping the AI Code Reviewer into a ChatGPT-style conversational UI.
 */
function App() {
  const [code, setCode] = useState('');
  const [queryCode, setQueryCode] = useState(''); // The code that was submitted
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat when review changes
  useEffect(() => {
    if (review && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [review]);

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review.');
      return;
    }

    setLoading(true);
    setQueryCode(code);
    setReview(null);

    try {
      const response = await fetch('http://localhost:3001/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch review');
      }

      setReview(data.review);
      setCode(''); // Clear input after successful submission
      toast.success('Code review complete!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setCode('');
    setQueryCode('');
    setReview(null);
    toast('Chat cleared', { icon: '🧹' });
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug size={16} />;
      case 'security': return <ShieldAlert size={16} />;
      case 'performance': return <Zap size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="app-layout">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1A1A3E',
          color: '#fff',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        },
      }} />

      <header className="app-header">
        <div className="brand-section">
          <img src={logoUrl} alt="AI Logo" className="brand-logo" />
          <h1>AI Code Reviewer</h1>
        </div>
        <div className="header-actions">
          <button onClick={clearChat} title="Clear Chat">
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </header>

      <main className="chat-container">
        {queryCode && (
          <motion.div className="chat-message" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="avatar user">U</div>
            <div className="message-content">
              <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0 }}>
                {queryCode}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {review && (
            <motion.div className="chat-message" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="avatar ai">
                <Cpu size={20} color="#A78BFA" />
              </div>
              <div className="message-content">
                <div className="badge-row">
                  <span className="language-badge">Detected: {review.language}</span>
                  <span className="language-badge">{review.issues.length} Issues Found</span>
                </div>

                {review.issues.length > 0 ? (
                  <div className="issues-grid">
                    {review.issues.map((issue, idx) => (
                      <motion.div key={idx} className={`issue-card ${issue.severity}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                        <div className="issue-header">
                          <span className="issue-type" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {getIssueIcon(issue.type)} {issue.type}
                          </span>
                          <span style={{ textTransform: 'capitalize', color: issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#f59e0b' : '#3b82f6' }}>
                            {issue.severity}
                          </span>
                        </div>
                        <p className="issue-desc">{issue.description}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="issue-card low" style={{ borderColor: '#10b981' }}>
                    <p style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={18} /> No major issues found! Great code.
                    </p>
                  </div>
                )}

                <div className="improved-code-wrapper">
                  <div className="improved-code-header">
                    <Wand2 size={16} /> Optimized Code
                  </div>
                  <SyntaxHighlighter language={review.language.toLowerCase() || 'javascript'} style={vscDarkPlus} customStyle={{ margin: 0 }}>
                    {review.improvedCode}
                  </SyntaxHighlighter>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} />
      </main>

      <div className="input-area-wrapper">
        <div className="input-container">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here for an AI review..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleReview();
            }}
          />
          <button 
            className="submit-btn" 
            onClick={handleReview} 
            disabled={loading || !code.trim()}
            title="Send (Ctrl + Enter)"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div className="loading-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="loading-content">
              <img src={logoUrl} alt="Loading" className="loader-icon" />
              <div className="loading-text">Analyzing Code...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;