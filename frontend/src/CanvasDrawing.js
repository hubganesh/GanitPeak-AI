import React, { useRef, useState, useEffect } from 'react';
import './CanvasDrawing.css';

const CanvasDrawing = ({ isOpen, onClose, onDone }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Use the parent wrapper size on mobile, fallback to 800x500
      const wrapper = canvas.parentElement;
      const w = wrapper ? wrapper.clientWidth || 800 : 800;
      const h = wrapper ? wrapper.clientHeight || 500 : 500;

      canvas.width = w > 0 ? w : 800;
      canvas.height = h > 0 ? h : 500;
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height);
    }
  }, [isOpen]);

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    
    const gridSize = 20;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    if (tool === 'pen') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear and redraw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw grid
    drawGrid(ctx, canvas.width, canvas.height);
  };

  const handleDone = async () => {
    setIsAnalyzing(true);
    
    // Simulate OCR/handwriting analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
    
    setIsAnalyzing(false);
    onDone(imageData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="canvas-modal-overlay" onClick={onClose}>
      <div 
        className="canvas-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="canvas-modal-header">
          <h2 className="canvas-modal-title">Draw your math problem</h2>
          <button className="canvas-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="canvas-toolbar">
          <button 
            className={`canvas-tool-btn pen ${tool === 'pen' ? 'active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            🖊 Pen
          </button>
          <button 
            className={`canvas-tool-btn eraser ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            🧽 Eraser
          </button>
          <button 
            className="canvas-tool-btn clear"
            onClick={clearCanvas}
            title="Clear Canvas"
          >
            🗑 Clear
          </button>
          <button 
            className="canvas-tool-btn done"
            onClick={handleDone}
            title="Done"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '💾 Done'}
          </button>
        </div>
        
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        {isAnalyzing && (
          <div className="analyzing-overlay">
            <div className="analyzing-content">
              <div className="analyzing-spinner"></div>
              <p>Analyzing handwriting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasDrawing;
