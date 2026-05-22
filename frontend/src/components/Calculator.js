import React, { useState } from 'react';
import MathToolsPanel from './MathToolsPanel';
import './Calculator.css';

function Calculator({ onSolve, onClear }) {
    const [input, setInput] = useState('');
    const [showMathTools, setShowMathTools] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!input || input.trim() === '') {
            alert("Please enter a math problem");
            return;
        }

        await onSolve(input);
    };

    const handleClear = () => {
        setInput('');
        // Call the onClear prop to clear the solution in the parent component
        if (onClear) {
            onClear();
        }
    };

    const loadExample = (example) => {
        setInput(example);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const insertSymbol = (symbol) => {
        const textarea = document.getElementById('problem');
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;
        const newValue = input.substring(0, startPos) + symbol + input.substring(endPos);

        setInput(newValue);

        // Set cursor position after the inserted symbol
        setTimeout(() => {
            textarea.selectionStart = startPos + symbol.length;
            textarea.selectionEnd = startPos + symbol.length;
            textarea.focus();
        }, 0);
    };

    return ( <
        div className = "calculator" >
        <
        form onSubmit = { handleSubmit }
        className = "calc-form" >
        <
        div className = "input-group" >
        <
        label htmlFor = "problem" > Enter Math Problem: < /label> <
        textarea id = "problem"
        className = "input-field"
        value = { input }
        onChange = {
            (e) => setInput(e.target.value) }
        onKeyPress = { handleKeyPress }
        placeholder = "e.g., 5x + 10 = 40 or sin(30°) or √75 or 3! + 5²"
        rows = "4"
        autoFocus /
        >
        <
        /div>

        <
        div className = "examples-section" >
        <
        h3 > Try these examples: < /h3> <
        div className = "examples-grid" >
        <
        button type = "button"
        className = "example-btn"
        onClick = {
            () => loadExample("sin(30°)") } > sin(30°) < /button> <
        button type = "button"
        className = "example-btn"
        onClick = {
            () => loadExample("log(1000)") } > log(1000) < /button> <
        button type = "button"
        className = "example-btn"
        onClick = {
            () => loadExample("√(75)") } > √(75) < /button> <
        button type = "button"
        className = "example-btn"
        onClick = {
            () => loadExample("3! + 5²") } > 3!+5² < /button> <
        button type = "button"
        className = "example-btn"
        onClick = {
            () => loadExample("2x + 5 = 15") } > 2 x + 5 = 15 < /button> <
        button type = "button"
        className = "example-btn"
        onClick = {
            () => loadExample("x² + 5x + 6 = 0") } > x² + 5 x + 6 = 0 < /button> <
        /div> <
        /div>

        { /* Mathematical Symbols Button */ } <
        div className = "math-tools-section" >
        <
        button type = "button"
        className = "math-tools-toggle-btn"
        onClick = {
            () => setShowMathTools(!showMathTools) } >
        Mathematical Symbols <
        /button>

        {
            showMathTools && ( <
                MathToolsPanel onInsertSymbol = { insertSymbol }
                />
            )
        } <
        /div>

        <
        div className = "button-group" >
        <
        button type = "submit"
        className = "btn btn-solve" > 🔍Solve Problem <
        /button> <
        button type = "button"
        className = "btn btn-clear"
        onClick = { handleClear } > 🗑️Clear <
        /button> <
        /div> <
        /form> <
        /div>
    );
}

export default Calculator;