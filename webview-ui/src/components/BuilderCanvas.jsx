import React, { useState, useRef, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Card, Button } from 'react-bootstrap';

import { RiGeminiFill } from "react-icons/ri";

function BuilderCanvas(props) {
  const {
    formStyle,
    currentStep,
    totalSteps,
    setCurrentStep,
    handleDrop,
    renderStepFields,
    handleAddField, // new prop for adding full field objects
    handleAddFields // batch add fields (Gemini/AI)
  } = props;
  const [dropAnim, setDropAnim] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [geminiPrompt, setGeminiPrompt] = useState('Explain how AI works in a few words');
  const [loadingGemini, setLoadingGemini] = useState(false);
  // Chat history: {role: 'user'|'ai', text: string, code?: string}
  const [geminiChat, setGeminiChat] = useState(() => {
    const saved = localStorage.getItem('geminiChat');
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Set initial intro message
      return [{
        role: 'ai',
        text: 'Welcome to Gemini AI! I can help you with form building and answer any questions you have.',
        code: false
      }];
    }
  });
  const [typingIndex, setTypingIndex] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [stopGeneration, setStopGeneration] = useState(false);
  const chatContainerRef = useRef(null);

  // Save chat to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('geminiChat', JSON.stringify(geminiChat));
  }, [geminiChat]);

  // Start typing animation for intro message when component mounts
  useEffect(() => {
    if (geminiChat.length > 0 && typingIndex === null) {
      setTypingIndex(0);
      setWordIndex(0);
      setTypingText('');
      setTypingWord('');
    }
  }, []);
  const [typingText, setTypingText] = useState('');
  const [typingWord, setTypingWord] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const typingTimeout = useRef(null);
  const wordTimeout = useRef(null);

  const onDrop = e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (type) handleDrop(type);
    setDropAnim(true);
    setTimeout(() => setDropAnim(false), 600); // Match animation duration
  };

  // GPT-style typing effect
  useEffect(() => {
    if (typingIndex === null) return;
    const msg = geminiChat[typingIndex];
    if (!msg || msg.role !== 'ai') return;

    // Reset stop generation state
    setStopGeneration(false);

    // Reset states when starting new message
    if (wordIndex === 0) {
      setTypingText('');
      setTypingWord('');
    }

    // Handle differently for code blocks
    if (msg.code === true) {  // msg.code is a boolean flag, text content is in msg.text
      const lines = msg.text.split('\n');
      if (wordIndex < lines.length) {
        // Show all previous lines instantly
        const previousLines = lines.slice(0, wordIndex).join('\n');
        if (wordIndex === 0) {
          setTypingText(previousLines);
        }
        
        const line = lines[wordIndex];
        let charIndex = 0;
        
        const typeChar = () => {
          if (stopGeneration) {
            setTypingText(msg.text);
            setTypingWord('');
            setTypingIndex(null);
            return;
          }
          if (charIndex < line.length) {
            setTypingWord(prev => line.substring(0, charIndex + 1));
            charIndex++;
            typingTimeout.current = setTimeout(typeChar, 10); // Faster typing for code
          } else {
            const allPreviousLines = lines.slice(0, wordIndex + 1).join('\n');
            setTypingText(allPreviousLines);
            setTypingWord('');
            
            if (wordIndex + 1 < lines.length) {
              wordTimeout.current = setTimeout(() => {
                setWordIndex(prev => prev + 1);
              }, 100); // Pause between lines
            } else {
              setTimeout(() => {
                setTypingIndex(null);
                setWordIndex(0);
              }, 100);
            }
          }
        };
        
        typeChar();
        return;
      }
    }

    // Handle regular text
    const words = msg.text.split(/(\s+)/); // Split by whitespace but keep separators
    
    if (wordIndex < words.length) {
      // Show all previous words instantly
      const previousWords = words.slice(0, wordIndex).join('');
      if (wordIndex === 0) {
        setTypingText(previousWords);
      }
      
      const word = words[wordIndex];
      let charIndex = 0;
      
      const typeChar = () => {
        if (stopGeneration) {
          setTypingText(msg.text);
          setTypingWord('');
          setTypingIndex(null);
          return;
        }
        if (charIndex < word.length) {
          setTypingWord(word.substring(0, charIndex + 1));
          charIndex++;
          typingTimeout.current = setTimeout(typeChar, 1); // Slightly slower for better readability
        } else {
          const allPreviousWords = words.slice(0, wordIndex + 1).join('');
          setTypingText(allPreviousWords);
          setTypingWord('');
          
          if (wordIndex + 1 < words.length) {
            const delay = word.match(/\s+/) ? 20 : 150; // Small pause for spaces, longer for words
            wordTimeout.current = setTimeout(() => {
              setWordIndex(prev => prev + 1);
            }, delay);
          } else {
            // Message complete
            setTimeout(() => {
              setTypingIndex(null);
              setWordIndex(0);
              setStopGeneration(false); // Reset stop generation when typing is complete
            }, 100);
          }
        }
      };
      
      typeChar();
    }

    return () => {
      clearTimeout(typingTimeout.current);
      clearTimeout(wordTimeout.current);
    };
  }, [typingIndex, wordIndex, geminiChat]);

  // Gemini API call with chat and code detection
  const askGemini = async () => {
    if (!geminiPrompt.trim()) return;
    setLoadingGemini(true);
    const userMessage = { role: 'user', text: geminiPrompt };
    const loadingMessage = { role: 'ai', text: 'Generating...', isLoading: true };
    setGeminiChat(chat => [loadingMessage, userMessage, ...chat]);
    try {
      const response = await fetch('http://localhost:4000/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [ { text: geminiPrompt } ] }
          ]
        })
      });
      const data = await response.json();
      let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
      let code = null;
      // Detect code block
      const codeMatch = aiText.match(/```([a-zA-Z]*)\n([\s\S]*?)```([\s\S]*)/);
      let afterCode = '';
      if (codeMatch) {
        code = codeMatch[2];
        afterCode = codeMatch[3].trim();
      }
      
      // Replace loading message with actual response
      setGeminiChat(chat => {
        const chatWithoutLoading = chat.filter(msg => !msg.isLoading);
        let messages = [];
        
        if (code) {
          // Add the code block directly without intro
          messages.push({ 
            role: 'ai', 
            text: code, 
            code: true, 
            insertableCode: code
          });
          // Add any text after the code if it exists
         
        } else {
          messages.push({ role: 'ai', text: aiText, code: false });
        }
        const newChat = [...messages, ...chatWithoutLoading];
        // Then start typing animation
        setTimeout(() => {
          setTypingIndex(0); // Always animate the first message
          setWordIndex(0);
          setTypingText('');
          setTypingWord('');
        }, 100);
        return newChat;
      });
    } catch (e) {
      const chatWithoutLoading = geminiChat.filter(msg => !msg.isLoading);
      setGeminiChat([
        { role: 'ai', text: 'Error: ' + e.message },
        ...chatWithoutLoading
      ]);
    }
    setLoadingGemini(false);
    setGeminiPrompt('');
  };

  // Insert code as a new field/component
  const insertGeminiCode = (codeToInsert) => {
    if (!codeToInsert) return;
    let field = null;
    let added = false;
    try {
      const parsed = JSON.parse(codeToInsert);
      // If it's an array of fields, add all at once if possible
      if (Array.isArray(parsed)) {
        if (handleAddFields) {
          handleAddFields(parsed);
        } else if (handleAddField) {
          parsed.forEach(f => handleAddField(f));
        } else {
          parsed.forEach(f => handleDrop(f.type || 'input'));
        }
        added = true;
      } else if (parsed.type) {
        if (handleAddField) handleAddField(parsed);
        else handleDrop(parsed.type);
        added = true;
      }
    } catch {
      // Try to parse as HTML form or HTML document
      const html = codeToInsert;
      let temp = document.createElement('div');
      temp.innerHTML = html;
      let form = temp.querySelector('form') || temp;
      // Parse inputs
      const inputs = form.querySelectorAll('input');
      const fieldsToAdd = [];
      inputs.forEach(input => {
        let type = input.getAttribute('type') || 'text';
        let label = '';
        if (input.id) {
          const labelEl = form.querySelector(`label[for="${input.id}"]`);
          if (labelEl) label = labelEl.textContent.trim();
        }
        if (!label) label = input.name || 'Input';
        let fieldType = 'input';
        if (type === 'email') fieldType = 'email';
        else if (type === 'password') fieldType = 'password';
        else if (type === 'submit' || type === 'button') return; // skip buttons
        const fieldObj = {
          type: fieldType,
          label,
          required: input.required || false,
          placeholder: input.placeholder || ''
        };
        fieldsToAdd.push(fieldObj);
        added = true;
      });
      // Parse textareas
      const textareas = form.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        let label = '';
        if (textarea.id) {
          const labelEl = form.querySelector(`label[for="${textarea.id}"]`);
          if (labelEl) label = labelEl.textContent.trim();
        }
        if (!label) label = textarea.name || 'Textarea';
        const fieldObj = {
          type: 'textarea',
          label,
          required: textarea.required || false,
          placeholder: textarea.placeholder || ''
        };
        fieldsToAdd.push(fieldObj);
        added = true;
      });
      // If we found fields, batch add if possible
      if (fieldsToAdd.length > 0) {
        if (handleAddFields) {
          handleAddFields(fieldsToAdd);
        } else if (handleAddField) {
          fieldsToAdd.forEach(f => handleAddField(f));
        } else {
          fieldsToAdd.forEach(f => handleDrop(f.type || 'input'));
        }
      } else {
        // fallback: add as textarea with code as label if nothing added
        field = {
          type: 'textarea',
          label: 'Gemini Code',
          placeholder: codeToInsert,
          required: false
        };
        if (handleAddField) handleAddField(field);
        else handleDrop(field.type || 'textarea');
      }
    }
    setShowGemini(false);
  };

  return (
    <Card
      style={{
        flex: 1,
        margin: '16px',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        minHeight: 500
      }}
    >
      <Card.Body className="p-0">
        <div className="d-flex justify-content-between align-items-center p-3" style={{ background: '#333333ff' }}>
          <span className="text-white fw-bold" style={{ fontSize: '1.25rem' }}>📝 Builder</span>
          <Button variant={showGemini ? "secondary" : "light"} size="sm" onClick={() => setShowGemini(v => !v)} title="Toggle Gemini AI" style={{ borderRadius: '12px',background: 'rgb(255 255 255 / 0%)',border: 'none', padding: '0.5rem 1rem' }}>
           <img style={{ width: '45px', height: '45px', marginRight: '8px' }} src="https://static.vecteezy.com/system/resources/previews/055/687/063/non_2x/circle-gemini-google-icon-symbol-logo-free-png.png" alt="Gemini AI" />
          </Button>
        </div>
        <div style={{ display: 'flex', width: '100%', minHeight: 400 }}>
          {/* Main builder area */}
          <div style={{ 
            width: showGemini ? '65%' : '100%',
            transition: 'width 0.3s ease',
            padding: 24,
            background: '#f8f9fa',
            minHeight: '500px',
            overflow: 'auto',
            borderRadius: '15px',
            border: '1px dashed #ced4da',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}
            className={`drop-anim-zone${dropAnim ? ' drop-anim-active' : ''}`}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
          >
            {renderStepFields()}
            <div className="text-center text-muted" style={{ marginTop: 32, padding: '20px', borderRadius: '10px', background: '#e9ecef', border: '1px solid #dee2e6' }}>
              <small style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#495057' }}>Drag components here to build your form!</small>
            </div>
          </div>
          {/* Gemini split panel */}
          {showGemini && (
            <div style={{ 
              width: '35%',
              minWidth: 400,
              maxWidth: 480,
              borderLeft: '1px solid rgba(0,0,0,0.1)', 
              background: '#ffffff', 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
              zIndex: 1000
            }}>
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid rgba(0,0,0,0.08)', 
                background: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: 20, 
                    background: 'linear-gradient(45deg, #4285f4, #0f9d58)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600 
                  }}>Gemini</span>
                   <img style={{ width: '45px', height: '45px', marginRight: '8px' }} src="https://static.vecteezy.com/system/resources/previews/055/687/063/non_2x/circle-gemini-google-icon-symbol-logo-free-png.png" alt="Gemini AI" />
                </div>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setShowGemini(false)} 
                  title="Close Gemini"
                  style={{ 
                    color: '#666', 
                    textDecoration: 'none', 
                    padding: '4px 8px',
                    transition: 'all 0.2s'
                  }}
                >✖</Button>
              </div>
              <div 
                ref={chatContainerRef}
                onScroll={(e) => {
                  const { scrollTop, scrollHeight, clientHeight } = e.target;
                  setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
                }}
                style={{ 
                  padding: '20px', 
                  flex: 1, 
                  overflowY: 'auto',
                  background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)',
                  scrollBehavior: 'smooth'
                }}>
                {showScrollButton && (
                  <Button
                    onClick={() => chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' })}
                    style={{
                      position: 'fixed',
                      right: '60px',
                      bottom: '100px',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#4285f4',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      zIndex: 1000
                    }}
                  >
                    ↓
                  </Button>
                )}
                <div style={{ 
                  marginBottom: 16,
                  position: 'sticky',
                  bottom: 0,
                  background: '#fff',
                  padding: '12px',
                  borderRadius: '12px',
                  boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <input
                      type="text"
                      value={geminiPrompt}
                      onChange={e => setGeminiPrompt(e.target.value)}
                      placeholder="Ask Gemini anything..."
                      style={{ 
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        backgroundColor: '#f8f9fa',
                        outline: 'none'
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') askGemini(); }}
                      disabled={loadingGemini}
                    />
                    <Button
                      variant={loadingGemini ? "secondary" : "primary"}
                      style={{ 
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        background: loadingGemini ? '#9aa0a6' : 'linear-gradient(45deg, #6a11cb, #2575fc)',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                      }}
                      onClick={askGemini}
                      disabled={loadingGemini || !geminiPrompt.trim()}
                    >
                      {loadingGemini ? '...' : '→'}
                    </Button>
                  </div>
                </div>
                <div style={{ 
                  minHeight: 40, 
                  borderRadius: 12,
                  marginBottom: 60
                }}>
                  {geminiChat.length === 0 && typingIndex === null && (
                    <div style={{
                      textAlign: 'center',
                      color: '#666',
                      padding: '40px 20px',
                      background: 'rgba(0,0,0,0.02)',
                      borderRadius: 12,
                      fontSize: 14
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>👋</div>
                      Loading...
                    </div>
                  )}
                  {typingIndex !== null && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setStopGeneration(true)}
                      style={{
                        position: 'fixed',
                        right: '60px',
                        bottom: '160px',
                        borderRadius: '12px',
                        padding: '8px 16px',
                        background: '#dc3545',
                        border: 'none',
                        color: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000
                      }}
                    >
                      Stop Generating
                    </Button>
                  )}
                  {geminiChat.map((msg, i) => (
                    <div key={i} style={{
                      margin: '16px 0',
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      position: 'relative',
                      opacity: msg.isLoading ? 0.7 : 1,
                    }}>
                      {msg.role === 'ai' && (
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          
                          position: 'absolute',
                          left: -8,
                          top: -2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 600
                        }}>   <img style={{ width: '30px', height: '30px', marginRight: '8px' }} src="https://static.vecteezy.com/system/resources/previews/055/687/063/non_2x/circle-gemini-google-icon-symbol-logo-free-png.png" alt="Gemini AI" /></div>
                      )}
                      <div style={{
                        display: 'inline-block',
                                                background: msg.role === 'user' 
                          ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
                          : 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                        color: msg.role === 'user' ? '#fff' : '#333',
                        animation: msg.isLoading ? 'pulse 1.5s infinite' : 'none',
                        borderRadius: '20px',
                        borderBottomLeftRadius: msg.role === 'user' ? '20px' : '2px',
                        borderBottomRightRadius: msg.role === 'ai' ? '20px' : '2px',
                        padding: '12px 18px',
                        maxWidth: '85%',
                        fontFamily: msg.code ? 'monospace' : 'inherit',
                        whiteSpace: msg.code ? 'pre' : 'normal',
                        boxShadow: msg.role === 'user' 
                          ? '0 4px 15px rgba(0,0,0,0.15)'
                          : '0 4px 15px rgba(0,0,0,0.08)',
                        marginLeft: msg.role === 'ai' ? '20px' : '0',
                        border: msg.code ? '1px solid rgba(0,0,0,0.1)' : 'none',
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {msg.code ? (
                          <div className="code-block">
                            <div style={{ 
                              color: '#6c757d', 
                              fontSize: 12, 
                              marginBottom: 4,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span>Code</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {msg.insertableCode && (
                                  <Button 
                                    size="sm" 
                                    variant="link" 
                                    onClick={() => insertGeminiCode(msg.insertableCode)}
                                    style={{ padding: '2px 8px', fontSize: 7 }}
                                  >
                                    Insert as field →
                                  </Button>
                                )}
                                {msg.text && (
                                  <Button 
                                    size="sm" 
                                    variant="link" 
                                    onClick={() => window.vscode?.postMessage({ 
                                      command: 'insertCode',
                                      code: msg.text
                                    })}
                                    style={{ padding: '2px 8px', fontSize: 7 }}
                                  >
                                    Insert in VS Code →
                                  </Button>
                                )}
                              </div>
                            </div>
                            <pre style={{ 
                              margin: 0, 
                              position: 'relative',
                              background: '#f6f8fa',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(0,0,0,0.1)',
                              overflow: 'auto'
                            }}>
                              {typingIndex === i ? (
                                <>
                                  {typingText}
                                  <span style={{ color: '#2d7c32' }}>{typingWord}</span>
                                  <span className="code-cursor"></span>
                                </>
                              ) : (
                                msg.text
                              )}
                            </pre>
                          </div>
                        ) : (
                          typingIndex === i ? (
                            <span>
                              {typingText}
                              <span style={{ color: msg.role === 'ai' ? '#2d7c32' : '#1a73e8' }}>{typingWord}</span>
                              <span className="cursor"></span>
                            </span>
                          ) : (
                            msg.text
                          )
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <style>{`
                    .cursor, .code-cursor {
                      display: inline-block;
                      width: 2px;
                      margin-left: 4px;
                      vertical-align: middle;
                      animation: cursor-blink 1s infinite;
                    }
                    .cursor {
                      height: 16px;
                      background: currentColor;
                    }
                    .code-cursor {
                      height: 14px;
                      background: #2d7c32;
                      opacity: 0.8;
                    }
                    @keyframes cursor-blink {
                      0%, 100% { opacity: 0; }
                      50% { opacity: 1; }
                    }
                    .code-block {
                      margin: -4px -8px;
                      padding: 8px;
                      background: white;
                      border-radius: 12px;
                    }
                    .code-block pre {
                      font-size: 13px;
                      line-height: 1.4;
                      tab-size: 2;
                      white-space: pre-wrap;
                      word-break: break-word;
                      color: #333;
                    }
                    .code-block pre::-webkit-scrollbar {
                      width: 6px;
                      height: 6px;
                    }
                    .code-block pre::-webkit-scrollbar-thumb {
                      background: rgba(0,0,0,0.2);
                      border-radius: 3px;
                    }
                    .code-block pre::-webkit-scrollbar-track {
                      background: rgba(0,0,0,0.05);
                      border-radius: 3px;
                    }
                    @keyframes pulse {
                      0% { opacity: 0.6; }
                      50% { opacity: 0.9; }
                      100% { opacity: 0.6; }
                    }
                    @keyframes drop-zone-pulse {
                      0% { box-shadow: 0 0 15px rgba(106, 17, 203, 0.2); border-color: #ced4da; }
                      50% { box-shadow: 0 0 25px rgba(106, 17, 203, 0.5); border-color: #6a11cb; }
                      100% { box-shadow: 0 0 15px rgba(106, 17, 203, 0.2); border-color: #ced4da; }
                    }
                    .drop-anim-zone {
                      transition: all 0.3s ease-in-out;
                    }
                    .drop-anim-zone.drop-anim-active {
                      transform: scale(1.01);
                      animation: drop-zone-pulse 1.5s infinite alternate;
                    }
                  `}</style>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
export default BuilderCanvas;
