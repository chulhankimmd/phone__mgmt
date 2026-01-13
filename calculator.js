class ScientificCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.history = document.getElementById('history');
        this.currentValue = '0';
        this.expression = '';
        this.isDegree = true; // true for DEG, false for RAD

        this.init();
    }

    init() {
        // Number and operator buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                if (value) {
                    this.handleInput(value);
                }
            });
        });

        // Special buttons
        document.getElementById('clear').addEventListener('click', () => this.clear());
        document.getElementById('delete').addEventListener('click', () => this.delete());
        document.getElementById('equals').addEventListener('click', () => this.calculate());
        document.getElementById('degRadToggle').addEventListener('click', () => this.toggleDegRad());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleInput(value) {
        if (this.currentValue === '0' && value !== '.') {
            this.currentValue = '';
        }

        switch(value) {
            case 'sin':
            case 'cos':
            case 'tan':
            case 'asin':
            case 'acos':
            case 'atan':
            case 'sqrt':
            case 'log':
            case 'ln':
                this.addFunction(value);
                break;
            case '^':
                this.currentValue += '^';
                break;
            case 'x²':
                this.currentValue += '^2';
                break;
            case '!':
                this.currentValue += '!';
                break;
            case 'exp':
                this.currentValue += 'e';
                break;
            case 'π':
                this.currentValue += Math.PI;
                break;
            case 'e':
                this.currentValue += Math.E;
                break;
            default:
                this.currentValue += value;
        }

        this.updateDisplay();
    }

    addFunction(func) {
        this.currentValue += func + '(';
    }

    clear() {
        this.currentValue = '0';
        this.expression = '';
        this.history.textContent = '';
        this.updateDisplay();
    }

    delete() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    toggleDegRad() {
        this.isDegree = !this.isDegree;
        const toggleBtn = document.getElementById('degRadToggle');
        toggleBtn.textContent = this.isDegree ? 'DEG' : 'RAD';
        toggleBtn.classList.toggle('active');
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    evaluateExpression(expr) {
        // Replace custom functions and operators
        expr = expr.replace(/π/g, Math.PI);
        expr = expr.replace(/e(?!xp)/g, Math.E);

        // Handle factorials
        expr = expr.replace(/(\d+\.?\d*)!/g, (match, num) => {
            return this.factorial(parseFloat(num));
        });

        // Handle powers
        expr = expr.replace(/\^/g, '**');

        // Handle trigonometric functions
        expr = expr.replace(/sin\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            const value = parseFloat(num);
            return Math.sin(this.isDegree ? this.toRadians(value) : value);
        });

        expr = expr.replace(/cos\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            const value = parseFloat(num);
            return Math.cos(this.isDegree ? this.toRadians(value) : value);
        });

        expr = expr.replace(/tan\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            const value = parseFloat(num);
            return Math.tan(this.isDegree ? this.toRadians(value) : value);
        });

        // Handle inverse trigonometric functions
        expr = expr.replace(/asin\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            const value = parseFloat(num);
            const result = Math.asin(value);
            return this.isDegree ? this.toDegrees(result) : result;
        });

        expr = expr.replace(/acos\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            const value = parseFloat(num);
            const result = Math.acos(value);
            return this.isDegree ? this.toDegrees(result) : result;
        });

        expr = expr.replace(/atan\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            const value = parseFloat(num);
            const result = Math.atan(value);
            return this.isDegree ? this.toDegrees(result) : result;
        });

        // Handle square root
        expr = expr.replace(/sqrt\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            return Math.sqrt(parseFloat(num));
        });

        // Handle logarithms
        expr = expr.replace(/log\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            return Math.log10(parseFloat(num));
        });

        expr = expr.replace(/ln\(([-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)\)/g, (match, num) => {
            return Math.log(parseFloat(num));
        });

        try {
            // Use Function constructor for safe evaluation
            const result = Function('"use strict"; return (' + expr + ')')();
            return result;
        } catch (error) {
            return 'Error';
        }
    }

    calculate() {
        try {
            this.history.textContent = this.currentValue;
            const result = this.evaluateExpression(this.currentValue);

            if (isNaN(result) || !isFinite(result)) {
                this.currentValue = 'Error';
            } else {
                // Round to 10 decimal places to avoid floating point errors
                this.currentValue = String(Math.round(result * 10000000000) / 10000000000);
            }
        } catch (error) {
            this.currentValue = 'Error';
        }

        this.updateDisplay();
    }

    updateDisplay() {
        this.display.textContent = this.currentValue;
    }

    handleKeyboard(e) {
        const key = e.key;

        if (key >= '0' && key <= '9') {
            this.handleInput(key);
        } else if (key === '.') {
            this.handleInput('.');
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            this.handleInput(key);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            this.calculate();
        } else if (key === 'Escape') {
            this.clear();
        } else if (key === 'Backspace') {
            this.delete();
        } else if (key === '(' || key === ')') {
            this.handleInput(key);
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScientificCalculator();
});
