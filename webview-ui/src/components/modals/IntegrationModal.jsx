// src/modals/IntegrationModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Tab, Nav } from 'react-bootstrap';
import { FaDatabase, FaServer, FaKey, FaProjectDiagram } from 'react-icons/fa';

export default function IntegrationModal({
  show,
  onHide,
  integrationConfig,
  setIntegrationConfig,
  setDbUrl,
  setApiKey,
}) {
  const [activeTab, setActiveTab] = useState(integrationConfig?.type || 'webhook');

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setIntegrationConfig((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [name]: value,
      },
    }));
  };

  const handleTypeChange = (type) => {
    setActiveTab(type);
    setIntegrationConfig((prev) => ({
      ...prev,
      type,
    }));
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'webhook':
        return (
          <div className="form-section">
            <Form.Group className="modern-form-group">
              <Form.Label className="modern-label">
                <FaServer className="label-icon" /> Webhook URL
              </Form.Label>
              <Form.Control
                type="url"
                name="url"
                value={integrationConfig.webhook?.url || ''}
                onChange={handleConfigChange}
                placeholder="https://api.example.com/submit"
                className="modern-input"
              />
              <Form.Text className="modern-help-text">
                We'll POST each submission's JSON data to this URL.
              </Form.Text>
            </Form.Group>
          </div>
        );

      case 'firebase':
        return (
          <div className="form-section">
            <div className="info-card">
              <p className="info-text">
                Provide your Firebase Realtime Database credentials. The form will directly write submissions to the specified path.
              </p>
            </div>
            <Form.Group className="modern-form-group">
              <Form.Label className="modern-label">
                <FaKey className="label-icon" /> API Key
              </Form.Label>
              <Form.Control
                type="text"
                name="apiKey"
                value={integrationConfig.firebase?.apiKey || ''}
                onChange={handleConfigChange}
                placeholder="AIzaSy..."
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="modern-form-group">
              <Form.Label className="modern-label">
                <FaProjectDiagram className="label-icon" /> Database URL
              </Form.Label>
              <Form.Control
                type="text"
                name="databaseURL"
                value={integrationConfig.firebase?.databaseURL || ''}
                onChange={handleConfigChange}
                placeholder="https://your-project-id.firebaseio.com"
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="modern-form-group">
              <Form.Label className="modern-label">
                <FaServer className="label-icon" /> Submissions Path
              </Form.Label>
              <Form.Control
                type="text"
                name="path"
                value={integrationConfig.firebase?.path || 'submissions'}
                onChange={handleConfigChange}
                placeholder="e.g., submissions, form-responses"
                className="modern-input"
              />
            </Form.Group>
          </div>
        );

      case 'mongodb':
        return (
          <div className="form-section">
            <div className="info-card">
              <p className="info-text">
                Provide your MongoDB connection details. This requires a backend proxy to securely handle the connection.
              </p>
            </div>
            <Form.Group className="modern-form-group">
              <Form.Label className="modern-label">
                <FaServer className="label-icon" /> Connection URI
              </Form.Label>
              <Form.Control
                type="text"
                name="uri"
                value={integrationConfig.mongodb?.uri || ''}
                onChange={handleConfigChange}
                placeholder="mongodb+srv://<user>:<password>@cluster.mongodb.net/..."
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="modern-form-group">
              <Form.Label className="modern-label">
                <FaDatabase className="label-icon" /> Database Name
              </Form.Label>
              <Form.Control
                type="text"
                name="database"
                value={integrationConfig.mongodb?.database || ''}
                onChange={handleConfigChange}
                placeholder="your-database-name"
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="modern-form-group">
              <Form.Label className="modern-label">
                <FaProjectDiagram className="label-icon" /> Collection Name
              </Form.Label>
              <Form.Control
                type="text"
                name="collection"
                value={integrationConfig.mongodb?.collection || ''}
                onChange={handleConfigChange}
                placeholder="your-collection-name"
                className="modern-input"
              />
            </Form.Group>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg" className="ultra-modern-modal">
      <Modal.Header closeButton className="modern-header">
        <Modal.Title className="modern-title">
          <span className="title-icon">🔗</span>
          Configure Data Integration
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="modern-body">
        <Tab.Container activeKey={activeTab} onSelect={handleTypeChange}>
          <Nav variant="pills" className="modern-tabs">
            <Nav.Item>
              <Nav.Link eventKey="webhook" className="modern-tab">
                <FaServer className="tab-icon" />
                <span className="tab-label">Webhook</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="firebase" className="modern-tab">
                <FaDatabase className="tab-icon" />
                <span className="tab-label">Firebase</span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="mongodb" className="modern-tab">
                <FaDatabase className="tab-icon" />
                <span className="tab-label">MongoDB</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content className="tab-content-modern">
            <Tab.Pane eventKey={activeTab}>
              {renderForm()}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer className="modern-footer">
        <Button variant="outline-secondary" onClick={onHide} className="modern-btn-secondary">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (activeTab === 'firebase') {
              const apiKey = integrationConfig.firebase?.apiKey || '';
              const databaseURL = integrationConfig.firebase?.databaseURL || '';
              setDbUrl(databaseURL);
              setApiKey(apiKey);
              setIntegrationConfig(prev => ({
                ...prev,
                firebase: {
                  ...(prev.firebase || {}),
                  apiKey,
                  databaseURL,
                  path: prev.firebase?.path || 'submissions',
                }
              }));
            }
            onHide();
          }}
          className="modern-btn-primary"
        >
          Save Configuration
        </Button>
      </Modal.Footer>

      <style>{`
        .ultra-modern-modal .modal-content {
          border: none;
          border-radius: 24px;
          box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%, 
            rgba(248, 250, 252, 0.95) 100%);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        .modern-header {
          padding: 2rem 2rem 1rem;
          background: transparent;
          border: none;
          position: relative;
        }

        .modern-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(59, 130, 246, 0.3) 50%, 
            transparent 100%);
        }

        .modern-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }

        .title-icon {
          font-size: 1.75rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .modern-body {
          padding: 0 2rem 1rem;
        }

        .modern-tabs {
          display: flex;
          gap: 8px;
          background: rgba(241, 245, 249, 0.6);
          padding: 8px;
          border-radius: 16px;
          margin-bottom: 2rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .modern-tab {
          border-radius: 12px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
          justify-content: center;
          position: relative;
        }

        .modern-tab:hover {
          background: rgba(255, 255, 255, 0.8);
          color: #475569;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .modern-tab.active {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          box-shadow: 
            0 8px 25px rgba(30, 41, 59, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .modern-tab.active::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.2) 0%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.1) 100%);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }

        .tab-icon {
          font-size: 0.875rem;
        }

        .tab-label {
          font-size: 0.875rem;
        }

        .tab-content-modern {
          animation: slideUp 0.3s ease-out;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-card {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.05) 0%, 
            rgba(147, 197, 253, 0.05) 100%);
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 16px;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
        }

        .info-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
        }

        .info-text {
          margin: 0;
          color: #475569;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .modern-form-group {
          margin-bottom: 0;
        }

        .modern-label {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .label-icon {
          color: #64748b;
          font-size: 0.875rem;
        }

        .modern-input {
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          padding: 12px 16px;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #334155;
        }

        .modern-input::placeholder {
          color: #94a3b8;
        }

        .modern-input:focus {
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 3px rgba(59, 130, 246, 0.1),
            0 4px 12px rgba(0, 0, 0, 0.05);
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.95);
          outline: none;
        }

        .modern-help-text {
          color: #64748b;
          font-size: 0.8rem;
          margin-top: 6px;
          margin-bottom: 0;
        }

        .modern-footer {
          padding: 1rem 2rem 2rem;
          border: none;
          background: transparent;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .modern-btn-secondary {
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 500;
          border: 1.5px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.8);
          color: #64748b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modern-btn-secondary:hover {
          background: rgba(248, 250, 252, 0.9);
          border-color: #cbd5e1;
          color: #475569;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .modern-btn-primary {
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
          border: none;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .modern-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.2) 0%, 
            transparent 50%, 
            rgba(255, 255, 255, 0.1) 100%);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
        }

        .modern-btn-primary:hover {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          transform: translateY(-2px);
          box-shadow: 
            0 8px 25px rgba(30, 41, 59, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .ultra-modern-modal .btn-close {
          background-size: 1rem;
          opacity: 0.6;
          transition: all 0.2s ease;
        }

        .ultra-modern-modal .btn-close:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .modern-header,
          .modern-body,
          .modern-footer {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }

          .modern-tabs {
            flex-direction: column;
            gap: 6px;
          }

          .modern-tab {
            min-width: auto;
          }

          .modern-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </Modal>
  );
}