/*===== SLIDERS MODULE =====*/
import { createLiveRegion } from './utils.js';

/**
 * Base Slider Class
 */
class BaseSlider {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.track = this.container.querySelector(options.trackSelector || '.slider-track');
        this.slides = this.container.querySelectorAll(options.slideSelector || '.slide');
        this.prevBtn = this.container.querySelector(options.prevSelector || '.prev');
        this.nextBtn = this.container.querySelector(options.nextSelector || '.next');
        this.dotsContainer = this.container.querySelector(options.dotsSelector || '.dots');
        
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.autoplayDelay = options.autoplayDelay || 5000;
        this.enableAutoplay = options.enableAutoplay !== false;
        this.liveRegionId = options.liveRegionId || 'slider-live-region';
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.createDots();
        this.setupControls();
        this.setupTouchEvents();
        this.updateSlider();
        
        if (this.enableAutoplay) {
            this.startAutoplay();
        }
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        
        this.slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Slide ${index + 1}`);
            dot.setAttribute('tabindex', '0');
            
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                if (this.enableAutoplay) this.resetAutoplay();
            });
            
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.goToSlide(index);
                    if (this.enableAutoplay) this.resetAutoplay();
                }
            });
            
            this.dotsContainer.appendChild(dot);
        });
    }
    
    setupControls() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.navigate(-1);
                if (this.enableAutoplay) this.resetAutoplay();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.navigate(1);
                if (this.enableAutoplay) this.resetAutoplay();
            });
        }
    }
    
    setupTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        const SWIPE_THRESHOLD = 50;
        const SWIPE_ANGLE_THRESHOLD = 30;
        
        const swipeDistanceX = endX - startX;
        const swipeDistanceY = endY - startY;
        
        const swipeAngle = Math.abs(Math.atan2(swipeDistanceY, swipeDistanceX) * 180 / Math.PI);
        const isHorizontalSwipe = swipeAngle <= SWIPE_ANGLE_THRESHOLD || 
                                  swipeAngle >= (180 - SWIPE_ANGLE_THRESHOLD);
        
        if (Math.abs(swipeDistanceX) < SWIPE_THRESHOLD || !isHorizontalSwipe) return;
        
        const direction = swipeDistanceX > 0 ? -1 : 1;
        this.navigate(direction);
        if (this.enableAutoplay) this.resetAutoplay();
    }
    
    navigate(direction) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.disableControls();
        
        this.currentIndex = (this.currentIndex + direction + this.slides.length) % this.slides.length;
        this.updateSlider();
    }
    
    goToSlide(index) {
        if (index < 0 || index >= this.slides.length || index === this.currentIndex || this.isAnimating) {
            return;
        }
        
        this.isAnimating = true;
        this.disableControls();
        
        this.currentIndex = index;
        this.updateSlider();
    }
    
    updateSlider() {
        // Override in child class
    }
    
    disableControls() {
        if (this.prevBtn) this.prevBtn.disabled = true;
        if (this.nextBtn) this.nextBtn.disabled = true;
    }
    
    enableControls() {
        if (this.prevBtn) this.prevBtn.disabled = false;
        if (this.nextBtn) this.nextBtn.disabled = false;
        this.isAnimating = false;
    }
    
    updateDots() {
        if (!this.dotsContainer) return;
        
        const dots = this.dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
            dot.setAttribute('aria-current', index === this.currentIndex ? 'true' : 'false');
        });
    }
    
    announceSlide(message) {
        const liveRegion = createLiveRegion(this.liveRegionId);
        liveRegion.textContent = message;
    }
    
    startAutoplay() {
        if (!this.enableAutoplay) return;
        
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = setInterval(() => {
            this.navigate(1);
        }, this.autoplayDelay);
    }
    
    resetAutoplay() {
        clearInterval(this.autoplayInterval);
        this.startAutoplay();
    }
    
    stopAutoplay() {
        clearInterval(this.autoplayInterval);
    }
}

/**
 * Gallery Slider Class
 */
export class GallerySlider extends BaseSlider {
    constructor() {
        super('.gallery-wrapper', {
            trackSelector: '.gallery-track',
            slideSelector: '.gallery-slide',
            prevSelector: '.gallery-arrow.prev',
            nextSelector: '.gallery-arrow.next',
            dotsSelector: '.gallery-dots',
            liveRegionId: 'gallery-live-region',
            autoplayDelay: 5000,
            enableAutoplay: true
        });
    }
    
    updateSlider() {
        if (!this.track || !this.slides.length) return;
        
        const slideWidth = this.slides[0].offsetWidth;
        
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.track.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
        
        setTimeout(() => {
            this.enableControls();
        }, 500);
        
        this.updateDots();
        this.announceSlide(`Showing image ${this.currentIndex + 1} of ${this.slides.length}`);
    }
}

/**
 * Video Gallery Slider Class
 */
export class VideoGallerySlider extends BaseSlider {
    constructor() {
        super('.video-gallery-wrapper', {
            trackSelector: '.video-gallery-track',
            slideSelector: '.video-gallery-slide',
            prevSelector: '.video-gallery-arrow.prev',
            nextSelector: '.video-gallery-arrow.next',
            dotsSelector: '.video-gallery-dots',
            liveRegionId: 'video-gallery-live-region',
            autoplayDelay: 0,
            enableAutoplay: false
        });
    }
    
    updateSlider() {
        if (!this.track || !this.slides.length) return;
        
        const slideWidth = this.slides[0].offsetWidth;
        
        this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.track.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
        
        setTimeout(() => {
            this.enableControls();
        }, 500);
        
        this.updateDots();
        this.pauseOtherVideos();
        this.announceSlide(`Showing video ${this.currentIndex + 1} of ${this.slides.length}`);
    }
    
    pauseOtherVideos() {
        this.slides.forEach((slide, index) => {
            const iframe = slide.querySelector('iframe');
            if (iframe && index !== this.currentIndex) {
                // Pause YouTube videos
                if (iframe.src.includes('youtube.com')) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                }
                // Reload Facebook videos to pause them
                if (iframe.src.includes('facebook.com')) {
                    const currentSrc = iframe.src;
                    iframe.src = '';
                    setTimeout(() => { iframe.src = currentSrc; }, 100);
                }
            }
        });
    }
}

/**
 * Testimonials Slider Class
 */
export class TestimonialsSlider extends BaseSlider {
    constructor() {
        super('.testimonial-slider', {
            trackSelector: '.testimonial-slides-wrapper',
            slideSelector: '.testimonial-slide',
            prevSelector: '.testimonial-arrows .prev',
            nextSelector: '.testimonial-arrows .next',
            dotsSelector: '.testimonial-dots',
            liveRegionId: 'testimonial-live-region',
            autoplayDelay: 8000,
            enableAutoplay: true
        });
    }
    
    createDots() {
        // Testimonials already have dots in HTML, just setup event listeners
        const dots = document.querySelectorAll('.testimonial-dot');
        if (!dots.length) return;
        
        dots.forEach((dot, index) => {
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Testimonial ${index + 1}`);
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
            
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                if (this.enableAutoplay) this.resetAutoplay();
            });
            
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.goToSlide(index);
                    if (this.enableAutoplay) this.resetAutoplay();
                }
            });
        });
    }
    
    updateSlider() {
        // Hide all slides
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');
            
            if (index === this.currentIndex) {
                void slide.offsetWidth; // Force reflow
            }
        });
        
        // Show active slide with animation
        this.slides[this.currentIndex].classList.add('active');
        this.slides[this.currentIndex].setAttribute('aria-hidden', 'false');
        
        setTimeout(() => {
            this.enableControls();
        }, 500);
        
        // Update dots
        const dots = document.querySelectorAll('.testimonial-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
            dot.setAttribute('aria-current', index === this.currentIndex ? 'true' : 'false');
        });
        
        this.announceSlide(`Showing testimonial ${this.currentIndex + 1} of ${this.slides.length}`);
    }
}
