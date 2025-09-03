import React from 'react';
import { Card, Button, Accordion, Form, Nav, Col } from 'react-bootstrap';

export default function Sidebar({
  defaultComponents,
  formStyle,
  history,
  redoStack,
  undo,
  redo,
  setShowStyleModal,
  exportAsHTML,
  exportAsJSON,
  importFromJSON,
  handleInsertToEditor,
  setCodeType,
  setCodeContent,
  setShowCodeModal,
  generatePlainHTML,
  generateJSONSchema,
  generateReactJSX,
  setShowHistoryModal,
  setShowAnalyticsModal,
  downloadPDF,
  setShowGitModal,
  formTemplates,
  customTemplates,
  loadTemplate,
  newTemplateName,
  setNewTemplateName,
  saveCustomTemplate
}) {
  return (
    <Card style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '16px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }}>
      <Card.Body className="p-0">
        <Col xs={12} md={4} lg={3} style={{ padding: '16px' }}>
          <Card
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}
          >
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="builder">🛠 Builder</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="preview">👀 Preview</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="dashboard">📊 Dashboard</Nav.Link>
                </Nav.Item>
              </Nav>
              <hr style={{ borderColor: '#ddd' }} />
              <h6 style={{ fontWeight: 600, color: '#333' }}>🧩 Components</h6>
              <Accordion defaultActiveKey="0" className="mb-3">
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
                              className="w-100 text-start mb-2"
                              variant="outline-primary"
                              size="sm"
                              draggable
                              onDragStart={(e) =>
                                e.dataTransfer.setData('component/type', comp.type)
                              }
                              style={{
                                fontSize: '0.85rem',
                                background: 'white',
                                color: '#333',
                                border: `1px solid ${formStyle.primaryColor}`,
                                transition: 'transform 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.375rem'
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.transform = 'translateY(-2px)')
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.transform = 'translateY(0)')
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
              <hr style={{ borderColor: '#ddd' }} />
              <h6 style={{ fontWeight: 600, color: '#333' }}>🎨 Actions</h6>
              <div className="d-grid gap-2 mb-3">
                <Button size="sm" onClick={undo} disabled={!history.length}>
                  🔄 Undo
                </Button>
                <Button size="sm" onClick={redo} disabled={!redoStack.length}>
                  🔁 Redo
                </Button>
                <Button size="sm" onClick={() => setShowStyleModal(true)}>
                  🎨 Form Style
                </Button>
                <Button size="sm" onClick={exportAsHTML}>⬇️ Export HTML</Button>
                <Button size="sm" onClick={exportAsJSON}>📑 Export JSON</Button>
                <label className="btn btn-sm w-100 mb-0">
                  📁 Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={importFromJSON}
                    style={{ display: 'none' }}
                  />
                </label>
                <Button size="sm" onClick={handleInsertToEditor}>
                  📥 Insert to Editor
                </Button>
                <Button
                  size="sm"
                  variant="outline-dark"
                  onClick={() => {
                    setCodeType('html');
                    setCodeContent(generatePlainHTML());
                    setShowCodeModal(true);
                  }}
                  style={{
                    background: 'white',
                    color: '#333',
                    border: `1px solid ${formStyle.primaryColor}`,
                    fontWeight: 500,
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => (e.target.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.target.style.transform = 'translateY(0)')}
                >
                  🖋️ View Generated Code
                </Button>
                <Button size="sm" onClick={() => setShowHistoryModal(true)}>
                  🕒 History
                </Button>
                <Button size="sm" onClick={() => setShowAnalyticsModal(true)}>
                  📊 Analytics & Submissions
                </Button>

                <Button size="sm" onClick={downloadPDF}>📄 PDF</Button>
                <Button size="sm" onClick={() => setShowGitModal(true)}>
                  🔀 Git
                </Button>


              </div>
              <hr style={{ borderColor: '#ddd' }} />
              <h6 style={{ fontWeight: 600, color: '#333' }}>📋 Templates</h6>
              <div className="d-grid gap-1 mb-2">
                {Object.entries(formTemplates).map(([key, tpl]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="outline-info"
                    onClick={() => loadTemplate(key, false)}
                  >
                    {tpl.name}
                  </Button>
                ))}
                {Object.entries(customTemplates).map(([key, tpl]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="outline-success"
                    onClick={() => loadTemplate(key, true)}
                  >
                    {tpl.name} (Custom)
                  </Button>
                ))}
              </div>
              <Form className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="New template name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  size="sm"
                />
                <Button size="sm" className="mt-1 w-100" onClick={saveCustomTemplate}>
                  💾 Save Template
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Card.Body>
    </Card>
  );
}