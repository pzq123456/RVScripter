// Debounce function to limit the frequency of function calls
/**
 * Debounce function to limit the frequency of function calls
 * @param {function} func - function to be called
 * @param {number} delay - delay in milliseconds
 * @returns 
 */
export function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Generate a UUID
 * @returns - UUID string
 */
export function uuid () {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}