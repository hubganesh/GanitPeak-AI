import React, { useState, useRef, useEffect } from 'react';
import './GraphCreator.css';

const GraphCreator = () => {
  const [functions, setFunctions] = useState([
    { id: 1, expression: 'f(x) = 2*x + 3', color: '#2563eb', thickness: 2, visible: true, label: 'f' }
  ]);
  const [nextId, setNextId] = useState(2);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Function colors palette
  const colors = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#be185d'];

  const addFunction = () => {
    const newFunction = {
      id: nextId,
      expression: `g(x) = `,
      color: colors[(nextId - 1) % colors.length],
      thickness: 2,
      visible: true,
      label: String.fromCharCode(102 + nextId - 1) // f, g, h, i, etc.
    };
    setFunctions([...functions, newFunction]);
    setNextId(nextId + 1);
  };

  const updateFunction = (id, field, value) => {
    setFunctions(functions.map(func => {
      if (func.id === id) {
        const updatedFunc = { ...func, [field]: value };
        
        // Validate expression if updating the expression field
        if (field === 'expression') {
          updatedFunc.isValid = validateExpression(value);
          updatedFunc.errorMessage = updatedFunc.isValid ? null : getExpressionError(value);
        }
        
        return updatedFunc;
      }
      return func;
    }));
  };

  // Validate mathematical expression
  const validateExpression = (expr) => {
    if (!expr || !expr.trim()) return false;
    
    try {
      const func = parseExpression(expr);
      if (!func) return false;
      
      // Test with a few values to ensure it works
      const testValues = [0, 1, -1, 0.5];
      for (const testVal of testValues) {
        const result = func(testVal);
        if (result !== result && result !== Infinity && result !== -Infinity) {
          // Allow NaN and Infinity as valid results for some functions
          continue;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  // Get error message for invalid expression
  const getExpressionError = (expr) => {
    if (!expr || !expr.trim()) return 'Expression cannot be empty';
    
    try {
      parseExpression(expr);
      return 'Invalid mathematical expression';
    } catch (error) {
      return 'Syntax error in expression';
    }
  };

  const deleteFunction = (id) => {
    setFunctions(functions.filter(func => func.id !== id));
    setActiveMenu(null);
  };

  const duplicateFunction = (id) => {
    const funcToDuplicate = functions.find(func => func.id === id);
    if (funcToDuplicate) {
      const newFunction = {
        ...funcToDuplicate,
        id: nextId,
        label: String.fromCharCode(102 + nextId - 1),
        color: colors[(nextId - 1) % colors.length]
      };
      setFunctions([...functions, newFunction]);
      setNextId(nextId + 1);
    }
    setActiveMenu(null);
  };

  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Insert example expression into the first empty or selected function
  const insertExample = (expression) => {
    const emptyFunction = functions.find(func => !func.expression || func.expression.trim() === '');
    if (emptyFunction) {
      updateFunction(emptyFunction.id, 'expression', `f(x) = ${expression}`);
    } else {
      // Add a new function with the example
      const newFunction = {
        id: nextId,
        expression: `${String.fromCharCode(102 + nextId - 1)}(x) = ${expression}`,
        color: colors[(nextId - 1) % colors.length],
        thickness: 2,
        visible: true,
        label: String.fromCharCode(102 + nextId - 1)
      };
      setFunctions([...functions, newFunction]);
      setNextId(nextId + 1);
    }
  };

  const exportGraph = (format) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `graph.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
    }
  };

  // Enhanced mathematical expression parser
  const parseExpression = (expr) => {
    try {
      let equation = expr.trim();
      
      // Handle different input formats
      if (equation.includes('=')) {
        equation = equation.split('=')[1]?.trim();
      }
      
      // If no equation part, treat the whole input as the equation
      if (!equation) {
        equation = expr.trim();
      }
      
      // Handle special cases and common mathematical expressions
      equation = preprocessExpression(equation);
      
      return (x) => {
        try {
          let sanitized = equation
            // Replace x with the actual value (handle various x formats)
            .replace(/\bx\b/g, `(${x})`)
            .replace(/\bX\b/g, `(${x})`)
            
            // Handle exponents (multiple formats)
            .replace(/\^/g, '**')
            .replace(/\*\*\*/g, '**') // Fix triple asterisks
            
            // Handle mathematical functions (case insensitive)
            .replace(/\bsin\b/gi, 'Math.sin')
            .replace(/\bcos\b/gi, 'Math.cos')
            .replace(/\btan\b/gi, 'Math.tan')
            .replace(/\bsec\b/gi, '(1/Math.cos)')
            .replace(/\bcsc\b/gi, '(1/Math.sin)')
            .replace(/\bcot\b/gi, '(1/Math.tan)')
            .replace(/\basin\b/gi, 'Math.asin')
            .replace(/\bacos\b/gi, 'Math.acos')
            .replace(/\batan\b/gi, 'Math.atan')
            .replace(/\bsinh\b/gi, 'Math.sinh')
            .replace(/\bcosh\b/gi, 'Math.cosh')
            .replace(/\btanh\b/gi, 'Math.tanh')
            
            // Logarithmic functions
            .replace(/\bln\b/gi, 'Math.log')
            .replace(/\blog\b/gi, 'Math.log10')
            .replace(/\bexp\b/gi, 'Math.exp')
            
            // Other mathematical functions
            .replace(/\bsqrt\b/gi, 'Math.sqrt')
            .replace(/\babs\b/gi, 'Math.abs')
            .replace(/\bfloor\b/gi, 'Math.floor')
            .replace(/\bceil\b/gi, 'Math.ceil')
            .replace(/\bround\b/gi, 'Math.round')
            .replace(/\bmax\b/gi, 'Math.max')
            .replace(/\bmin\b/gi, 'Math.min')
            .replace(/\bpow\b/gi, 'Math.pow')
            
            // Handle constants
            .replace(/\bpi\b/gi, 'Math.PI')
            .replace(/\bπ\b/g, 'Math.PI')
            .replace(/\be\b/gi, 'Math.E')
            
            // Handle implicit multiplication
            .replace(/(\d)([a-zA-Z])/g, '$1*$2')
            .replace(/([a-zA-Z])(\d)/g, '$1*$2')
            .replace(/\)(\d)/g, ')*$1')
            .replace(/(\d)\(/g, '$1*(')
            .replace(/\)\(/g, ')*(')
            
            // Handle fractions like 1/2x -> 1/(2*x)
            .replace(/\/(\d+)([a-zA-Z])/g, '/($1*$2)')
            
            // Handle square brackets as parentheses
            .replace(/\[/g, '(')
            .replace(/\]/g, ')');
          
          const result = eval(sanitized);
          return isFinite(result) ? result : NaN;
        } catch (error) {
          return NaN;
        }
      };
    } catch (error) {
      return null;
    }
  };

  // Preprocess expression to handle common mathematical notations
  const preprocessExpression = (expr) => {
    let processed = expr
      // Handle common mathematical notations
      .replace(/√/g, 'sqrt')
      .replace(/∞/g, 'Infinity')
      .replace(/−/g, '-') // En dash to minus
      .replace(/×/g, '*') // Multiplication symbol
      .replace(/÷/g, '/') // Division symbol
      
      // Handle degree symbol (convert to radians)
      .replace(/(\d+)°/g, '($1*Math.PI/180)')
      
      // Handle factorial (simple cases)
      .replace(/(\d+)!/g, (match, num) => {
        const n = parseInt(num);
        if (n <= 10) {
          let factorial = 1;
          for (let i = 2; i <= n; i++) factorial *= i;
          return factorial.toString();
        }
        return match; // Keep original for large numbers
      })
      
      // Handle absolute value notation |x|
      .replace(/\|([^|]+)\|/g, 'abs($1)')
      
      // Handle common fraction notations
      .replace(/(\d+)\/(\d+)/g, '($1/$2)')
      
      // Handle scientific notation
      .replace(/(\d+(?:\.\d+)?)e([+-]?\d+)/gi, '$1*Math.pow(10,$2)')
      
      // Handle percentage
      .replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    
    return processed;
  };

  // Find special points (intercepts, extrema)
  const findSpecialPoints = (func, expression) => {
    const points = [];
    
    // Y-intercept (x = 0)
    const yIntercept = func(0);
    if (!isNaN(yIntercept)) {
      points.push({ x: 0, y: yIntercept, type: 'y-intercept' });
    }
    
    // Simple x-intercept approximation
    for (let x = -10; x <= 10; x += 0.1) {
      const y = func(x);
      const nextY = func(x + 0.1);
      if (!isNaN(y) && !isNaN(nextY) && y * nextY < 0) {
        points.push({ x: x + 0.05, y: 0, type: 'x-intercept' });
      }
    }
    
    return points;
  };

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Graph parameters
    const centerX = rect.width / 2 + panX;
    const centerY = rect.height / 2 + panY;
    const scale = 40 * zoom; // pixels per unit
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let x = centerX % scale; x < rect.width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let y = centerY % scale; y < rect.height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }
    }
    
    // Draw axes
    if (showAxes) {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      
      // X-axis
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(rect.width, centerY);
      ctx.stroke();
      
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, rect.height);
      ctx.stroke();
      
      // Axis labels
      if (showLabels) {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        // X-axis numbers
        for (let i = -20; i <= 20; i++) {
          if (i === 0) continue;
          const x = centerX + i * scale;
          if (x > 0 && x < rect.width) {
            ctx.fillText(i.toString(), x, centerY + 20);
          }
        }
        
        // Y-axis numbers
        ctx.textAlign = 'right';
        for (let i = -20; i <= 20; i++) {
          if (i === 0) continue;
          const y = centerY - i * scale;
          if (y > 0 && y < rect.height) {
            ctx.fillText(i.toString(), centerX - 10, y + 4);
          }
        }
      }
    }
    
    // Draw functions
    functions.forEach((funcData) => {
      if (!funcData.visible) return;
      
      const func = parseExpression(funcData.expression);
      if (!func) return;
      
      ctx.strokeStyle = funcData.color;
      ctx.lineWidth = Math.max(0.5, funcData.thickness / zoom); // Scale thickness with zoom for consistent appearance
      ctx.beginPath();
      
      let firstPoint = true;
      for (let pixelX = 0; pixelX < rect.width; pixelX += 1) {
        const mathX = (pixelX - centerX) / scale;
        const mathY = func(mathX);
        
        if (!isNaN(mathY)) {
          const pixelY = centerY - mathY * scale;
          
          if (firstPoint) {
            ctx.moveTo(pixelX, pixelY);
            firstPoint = false;
          } else {
            ctx.lineTo(pixelX, pixelY);
          }
        } else {
          firstPoint = true;
        }
      }
      
      ctx.stroke();
      
      // Draw special points
      const specialPoints = findSpecialPoints(func, funcData.expression);
      specialPoints.forEach(point => {
        const pixelX = centerX + point.x * scale;
        const pixelY = centerY - point.y * scale;
        
        if (pixelX >= 0 && pixelX <= rect.width && pixelY >= 0 && pixelY <= rect.height) {
          ctx.fillStyle = funcData.color;
          ctx.beginPath();
          ctx.arc(pixelX, pixelY, Math.max(2, 4 / zoom), 0, 2 * Math.PI); // Scale point size with zoom
          ctx.fill();
        }
      });
    });
    
  }, [functions, showGrid, showAxes, showLabels, zoom, panX, panY]);

  // Handle canvas mouse events
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2 + panX;
    const centerY = rect.height / 2 + panY;
    const scale = 40 * zoom;
    
    const mathX = (x - centerX) / scale;
    const mathY = (centerY - y) / scale;
    
    setHoveredPoint({ x: mathX.toFixed(2), y: mathY.toFixed(2) });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
      if (!event.target.closest('.function-menu')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="graph-creator">
      <div className="graph-header">
        <h2>Create Graph</h2>
        <div className="graph-controls">
          <button onClick={resetView} className="control-btn">
            Reset View
          </button>
          <div className="export-dropdown">
            <button 
              className={`control-btn ${showExportDropdown ? 'active' : ''}`}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Export {showExportDropdown ? '▲' : '▼'}
            </button>
            {showExportDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => {
                  exportGraph('png');
                  setShowExportDropdown(false);
                }}>
                  PNG
                </button>
                <button onClick={() => {
                  exportGraph('svg');
                  setShowExportDropdown(false);
                }}>
                  SVG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="graph-content">
        {/* Left Panel - Function Inputs */}
        <div className="function-panel">
          <div className="panel-header">
            <h3>Functions</h3>
            <button onClick={addFunction} className="add-function-btn">
              + Add Function
            </button>
          </div>
          
          <div className="function-list">
            {functions.map((func) => (
              <div key={func.id} className={`function-item ${func.isValid === false ? 'error' : ''}`}>
                <div className="function-input-group">
                  <div className="function-input-row">
                    <div 
                      className="color-indicator" 
                      style={{ backgroundColor: func.color }}
                    ></div>
                    <input
                      type="text"
                      value={func.expression}
                      onChange={(e) => updateFunction(func.id, 'expression', e.target.value)}
                      className={`function-input ${func.isValid === false ? 'error' : ''}`}
                      placeholder="Enter any mathematical expression (e.g., sin(x), x^2, sqrt(x), |x|, etc.)"
                    />
                    <div className="function-menu">
                      <button 
                        className="menu-trigger"
                        onClick={() => setActiveMenu(activeMenu === func.id ? null : func.id)}
                      >
                        ⋮
                      </button>
                      {activeMenu === func.id && (
                        <div className="menu-dropdown">
                          <button onClick={() => {}}>
                            Special Points
                          </button>
                          <button onClick={() => duplicateFunction(func.id)}>
                            Duplicate
                          </button>
                          <button onClick={() => deleteFunction(func.id)}>
                            Delete
                          </button>
                          <div className="menu-divider"></div>
                          <div className="color-picker">
                            <label>Color:</label>
                            <input
                              type="color"
                              value={func.color}
                              onChange={(e) => updateFunction(func.id, 'color', e.target.value)}
                            />
                          </div>
                          <div className="thickness-slider">
                            <label>Thickness:</label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={func.thickness}
                              onChange={(e) => updateFunction(func.id, 'thickness', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {func.errorMessage && (
                    <div className="error-message">
                      {func.errorMessage}
                    </div>
                  )}
                  {func.isValid && func.expression && (
                    <div className="success-indicator">
                      ✓ Valid expression
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="display-options">
            <h4>Display Options</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
              />
              Show Grid
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => setShowAxes(e.target.checked)}
              />
              Show Axes
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
              Show Labels
            </label>
          </div>

          <div className="help-section">
            <h4>Supported Expressions</h4>
            <div className="help-examples">
              <div className="example-category">
                <h5>Basic Functions</h5>
                <div className="examples">
                  <code onClick={() => insertExample('x^2')}>x^2</code>
                  <code onClick={() => insertExample('2*x + 3')}>2*x + 3</code>
                  <code onClick={() => insertExample('sqrt(x)')}>sqrt(x)</code>
                  <code onClick={() => insertExample('abs(x)')}>|x|</code>
                </div>
              </div>
              <div className="example-category">
                <h5>Trigonometric</h5>
                <div className="examples">
                  <code onClick={() => insertExample('sin(x)')}>sin(x)</code>
                  <code onClick={() => insertExample('cos(x)')}>cos(x)</code>
                  <code onClick={() => insertExample('tan(x)')}>tan(x)</code>
                  <code onClick={() => insertExample('sin(x)^2')}>sin(x)^2</code>
                </div>
              </div>
              <div className="example-category">
                <h5>Logarithmic</h5>
                <div className="examples">
                  <code onClick={() => insertExample('ln(x)')}>ln(x)</code>
                  <code onClick={() => insertExample('log(x)')}>log(x)</code>
                  <code onClick={() => insertExample('exp(x)')}>exp(x)</code>
                  <code onClick={() => insertExample('Math.E^x')}>e^x</code>
                </div>
              </div>
              <div className="example-category">
                <h5>Advanced</h5>
                <div className="examples">
                  <code onClick={() => insertExample('1/x')}>1/x</code>
                  <code onClick={() => insertExample('x^3 - 2*x')}>x^3 - 2*x</code>
                  <code onClick={() => insertExample('sin(x)/x')}>sin(x)/x</code>
                  <code onClick={() => insertExample('sqrt(1-x^2)')}>sqrt(1-x^2)</code>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Graph Canvas */}
        <div className="graph-panel" ref={containerRef}>
          <canvas
            ref={canvasRef}
            className="graph-canvas"
            onMouseMove={handleCanvasMouseMove}
            onWheel={(e) => {
              e.preventDefault();
              
              const rect = canvasRef.current.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const mouseY = e.clientY - rect.top;
              
              const delta = e.deltaY > 0 ? 0.9 : 1.1;
              const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
              
              // Calculate the mathematical coordinates of the mouse position before zoom
              const centerX = rect.width / 2 + panX;
              const centerY = rect.height / 2 + panY;
              const scale = 40 * zoom;
              const mathX = (mouseX - centerX) / scale;
              const mathY = (centerY - mouseY) / scale;
              
              // Calculate new pan values so the mouse position maps to the same mathematical point
              const newScale = 40 * newZoom;
              const newCenterX = mouseX - mathX * newScale;
              const newCenterY = mouseY + mathY * newScale;
              const newPanX = newCenterX - rect.width / 2;
              const newPanY = newCenterY - rect.height / 2;
              
              setZoom(newZoom);
              setPanX(newPanX);
              setPanY(newPanY);
            }}
          />
          
          {hoveredPoint && (
            <div className="coordinate-tooltip">
              ({hoveredPoint.x}, {hoveredPoint.y})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphCreator;
