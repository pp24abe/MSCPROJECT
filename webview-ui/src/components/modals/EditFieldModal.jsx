import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

export default function EditFieldModal({ show, field, onSave, onHide, steps = [1] }) {
  const [localField, setLocalField] = useState(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  if (!show || !field || !localField) return null;

  const handleChange = (key, value) => {
    setLocalField(f => ({ ...f, [key]: value }));
  };

  const handleCustomStyleChange = (key, value) => {
    setLocalField(f => ({
      ...f,
      customStyle: { ...f.customStyle, [key]: value }
    }));
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton style={{ background: '#2196f3', color: '#fff' }}>
        <Modal.Title>
          <span role="img" aria-label="edit">📝</span> Edit Field
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            {/* Field Properties */}
            <Col md={6}>
              <h6 className="mb-3">Field Properties</h6>
              <Form.Group className="mb-2">
                <Form.Label>Label</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.label || ''}
                  onChange={e => handleChange('label', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Placeholder</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.placeholder || ''}
                  onChange={e => handleChange('placeholder', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Icon Class (e.g. "fas fa-user")</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.iconClass || ''}
                  onChange={e => handleChange('iconClass', e.target.value)}
                  placeholder="Leave blank for no icon"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Step</Form.Label>
                <Form.Select
                  value={localField.step || 1}
                  onChange={e => handleChange('step', Number(e.target.value))}
                >
                  {steps.map(step => (
                    <option key={step} value={step}>Step {step}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  label="Required"
                  checked={!!localField.required}
                  onChange={e => handleChange('required', e.target.checked)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Min Length</Form.Label>
                <Form.Control
                  type="number"
                  value={localField.minLength || ''}
                  onChange={e => handleChange('minLength', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Max Length</Form.Label>
                <Form.Control
                  type="number"
                  value={localField.maxLength || ''}
                  onChange={e => handleChange('maxLength', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Pattern (Regex)</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.pattern || ''}
                  onChange={e => handleChange('pattern', e.target.value)}
                  placeholder="e.g. [0-9]{3}-[0-9]{3}-[0-9]{4} for phone"
                />
              </Form.Group>
              {(localField.type === 'select' || localField.type === 'radio') && (
                <Form.Group className="mb-2">
                  <Form.Label>Options (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={localField.options || ''}
                    onChange={e => handleChange('options', e.target.value)}
                  />
                </Form.Group>
              )}
            </Col>

            {/* Style Properties */}
            <Col md={6}>
              <h6 className="mb-3">Style Properties</h6>
              <Form.Group className="mb-2">
                <Form.Label>Background Color</Form.Label>
                <Form.Control
                  type="color"
                  value={localField.customStyle?.backgroundColor || '#ffffff'}
                  onChange={e => handleCustomStyleChange('backgroundColor', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Text Color</Form.Label>
                <Form.Control
                  type="color"
                  value={localField.customStyle?.textColor || '#000000'}
                  onChange={e => handleCustomStyleChange('textColor', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Border Color</Form.Label>
                <Form.Control
                  type="color"
                  value={localField.customStyle?.borderColor || '#ced4da'}
                  onChange={e => handleCustomStyleChange('borderColor', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Border Width</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.customStyle?.borderWidth || '1px'}
                  onChange={e => handleCustomStyleChange('borderWidth', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Border Style</Form.Label>
                <Form.Select
                  value={localField.customStyle?.borderStyle || 'solid'}
                  onChange={e => handleCustomStyleChange('borderStyle', e.target.value)}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                  <option value="groove">Groove</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Font Size</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.customStyle?.fontSize || '1rem'}
                  onChange={e => handleCustomStyleChange('fontSize', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Padding</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.customStyle?.padding || '0.375rem 0.75rem'}
                  onChange={e => handleCustomStyleChange('padding', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Border Radius</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.customStyle?.borderRadius || '4px'}
                  onChange={e => handleCustomStyleChange('borderRadius', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Bottom Margin</Form.Label>
                <Form.Control
                  type="text"
                  value={localField.customStyle?.marginBottom || '1rem'}
                  onChange={e => handleCustomStyleChange('marginBottom', e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Font Family</Form.Label>
                <Form.Select
                  value={localField.customStyle?.fontFamily || 'Arial'}
                  onChange={e => handleCustomStyleChange('fontFamily', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button
          variant="primary"
          onClick={() => onSave(localField)}
        >Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
}