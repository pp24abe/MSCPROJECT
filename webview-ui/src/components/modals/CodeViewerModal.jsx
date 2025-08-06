import React from 'react';
import { Modal, Button, Nav } from 'react-bootstrap';
import { FaCopy, FaCode } from 'react-icons/fa';

export default function CodeViewerModal({
  show,
  onHide,
  codeType,
  codeContent,
  setCodeType,
  onGenerate
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ background: '#2196f3', color: '#fff' }}>
        <Modal.Title>
          <FaCode className="me-2" />
          View Generated Code
        </Modal.Title>
        <Nav variant="tabs" activeKey={codeType} className="ms-4">
          <Nav.Item>
            <Nav.Link
              eventKey="html"
              onClick={() => { setCodeType('html'); onGenerate('html'); }}
              style={{ color: codeType === 'html' ? '#2196f3' : '#333' }}
            >
              HTML
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="json"
              onClick={() => { setCodeType('json'); onGenerate('json'); }}
              style={{ color: codeType === 'json' ? '#2196f3' : '#333' }}
            >
              JSON
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="react"
              onClick={() => { setCodeType('react'); onGenerate('react'); }}
              style={{ color: codeType === 'react' ? '#2196f3' : '#333' }}
            >
              React (JSX)
            </Nav.Link>
            </Nav.Item>
  <Nav.Item>
    <Nav.Link
      eventKey="vue"
      onClick={() => { setCodeType('vue'); onGenerate('vue'); }}
      style={{ color: codeType === 'vue' ? '#2196f3' : '#333' }}
    >
      Vue
    </Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link
      eventKey="angular"
      onClick={() => { setCodeType('angular'); onGenerate('angular'); }}
      style={{ color: codeType === 'angular' ? '#2196f3' : '#333' }}
    >
      Angular
    </Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link
      eventKey="python"
      onClick={() => { setCodeType('python'); onGenerate('python'); }}
      style={{ color: codeType === 'python' ? '#2196f3' : '#333' }}
    >
      Python
    </Nav.Link>
  </Nav.Item>
  <Nav.Item>
    <Nav.Link
      eventKey="php"
      onClick={() => { setCodeType('php'); onGenerate('php'); }}
      style={{ color: codeType === 'php' ? '#2196f3' : '#333' }}
    >
      PHP
    </Nav.Link>
  </Nav.Item>
</Nav>
        <Button
          variant="outline-primary"
          size="sm"
          className="ms-auto"
          onClick={handleCopy}
          title="Copy"
        >
          <FaCopy className="me-1" /> Copy
        </Button>
      </Modal.Header>
      <Modal.Body style={{ background: '#f8f9fa', padding: 0 }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '1rem',
            background: '#fff',
            borderRadius: '0 0 8px 8px',
            padding: '1.5rem',
            minHeight: 350,
            maxHeight: 500,
            overflow: 'auto',
            whiteSpace: 'pre',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
          }}
        >
          {codeContent}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}