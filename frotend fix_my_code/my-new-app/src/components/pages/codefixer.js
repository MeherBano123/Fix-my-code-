import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CodeFixer = () => {
  const [formData, setFormData] = useState({
    code: '',
    errorMessage: '',
    language: 'python'
  });
  const [fixedCode, setFixedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [copied, setCopied] = useState(false);

  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:8000/supported-languages');
        setLanguages(response.data.languages);
      } catch (err) {
        setError({
          message: 'Failed to load supported languages',
          details: err.response?.data || err.message
        });
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFixedCode('');
    setCopied(false);

    try {
      const response = await axios.post('http://localhost:8000/fix-code', {
        code: formData.code,
        error_message: formData.errorMessage,
        language: formData.language
      });

      if (response.data?.fixed_code) {
        setFixedCode(response.data.fixed_code);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      let errorMessage = 'Failed to fix code';
      let errorDetails = null;

      if (err.response) {
        if (err.response.data?.detail) {
          if (typeof err.response.data.detail === 'string') {
            errorMessage = err.response.data.detail;
          } else if (err.response.data.detail.message) {
            errorMessage = err.response.data.detail.message;
            errorDetails = err.response.data.detail;
          } else {
            errorDetails = err.response.data.detail;
          }
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = err.message;
      }

      setError({
        message: errorMessage,
        details: errorDetails
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Code Fixer</h1>
      <p style={styles.subtitle}>Fix your buggy code using open-source tools</p>

      {error && (
        <div style={styles.error}>
          <strong>Error: </strong>{error.message}
          {error.details && (
            <pre style={styles.errorDetails}>
              {JSON.stringify(error.details, null, 2)}
            </pre>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Programming Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            style={styles.select}
            required
          >
            {languages.map((lang) => (
              <option key={lang.name} value={lang.name}>
                {lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Buggy Code</label>
          <textarea
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Paste your buggy code here..."
            style={styles.textarea}
            rows={10}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Error Message</label>
          <textarea
            name="errorMessage"
            value={formData.errorMessage}
            onChange={handleChange}
            placeholder="Paste the error message you're getting..."
            style={styles.textarea}
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(loading && styles.loadingButton)
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span style={styles.spinner}>🌀</span> Fixing Code...
            </>
          ) : (
            'Fix Code'
          )}
        </button>
      </form>

      {fixedCode && (
        <div style={styles.resultContainer}>
          <div style={styles.resultHeader}>
            <h3 style={styles.resultTitle}>Fixed Code</h3>
            <button
              onClick={copyToClipboard}
              style={styles.copyButton}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre style={styles.fixedCode}>
            {fixedCode}
          </pre>
          <div style={styles.suggestions}>
            <h4>Suggestions:</h4>
            <ul>
              <li>Review the changes carefully before using</li>
              <li>The fix might not address all issues</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: "'Poppins', sans-serif",
    color: '#e0e0e0',
    background: 'linear-gradient(135deg, #480577, #0d0330, #000000)',
    minHeight: '100vh'
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#fff',
    textShadow: '0 0 8px rgba(255, 0, 255, 0.4)'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#bbb'
  },
  form: {
    background: 'rgba(26, 26, 46, 0.9)',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 0, 255, 0.3)',
    border: '1px solid rgba(255, 0, 255, 0.3)'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #4a4a6a',
    background: '#101022',
    color: '#e0e0e0',
    fontSize: '1rem',
    fontFamily: "'Poppins', sans-serif"
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #4a4a6a',
    background: '#101022',
    color: '#e0e0e0',
    fontSize: '1rem',
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100px',
    resize: 'vertical'
  },
  error: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.2)',
    borderRadius: '4px',
    padding: '1rem',
    marginBottom: '1.5rem',
    color: '#ff4444'
  },
  errorDetails: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    overflowX: 'auto',
    fontSize: '0.85rem'
  },
  submitButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(90deg, #00c6ff, #ff00ff)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem'
  },
  loadingButton: {
    background: '#666',
    cursor: 'not-allowed'
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    display: 'inline-block'
  },
  resultContainer: {
    marginTop: '2rem',
    background: 'rgba(26, 26, 46, 0.9)',
    padding: '1.5rem',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 0, 255, 0.3)',
    border: '1px solid rgba(255, 0, 255, 0.3)'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  resultTitle: {
    margin: '0',
    color: '#fff'
  },
  copyButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#e0e0e0',
    border: '1px solid #4a4a6a',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.2)'
    }
  },
  fixedCode: {
    background: '#101022',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #4a4a6a',
    color: '#e0e0e0',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowX: 'auto',
    maxHeight: '500px',
    overflowY: 'auto',
    margin: '0'
  },
  suggestions: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px'
  }
};

export default CodeFixer;