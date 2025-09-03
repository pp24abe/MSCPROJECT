import React, { useEffect, useState } from 'react';
import { Card, Button, Form, ListGroup, Accordion, Nav, Row } from 'react-bootstrap';
import { FaGithub, FaSignOutAlt } from 'react-icons/fa'
import Swal from 'sweetalert2';

export default function BuilderSidebar({
  activeTab,
  setActiveTab,
  defaultComponents,
  undo, redo, canUndo, canRedo,
  openStyleModal,
  exportAsHTML, exportAsJSON, importJSON,
  insertToEditor,
  openHistory, openAnalytics,
  downloadPDF, openGit, openIntegrationModal,
  formTemplates, customTemplates,
  loadTemplate,
  newTemplateName, setNewTemplateName, saveCustomTemplate,
  formStyle,
  openCodeModal, deployToGitHub,
  showSuccess, showError,
  deployedURL, onLogout
}) {
  // Group components by category
  const grouped = defaultComponents.reduce((acc, comp) => {
    acc[comp.category] = acc[comp.category] || [];
    acc[comp.category].push(comp);
    return acc;
  }, {});

  // --- NEW: auto-collapse banners after their fade-out animation ---
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      setSuccessVisible(true);
      const t = setTimeout(() => setSuccessVisible(false), 10050); // ~10s + tiny buffer
      return () => clearTimeout(t);
    } else {
      setSuccessVisible(false);
    }
  }, [showSuccess]);

  useEffect(() => {
    if (showError) {
      setErrorVisible(true);
      const t = setTimeout(() => setErrorVisible(false), 10050);
      return () => clearTimeout(t);
    } else {
      setErrorVisible(false);
    }
  }, [showError]);

  // Helpers
  const safeOpenSite = () => {
    if (!deployedURL) {
      alert('No deployed URL yet.');
      return;
    }
    try {
      window.open(deployedURL, '_blank', 'noopener,noreferrer');
    } catch {
      // fallback
      window.location.href = deployedURL;
    }
  };

  const safeShare = async () => {
    if (!deployedURL) {
      alert('No deployed URL yet.');
      return;
    }
    const shareData = {
      title: 'Check out my form!',
      text: 'I just deployed my form using the Form Builder',
      url: deployedURL
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`Check out my form: ${deployedURL}`);
        alert('Share link copied to clipboard.');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`Check out my form: ${deployedURL}`);
        alert('Share link copied to clipboard.');
      } catch {}
    }
  };

  return (
    <>
     <style>
{`
  .custom-nav .nav-pills .nav-link {
    color: #333;
    background-color: transparent;
    border-radius: 8px;
    margin-bottom: 5px;
    transition: all 0.3s ease;
    font-weight: 500;
    padding: 10px 15px;
    text-align: center;
  }

  .custom-nav .nav-pills .nav-link:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .custom-nav .nav-pills .nav-link.active {
    background: linear-gradient(45deg, #000000ff 0%, #9e9d9dff 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .btn-outline-info {
    color: #000000ff;
    border-color: #000000ff;
  }

  .btn-outline-info:hover {
    background-color: #000000ff;
    color: white;
  }

  .stylish-accordion .accordion-item {
    border: none;
    margin-bottom: 10px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .stylish-accordion .accordion-header button {
    background-color: #eaeaebff;
    border: none;
    padding: 15px 20px;
    font-weight: 600;
    color: #333;
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .stylish-accordion .accordion-header button:hover {
    background-color: #e9ecef;
  }

  .stylish-accordion .accordion-body {
    background-color: #fff;
    padding: 15px 20px;
    border-top: 1px solid #eee;
  }

  .stylish-button {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid #dee2e6;
    border-radius: 12px;
    color: #495057;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
  }

  .stylish-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    transition: left 0.5s;
  }

  .stylish-button:hover::before {
    left: 100%;
  }

  .stylish-button:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-color: #adb5bd;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
    color: #212529;
  }

  .stylish-button:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  .stylish-action-btn:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 5px 15px rgba(108, 117, 125, 0.4) !important;
  }

  .btn-premium {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    padding: 10px 16px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;
  }

  .btn-premium::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  .btn-premium:hover::before {
    left: 100%;
  }

  .btn-premium:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }

  .btn-danger-gradient {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  }

  .template-section {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
    border-radius: 16px;
    padding: 20px;
    margin: 16px 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(102, 126, 234, 0.1);
    position: relative;
    overflow: hidden;
  }

  .template-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    50% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .template-section > * {
    animation: fadeInUp 0.5s ease-out;
  }

  .template-label {
    font-weight: 700;
    color: #495057;
    margin-bottom: 12px;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
  }

  .template-label::after {
    content: '';
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, transparent 100%);
    margin-left: 12px;
  }

  .template-select {
    border-radius: 12px;
    border: 2px solid #e9ecef;
    padding: 12px 16px;
    font-size: 0.875rem;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    padding-right: 40px;
  }

  .template-select::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.6s ease;
  }

  .template-select:hover {
    border-color: #667eea;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.2);
    transform: translateY(-3px) scale(1.02);
  }

  .template-select:hover::before {
    left: 100%;
  }

  .template-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 8px 30px rgba(102, 126, 234, 0.25);
    outline: none;
    transform: translateY(-2px) scale(1.01);
    background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%);
    animation: focusPulse 2s ease-in-out infinite;
  }

  @keyframes focusPulse {
    0%, 100% { box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 8px 30px rgba(102, 126, 234, 0.25); }
    50% { box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.2), 0 10px 35px rgba(102, 126, 234, 0.3); }
  }

  .template-select:active {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .template-select option {
    padding: 14px 18px;
    font-weight: 500;
    background: white;
    color: #495057;
    border-radius: 8px;
    margin: 2px 0;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
  }

  .template-select option:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: scale(1.02);
  }

  .template-select option:disabled {
    color: #6c757d;
    font-style: italic;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-weight: 600;
  }

  .template-select option:checked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 700;
  }

  /* Custom dropdown animation */
  .template-select[aria-expanded="true"] {
    border-color: #667eea;
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 35px rgba(102, 126, 234, 0.25);
  }

  .template-input {
    border-radius: 10px;
    border: 2px solid #e9ecef;
    padding: 10px 12px;
    font-size: 0.875rem;
    transition: all 0.3s ease;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .template-input:focus {
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
    outline: none;
  }

  .template-input::placeholder {
    color: #adb5bd;
    font-style: italic;
  }
`}
</style>
<Card style={{ minHeight: '100vh', borderRadius: '18px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)', padding: '1rem' }}>
      <Card.Body className="p-0 custom-nav">
        <Nav variant="pills" className="flex-column mb-4" activeKey={activeTab} onSelect={setActiveTab}>
          <Nav.Item>
            <Nav.Link  eventKey="builder">🛠 Builder</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="preview">👀 Preview</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="dashboard">📊 Dashboard</Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Body>
      <Card.Body style={{ padding: '1rem', overflowY: 'auto' }}>
        <Accordion defaultActiveKey="0" className="mb-3 stylish-accordion">
          {['Text Fields', 'Selection Fields', 'Special Fields'].map(
            (category, idx) => (
              <Accordion.Item eventKey={`${idx}`} key={category}>
                <Accordion.Header>{category}</Accordion.Header>
                <Accordion.Body className="py-2">
                  {defaultComponents
                    .filter((comp) => comp.category === category)
                    .map((comp, i) => (
                      <Button
                        key={`${category}-${i}`}
                        className="w-100 text-start mb-2 stylish-button"
                        variant="outline-dark"
                        size="sm"
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData('type', comp.type)
                        }
                        style={{
                          fontSize: '0.85rem',
                          background: 'white',
                          color: '#333',
                          border: `1px solid outline-dark`,
                          transition: 'transform 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.375rem'
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = 'translateY(-2px)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = 'translateY(0)')
                        }
                      >
                        <i className={`${comp.icon} me-2`} />
                        {comp.label}
                      </Button>
                    ))}
                </Accordion.Body>
              </Accordion.Item>
            )
          )}
        </Accordion>

        <div className="mt-4" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline-dark"
            size="sm"
            className="stylish-action-btn"
            onClick={undo}
            disabled={!canUndo}
            style={{
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '500',
              padding: '8px 16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 3px 10px rgba(108, 117, 125, 0.3)',
              opacity: canUndo ? 1 : 0.6,
              cursor: canUndo ? 'pointer' : 'not-allowed'
            }}
          >⟲ Undo</Button>
          <Button
            variant="outline-dark"
            size="sm"
            className="stylish-action-btn"
            onClick={redo}
            disabled={!canRedo}
            style={{
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '500',
              padding: '8px 16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 3px 10px rgba(108, 117, 125, 0.3)',
              opacity: canRedo ? 1 : 0.6,
              cursor: canRedo ? 'pointer' : 'not-allowed'
            }}
          >⟳ Redo</Button>
        </div>

        <hr />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
          <Button variant="outline-secondary" size="sm" className="stylish-button" onClick={openStyleModal}>
            🎨 Style
          </Button>
          <Button variant="outline-secondary" size="sm" className="stylish-button" onClick={openHistory}>
            🕒 History
          </Button>
          <Button variant="outline-secondary" size="sm" className="stylish-button" onClick={openAnalytics}>
            📊 Analytics
          </Button>
          <Button variant="outline-secondary" size="sm" className="stylish-button" onClick={openGit}>
            🔀 Git
          </Button>
          <Button variant="outline-secondary" size="sm" className="stylish-button" onClick={openIntegrationModal}>
            🔗 Integrations
          </Button>
        </div>

        <hr />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
          <Button variant="outline-dark" size="sm" className="stylish-button" onClick={exportAsHTML}>
            📤 Export HTML
          </Button>
          <Button variant="outline-success" size="sm" className="stylish-button" onClick={exportAsJSON} style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white', border: 'none' }}>
            📄 Export JSON
          </Button>
          <Button variant="outline-info" size="sm" className="stylish-button" onClick={insertToEditor}>
            ⬇️ VS Code
          </Button>
          <Button variant="outline-dark" size="sm" className="stylish-button" onClick={downloadPDF}>
            📥 Download PDF
          </Button>
          <Button variant="outline-info" size="sm" className="stylish-button" onClick={openCodeModal}>
            🧩 View Code
          </Button>
        </div>
        <Form.Control
          type="file"
          accept=".json"
          size="sm"
          className="mb-3"
          onChange={importJSON}
          style={{
            borderRadius: '10px',
            border: '2px dashed #dee2e6',
            padding: '10px',
            transition: 'all 0.3s ease'
          }}
        />
      <Button 
  variant="dark" 
  onClick={deployToGitHub}
  style={{ 
    fontSize: '0.95rem', 
    fontWeight: '600',
    padding: '14px 28px', 
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    marginBottom: '1rem'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
    e.currentTarget.style.boxShadow = '0 15px 50px rgba(102, 126, 234, 0.4), 0 8px 25px rgba(0, 0, 0, 0.15)';
    e.currentTarget.style.background = 'linear-gradient(135deg, #764ba2 0%, #8b5fbf 100%)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)';
    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }}
  onMouseDown={(e) => {
    e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
  }}
>
  <span style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '10px',
    position: 'relative',
    zIndex: 1
  }}>
    <span style={{ 
      fontSize: '1.2em',
      animation: 'rocketFloat 2s ease-in-out infinite'
    }}>🚀</span>
    Deploy to GitHub Pages
  </span>
</Button>

{showSuccess && successVisible && (
  <div style={{
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    border: '2px solid #28a745',
    borderRadius: '16px',
    color: '#155724',
    boxShadow: '0 10px 40px rgba(40, 167, 69, 0.2), 0 6px 20px rgba(0, 0, 0, 0.08)',
    animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1), fadeOutAfter 10s forwards',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(15px)'
  }}>
    {/* Animated top border with countdown */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #28a745, #20c997, #17a2b8, #20c997, #28a745)',
      backgroundSize: '300% 100%',
      animation: 'successShimmer 3s ease-in-out infinite'
    }}></div>
    
    {/* Progress bar countdown */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      height: '4px',
      background: 'rgba(255, 255, 255, 0.6)',
      borderRadius: '0 0 4px 0',
      animation: 'countdownProgress 10s linear forwards',
      zIndex: 1
    }}></div>
    
    {/* Success header */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '1.2rem',
      fontSize: '1.1rem',
      fontWeight: '700'
    }}>
      <span style={{ 
        fontSize: '1.4em', 
        marginRight: '0.7rem',
        animation: 'successPulse 1.5s ease-in-out infinite'
      }}>✅</span>
      Form Deployed Successfully!
    </div>
    
    {/* URL container with responsive design */}
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '0.75rem',
      marginTop: '1rem'
    }}>
      {/* URL input with enhanced styling */}
      <div style={{
        position: 'relative',
        width: '100%'
      }}>
        <input
          type="text"
          value={deployedURL}
          readOnly
          style={{
            width: '100%',
            padding: '0.85rem 3.5rem 0.85rem 1.1rem',
            fontSize: '0.9rem',
            borderRadius: '12px',
            border: '2px solid #28a745',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#155724',
            fontFamily: '"SF Mono", "Monaco", "Consolas", monospace',
            fontWeight: '500',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'inset 0 2px 8px rgba(40, 167, 69, 0.1)',
            cursor: 'text'
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(40, 167, 69, 0.2), inset 0 2px 8px rgba(40, 167, 69, 0.15)';
            e.currentTarget.style.borderColor = '#20c997';
            e.currentTarget.style.transform = 'scale(1.01)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 2px 8px rgba(40, 167, 69, 0.1)';
            e.currentTarget.style.borderColor = '#28a745';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
        
        {/* Integrated copy button inside input */}
        <button
          onClick={async (e) => {
            await navigator.clipboard.writeText(deployedURL);
            const btn = e.currentTarget;
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓';
            btn.style.background = '#20c997';
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.style.background = 'linear-gradient(135deg, rgba(40, 167, 69, 0.9) 0%, rgba(32, 201, 151, 0.9) 100%)';
            }, 1000);
          }}
          style={{
            position: 'absolute',
            right: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.9) 0%, rgba(32, 201, 151, 0.9) 100%)',
            color: 'white',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(40, 167, 69, 0.9) 0%, rgba(32, 201, 151, 0.9) 100%)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
          }}
        >
          <span style={{ fontSize: '1em' }}>📋</span>
          <span style={{ 
            display: window.innerWidth > 480 ? 'inline' : 'none'
          }}>Copy</span>
        </button>
      </div>
      
      {/* Alternative: Separate copy button for larger screens */}
      <div style={{
        display: 'none',
        gap: '0.75rem'
      }}>
        <input
          type="text"
          value={deployedURL}
          readOnly
          style={{
            flex: 1,
            padding: '0.85rem 1.1rem',
            fontSize: '0.9rem',
            borderRadius: '12px',
            border: '2px solid #28a745',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#155724',
            fontFamily: '"SF Mono", "Monaco", "Consolas", monospace',
            fontWeight: '500',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: 'inset 0 2px 8px rgba(40, 167, 69, 0.1)',
            minWidth: 0
          }}
        />
        <button 
          onClick={() => navigator.clipboard.writeText(deployedURL)}
          style={{
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            border: '2px solid #28a745',
            background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(32, 201, 151, 0.1) 100%)',
            color: '#155724',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            minWidth: 'auto'
          }}
        >
          <span>📋</span>
          <span>Copy</span>
        </button>
      </div>
      
      {/* Quick action buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={safeOpenSite}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(40, 167, 69, 0.3)',
            background: 'rgba(40, 167, 69, 0.05)',
            color: '#155724',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(40, 167, 69, 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(40, 167, 69, 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>🔗</span>
          <span>Open Site</span>
        </button>
        
        <button
          onClick={safeShare}
          style={{
            flex: 1,
            minWidth: '120px',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(40, 167, 69, 0.3)',
            background: 'rgba(40, 167, 69, 0.05)',
            color: '#155724',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(40, 167, 69, 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(40, 167, 69, 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>📤</span>
          <span>Share</span>
        </button>
      </div>
    </div>
  </div>
)}

{showError && errorVisible && (
  <div style={{
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
    border: '2px solid #dc3545',
    borderRadius: '16px',
    color: '#721c24',
    boxShadow: '0 10px 40px rgba(220, 53, 69, 0.2), 0 6px 20px rgba(0, 0, 0, 0.08)',
    animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1), fadeOutAfter 10s forwards',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(15px)'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #dc3545, #e74c3c, #dc3545)',
      backgroundSize: '200% 100%',
      animation: 'errorPulse 2s ease-in-out infinite'
    }}></div>
    
    {/* Progress bar countdown */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      height: '4px',
      background: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '0 0 4px 0',
      animation: 'countdownProgress 10s linear forwards',
      zIndex: 1
    }}></div>
    
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '1.2rem',
      fontSize: '1.1rem',
      fontWeight: '700'
    }}>
      <span style={{ 
        fontSize: '1.4em', 
        marginRight: '0.7rem',
        animation: 'errorShake 0.8s ease-in-out'
      }}>❌</span>
      Deployment Failed!
    </div>
    
    <div style={{
      background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.08) 0%, rgba(231, 76, 60, 0.08) 100%)',
      padding: '1.2rem',
      borderRadius: '12px',
      border: '1px solid rgba(220, 53, 69, 0.2)',
      marginTop: '1rem',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{ 
        fontWeight: '600',
        marginBottom: '0.7rem',
        display: 'flex',
        alignItems: 'center',
        color: '#721c24'
      }}>
        <span style={{ marginRight: '0.5rem' }}>⚠️</span>
        Quick Fix:
      </div>
      <div style={{ 
        fontSize: '0.9rem', 
        lineHeight: '1.6',
        color: '#721c24',
        opacity: 0.9
      }}>
        1. Paste your repository URL<br/>
        2. Initialize Git in your project<br/>
        3. Verify your GitHub token and repository settings
      </div>
    </div>
  </div>
)}

<style>
{`
@keyframes fadeOutAfter {
  0%, 90% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
  95% { 
    opacity: 0.5; 
    transform: translateY(-10px) scale(0.98);
  }
  100% { 
    opacity: 0; 
    transform: translateY(-20px) scale(0.95);
    visibility: hidden;
  }
}

@keyframes countdownProgress {
  0% { 
    width: 100%; 
    opacity: 0.8;
  }
  100% { 
    width: 0%; 
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes successShimmer {
  0% { background-position: -300% 0; }
  50% { background-position: 300% 0; }
  100% { background-position: -300% 0; }
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes rocketFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(-3deg); }
  50% { transform: translateY(-1px) rotate(0deg); }
  75% { transform: translateY(-2px) rotate(3deg); }
}

@keyframes errorPulse {
  0%, 100% { background-position: -200% 0; }
  50% { background-position: 200% 0; }
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

/* Responsive design for mobile */
@media (max-width: 768px) {
  .deploy-button {
    padding: 12px 20px !important;
    font-size: 0.9rem !important;
  }
  
  .success-notification {
    padding: 1.2rem !important;
    margin-top: 1.2rem !important;
  }
  
  .url-input {
    font-size: 0.8rem !important;
    padding: 0.75rem 3rem 0.75rem 0.9rem !important;
  }
  
  .copy-button-integrated {
    padding: 0.4rem 0.6rem !important;
    font-size: 0.75rem !important;
  }
  
  .quick-actions {
    flex-direction: column !important;
    gap: 0.4rem !important;
  }
  
  .quick-action-btn {
    min-width: auto !important;
    font-size: 0.8rem !important;
    padding: 0.5rem 0.8rem !important;
  }
}

@media (max-width: 480px) {
  .copy-button-text {
    display: none !important;
  }
  
  .url-input {
    padding-right: 2.5rem !important;
  }
  
  .copy-button-integrated {
    padding: 0.3rem 0.5rem !important;
    right: 0.3rem !important;
  }
}
`}
</style>
        <hr />

        <div>
          <div className="template-label">
             Built-in Templates
          </div>
          <Form.Select
            size="sm"
            className="template-select mb-4"
            onChange={e => loadTemplate(e.target.value, false)}
            defaultValue=""
          >
            <option value="" disabled> Choose a built-in template...</option>
            {Object.keys(formTemplates).map(key => (
              <option key={key} value={key}> {formTemplates[key].name}</option>
            ))}
          </Form.Select>

          <div className="template-label">
             Custom Templates
          </div>
          <Form.Select
            size="sm"
            className="template-select mb-4"
            onChange={e => loadTemplate(e.target.value, true)}
            defaultValue=""
          >
            <option value="" disabled> Choose a custom template...</option>
            {Object.keys(customTemplates).map(key => (
              <option key={key} value={key}> {customTemplates[key].name}</option>
            ))}
          </Form.Select>

          <div className="template-label">
             Save Current as Template
          </div>
          <Form.Control
            size="sm"
            type="text"
            className="template-input mb-3"
            placeholder="✏️ Enter your template name..."
            value={newTemplateName}
            onChange={e => setNewTemplateName(e.target.value)}
          />
          <Button
            size="sm"
            className="stylish-button"
            variant="outline-success"
            onClick={saveCustomTemplate}
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              width: '100%',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
            }}
          >💾 Save Template</Button>

          <div style={{ borderTop: '2px solid rgba(102, 126, 234, 0.1)', margin: '20px 0', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '-8px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)', 
              padding: '0 12px',
              fontSize: '0.8rem',
              color: '#6c757d',
              fontWeight: '500'
            }}>
              Account
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              Swal.fire({
                title: 'Are you sure?',
                text: "You will be logged out.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, sign out!'
              }).then((result) => {
                if (result.isConfirmed) {
                  onLogout();
                }
              });
            }}
            className="btn-danger-gradient"
            style={{
              width: '100%',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginTop: '1rem'
            }}
          >
            <FaSignOutAlt className="me-2" />
            Sign Out
          </Button>
        </div>
      </Card.Body>
    </Card>
</>
  );
}
