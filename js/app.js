/*===== ANNAPURNA AYURVEDA CLINIC - MAIN APP =====*/
/*===== MODULAR & OPTIMIZED FOR MOBILE =====*/

import { Navigation } from './navigation.js';
import { GallerySlider, VideoGallerySlider, TestimonialsSlider } from './sliders.js';
import { Tabs } from './tabs.js';
import { Animations } from './animations.js';
import { fixIOSViewportHeight, preloadImages, getDeviceType } from './utils.js';

class AnnapurnaApp {
    constructor() {
        this.deviceType = getDeviceType();
        this.init();
    }
    
    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        console.log(`🌿 Annapurna Ayurveda Clinic - Initializing (${this.deviceType})`);
        
        // Prevent scroll restoration (fixes random scrolling issues)
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        // Fix iOS viewport height issue
        fixIOSViewportHeight();
        
        // Preload critical images
        this.preloadCriticalImages();
        
        // Initialize all modules
        this.initModules();
        
        // Setup window event listeners
        this.setupWindowEvents();
        
        console.log('✅ App initialized successfully');
    }
    
    preloadCriticalImages() {
        const criticalImages = [
            // Add paths to critical images that should load first
            'clinic.jpg',
            'logo.jpeg'
        ];
        
        preloadImages(criticalImages);
    }
    
    initModules() {
        // Initialize navigation
        this.navigation = new Navigation();
        
        // Initialize tabs
        this.tabs = new Tabs();
        
        // Initialize sliders
        this.gallerySlider = new GallerySlider();
        this.videoGallerySlider = new VideoGallerySlider();
        this.testimonialsSlider = new TestimonialsSlider();
        
        // Initialize animations
        this.animations = new Animations();
    }
    
    setupWindowEvents() {
        // Handle window load event
        window.addEventListener('load', () => {
            this.handleWindowLoad();
        });
        
        // Handle resize with debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 300);
        });
        
        // Prevent zoom on double tap (iOS)
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    handleWindowLoad() {
        // Ensure sliders are properly positioned after all assets load
        if (this.gallerySlider && this.gallerySlider.track) {
            this.gallerySlider.updateSlider();
        }
        
        if (this.videoGallerySlider && this.videoGallerySlider.track) {
            this.videoGallerySlider.updateSlider();
        }
        
        // Add loaded class to body for potential page entrance animations
        document.body.classList.add('page-loaded');
        
        // Small delay to ensure everything is settled
        setTimeout(() => {
            this.handleResize();
        }, 300);
    }
    
    handleResize() {
        const newDeviceType = getDeviceType();
        
        if (this.deviceType !== newDeviceType) {
            this.deviceType = newDeviceType;
            console.log(`📱 Device type changed to: ${this.deviceType}`);
        }
        
        // Update gallery positions
        if (this.gallerySlider && this.gallerySlider.track) {
            this.gallerySlider.updateSlider();
        }
        
        if (this.videoGallerySlider && this.videoGallerySlider.track) {
            this.videoGallerySlider.updateSlider();
        }
        
        // Update tabs scroll indicators if on mobile
        if (this.tabs && this.tabs.tabsContainer) {
            this.tabs.updateScrollIndicators();
        }
    }
}

// Initialize the app
const app = new AnnapurnaApp();

// Export for debugging purposes
window.AnnapurnaApp = app;
