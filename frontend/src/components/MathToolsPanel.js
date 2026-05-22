import React, { useState } from 'react';
import './MathToolsPanel.css';

const MathToolsPanel = ({ onInsertSymbol }) => {
    const [selectedSymbol, setSelectedSymbol] = useState(null);

    // Group symbols by category
    const symbolCategories = [{
            name: "Basic Operations",
            symbols: [
                { symbol: "+", label: "Plus" },
                { symbol: "-", label: "Minus" },
                { symbol: "×", label: "Multiply" },
                { symbol: "÷", label: "Divide" },
                { symbol: "=", label: "Equals" },
                { symbol: "≠", label: "Not Equal" },
                { symbol: "<", label: "Less Than" },
                { symbol: ">", label: "Greater Than" },
                { symbol: "≤", label: "Less or Equal" },
                { symbol: "≥", label: "Greater or Equal" }
            ]
        },
        {
            name: "Powers & Roots",
            symbols: [
                { symbol: "²", label: "Square" },
                { symbol: "³", label: "Cube" },
                { symbol: "^", label: "Power" },
                { symbol: "√", label: "Square Root" },
                { symbol: "∛", label: "Cube Root" },
                { symbol: "∜", label: "Fourth Root" }
            ]
        },
        {
            name: "Fractions",
            symbols: [
                { symbol: "½", label: "One Half" },
                { symbol: "¼", label: "One Quarter" },
                { symbol: "¾", label: "Three Quarters" },
                { symbol: "⅓", label: "One Third" },
                { symbol: "⅔", label: "Two Thirds" },
                { symbol: "⅕", label: "One Fifth" }
            ]
        },
        {
            name: "Greek Letters",
            symbols: [
                { symbol: "α", label: "Alpha" },
                { symbol: "β", label: "Beta" },
                { symbol: "γ", label: "Gamma" },
                { symbol: "δ", label: "Delta" },
                { symbol: "ε", label: "Epsilon" },
                { symbol: "θ", label: "Theta" },
                { symbol: "λ", label: "Lambda" },
                { symbol: "μ", label: "Mu" },
                { symbol: "π", label: "Pi" },
                { symbol: "σ", label: "Sigma" },
                { symbol: "φ", label: "Phi" },
                { symbol: "ω", label: "Omega" }
            ]
        },
        {
            name: "Trigonometry",
            symbols: [
                { symbol: "sin(", label: "Sine" },
                { symbol: "cos(", label: "Cosine" },
                { symbol: "tan(", label: "Tangent" },
                { symbol: "asin(", label: "Arcsine" },
                { symbol: "acos(", label: "Arccosine" },
                { symbol: "atan(", label: "Arctangent" },
                { symbol: "sinh(", label: "Hyperbolic Sine" },
                { symbol: "cosh(", label: "Hyperbolic Cosine" },
                { symbol: "tanh(", label: "Hyperbolic Tangent" },
                { symbol: "°", label: "Degree" }
            ]
        },
        {
            name: "Logarithms",
            symbols: [
                { symbol: "log(", label: "Logarithm" },
                { symbol: "ln(", label: "Natural Log" },
                { symbol: "e", label: "Euler's Number" },
                { symbol: "exp(", label: "Exponential" }
            ]
        },
        {
            name: "Calculus",
            symbols: [
                { symbol: "∫", label: "Integral" },
                { symbol: "∂", label: "Partial Derivative" },
                { symbol: "∞", label: "Infinity" },
                { symbol: "lim", label: "Limit" },
                { symbol: "∑", label: "Summation" },
                { symbol: "∏", label: "Product" }
            ]
        },
        {
            name: "Special Symbols",
            symbols: [
                { symbol: "!", label: "Factorial" },
                { symbol: "|x|", label: "Absolute Value" },
                { symbol: "±", label: "Plus-Minus" },
                { symbol: "∓", label: "Minus-Plus" },
                { symbol: "∠", label: "Angle" },
                { symbol: "⊥", label: "Perpendicular" },
                { symbol: "∥", label: "Parallel" },
                { symbol: "∴", label: "Therefore" },
                { symbol: "∵", label: "Because" }
            ]
        }
    ];

    const handleSymbolClick = (symbolItem) => {
        // For absolute value, we want to insert |x| but only the | character
        const insertSymbol = symbolItem.symbol === "|x|" ? "|" : symbolItem.symbol;
        onInsertSymbol(insertSymbol);

        // Set the selected symbol for preview
        setSelectedSymbol(symbolItem);

        // Clear the selection after 2 seconds
        setTimeout(() => {
            setSelectedSymbol(null);
        }, 2000);
    };

    return ( <
        div className = "math-tools-panel" >
        <
        h3 > Mathematical Symbols < /h3>

        { /* Symbol Preview Display */ } {
            selectedSymbol && ( <
                div className = "symbol-preview" >
                <
                div className = "symbol-preview-content" >
                <
                div className = "symbol-large" > { selectedSymbol.symbol } < /div> <
                div className = "symbol-label" > { selectedSymbol.label } < /div> <
                /div> <
                /div>
            )
        }

        <
        div className = "symbols-container" > {
            symbolCategories.map((category, categoryIndex) => ( <
                div key = { categoryIndex }
                className = "symbol-category" >
                <
                h4 > { category.name } < /h4> <
                div className = "symbols-grid" > {
                    category.symbols.map((item, index) => ( <
                        button key = { index }
                        className = { `symbol-button ${selectedSymbol && selectedSymbol.symbol === item.symbol ? 'selected' : ''}` }
                        onClick = {
                            () => handleSymbolClick(item) }
                        title = { `${item.label} (${item.symbol})` } >
                        { item.symbol } <
                        /button>
                    ))
                } <
                /div> <
                /div>
            ))
        } <
        /div> <
        /div>
    );
};

export default MathToolsPanel;