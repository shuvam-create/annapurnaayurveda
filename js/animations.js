/*===== ANIMATIONS MODULE =====*/
import { isInViewport } from './utils.js';

export class Animations {
    constructor() {
        this.animatedElements = document.querySelectorAll(
            '.feature-card, .about-image, .about-text, .service-card, ' +
            '.info-card, .highlight-box, .testimonial-content, .video-gallery-slide'
        );
        
        this.init();
    }
    
    init() {
        if ('IntersectionObserver' in window) {
            this.initIntersectionObserver();
        } else {
            // Fallback for older browsers
            this.initScrollAnimation();
            window.addEventListener('scroll', () => this.handleScrollAnimation(), { passive: true });
        }
    }
    
    initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // For feature cards, add a staggered delay
                    if (entry.target.classList.contains('feature-card')) {
                        const featureCards = Array.from(document.querySelectorAll('.feature-card'));
                        const index = featureCards.indexOf(entry.target);
                        setTimeout(() => {
                            entry.target.classList.add('card-animated');
                        }, index * 150);
                    }
                    
                    // Unobserve once animation is applied (performance optimization)
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all animated elements
        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    initScrollAnimation() {
        this.animatedElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('is-visible');
            }
        });
    }
    
    handleScrollAnimation() {
        this.animatedElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('is-visible');
                
                if (element.classList.contains('feature-card')) {
                    element.classList.add('card-animated');
                }
            }
        });
    }
}
