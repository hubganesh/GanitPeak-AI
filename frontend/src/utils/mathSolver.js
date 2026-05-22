// Advanced Mathematical Expression Solver
// This module provides functions to solve various types of math problems accurately

// Helper function to evaluate basic arithmetic expressions
const evaluateExpression = (expression) => {
    // Replace common mathematical symbols
    let expr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/√/g, 'sqrt')
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString())
        .replace(/\^/g, '**')
        .replace(/²/g, '**2')
        .replace(/³/g, '**3')
        .replace(/°/g, '*Math.PI/180') // Convert degrees to radians
        .replace(/∞/g, 'Infinity')
        .replace(/½/g, '0.5')
        .replace(/¼/g, '0.25')
        .replace(/¾/g, '0.75')
        .replace(/⅓/g, '1/3')
        .replace(/⅔/g, '2/3')
        .replace(/⅕/g, '0.2');

    // Handle square root function
    expr = expr.replace(/sqrt\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.sqrt(${value})`;
    });

    // Handle absolute value
    expr = expr.replace(/\|([^|]+)\|/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.abs(${value})`;
    });

    // Handle factorial
    expr = expr.replace(/(\d+)!/g, (match, num) => {
        const n = parseInt(num);
        if (n < 0) throw new Error("Factorial of negative number is undefined");
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result.toString();
    });

    // Handle trigonometric functions
    expr = expr.replace(/sin\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.sin(${value})`;
    });

    expr = expr.replace(/cos\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.cos(${value})`;
    });

    expr = expr.replace(/tan\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.tan(${value})`;
    });

    // Handle inverse trigonometric functions
    expr = expr.replace(/asin\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.asin(${value})`;
    });

    expr = expr.replace(/acos\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.acos(${value})`;
    });

    expr = expr.replace(/atan\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.atan(${value})`;
    });

    // Handle hyperbolic functions
    expr = expr.replace(/sinh\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.sinh(${value})`;
    });

    expr = expr.replace(/cosh\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.cosh(${value})`;
    });

    expr = expr.replace(/tanh\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.tanh(${value})`;
    });

    // Handle logarithms
    expr = expr.replace(/log\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.log10(${value})`;
    });

    expr = expr.replace(/ln\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.log(${value})`;
    });

    // Handle exponential
    expr = expr.replace(/exp\(([^)]+)\)/g, (match, inner) => {
        const value = evaluateExpression(inner);
        return `Math.exp(${value})`;
    });

    try {
        // Evaluate the expression
        // eslint-disable-next-line no-eval
        const result = eval(expr);
        if (typeof result === 'number' && !isNaN(result)) {
            return result;
        } else {
            throw new Error("Invalid expression");
        }
    } catch (error) {
        throw new Error("Unable to evaluate expression: " + error.message);
    }
};

// Function to solve linear equations (ax + b = c)
const solveLinearEquation = (equation) => {
    // Parse equation like "2x + 5 = 15"
    const parts = equation.split('=');
    if (parts.length !== 2) {
        throw new Error("Invalid equation format");
    }

    const leftSide = parts[0].trim();
    const rightSide = parts[1].trim();

    // Evaluate the right side
    const rightValue = evaluateExpression(rightSide);

    // Parse left side for x coefficient and constant
    // This is a simplified parser for linear equations
    const xMatch = leftSide.match(/([+-]?\d*)x/);
    const constantMatches = leftSide.match(/(?<![a-z])([+-]?\d+(?:\.\d+)?)(?![a-z])/gi);

    let xCoefficient = 1;
    if (xMatch) {
        const coeff = xMatch[1];
        if (coeff === '' || coeff === '+') xCoefficient = 1;
        else if (coeff === '-') xCoefficient = -1;
        else xCoefficient = parseFloat(coeff);
    }

    let constant = 0;
    if (constantMatches) {
        // Filter out the x coefficient if it was matched as a constant
        const filteredConstants = constantMatches.filter(match => {
            // Check if this match is part of the x term
            const xTermIndex = leftSide.indexOf(xMatch[0]);
            const matchIndex = leftSide.indexOf(match);
            return Math.abs(matchIndex - xTermIndex) > match.length;
        });

        // Sum all constants
        constant = filteredConstants.reduce((sum, val) => sum + parseFloat(val), 0);
    }

    // Solve: ax + b = c  =>  x = (c - b) / a
    if (xCoefficient === 0) {
        throw new Error("No variable term found");
    }

    const solution = (rightValue - constant) / xCoefficient;

    return {
        steps: [
            `Equation: ${equation}`,
            `Rearrange to standard form: ${xCoefficient}x + ${constant} = ${rightValue}`,
            `Subtract ${constant} from both sides: ${xCoefficient}x = ${rightValue - constant}`,
            `Divide both sides by ${xCoefficient}: x = ${solution}`
        ],
        solution: solution
    };
};

// Function to solve quadratic equations (ax² + bx + c = 0)
const solveQuadraticEquation = (equation) => {
    // This is a simplified implementation
    // For now, we'll assume standard form: ax^2 + bx + c = 0

    // Extract coefficients (simplified approach)
    // This would need a more sophisticated parser in a full implementation
    const simplifiedEquation = equation.replace(/\s/g, '');
    const aMatch = simplifiedEquation.match(/([+-]?\d*)x\^2|([+-]?\d*)x²/);
    const bMatch = simplifiedEquation.match(/([+-]?\d*)x(?![²^])/);
    const cMatch = simplifiedEquation.match(/=([+-]?\d+)/);

    let a = 1,
        b = 0,
        c = 0;

    if (aMatch) {
        const coeff = aMatch[1] || aMatch[2];
        if (coeff === '' || coeff === '+') a = 1;
        else if (coeff === '-') a = -1;
        else a = parseFloat(coeff) || 1;
    }

    if (bMatch) {
        const coeff = bMatch[1];
        if (coeff === '' || coeff === '+') b = 1;
        else if (coeff === '-') b = -1;
        else b = parseFloat(coeff) || 0;
    }

    if (cMatch) {
        c = parseFloat(cMatch[1]) || 0;
    }

    // Quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
        return {
            steps: [
                `Equation: ${equation}`,
                `a = ${a}, b = ${b}, c = ${c}`,
                `Discriminant = b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
                `Since discriminant < 0, there are no real solutions`
            ],
            solutions: ["No real solutions (complex roots)"]
        };
    } else if (discriminant === 0) {
        const solution = -b / (2 * a);
        return {
            steps: [
                `Equation: ${equation}`,
                `a = ${a}, b = ${b}, c = ${c}`,
                `Discriminant = b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
                `Since discriminant = 0, there is one solution: x = -b/(2a) = ${solution}`
            ],
            solutions: [solution]
        };
    } else {
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const solution1 = (-b + sqrtDiscriminant) / (2 * a);
        const solution2 = (-b - sqrtDiscriminant) / (2 * a);

        return {
            steps: [
                `Equation: ${equation}`,
                `a = ${a}, b = ${b}, c = ${c}`,
                `Discriminant = b² - 4ac = ${b}² - 4(${a})(${c}) = ${discriminant}`,
                `√discriminant = √${discriminant} = ${sqrtDiscriminant}`,
                `x = (-b ± √discriminant) / (2a)`,
                `x₁ = (-${b} + ${sqrtDiscriminant}) / (2×${a}) = ${solution1}`,
                `x₂ = (-${b} - ${sqrtDiscriminant}) / (2×${a}) = ${solution2}`
            ],
            solutions: [solution1, solution2]
        };
    }
};

// Main solver function
const solveMathProblem = (problem) => {
    const trimmedProblem = problem.trim();

    // Check if it's a quadratic equation (contains x^2)
    if (trimmedProblem.includes('x^2') || trimmedProblem.includes('x²')) {
        try {
            const result = solveQuadraticEquation(trimmedProblem);
            return {
                problem: trimmedProblem,
                mode: "Algebra - Quadratic Equation",
                steps: result.steps,
                answer: result.solutions.length === 1 ?
                    `x = ${result.solutions[0]}` : `x = {${result.solutions.join(', ')}}`
            };
        } catch (error) {
            // If quadratic solving fails, fall back to arithmetic
        }
    }

    // Check if it's a linear equation (contains x but not x^2)
    if (trimmedProblem.includes('x') && !trimmedProblem.includes('x^2') && !trimmedProblem.includes('x²')) {
        try {
            const result = solveLinearEquation(trimmedProblem);
            return {
                problem: trimmedProblem,
                mode: "Algebra - Linear Equation",
                steps: result.steps,
                answer: `x = ${result.solution}`
            };
        } catch (error) {
            // If linear solving fails, fall back to arithmetic
        }
    }

    // Otherwise, treat as arithmetic expression
    try {
        const result = evaluateExpression(trimmedProblem);
        return {
            problem: trimmedProblem,
            mode: "Arithmetic",
            steps: [
                `Expression: ${trimmedProblem}`,
                `Calculation: ${result}`
            ],
            answer: result.toString()
        };
    } catch (error) {
        throw new Error(`Unable to solve the problem: ${error.message}`);
    }
};

export { solveMathProblem };