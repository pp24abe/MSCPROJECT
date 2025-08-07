import React from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';

export default function GitModal({
  show, onHide,
  gitRemoteURL, setGitRemoteURL,
  repoExists, gitLog,
  initRepo, cloneRepo, commitAndPush, pullImport, clearGit,formStyle
}) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🔀 Git Integration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label>Remote Repo URL</Form.Label>
          <Form.Control
            type="text"
            value={gitRemoteURL}
            onChange={e => setGitRemoteURL(e.target.value)}
            placeholder="https://github.com/your/repo.git"
          />
        </Form.Group>
        <div className="mb-2">
          <Button size="sm" className="me-2" onClick={initRepo} disabled={repoExists}>Init Repo</Button>
          <Button size="sm" className="me-2" onClick={cloneRepo}>Clone</Button>
          <Button size="sm" className="me-2" onClick={commitAndPush} disabled={!repoExists}>Commit & Push</Button>
          <Button size="sm" className="me-2" onClick={pullImport} disabled={!repoExists}>Pull & Import</Button>
          <Button size="sm" variant="danger" onClick={clearGit}>Clear</Button>
        </div>
        <hr />
        <h6>Git Log</h6>
         {gitLog && (
              <div
                className="mt-3 p-2"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: `1px solid ${formStyle.primaryColor}`,
                  borderRadius: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                <pre style={{ fontSize: '0.8rem', color: '#333' }}>{gitLog}</pre>
              </div>
            )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
