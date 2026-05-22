import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import './MathStudyGuide.css';

const MathStudyGuide = () => {
  const [activeSection, setActiveSection] = useState('basics');
  const [isCheatsheetMode, setIsCheatsheetMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);

  // Math content data
  const mathSections = {
    basics: {
      title: 'Basic Math (Class 1-8)',
      icon: '🔢',
      topics: [
        {
          id: 'arithmetic-operations',
          title: 'Basic Operations',
          description: 'Fundamental arithmetic operations.',
          formula: 'Addition: a + b, Subtraction: a - b',
          solution: 'Multiplication: a \\times b, Division: a \\div b',
          example: 'BODMAS/PEMDAS order of operations',
          cheatsheet: '+, -, ×, ÷; BODMAS/PEMDAS'
        },
        {
          id: 'fractions',
          title: 'Fractions',
          description: 'Operations with fractions.',
          formula: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}',
          solution: '\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}',
          example: '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}',
          cheatsheet: 'a/b + c/d = (ad+bc)/bd, a/b × c/d = ac/bd'
        },
        {
          id: 'decimals-percentages',
          title: 'Decimals & Percentages',
          description: 'Converting between decimals and percentages.',
          formula: 'Percentage = \\frac{Part}{Whole} \\times 100\\%',
          solution: 'Decimal \\times 100 = Percentage',
          example: '0.75 = 75\\%, \\quad \\frac{3}{4} = 75\\%',
          cheatsheet: '% = (Part/Whole) × 100'
        },
        {
          id: 'ratio-proportion',
          title: 'Ratio & Proportion',
          description: 'Comparing quantities and solving proportions.',
          formula: 'Ratio: a:b = \\frac{a}{b}',
          solution: 'Proportion: \\frac{a}{b} = \\frac{c}{d} \\Rightarrow ad = bc',
          example: 'If 2:3 = 4:x, then x = 6',
          cheatsheet: 'a:b = a/b, a/b = c/d → ad = bc'
        },
        {
          id: 'simple-interest',
          title: 'Simple Interest',
          description: 'Interest calculated on principal amount.',
          formula: 'SI = \\frac{P \\times R \\times T}{100}',
          solution: 'Amount = P + SI',
          example: 'P = Principal, R = Rate, T = Time',
          cheatsheet: 'SI = (P×R×T)/100, A = P + SI'
        },
        {
          id: 'compound-interest',
          title: 'Compound Interest',
          description: 'Interest calculated on principal plus accumulated interest.',
          formula: 'A = P\\left(1 + \\frac{R}{100}\\right)^T',
          solution: 'CI = A - P',
          example: 'Compounded annually',
          cheatsheet: 'A = P(1 + R/100)ᵀ, CI = A - P'
        },
        {
          id: 'profit-loss',
          title: 'Profit & Loss',
          description: 'Calculating profit, loss, and percentages.',
          formula: 'Profit = SP - CP, Loss = CP - SP',
          solution: 'Profit\\% = \\frac{Profit}{CP} \\times 100',
          example: 'SP = Selling Price, CP = Cost Price',
          cheatsheet: 'Profit = SP - CP, Profit% = (Profit/CP) × 100'
        },
        {
          id: 'speed-distance-time',
          title: 'Speed, Distance & Time',
          description: 'Relationship between speed, distance, and time.',
          formula: 'Speed = \\frac{Distance}{Time}',
          solution: 'Distance = Speed \\times Time',
          example: 'Time = \\frac{Distance}{Speed}',
          cheatsheet: 'Speed = Distance/Time, D = S×T, T = D/S'
        },
        {
          id: 'average',
          title: 'Average',
          description: 'Mean of a set of numbers.',
          formula: 'Average = \\frac{Sum\\ of\\ all\\ values}{Number\\ of\\ values}',
          solution: 'Sum = Average \\times Number\\ of\\ values',
          example: 'Avg of 2,4,6,8,10 = 30/5 = 6',
          cheatsheet: 'Average = Sum/Count'
        }
      ]
    },
    algebra: {
      title: 'Algebra',
      icon: '📊',
      topics: [
        {
          id: 'linear-equations',
          title: 'Linear Equations',
          description: 'Equations of the form ax + b = 0, representing straight lines.',
          formula: 'ax + b = 0',
          solution: 'x = -\\frac{b}{a}',
          example: '2x + 6 = 0 \\Rightarrow x = -3',
          cheatsheet: 'ax + b = 0 → x = -b/a'
        },
        {
          id: 'quadratic-equations',
          title: 'Quadratic Equations',
          description: 'Second-degree polynomial equations with solutions using the quadratic formula.',
          formula: 'ax^2 + bx + c = 0',
          solution: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
          example: 'x^2 - 5x + 6 = 0 \\Rightarrow x = 2, 3',
          cheatsheet: 'ax² + bx + c = 0 → x = (-b ± √(b²-4ac))/2a'
        },
        {
          id: 'algebraic-identities',
          title: 'Algebraic Identities',
          description: 'Essential algebraic identities for simplification and expansion.',
          formula: '(a+b)^2 = a^2 + 2ab + b^2',
          solution: '(a-b)^2 = a^2 - 2ab + b^2',
          example: '(x+3)^2 = x^2 + 6x + 9',
          cheatsheet: '(a±b)² = a² ± 2ab + b²'
        },
        {
          id: 'difference-squares',
          title: 'Difference of Squares',
          description: 'Breaking down expressions into products of simpler expressions.',
          formula: 'a^2 - b^2 = (a+b)(a-b)',
          solution: 'x^2 + (a+b)x + ab = (x+a)(x+b)',
          example: 'x^2 - 9 = (x+3)(x-3)',
          cheatsheet: 'a² - b² = (a+b)(a-b)'
        },
        {
          id: 'cube-identities',
          title: 'Cube Identities',
          description: 'Formulas for cubes and sum/difference of cubes.',
          formula: '(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3',
          solution: 'a^3 + b^3 = (a+b)(a^2 - ab + b^2)',
          example: 'a^3 - b^3 = (a-b)(a^2 + ab + b^2)',
          cheatsheet: '(a+b)³ = a³ + 3a²b + 3ab² + b³'
        },
        {
          id: 'exponents',
          title: 'Exponent Rules',
          description: 'Rules for manipulating expressions with exponents.',
          formula: 'a^m \\cdot a^n = a^{m+n}',
          solution: '\\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}',
          example: '2^3 \\cdot 2^4 = 2^7 = 128',
          cheatsheet: 'aᵐ · aⁿ = aᵐ⁺ⁿ, aᵐ/aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ'
        },
        {
          id: 'logarithms',
          title: 'Logarithm Rules',
          description: 'Properties and rules for logarithmic functions.',
          formula: '\\log_a(xy) = \\log_a(x) + \\log_a(y)',
          solution: '\\log_a\\left(\\frac{x}{y}\\right) = \\log_a(x) - \\log_a(y)',
          example: '\\log_a(x^n) = n\\log_a(x)',
          cheatsheet: 'log(xy) = log(x) + log(y), log(x/y) = log(x) - log(y)'
        },
        {
          id: 'arithmetic-progression',
          title: 'Arithmetic Progression',
          description: 'Sequence with constant difference between consecutive terms.',
          formula: 'a_n = a_1 + (n-1)d',
          solution: 'S_n = \\frac{n}{2}[2a_1 + (n-1)d]',
          example: 'Sum: S_n = \\frac{n}{2}(a_1 + a_n)',
          cheatsheet: 'aₙ = a₁ + (n-1)d, Sₙ = n/2[2a₁ + (n-1)d]'
        },
        {
          id: 'geometric-progression',
          title: 'Geometric Progression',
          description: 'Sequence with constant ratio between consecutive terms.',
          formula: 'a_n = a_1 \\cdot r^{n-1}',
          solution: 'S_n = a_1\\frac{r^n - 1}{r - 1} \\quad (r \\neq 1)',
          example: 'S_\\infty = \\frac{a_1}{1-r} \\quad (|r| < 1)',
          cheatsheet: 'aₙ = a₁·rⁿ⁻¹, Sₙ = a₁(rⁿ-1)/(r-1)'
        }
      ]
    },
    geometry: {
      title: 'Geometry',
      icon: '📐',
      topics: [
        {
          id: 'pythagorean-theorem',
          title: 'Pythagorean Theorem',
          description: 'Relationship between sides of a right triangle.',
          formula: 'a^2 + b^2 = c^2',
          solution: 'c = \\sqrt{a^2 + b^2}',
          example: '3^2 + 4^2 = 5^2 \\Rightarrow 9 + 16 = 25',
          cheatsheet: 'a² + b² = c²'
        },
        {
          id: 'triangle-area',
          title: 'Triangle Area',
          description: 'Different methods to calculate triangle area.',
          formula: 'A = \\frac{1}{2}bh',
          solution: 'A = \\frac{1}{2}ab\\sin(C)',
          example: 'Heron: A = \\sqrt{s(s-a)(s-b)(s-c)}, s = \\frac{a+b+c}{2}',
          cheatsheet: 'A = ½bh, A = ½ab·sin(C)'
        },
        {
          id: 'circle-formulas',
          title: 'Circle Formulas',
          description: 'Formulas for calculating circle properties.',
          formula: 'A = \\pi r^2',
          solution: 'C = 2\\pi r = \\pi d',
          example: 'Arc\\ length: L = r\\theta, Sector: A = \\frac{1}{2}r^2\\theta',
          cheatsheet: 'A = πr², C = 2πr, Arc = rθ'
        },
        {
          id: 'rectangle-square',
          title: 'Rectangle & Square',
          description: 'Area and perimeter of rectangles and squares.',
          formula: 'A_{rect} = l \\times w',
          solution: 'P_{rect} = 2(l + w), \\quad A_{square} = s^2',
          example: 'P_{square} = 4s',
          cheatsheet: 'Rectangle: A = l×w, P = 2(l+w); Square: A = s², P = 4s'
        },
        {
          id: 'parallelogram-trapezoid',
          title: 'Parallelogram & Trapezoid',
          description: 'Area formulas for parallelograms and trapezoids.',
          formula: 'A_{parallelogram} = b \\times h',
          solution: 'A_{trapezoid} = \\frac{1}{2}(a + b)h',
          example: 'Trapezoid: a, b are parallel sides, h is height',
          cheatsheet: 'Parallelogram: A = b×h, Trapezoid: A = ½(a+b)h'
        },
        {
          id: 'volume-cube-cuboid',
          title: 'Volume: Cube & Cuboid',
          description: 'Volume formulas for rectangular prisms.',
          formula: 'V_{cube} = s^3',
          solution: 'V_{cuboid} = l \\times w \\times h',
          example: 'Surface\\ Area: SA_{cube} = 6s^2',
          cheatsheet: 'Cube: V = s³, SA = 6s²; Cuboid: V = l×w×h'
        },
        {
          id: 'volume-cylinder',
          title: 'Volume: Cylinder',
          description: 'Volume and surface area of cylinders.',
          formula: 'V = \\pi r^2 h',
          solution: 'SA = 2\\pi r(r + h)',
          example: 'Curved\\ SA = 2\\pi rh',
          cheatsheet: 'V = πr²h, SA = 2πr(r+h)'
        },
        {
          id: 'volume-cone',
          title: 'Volume: Cone',
          description: 'Volume and surface area of cones.',
          formula: 'V = \\frac{1}{3}\\pi r^2 h',
          solution: 'SA = \\pi r(r + l), \\quad l = \\sqrt{r^2 + h^2}',
          example: 'l is slant height',
          cheatsheet: 'V = ⅓πr²h, SA = πr(r+l)'
        },
        {
          id: 'volume-sphere',
          title: 'Volume: Sphere',
          description: 'Volume and surface area of spheres.',
          formula: 'V = \\frac{4}{3}\\pi r^3',
          solution: 'SA = 4\\pi r^2',
          example: 'r = 3 \\Rightarrow V = 36\\pi, SA = 36\\pi',
          cheatsheet: 'V = (4/3)πr³, SA = 4πr²'
        },
        {
          id: 'coordinate-geometry',
          title: 'Coordinate Geometry',
          description: 'Distance and midpoint formulas in coordinate plane.',
          formula: 'Distance: d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
          solution: 'Midpoint: M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)',
          example: 'Slope: m = \\frac{y_2-y_1}{x_2-x_1}',
          cheatsheet: 'd = √[(x₂-x₁)² + (y₂-y₁)²], M = ((x₁+x₂)/2, (y₁+y₂)/2)'
        }
      ]
    },
    trigonometry: {
      title: 'Trigonometry',
      icon: '📏',
      topics: [
        {
          id: 'basic-ratios',
          title: 'Basic Trigonometric Ratios',
          description: 'Fundamental relationships in right triangles.',
          formula: '\\sin(\\theta) = \\frac{opposite}{hypotenuse}',
          solution: '\\cos(\\theta) = \\frac{adjacent}{hypotenuse}',
          example: '\\tan(\\theta) = \\frac{opposite}{adjacent} = \\frac{\\sin\\theta}{\\cos\\theta}',
          cheatsheet: 'sin = opp/hyp, cos = adj/hyp, tan = opp/adj'
        },
        {
          id: 'reciprocal-identities',
          title: 'Reciprocal Identities',
          description: 'Reciprocal trigonometric functions.',
          formula: '\\csc(\\theta) = \\frac{1}{\\sin(\\theta)}',
          solution: '\\sec(\\theta) = \\frac{1}{\\cos(\\theta)}',
          example: '\\cot(\\theta) = \\frac{1}{\\tan(\\theta)} = \\frac{\\cos\\theta}{\\sin\\theta}',
          cheatsheet: 'csc = 1/sin, sec = 1/cos, cot = 1/tan'
        },
        {
          id: 'pythagorean-identities',
          title: 'Pythagorean Identities',
          description: 'Fundamental trigonometric identities.',
          formula: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
          solution: '1 + \\tan^2(\\theta) = \\sec^2(\\theta)',
          example: '1 + \\cot^2(\\theta) = \\csc^2(\\theta)',
          cheatsheet: 'sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ'
        },
        {
          id: 'angle-sum-identities',
          title: 'Angle Sum & Difference',
          description: 'Formulas for sum and difference of angles.',
          formula: '\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B',
          solution: '\\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B',
          example: '\\tan(A \\pm B) = \\frac{\\tan A \\pm \\tan B}{1 \\mp \\tan A \\tan B}',
          cheatsheet: 'sin(A±B) = sinA·cosB ± cosA·sinB'
        },
        {
          id: 'double-angle',
          title: 'Double Angle Formulas',
          description: 'Formulas for double angles.',
          formula: '\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta',
          solution: '\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta',
          example: '\\tan(2\\theta) = \\frac{2\\tan\\theta}{1 - \\tan^2\\theta}',
          cheatsheet: 'sin(2θ) = 2sinθ·cosθ, cos(2θ) = cos²θ - sin²θ'
        },
        {
          id: 'half-angle',
          title: 'Half Angle Formulas',
          description: 'Formulas for half angles.',
          formula: '\\sin\\frac{\\theta}{2} = \\pm\\sqrt{\\frac{1-\\cos\\theta}{2}}',
          solution: '\\cos\\frac{\\theta}{2} = \\pm\\sqrt{\\frac{1+\\cos\\theta}{2}}',
          example: '\\tan\\frac{\\theta}{2} = \\frac{1-\\cos\\theta}{\\sin\\theta}',
          cheatsheet: 'sin(θ/2) = ±√[(1-cosθ)/2]'
        },
        {
          id: 'law-of-sines',
          title: 'Law of Sines',
          description: 'Relationship between sides and angles in any triangle.',
          formula: '\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}',
          solution: 'a = \\frac{b \\sin(A)}{\\sin(B)}',
          example: 'Find side a when A=30°, B=45°, b=10',
          cheatsheet: 'a/sin(A) = b/sin(B) = c/sin(C)'
        },
        {
          id: 'law-of-cosines',
          title: 'Law of Cosines',
          description: 'Generalization of Pythagorean theorem for any triangle.',
          formula: 'c^2 = a^2 + b^2 - 2ab\\cos(C)',
          solution: '\\cos(C) = \\frac{a^2 + b^2 - c^2}{2ab}',
          example: 'a=3, b=4, C=60° \\Rightarrow c = \\sqrt{13}',
          cheatsheet: 'c² = a² + b² - 2ab·cos(C)'
        },
        {
          id: 'special-angles',
          title: 'Special Angle Values',
          description: 'Common trigonometric values for special angles.',
          formula: '\\sin(30°) = \\frac{1}{2}, \\sin(45°) = \\frac{\\sqrt{2}}{2}, \\sin(60°) = \\frac{\\sqrt{3}}{2}',
          solution: '\\cos(30°) = \\frac{\\sqrt{3}}{2}, \\cos(45°) = \\frac{\\sqrt{2}}{2}, \\cos(60°) = \\frac{1}{2}',
          example: '\\tan(30°) = \\frac{1}{\\sqrt{3}}, \\tan(45°) = 1, \\tan(60°) = \\sqrt{3}',
          cheatsheet: 'sin30°=½, sin45°=√2/2, sin60°=√3/2'
        }
      ]
    },
    calculus: {
      title: 'Calculus',
      icon: '∫',
      topics: [
        {
          id: 'limits',
          title: 'Limits',
          description: 'Fundamental concept of approaching values.',
          formula: '\\lim_{x \\to a} f(x) = L',
          solution: '\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1',
          example: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
          cheatsheet: 'lim[x→a] f(x) = L'
        },
        {
          id: 'derivatives-power',
          title: 'Power Rule',
          description: 'Derivative of power functions.',
          formula: '\\frac{d}{dx}[x^n] = nx^{n-1}',
          solution: '\\frac{d}{dx}[c] = 0, \\quad \\frac{d}{dx}[cx] = c',
          example: '\\frac{d}{dx}[x^3] = 3x^2',
          cheatsheet: 'd/dx[xⁿ] = nxⁿ⁻¹'
        },
        {
          id: 'derivatives-trig',
          title: 'Trigonometric Derivatives',
          description: 'Derivatives of trigonometric functions.',
          formula: '\\frac{d}{dx}[\\sin(x)] = \\cos(x)',
          solution: '\\frac{d}{dx}[\\cos(x)] = -\\sin(x)',
          example: '\\frac{d}{dx}[\\tan(x)] = \\sec^2(x)',
          cheatsheet: 'd/dx[sin(x)] = cos(x), d/dx[cos(x)] = -sin(x)'
        },
        {
          id: 'derivatives-exp-log',
          title: 'Exponential & Logarithmic Derivatives',
          description: 'Derivatives of exponential and logarithmic functions.',
          formula: '\\frac{d}{dx}[e^x] = e^x',
          solution: '\\frac{d}{dx}[a^x] = a^x \\ln(a)',
          example: '\\frac{d}{dx}[\\ln(x)] = \\frac{1}{x}',
          cheatsheet: 'd/dx[eˣ] = eˣ, d/dx[ln(x)] = 1/x'
        },
        {
          id: 'product-rule',
          title: 'Product Rule',
          description: 'Derivative of product of two functions.',
          formula: '\\frac{d}{dx}[f(x)g(x)] = f\'(x)g(x) + f(x)g\'(x)',
          solution: '(uv)\' = u\'v + uv\'',
          example: '\\frac{d}{dx}[x^2\\sin(x)] = 2x\\sin(x) + x^2\\cos(x)',
          cheatsheet: '(fg)′ = f′g + fg′'
        },
        {
          id: 'quotient-rule',
          title: 'Quotient Rule',
          description: 'Derivative of quotient of two functions.',
          formula: '\\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f\'(x)g(x) - f(x)g\'(x)}{[g(x)]^2}',
          solution: '\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}',
          example: '\\frac{d}{dx}\\left[\\frac{x}{x+1}\\right] = \\frac{1}{(x+1)^2}',
          cheatsheet: '(f/g)′ = (f′g - fg′)/g²'
        },
        {
          id: 'chain-rule',
          title: 'Chain Rule',
          description: 'Rule for differentiating composite functions.',
          formula: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)',
          solution: '\\frac{d}{dx}[\\sin(x^2)] = \\cos(x^2) \\cdot 2x',
          example: '\\frac{d}{dx}[(x^2+1)^3] = 3(x^2+1)^2 \\cdot 2x',
          cheatsheet: '[f(g(x))]′ = f′(g(x)) · g′(x)'
        },
        {
          id: 'integrals-basic',
          title: 'Basic Integrals',
          description: 'Fundamental integration rules and formulas.',
          formula: '\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)',
          solution: '\\int \\frac{1}{x} dx = \\ln|x| + C',
          example: '\\int x^2 dx = \\frac{x^3}{3} + C',
          cheatsheet: '∫xⁿdx = xⁿ⁺¹/(n+1) + C'
        },
        {
          id: 'integrals-trig',
          title: 'Trigonometric Integrals',
          description: 'Integrals of trigonometric functions.',
          formula: '\\int \\sin(x) dx = -\\cos(x) + C',
          solution: '\\int \\cos(x) dx = \\sin(x) + C',
          example: '\\int \\sec^2(x) dx = \\tan(x) + C',
          cheatsheet: '∫sin(x)dx = -cos(x) + C, ∫cos(x)dx = sin(x) + C'
        },
        {
          id: 'integrals-exp',
          title: 'Exponential Integrals',
          description: 'Integrals of exponential functions.',
          formula: '\\int e^x dx = e^x + C',
          solution: '\\int a^x dx = \\frac{a^x}{\\ln(a)} + C',
          example: '\\int e^{2x} dx = \\frac{e^{2x}}{2} + C',
          cheatsheet: '∫eˣdx = eˣ + C'
        },
        {
          id: 'definite-integral',
          title: 'Definite Integral',
          description: 'Fundamental theorem of calculus.',
          formula: '\\int_a^b f(x) dx = F(b) - F(a)',
          solution: 'F\'(x) = f(x)',
          example: '\\int_0^1 x^2 dx = \\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{1}{3}',
          cheatsheet: '∫ₐᵇf(x)dx = F(b) - F(a)'
        }
      ]
    },
    statistics: {
      title: 'Statistics & Probability',
      icon: '📈',
      topics: [
        {
          id: 'mean-median-mode',
          title: 'Central Tendency',
          description: 'Measures of the center of a data distribution.',
          formula: 'Mean: \\bar{x} = \\frac{\\sum x_i}{n}',
          solution: 'Median = middle value when ordered',
          example: 'Mode = most frequent value',
          cheatsheet: 'Mean = Σx/n, Median = middle value, Mode = most frequent'
        },
        {
          id: 'variance-std-dev',
          title: 'Variance & Standard Deviation',
          description: 'Measures of spread or variability in data.',
          formula: 'Variance: s^2 = \\frac{\\sum(x_i - \\bar{x})^2}{n-1}',
          solution: 'Std\\ Dev: s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}',
          example: 'Population: \\sigma = \\sqrt{\\frac{\\sum(x_i - \\mu)^2}{N}}',
          cheatsheet: 's² = Σ(x-x̄)²/(n-1), s = √[Σ(x-x̄)²/(n-1)]'
        },
        {
          id: 'probability-basic',
          title: 'Basic Probability',
          description: 'Fundamental probability concepts and rules.',
          formula: 'P(A) = \\frac{\\text{favorable outcomes}}{\\text{total outcomes}}',
          solution: 'P(A\') = 1 - P(A)',
          example: '0 \\leq P(A) \\leq 1',
          cheatsheet: 'P(A) = favorable/total, P(A\') = 1 - P(A)'
        },
        {
          id: 'probability-addition',
          title: 'Addition Rule',
          description: 'Probability of union of events.',
          formula: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)',
          solution: 'Mutually\\ Exclusive: P(A \\cup B) = P(A) + P(B)',
          example: 'P(A \\cap B) = 0 for mutually exclusive events',
          cheatsheet: 'P(A∪B) = P(A) + P(B) - P(A∩B)'
        },
        {
          id: 'probability-multiplication',
          title: 'Multiplication Rule',
          description: 'Probability of intersection of events.',
          formula: 'P(A \\cap B) = P(A) \\cdot P(B|A)',
          solution: 'Independent: P(A \\cap B) = P(A) \\cdot P(B)',
          example: 'P(B|A) = \\frac{P(A \\cap B)}{P(A)}',
          cheatsheet: 'P(A∩B) = P(A)·P(B|A), Independent: P(A∩B) = P(A)·P(B)'
        },
        {
          id: 'conditional-probability',
          title: 'Conditional Probability',
          description: 'Probability of event given another event occurred.',
          formula: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}',
          solution: 'Bayes: P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}',
          example: 'P(B) \\neq 0',
          cheatsheet: 'P(A|B) = P(A∩B)/P(B)'
        },
        {
          id: 'permutations',
          title: 'Permutations',
          description: 'Number of ways to arrange objects in order.',
          formula: 'P(n,r) = \\frac{n!}{(n-r)!}',
          solution: 'n! = n \\times (n-1) \\times ... \\times 2 \\times 1',
          example: 'P(5,3) = \\frac{5!}{2!} = 60',
          cheatsheet: 'P(n,r) = n!/(n-r)!'
        },
        {
          id: 'combinations',
          title: 'Combinations',
          description: 'Number of ways to choose objects without order.',
          formula: 'C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}',
          solution: 'C(n,r) = C(n, n-r)',
          example: 'C(5,3) = \\frac{5!}{3!2!} = 10',
          cheatsheet: 'C(n,r) = n!/[r!(n-r)!]'
        },
        {
          id: 'binomial-probability',
          title: 'Binomial Probability',
          description: 'Probability distribution for repeated trials.',
          formula: 'P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}',
          solution: 'Mean: \\mu = np, Variance: \\sigma^2 = np(1-p)',
          example: 'n trials, k successes, p = probability of success',
          cheatsheet: 'P(X=k) = C(n,k)·pᵏ·(1-p)ⁿ⁻ᵏ'
        },
        {
          id: 'normal-distribution',
          title: 'Normal Distribution',
          description: 'Bell-shaped probability distribution.',
          formula: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
          solution: '68\\% \\text{ within } 1\\sigma, 95\\% \\text{ within } 2\\sigma, 99.7\\% \\text{ within } 3\\sigma',
          example: 'Z-score: z = \\frac{x - \\mu}{\\sigma}',
          cheatsheet: '68-95-99.7 rule, Z = (x-μ)/σ'
        }
      ]
    }
  };

  // Filter topics based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTopics([]);
      return;
    }

    const allTopics = [];
    Object.entries(mathSections).forEach(([sectionKey, section]) => {
      section.topics.forEach(topic => {
        if (
          topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.cheatsheet.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          allTopics.push({ ...topic, section: sectionKey, sectionTitle: section.title });
        }
      });
    });
    setFilteredTopics(allTopics);
  }, [searchTerm]);

  const handleSearchSelect = (topic) => {
    setActiveSection(topic.section);
    setSearchTerm('');
    setFilteredTopics([]);
    // Scroll to topic
    setTimeout(() => {
      const element = document.getElementById(topic.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="math-study-guide">
      {/* Header */}
      <div className="study-guide-header">
        <div className="header-content">
          <h1 className="main-title">📚 Math Study Guide</h1>
          <p className="subtitle">Interactive reference for essential mathematical concepts</p>
          
          {/* Navigation Section */}
          <div className="inline-navigation">
            {Object.entries(mathSections).map(([key, section]) => (
              <motion.button
                key={key}
                className={`nav-button ${activeSection === key ? 'active' : ''}`}
                onClick={() => setActiveSection(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-text">{section.title}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Mode Toggle */}
        <motion.button
          className={`mode-toggle ${isCheatsheetMode ? 'cheatsheet' : 'detailed'}`}
          onClick={() => setIsCheatsheetMode(!isCheatsheetMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="toggle-icon">
            {isCheatsheetMode ? '📋' : '📖'}
          </span>
          <span className="toggle-text">
            {isCheatsheetMode ? 'Cheatsheet' : 'Study Guide'}
          </span>
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search formulas, topics, or concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Search Results */}
        <AnimatePresence>
          {filteredTopics.length > 0 && (
            <motion.div
              className="search-results"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {filteredTopics.map((topic) => (
                <motion.div
                  key={`${topic.section}-${topic.id}`}
                  className="search-result-item"
                  onClick={() => handleSearchSelect(topic)}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                >
                  <div className="result-title">{topic.title}</div>
                  <div className="result-section">{topic.sectionTitle}</div>
                  <div className="result-formula">{topic.cheatsheet}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="study-guide-content">
        {/* Main Content */}
        <div className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              className="section-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-header">
                <h2 className="section-title">
                  {mathSections[activeSection].icon} {mathSections[activeSection].title}
                </h2>
              </div>

              <div className="topics-grid">
                {mathSections[activeSection].topics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    id={topic.id}
                    className={`topic-card ${isCheatsheetMode ? 'cheatsheet-mode' : 'detailed-mode'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                    }}
                  >
                    <div className="topic-header">
                      <h3 className="topic-title">{topic.title}</h3>
                    </div>

                    {!isCheatsheetMode && (
                      <motion.div
                        className="topic-description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {topic.description}
                      </motion.div>
                    )}

                    <div className="formulas-section">
                      {isCheatsheetMode ? (
                        <div className="cheatsheet-formula">
                          <code>{topic.cheatsheet}</code>
                        </div>
                      ) : (
                        <motion.div
                          className="detailed-formulas"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="formula-item">
                            <label>Formula:</label>
                            <div className="math-formula">
                              <BlockMath math={topic.formula} />
                            </div>
                          </div>
                          
                          {topic.solution && (
                            <div className="formula-item">
                              <label>Solution:</label>
                              <div className="math-formula">
                                <BlockMath math={topic.solution} />
                              </div>
                            </div>
                          )}
                          
                          {topic.example && (
                            <div className="formula-item example">
                              <label>Example:</label>
                              <div className="math-formula">
                                <BlockMath math={topic.example} />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MathStudyGuide;
