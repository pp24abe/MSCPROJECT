
import React, { useState } from 'react';
import { Container,Row,Col } from 'react-bootstrap';

export default function FormBuilder(){
    const [formElements, setFormElements] = useState([]);

    const handleAddField = () => {
        const newField = {
            id: Date.now(),
            label: 'New Field',
            type: 'text',
        };
        setFormElements([...formElements, newField]);
    }

    return(
        <Container fluid>
      <Row>
        <Col xs={3}>
          <button className="btn btn-primary w-100" onClick={handleAddField}>
            ➕ Add Field
          </button>
        </Col>
        <Col xs={9}>
          <h3>Form Canvas</h3>
          {formElements.map(field => (
            <div key={field.id}>
              <label>{field.label}</label>
              <input type="text" className="form-control mb-3" />
            </div>
          ))}
        </Col>
      </Row>
    </Container>
    )
}