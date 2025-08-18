/**
 * Enhanced utility functions for SearchHub
 */

// Storage Management
let _debounceTimers = {};

export const storage = {
    /**
     * Get a value from localStorage with fallback
     */
    get(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? fallback;
        } catch(_) {
            return fallback;
        }
    },
    
    /**
     * Set a value in localStorage with debouncing
     */
    set(key, value, delay = 150) {
        clearTimeout(_debounceTimers[key]);
        return new Promise((resolve) => {
            _debounceTimers[key] = setTimeout(() => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    resolve(true);
                } catch(_) {
                    resolve(false);
                }
            }, delay);
        });
    },
    
    /**
     * Remove a value from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch(_) {
            return false;
        }
    },

    /**
     * Clear all app-related storage
     */
    clear() {
        try {
            Object.keys(_debounceTimers).forEach(key => {
                clearTimeout(_debounceTimers[key]);
            });
            localStorage.clear();
            return true;
        } catch(_) {
            return false;
        }
    }
};

// DOM Helpers
export const dom = {
    /**
     * Create an element with attributes and children
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        return element;
    },

    /**
     * Create a button element with standard styling
     */
    createButton(text, onClick, className = '') {
        return this.createElement('button', {
            className: `px-4 py-2 rounded ${className}`,
            onclick: onClick
        }, [text]);
    }
};

// UI Feedback
export const ui = {
    /**
     * Show a toast message
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = '';
        toast.classList.add('show', type);
        setTimeout(() => toast.classList.remove('show'), 2600);
    },

    /**
     * Debounce a function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Validation Helpers
export const validate = {
    /**
     * Check if a string is a valid URL
     */
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },

    /**
     * Check if a string contains unsafe characters
     */
    isSafeString(str) {
        return !/[<>{}()]/.test(str);
    }
};

// Export legacy functions for backward compatibility
export const safeGet = storage.get;
export const safeSet = storage.set;
export const showToast = ui.showToast;
