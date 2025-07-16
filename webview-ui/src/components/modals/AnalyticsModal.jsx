import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export default function AnalyticsModal({ show, onHide, submissions, computeCompletionRate, formElements = [] }) {
  const lastFive = submissions.slice(-5).reverse();
  const idToLabel = {};
  formElements.forEach(f => { idToLabel[f.id] = f.label; });

  const exportSubmissionsToCSV = async () => {

    const snapshot = await firebase.database().ref('submissions').once('value');
    const data = snapshot.val() || {};
    const submissionsArr = Object.values(data);

    if (!submissionsArr.length) return;
    const allFieldKeys = Array.from(
      new Set(
        submissionsArr.flatMap(sub => Object.keys(sub.data || {}))
      )
    );
    const idToLabel = {};
    formElements.forEach(f => { idToLabel[f.id] = f.label; });
    const headers = ['Timestamp', ...allFieldKeys.map(k => idToLabel[k] || k)];

    const rows = submissionsArr.map(sub => [
      sub.timestamp,
      ...allFieldKeys.map(k => JSON.stringify(sub.data[k] ?? ''))
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>📊 Analytics</Modal.Title>
        <Button
                    variant="outline-light"
                    size="sm"
                    style={{
                      background: 'rgb(0, 0, 0)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 500,
                      marginLeft: 'auto',
                      transition: 'transform 0.2s'
                    }}
                    onClick={exportSubmissionsToCSV}
                    disabled={!submissions.length}
                    onMouseEnter={e => (e.target.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
                  >
                    ⬇️ Export to CSV
                  </Button>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Total Submissions:</strong> {submissions.length}</p>
        <p><strong>Completion Rate:</strong> {computeCompletionRate()}%</p>
        <hr />
        <h6>Last 5 Submissions</h6>
        {lastFive.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <Table size="sm" bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>When</th>
                <th>Fields</th>
              </tr>
            </thead>
            <tbody>
              {lastFive.map((s, i) => (
                <tr key={i}>
                  <td>{lastFive.length - i}</td>
                  <td>{new Date(s.timestamp).toLocaleString()}</td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {Object.entries(s.data).map(([k, v]) => (
                        <li key={k}><strong>{idToLabel[k] || k}:</strong> {String(v)}</li>
                      ))}
                    </ul>
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
