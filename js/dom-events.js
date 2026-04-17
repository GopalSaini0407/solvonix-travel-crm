function splitDataExpressions(expression, separator) {
    const parts = [];
    let current = '';
    let quote = null;

    for (let i = 0; i < expression.length; i += 1) {
        const char = expression[i];
        const previous = expression[i - 1];

        if ((char === "'" || char === '"') && previous !== '\\') {
            if (quote === char) {
                quote = null;
            } else if (!quote) {
                quote = char;
            }
        }

        if (char === separator && !quote) {
            const value = current.trim();
            if (value) parts.push(value);
            current = '';
            continue;
        }

        current += char;
    }

    const value = current.trim();
    if (value) parts.push(value);
    return parts;
}

function parseDataArgument(argument, event, element) {
    const value = argument.trim();

    if (!value) return undefined;
    if (value === 'event') return event;
    if (value === 'this') return element;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);

    if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
    ) {
        return value.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
    }

    return value;
}

function invokeDataExpression(expression, event, element) {
    const statements = splitDataExpressions(expression, ';');

    statements.forEach(statement => {
        const match = statement.match(/^([A-Za-z_$][\w$]*)\((.*)\)$/s);
        if (!match) return;

        const fnName = match[1];
        const argsString = match[2].trim();
        const fn = window[fnName];

        if (typeof fn !== 'function') return;

        const args = argsString
            ? splitDataExpressions(argsString, ',').map(arg => parseDataArgument(arg, event, element))
            : [];

        window.event = event;
        fn(...args, event, element);
    });
}

function handleDataEvent(eventName, nativeEvent, selectorMode) {
    const attribute = `data-on${eventName}`;
    const element = selectorMode === 'closest'
        ? nativeEvent.target.closest(`[${attribute}]`)
        : nativeEvent.target.matches(`[${attribute}]`)
            ? nativeEvent.target
            : null;

    if (!element) return;

    if (eventName === 'submit') {
        nativeEvent.preventDefault();
    }

    invokeDataExpression(element.getAttribute(attribute), nativeEvent, element);
}

document.addEventListener('click', event => handleDataEvent('click', event, 'closest'));
document.addEventListener('change', event => handleDataEvent('change', event, 'self'));
document.addEventListener('input', event => handleDataEvent('input', event, 'self'));
document.addEventListener('submit', event => handleDataEvent('submit', event, 'self'));
