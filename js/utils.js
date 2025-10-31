/*===== UTILITY FUNCTIONS MODULE =====*/

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
    let inDebounce;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => func.apply(context, args), delay);
    };
};

/**
 * Throttle function for scroll events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

/**
 * Check if device is touch screen
 * @returns {boolean}
 */
export const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} el - Element to check
 * @param {number} offset - Offset from viewport edge
 * @returns {boolean}
 */
export const isInViewport = (el, offset = 150) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight - offset) &&
        rect.bottom >= offset
    );
};

/**
 * Check if element is visible on screen
 * @param {HTMLElement} element - Element to check
 * @returns {boolean}
 */
export const isElementVisible = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0 &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
        rect.right > 0
    );
};

/**
 * Get device type for better handling device-specific behavior
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = () => {
    const width = window.innerWidth;
    if (width <= 576) return 'mobile';
    if (width <= 992) return 'tablet';
    return 'desktop';
};

/**
 * Create a live region for screen reader announcements
 * @param {string} id - ID for the live region
 * @returns {HTMLElement}
 */
export const createLiveRegion = (id) => {
    const existing = document.getElementById(id);
    if (existing) return existing;
    
    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.classList.add('sr-only');
    document.body.appendChild(region);
    return region;
};

/**
 * Prevent scroll on body (for mobile menu, modals, etc.)
 */
export const preventBodyScroll = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
};

/**
 * Allow scroll on body
 */
export const allowBodyScroll = () => {
    const scrollY = document.body.style.top;
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
};

/**
 * Smooth scroll to element with offset
 * @param {HTMLElement} element - Target element
 * @param {number} offset - Offset from top (default: header height)
 */
export const smoothScrollTo = (element, offset = 0) => {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
};

/**
 * Fix iOS viewport height issue
 */
export const fixIOSViewportHeight = () => {
    if (/iPhone|iPod|iPad/.test(navigator.userAgent)) {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', debounce(setVH, 200));
    }
};

/**
 * Preload critical images
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
};

/**
 * Add lazy loading to images
 */
export const enableLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
};
