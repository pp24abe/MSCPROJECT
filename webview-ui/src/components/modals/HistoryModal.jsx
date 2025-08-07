import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

export default function HistoryModal({ show, onHide, versionHistory, revertToVersion }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🕒 Version History</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {versionHistory.length === 0 ? (
          <p>No history yet.</p>
        ) : (
          <Table size="sm" bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {versionHistory.map((v, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{new Date(v.timestamp).toLocaleString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => revertToVersion(v.snapshot)}
                    >
                      Revert
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}