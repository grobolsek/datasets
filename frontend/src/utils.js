export const get_url = (location, domain) => {
    const base_url = process.env.REACT_APP_FILES_URL_BASE;
    if (!base_url) {
        throw new Error('REACT_APP_FILES_URL_BASE is not set');
    }
    return domain ? `${base_url}/${domain}/${location}` : `%{base_url}/${location}`;
}


// Debounce function
function debounce(func, wait) {
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

// Your resize logic
function handleResize(entries) {
    for (let entry of entries) {
        // Your resize handling logic here
    }
}

// Creating a debounced version of the resize handler
export const debouncedHandleResize = debounce(handleResize, 100);

