import React, { Component, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaGithub, FaLock, FaRocket } from 'react-icons/fa';
import FormBuilder from './components/FormBuilder';

/**
 * Catches rendering errors anywhere below and shows them instead of a white screen.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  componentDidCatch(error, info) {
    console.error('💥 Caught by ErrorBoundary:', error, info);
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, background: '#fee', color: '#900' }}>
          <h2>Something went wrong:</h2>
          <pre>{this.state.error.toString()}</pre>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.info.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoginScreen({ githubAuthUrl }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating circles */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '70%',
          right: '20%',
          width: '60px',
          height: '60px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite',
          animationDelay: '2s'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: '80px',
          height: '80px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
          animation: 'float 7s ease-in-out infinite',
          animationDelay: '4s'
        }}
      />

      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={4}>
            <Card
              className="shadow-lg border-0"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    padding: '20px',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <FaLock size={40} color="white" />
                </div>
              </div>

              <Card.Body className="text-center p-5">
                <Card.Title
                  as="h2"
                  className="mb-3"
                  style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Welcome Back
                </Card.Title>
                <Card.Text className="mb-4" style={{ color: '#6c757d', lineHeight: 1.6 }}>
                  Connect with GitHub to access your forms and unleash your creativity
                </Card.Text>

                <Row className="g-3 mb-4 text-center">
                  <Col xs={4}>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '8px'
                      }}
                    >
                      <FaLock size={20} style={{ color: '#667eea' }} />
                    </div>
                    <small style={{ color: '#6c757d', fontWeight: '500' }}>Secure</small>
                  </Col>
                  <Col xs={4}>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '8px'
                      }}
                    >
                      <FaRocket size={20} style={{ color: '#764ba2' }} />
                    </div>
                    <small style={{ color: '#6c757d', fontWeight: '500' }}>Fast</small>
                  </Col>
                  <Col xs={4}>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '8px'
                      }}
                    >
                      <FaGithub size={20} style={{ color: '#333' }} />
                    </div>
                    <small style={{ color: '#6c757d', fontWeight: '500' }}>GitHub</small>
                  </Col>
                </Row>

                <Button
                  href={githubAuthUrl}
                  size="lg"
                  className="d-flex align-items-center justify-content-center position-relative overflow-hidden"
                  style={{
                    width: '100%',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #333 0%, #555 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '15px 30px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                >
                  <FaGithub size={24} className="me-3" />
                  Continue with GitHub
                  <div
                    className="shine-effect"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease'
                    }}
                  />
                </Button>

                <p className="mt-4 mb-0" style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                  Your data is safe and secure with us
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* *** NO jsx ATTRIBUTE HERE *** */}
      <style>
        {`
          @keyframes float {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%,100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .btn:hover .shine-effect { left: 100% !important; }
        `}
      </style>
    </div>
  );
}

function App() {
  const [githubToken, setGithubToken] = useState(null);

  useEffect(() => {
    // 1) catch ?github_token=... in browser dev mode
    const params = new URLSearchParams(window.location.search);
    const t = params.get('github_token');
    if (t) {
      console.log('[App] token from URL:', t);
      setGithubToken(t);
      window.history.replaceState({}, '', window.location.pathname);
    }

    // 2) catch VS Code Webview postMessage
    const listener = event => {
      console.log('[App] message event.data =', event.data);
      if (event.data?.command === 'setGitHubToken' && event.data.token) {
        console.log('[App] setting githubToken from webview...');
        setGithubToken(event.data.token);
      }
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, []);

  const githubAuthUrl = `${process.env.REACT_APP_BACKEND_URL}/auth/github`;

  return (

    <>
      <style>
        {`
          .drop-anim-zone.drop-anim-active {
  animation: dropPop 0.6s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 0 0 6px #4caf50aa;
  z-index: 2;
}
@keyframes dropPop {
  0%   { box-shadow: 0 0 0 0 #4caf50aa; transform: scale(1); }
  50%  { box-shadow: 0 0 0 16px #4caf5044; transform: scale(1.03); }
  100% { box-shadow: 0 0 0 0 #4caf5000; transform: scale(1); }
}
        @keyframes fadeOutRight {
  0% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  60% {
    opacity: 0.5;
    transform: translateX(30px) scale(0.98);
  }
  100% {
    opacity: 0;
    transform: translateX(100px) scale(0.95);
  }
}
.form-field-deleting {
  animation: fadeOutRight 0.4s forwards;
  pointer-events: none;
}`}
      </style>


      <ErrorBoundary>
        (
        <Container fluid className="p-0">
          <Row className="g-0">
            <Col xs={12} className="p-3">
              <h1 className="text-center mb-4">Form Builder</h1>
              <p className="text-center text-muted mb-4">
                Create and manage your forms with ease. Your GitHub token is securely stored.
              </p>
            </Col>
          </Row>
          <Row className="g-0">
            <FormBuilder githubToken={githubToken} />
          </Row>
        </Container>
        )
      </ErrorBoundary>

    </>
  );
}

export default App;
