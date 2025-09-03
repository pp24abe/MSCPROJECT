import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function StyleModal({ show, onHide, formStyle, setFormStyle, themePresets }) {
  // ----- defaults -----
  const defaultStyle = useMemo(() => ({
    backgroundColor: '#ffffff',
    textColor: '#111827',
    primaryColor: '#3b82f6',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    googleFontURL: '',
    borderRadius: '6px',
    spacing: '16px',
    maxWidth: '600px',
    customCSS: '',
    iconLibraryURL: ''
  }), []);

  // util: simple deep equality for our flat object
  const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // local state
  const [localStyle, setLocalStyle] = useState({ ...defaultStyle, ...(formStyle || {}) });

  // Resync ONLY when opening OR when parent style truly changed
  useEffect(() => {
    if (!show) return;
    const merged = { ...defaultStyle, ...(formStyle || {}) };
    if (!isEqual(localStyle, merged)) {
      setLocalStyle(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, formStyle, defaultStyle]); // ok to depend; guarded by isEqual

  // ---------- Debounced upstream push (only from user events) ----------
  const DEBOUNCE_MS = 200;
  const debounceRef = useRef(null);
  useEffect(() => () => debounceRef.current && clearTimeout(debounceRef.current), []);

  const pushUpstreamDebounced = (next) => {
    if (!show) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFormStyle(prev => {
        const merged = { ...defaultStyle, ...prev, ...next };
        return merged;
      });
    }, DEBOUNCE_MS);
  };

  const pushUpstreamImmediate = (next) => {
    if (!show) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFormStyle(prev => ({ ...defaultStyle, ...prev, ...next }));
  };

  // update local; choose debounce vs immediate
  const handleChange = (key, value, { immediate = false } = {}) => {
    setLocalStyle(s => {
      const next = { ...s, [key]: value };
      immediate ? pushUpstreamImmediate(next) : pushUpstreamDebounced(next);
      return next;
    });
  };

  // Presets: apply immediately
  const handlePreset = (preset) => {
    const chosen = themePresets?.[preset] || {};
    setLocalStyle(s => {
      const next = { ...s, ...JSON.parse(JSON.stringify(chosen)) };
      pushUpstreamImmediate(next);
      return next;
    });
  };

  const Tip = ({ children, text }) => (
    <OverlayTrigger 
      placement="top" 
      overlay={
        <Tooltip style={{
          background: '#1f2937',
          color: '#f9fafb',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          padding: '6px 10px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          {text}
        </Tooltip>
      }
    >
      <span className="d-inline-block">{children}</span>
    </OverlayTrigger>
  );

  const colorInputStyle = {
    height: '40px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '4px'
  };

  const inputStyle = {
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '14px',
    background: '#ffffff',
    color: '#111827',
    outline: 'none',
    boxShadow: 'none',
    transition: 'border-color 0.15s ease'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
    display: 'block'
  };

  const sectionStyle = {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const presetColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ];

  // ---------- suggestions (datalists) ----------
  const fontFamilyOptions = [
    'Inter, system-ui, sans-serif',
    'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    'Roboto, system-ui, sans-serif',
    'Poppins, system-ui, sans-serif',
    'Lato, system-ui, sans-serif',
    'Montserrat, system-ui, sans-serif',
    'Source Sans Pro, system-ui, sans-serif',
    'Open Sans, system-ui, sans-serif',
    'Nunito, system-ui, sans-serif',
    'IBM Plex Sans, system-ui, sans-serif'
  ];
  const fontSizeOptions = ['12px', '14px', '16px', '18px', '20px'];
  const radiusOptions   = ['4px', '6px', '8px', '10px', '12px', '16px'];
  const spacingOptions  = ['8px', '12px', '16px', '20px', '24px', '28px', '32px'];
  const widthOptions    = ['480px', '560px', '600px', '640px', '720px', '800px', '100%'];

  // helpers for text inputs
  const onText = (key) => (e) => handleChange(key, e.target.value); // debounced
  const onTextImmediate = (key) => (e) => handleChange(key, e.target.value, { immediate: true });

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      centered
      style={{ '--bs-modal-border-radius': '8px' }}
    >
      <Modal.Header
        closeButton
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          borderRadius: '8px 8px 0 0',
          padding: '20px 24px'
        }}
      >
        <Modal.Title className="w-100 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: '32px',
              height: '32px',
              background: '#f3f4f6',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🎨
            </div>
            <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              Form Styling
            </span>
          </div>
          <Badge style={{
            background: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            Customization
          </Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{ background: '#ffffff', padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        {/* Theme Presets */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span>🎭</span>
            <span>Theme Presets</span>
          </div>
          
          <Form.Label style={labelStyle}>Quick Theme Selection</Form.Label>
          <Form.Select 
            onChange={e => handlePreset(e.target.value)} 
            defaultValue=""
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="" disabled>Choose a preset theme...</option>
            {Object.keys(themePresets || {}).map(preset => (
              <option key={preset} value={preset}>
                {preset.charAt(0).toUpperCase() + preset.slice(1).replace(/([A-Z])/g, ' $1')}
              </option>
            ))}
          </Form.Select>
        </div>

        {/* Colors */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span>🌈</span>
            <span>Colors</span>
          </div>
          
          <Row>
            <Col md={4} className="mb-3">
              <Form.Label style={labelStyle}>Background Color</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="color"
                  value={localStyle.backgroundColor || '#ffffff'}
                  onChange={e => handleChange('backgroundColor', e.target.value, { immediate: true })}
                  style={colorInputStyle}
                />
                <Form.Control
                  type="text"
                  value={localStyle.backgroundColor || ''}
                  onChange={onText('backgroundColor')}
                  onBlur={onTextImmediate('backgroundColor')}
                  style={{ ...inputStyle, flex: 1, fontSize: '12px' }}
                  placeholder="#ffffff"
                />
              </div>
            </Col>
            
            <Col md={4} className="mb-3">
              <Form.Label style={labelStyle}>Text Color</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="color"
                  value={localStyle.textColor || '#111827'}
                  onChange={e => handleChange('textColor', e.target.value, { immediate: true })}
                  style={colorInputStyle}
                />
                <Form.Control
                  type="text"
                  value={localStyle.textColor || ''}
                  onChange={onText('textColor')}
                  onBlur={onTextImmediate('textColor')}
                  style={{ ...inputStyle, flex: 1, fontSize: '12px' }}
                  placeholder="#000000"
                />
              </div>
            </Col>
            
            <Col md={4} className="mb-3">
              <Form.Label style={labelStyle}>Primary Color</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="color"
                  value={localStyle.primaryColor || '#3b82f6'}
                  onChange={e => handleChange('primaryColor', e.target.value, { immediate: true })}
                  style={colorInputStyle}
                />
                <Form.Control
                  type="text"
                  value={localStyle.primaryColor || ''}
                  onChange={onText('primaryColor')}
                  onBlur={onTextImmediate('primaryColor')}
                  style={{ ...inputStyle, flex: 1, fontSize: '12px' }}
                  placeholder="#3b82f6"
                />
              </div>
            </Col>
          </Row>

          <Form.Label style={labelStyle}>Quick Colors</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {presetColors.map(color => (
              <Tip key={color} text={`Use ${color}`}>
                <div
                  onClick={() => handleChange('primaryColor', color, { immediate: true })}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: color,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: localStyle.primaryColor === color ? '3px solid #111827' : '2px solid #e5e7eb',
                    transition: 'all 0.15s ease'
                  }}
                />
              </Tip>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span>✏️</span>
            <span>Typography</span>
          </div>
          
          <Row>
            <Col md={8} className="mb-3">
              <Form.Label style={labelStyle}>Font Family</Form.Label>
              <Form.Control
                type="text"
                value={localStyle.fontFamily || ''}
                onChange={onText('fontFamily')}
                onBlur={onTextImmediate('fontFamily')}
                placeholder="Inter, system-ui, sans-serif"
                style={inputStyle}
                list="font-family-options"
                onKeyDown={(e) => { if (e.key === 'Enter') onTextImmediate('fontFamily')(e); }}
              />
              <datalist id="font-family-options">
                {fontFamilyOptions.map(f => <option key={f} value={f} />)}
              </datalist>
            </Col>
            
            <Col md={4} className="mb-3">
              <Form.Label style={labelStyle}>Font Size</Form.Label>
              <Form.Control
                type="text"
                value={localStyle.fontSize || ''}
                onChange={onText('fontSize')}
                onBlur={onTextImmediate('fontSize')}
                placeholder="14px"
                style={inputStyle}
                list="font-size-options"
                onKeyDown={(e) => { if (e.key === 'Enter') onTextImmediate('fontSize')(e); }}
              />
              <datalist id="font-size-options">
                {fontSizeOptions.map(s => <option key={s} value={s} />)}
              </datalist>
            </Col>
          </Row>

          <Form.Label style={labelStyle}>Google Font URL</Form.Label>
          <Form.Control
            type="text"
            value={localStyle.googleFontURL || ''}
            onChange={onText('googleFontURL')}
            onBlur={onTextImmediate('googleFontURL')}
            placeholder="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            style={inputStyle}
            className="mb-3"
          />
        </div>

        {/* Layout & Spacing */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span>📐</span>
            <span>Layout & Spacing</span>
          </div>
          
          <Row>
            <Col md={4} className="mb-3">
              <Form.Label style={labelStyle}>Border Radius</Form.Label>
              <Form.Control
                type="text"
                value={localStyle.borderRadius || ''}
                onChange={onText('borderRadius')}
                onBlur={onTextImmediate('borderRadius')}
                placeholder="6px"
                style={inputStyle}
                list="radius-options"
              />
              <datalist id="radius-options">
                {radiusOptions.map(s => <option key={s} value={s} />)}
              </datalist>
            </Col>
            
            <Col md={4} className="mb-3">
              <Form.Label style={labelStyle}>Spacing</Form.Label>
              <Form.Control
                type="text"
                value={localStyle.spacing || ''}
                onChange={onText('spacing')}
                onBlur={onTextImmediate('spacing')}
                placeholder="16px"
                style={inputStyle}
                list="spacing-options"
              />
              <datalist id="spacing-options">
                {spacingOptions.map(s => <option key={s} value={s} />)}
              </datalist>
            </Col>
            
            <Col md={4} className="mb-3">
              <Form.Label style={labelStyle}>Max Width</Form.Label>
              <Form.Control
                type="text"
                value={localStyle.maxWidth || ''}
                onChange={onText('maxWidth')}
                onBlur={onTextImmediate('maxWidth')}
                placeholder="600px"
                style={inputStyle}
                list="width-options"
              />
              <datalist id="width-options">
                {widthOptions.map(s => <option key={s} value={s} />)}
              </datalist>
            </Col>
          </Row>
        </div>

        {/* Advanced */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <span>⚡</span>
            <span>Advanced</span>
          </div>
          
          <Form.Label style={labelStyle}>Custom CSS</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={localStyle.customCSS || ''}
            onChange={onText('customCSS')}
            onBlur={onTextImmediate('customCSS')}
            placeholder="/* Add your custom CSS here */&#10;.my-form {&#10;  /* Custom styles */&#10;}"
            style={{
              ...inputStyle,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              resize: 'vertical'
            }}
            className="mb-3"
          />

          <Form.Label style={labelStyle}>Icon Library URL</Form.Label>
          <Form.Control
            type="text"
            value={localStyle.iconLibraryURL || ''}
            onChange={onText('iconLibraryURL')}
            onBlur={onTextImmediate('iconLibraryURL')}
            placeholder="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"
            style={inputStyle}
          />
        </div>
      </Modal.Body>

      <Modal.Footer
        style={{
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
          borderRadius: '0 0 8px 8px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
          💡 <strong>Tip:</strong> Changes preview in real-time after applying
        </div>
        
        <div className="d-flex gap-2">
          <Button 
            onClick={() => {
              setLocalStyle({ ...defaultStyle, ...(formStyle || {}) });
              onHide();
            }}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: '#ffffff',
              color: '#374151',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.15s ease'
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              pushUpstreamImmediate({ ...localStyle });
              onHide();
            }}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '6px',
              background: '#3b82f6',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.15s ease'
            }}
          >
            Apply Changes
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
