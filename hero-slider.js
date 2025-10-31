/*===== PROFESSIONAL HERO SLIDER FUNCTIONALITY =====*/

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dotsContainer = document.querySelector('.hero-slider-dots');
        const prevBtn = document.querySelector('.hero-prev');
        const nextBtn = document.querySelector('.hero-next');
        
        if (!slides.length || !dotsContainer) {
            console.log('⚠️ Hero slider elements not found');
            return;
        }
        
        console.log('🎬 Hero slider initialized with', slides.length, 'slides');
        
        let currentIndex = 0;
        let autoplayInterval;
        let isTransitioning = false;
        
        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('hero-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.setAttribute('role', 'button');
            dot.setAttribute('tabindex', '0');
            
            dot.addEventListener('click', () => {
                if (!isTransitioning) {
                    goToSlide(index);
                    resetAutoplay();
                }
            });
            
            dot.addEventListener('keydown', (e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isTransitioning) {
                    e.preventDefault();
                    goToSlide(index);
                    resetAutoplay();
                }
            });
            
            dotsContainer.appendChild(dot);
        });
        
        const dots = document.querySelectorAll('.hero-dot');
        
        // Navigation functions
        function goToSlide(index) {
            if (isTransitioning || index === currentIndex) return;
            
            isTransitioning = true;
            
            // Remove active class from current slide
            slides[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');
            
            // Update index
            currentIndex = index;
            
            // Add active class to new slide
            slides[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
            
            // Allow next transition after animation completes
            setTimeout(() => {
                isTransitioning = false;
            }, 1500);
        }
        
        function nextSlide() {
            if (isTransitioning) return;
            const nextIndex = (currentIndex + 1) % slides.length;
            goToSlide(nextIndex);
        }
        
        function prevSlide() {
            if (isTransitioning) return;
            const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(prevIndex);
        }
        
        // Button events
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoplay();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoplay();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoplay();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoplay();
            }
        });
        
        // Touch/Swipe support
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        const sliderContainer = document.querySelector('.hero-slider-container');
        
        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });
            
            sliderContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleSwipe();
            }, { passive: true });
        }
        
        function handleSwipe() {
            const SWIPE_THRESHOLD = 50;
            const swipeDistanceX = touchEndX - touchStartX;
            const swipeDistanceY = touchEndY - touchStartY;
            
            // Check if horizontal swipe
            if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
                if (Math.abs(swipeDistanceX) > SWIPE_THRESHOLD) {
                    if (swipeDistanceX > 0) {
                        prevSlide();
                    } else {
                        nextSlide();
                    }
                    resetAutoplay();
                }
            }
        }
        
        // Autoplay
        function startAutoplay() {
            // Ensure we don't create multiple intervals
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
            
            autoplayInterval = setInterval(() => {
                nextSlide();
            }, 5000); // Change slide every 5 seconds
        }
        
        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }
        
        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }
        
        // Pause autoplay when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });
        
        // Start autoplay immediately
        startAutoplay();
        console.log('▶️ Hero slider autoplay started');
        
        // Cleanup on unload
        window.addEventListener('beforeunload', () => {
            stopAutoplay();
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroSlider);
    } else {
        initHeroSlider();
    }
    
})();
