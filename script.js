/*===== ANNAPURNA AYURVEDA CLINIC - FINAL OPTIMIZED SCRIPT =====*/
document.addEventListener('DOMContentLoaded', function() {
    "use strict";
    
    /*===== UTILITY FUNCTIONS =====*/
    // Debounce function to limit function calls
    const debounce = (func, delay) => {
        let inDebounce;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    };
    
    // Throttle function for scroll events
    const throttle = (func, limit) => {
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
    
    // Check if device is touch screen
    const isTouchDevice = () => {
        return (('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0));
    };
    
    // Check if element is in viewport
    const isInViewport = (el, offset = 150) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset) &&
            rect.bottom >= offset
        );
    };
    
    // Check if element is visible on screen
    const isElementVisible = (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom > 0 &&
            rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right > 0
        );
    };
    
    // Get device type for better handling device-specific behavior
    const getDeviceType = () => {
        const width = window.innerWidth;
        if (width <= 576) return 'mobile';
        if (width <= 992) return 'tablet';
        return 'desktop';
    };
    
    /*===== DOM ELEMENTS =====*/
    // Navigation elements
    const header = document.querySelector('.header');
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('backToTop');
    
    // Services tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Gallery elements
    const galleryTrack = document.querySelector('.gallery-track');
    const gallerySlides = document.querySelectorAll('.gallery-slide');
    const prevGalleryBtn = document.querySelector('.gallery-arrow.prev');
    const nextGalleryBtn = document.querySelector('.gallery-arrow.next');
    const galleryDotsContainer = document.querySelector('.gallery-dots');

    // Video Gallery elements
    const videoGalleryTrack = document.querySelector('.video-gallery-track');
    const videoGallerySlides = document.querySelectorAll('.video-gallery-slide');
    const prevVideoGalleryBtn = document.querySelector('.video-gallery-arrow.prev');
    const nextVideoGalleryBtn = document.querySelector('.video-gallery-arrow.next');
    const videoGalleryDotsContainer = document.querySelector('.video-gallery-dots');
    
    // Testimonial elements
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const testimonialDots = document.querySelectorAll('.testimonial-dot');
    const prevTestimonialBtn = document.querySelector('.testimonial-arrows .prev');
    const nextTestimonialBtn = document.querySelector('.testimonial-arrows .next');
    
    // Animation elements
    const animatedElements = document.querySelectorAll('.feature-card, .about-image, .about-text, .service-card, .info-card, .highlight-box, .testimonial-content, .video-gallery-slide');
    
    /*===== STATE VARIABLES =====*/
    let galleryCurrentIndex = 0;
    let videoGalleryCurrentIndex = 0;
    let testimonialCurrentIndex = 0;
    let lastScrollPosition = 0;
    let isHeaderHidden = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let galleryAutoplay;
    let isGalleryAnimating = false; 
    let testimonialAutoplay;
    let deviceType = getDeviceType();
    
    /*===== INITIALIZATION =====*/
    function init() {
        // Preload critical images
        preloadCriticalImages();
        
        // Setup all event listeners
        setupEventListeners();
        
        // Initialize components
        initHeader();
        initMobileMenu();
        initTabs();
        initGallery();
        initTestimonials();
        initVideoGallery();
        initScrollAnimations();
        initBackToTop();
        
        // Fix for mobile navigation
        fixMobileNavigation();
        
        // If we're on a device that supports IntersectionObserver, use it
        if ('IntersectionObserver' in window) {
            initIntersectionObserver();
        }
        
        console.log(`Annapurna Ayurveda Clinic - Website Initialized (${deviceType})`);
    }
    
    /*===== PRELOAD CRITICAL IMAGES =====*/
    function preloadCriticalImages() {
        // Define critical image URLs
        const criticalImages = [
            'https://via.placeholder.com/1920x1080?text=Hero+Background',
            'https://via.placeholder.com/1920x1080?text=Testimonials+Background'
        ];
        
        // Preload each critical image
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    /*===== SETUP FUNCTIONS =====*/
    
    // Setup all event listeners
    function setupEventListeners() {
        // Window events
        window.addEventListener('scroll', throttle(handleScroll, 100));
        window.addEventListener('resize', debounce(handleResize, 200));
        window.addEventListener('orientationchange', debounce(handleResize, 200));
        
        // Navigation events
        if(hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
            // Add touch feedback for better mobile experience
            hamburger.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, {passive: true});
            
            hamburger.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 300);
            }, {passive: true});
        }
        
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
        
        // Back to top button
        if(backToTopBtn) backToTopBtn.addEventListener('click', scrollToTop);
        
        // Setup touch events for mobile devices
        if(isTouchDevice()) {
            setupTouchEvents();
        }
        
        // Tab buttons
        tabBtns.forEach(btn => {
            btn.addEventListener('click', handleTabClick);
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu && navMenu.classList.contains('active')) {
                // If click is outside the menu and not on hamburger
                if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                    closeMobileMenu();
                }
            }
        });

        // Prevent background scrolling when mobile menu is open
        document.addEventListener('touchmove', function(e) {
            if (document.body.classList.contains('menu-open')) {
                if (!navMenu.contains(e.target)) {
                    e.preventDefault();
                }
            }
        }, { passive: false });

        // Gallery controls
        if (prevGalleryBtn && nextGalleryBtn) {
            nextGalleryBtn.addEventListener('click', () => {
                navigateGallery(1);
                resetGalleryAutoplay();
            });
            prevGalleryBtn.addEventListener('click', () => {
                navigateGallery(-1);
                resetGalleryAutoplay();
            });
        }

        // Video Gallery controls
        if (prevVideoGalleryBtn && nextVideoGalleryBtn) {
            nextVideoGalleryBtn.addEventListener('click', () => {
                navigateVideoGallery(1);
            });
            prevVideoGalleryBtn.addEventListener('click', () => {
                navigateVideoGallery(-1);
            });
        }

        // Testimonial controls
        if (prevTestimonialBtn && nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', () => {
                navigateTestimonial(1);
                resetTestimonialAutoplay();
            });
            
            prevTestimonialBtn.addEventListener('click', () => {
                navigateTestimonial(-1);
                resetTestimonialAutoplay();
            });
        }
    }
    
    // Setup touch events for mobile swipe functionality
    function setupTouchEvents() {
        // Common touch start handler
        const touchStartHandler = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        };
        
        // Common touch end handler
        const touchEndHandler = (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe(e.currentTarget);
        };
        
        // Add touch events to gallery
        const galleryContainer = document.querySelector('.gallery-container');
        if (galleryContainer) {
            galleryContainer.addEventListener('touchstart', touchStartHandler, {passive: true});
            galleryContainer.addEventListener('touchend', touchEndHandler, {passive: true});
        }

        // Add touch events to video gallery
        const videoGalleryContainer = document.querySelector('.video-gallery-container');
        if (videoGalleryContainer) {
            videoGalleryContainer.addEventListener('touchstart', touchStartHandler, { passive: true });
            videoGalleryContainer.addEventListener('touchend', touchEndHandler, { passive: true });
        }

        // Add touch events to testimonials
        const testimonialSlider = document.querySelector('.testimonial-slider');
        if (testimonialSlider) {
            testimonialSlider.addEventListener('touchstart', touchStartHandler, {passive: true});
            testimonialSlider.addEventListener('touchend', touchEndHandler, {passive: true});
        }
    }
    
    // Fix mobile navigation issues
    function fixMobileNavigation() {
        // Make sure hamburger is always visible on mobile
        if (window.innerWidth <= 768) {
            if (hamburger) {
                hamburger.style.display = 'flex';
            }
        }
        
        // Fix for iOS Safari
        if(/iPhone|iPod|iPad/.test(navigator.userAgent)) {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            window.addEventListener('resize', () => {
                document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            });
        }
    }
    
    /*===== EVENT HANDLERS =====*/
    
    // Handle scroll events
    function handleScroll() {
        const scrollPosition = window.pageYOffset;
        
        // Header behavior (hide on scroll down, show on scroll up)
        if (scrollPosition > 100) {
            if (scrollPosition > lastScrollPosition + 50 && !isHeaderHidden && scrollPosition > 300) {
                header.classList.add('header-hidden');
                isHeaderHidden = true;
            } else if (scrollPosition < lastScrollPosition - 10 && isHeaderHidden) {
                header.classList.remove('header-hidden');
                isHeaderHidden = false;
            }
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            header.classList.remove('header-hidden');
            isHeaderHidden = false;
        }
        
        // Back to top button visibility
        if (scrollPosition > 600) {
            if(backToTopBtn) {
                backToTopBtn.style.display = 'flex';
                setTimeout(() => {
                    backToTopBtn.classList.add('active');
                }, 10);
            }
        } else {
            if(backToTopBtn) {
                backToTopBtn.classList.remove('active');
                setTimeout(() => {
                    if(scrollPosition <= 600) {
                        backToTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        }
        
        // Update active navigation link
        updateActiveNavLink();
        
        // Simple animation for elements in viewport (fallback for browsers without IntersectionObserver)
        if (!('IntersectionObserver' in window)) {
            animatedElements.forEach(element => {
                if (isInViewport(element)) {
                    element.classList.add('is-visible');
                }
            });
        }
        
        // Save current scroll position
        lastScrollPosition = scrollPosition;
    }
    
    // Handle resize events
    function handleResize() {
        // Update device type
        const newDeviceType = getDeviceType();
        if (deviceType !== newDeviceType) {
            deviceType = newDeviceType;
            console.log(`Device type changed to: ${deviceType}`);
        }
        
        // Update gallery layout and position
        if (galleryTrack) updateGalleryPosition();
        // Update video gallery layout and position
        if (videoGalleryTrack) updateVideoGalleryPosition();
        
        // Close mobile menu if open on resize to desktop
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
        
        // Ensure hamburger is displayed correctly on mobile
        if (hamburger) {
            if (window.innerWidth <= 768) {
                hamburger.style.display = 'flex';
            } else {
                hamburger.style.display = 'none';
            }
        }
        
        // Adjust scroll position for hash links after resize
        if (window.location.hash) {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                setTimeout(() => {
                    const headerHeight = header.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'auto'
                    });
                }, 200);
            }
        }
    }
    
    // Handle navigation link clicks
    function handleNavLinkClick(e) {
        e.preventDefault();
        
        // Close mobile menu if open
        closeMobileMenu();
        
        // Get target section
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Scroll to target section
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Handle tab clicks
    function handleTabClick() {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        const tabId = this.getAttribute('data-id');
        const tabContent = document.getElementById(tabId);
        
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        // If on mobile, scroll tab into view
        if (deviceType !== 'desktop') {
            this.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    // Handle swipe gesture
    function handleSwipe(targetElement) {
        const SWIPE_THRESHOLD = 50;
        const SWIPE_ANGLE_THRESHOLD = 30;
        
        // Calculate swipe distance
        const swipeDistanceX = touchEndX - touchStartX;
        const swipeDistanceY = touchEndY - touchStartY;
        
        // Calculate swipe angle to ensure we're swiping mostly horizontally
        const swipeAngle = Math.abs(Math.atan2(swipeDistanceY, swipeDistanceX) * 180 / Math.PI);
        const isHorizontalSwipe = swipeAngle <= SWIPE_ANGLE_THRESHOLD || swipeAngle >= (180 - SWIPE_ANGLE_THRESHOLD);
        
        // Only process horizontal swipes that exceed the threshold
        if (Math.abs(swipeDistanceX) < SWIPE_THRESHOLD || !isHorizontalSwipe) return;
        
        // Determine direction (-1 for left/prev, 1 for right/next)
        const direction = swipeDistanceX > 0 ? -1 : 1;
        
        // Check which element is being swiped
        const galleryContainer = document.querySelector('.gallery-container');
        const testimonialContainer = document.querySelector('.testimonial-slider');
        const videoGalleryContainer = document.querySelector('.video-gallery-container');
        
        if (targetElement === galleryContainer || (galleryContainer && isElementVisible(galleryContainer))) {
            navigateGallery(direction);
            resetGalleryAutoplay();
        } else if (targetElement === videoGalleryContainer || (videoGalleryContainer && isElementVisible(videoGalleryContainer))) {
            navigateVideoGallery(direction);
        } else if (targetElement === testimonialContainer || (testimonialContainer && isElementVisible(testimonialContainer))) {
            navigateTestimonial(direction);
            resetTestimonialAutoplay();
        }
    }
    
    /*===== HEADER & NAVIGATION =====*/
    
    // Initialize header behavior
    function initHeader() {
        // Add visible class after a short delay (gives time to load)
        setTimeout(() => {
            header.classList.add('header-visible');
        }, 200);
        
        // Initial check for scroll position on page load
        if (window.pageYOffset > 100) {
            header.classList.add('scrolled');
        }
        
        // If we have a hash in the URL, adjust scroll position after page load
        if (window.location.hash) {
            setTimeout(() => {
                const targetElement = document.querySelector(window.location.hash);
                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'auto'
                    });
                }
            }, 300);
        }
    }
    
    // Initialize mobile menu
    function initMobileMenu() {
        // Add classes for animation delay on mobile menu items
        navLinks.forEach((link, index) => {
            link.style.transitionDelay = `${0.1 + index * 0.05}s`;
        });
    }
    
    // Toggle mobile menu - perfected
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Toggle aria-expanded for accessibility
        const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
        hamburger.setAttribute('aria-expanded', !expanded);
        
        // Add fade-in class to links for animation
        if (navMenu.classList.contains('active')) {
            navLinks.forEach((link, index) => {
                link.classList.remove('fade-in');
                // Force reflow to restart animation
                void link.offsetWidth;
                // Apply delay and add class
                link.style.transitionDelay = `${0.1 + index * 0.05}s`;
                link.classList.add('fade-in');
            });
            
            // Prevent scrolling of background content
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
            
            // Announce menu opened for screen readers
            const liveRegion = document.getElementById('menu-live-region') || createLiveRegion('menu-live-region');
            liveRegion.textContent = "Navigation menu opened";
        } else {
            navLinks.forEach(link => {
                link.classList.remove('fade-in');
                link.style.transitionDelay = "";
            });
            
            // Allow scrolling of background content
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
            
            // Announce menu closed for screen readers
            const liveRegion = document.getElementById('menu-live-region') || createLiveRegion('menu-live-region');
            liveRegion.textContent = "Navigation menu closed";
        }
    }
    
    // Create live region for screen reader announcements
    function createLiveRegion(id) {
        const region = document.createElement('div');
        region.id = id;
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'true');
        region.classList.add('sr-only');
        document.body.appendChild(region);
        return region;
    }
    
    // Close mobile menu
    function closeMobileMenu() {
        if (!hamburger || !navMenu) return;
        
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
        
        navLinks.forEach(link => {
            link.classList.remove('fade-in');
            link.style.transitionDelay = "";
        });
        
        // Allow scrolling of background content
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
    }
    
    // Update active navigation link
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        
        // Find the section currently in view
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - header.offsetHeight - 20;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // Update active class on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href').substring(1); // Remove # from href
            if (linkHref === currentSectionId) {
                link.classList.add('active');
            }
        });
    }
    
    /*===== TABS FUNCTIONALITY =====*/
    
    // Initialize tabs for services section
    function initTabs() {
        if (!tabBtns.length) return;
        
        // Make sure first tab is active on load
        if (tabBtns[0] && !tabBtns[0].classList.contains('active')) {
            tabBtns[0].classList.add('active');
            tabBtns[0].setAttribute('aria-selected', 'true');
            
            const firstTabId = tabBtns[0].getAttribute('data-id');
            const firstTab = document.getElementById(firstTabId);
            if (firstTab) {
                firstTab.classList.add('active');
            }
        }
        
        // Add scroll indicators for mobile tabs
        const tabsContainer = document.querySelector('.tabs');
        if (tabsContainer && deviceType !== 'desktop') {
            tabsContainer.classList.add('has-overflow');
            
            // Scroll active tab into view
            const activeTab = tabsContainer.querySelector('.tab-btn.active');
            if (activeTab) {
                setTimeout(() => {
                    activeTab.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }, 300);
            }
            
            // Show scroll indicators based on scroll position
            tabsContainer.addEventListener('scroll', function() {
                updateTabsScrollIndicators(this);
            }, { passive: true });
            
            // Initial check for scroll indicators
            updateTabsScrollIndicators(tabsContainer);
        }
    }
    
    // Update tabs scroll indicators
    function updateTabsScrollIndicators(tabsContainer) {
        const maxScrollLeft = tabsContainer.scrollWidth - tabsContainer.clientWidth;
        
        if (tabsContainer.scrollLeft > 20) {
            tabsContainer.classList.add('scroll-left');
        } else {
            tabsContainer.classList.remove('scroll-left');
        }
        
        if (tabsContainer.scrollLeft < maxScrollLeft - 20) {
            tabsContainer.classList.add('scroll-right');
        } else {
            tabsContainer.classList.remove('scroll-right');
        }
    }
    
    /*===== GALLERY SLIDER =====*/
    
    // Initialize gallery slider
    function initGallery() {
        if (!galleryTrack || !gallerySlides.length) return;
        
        // Create dots for gallery navigation
        createGalleryDots();
        
        // Set up gallery navigation
        if (prevGalleryBtn && nextGalleryBtn) {
            nextGalleryBtn.addEventListener('click', () => {
                navigateGallery(1);
                resetGalleryAutoplay();
            });
            
            prevGalleryBtn.addEventListener('click', () => {
                navigateGallery(-1);
                resetGalleryAutoplay();
            });
        }
        
        // Start gallery autoplay
        startGalleryAutoplay();
        
        // Set initial position
        updateGalleryPosition();
    }
    
    // Create dots for gallery navigation
    function createGalleryDots() {
        if (!galleryDotsContainer || !gallerySlides.length) return;
        
        // Clear existing dots
        galleryDotsContainer.innerHTML = '';
        
        // Create new dots based on number of slides
        gallerySlides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('gallery-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Slide ${index + 1}`);
            dot.setAttribute('tabindex', '0');
            
            // Add click event
            dot.addEventListener('click', () => {
                goToGallerySlide(index);
                resetGalleryAutoplay();
            });
            
            // Add keyboard support
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToGallerySlide(index);
                    resetGalleryAutoplay();
                }
            });
            
            galleryDotsContainer.appendChild(dot);
        });
    }
    
    // Navigate gallery by direction
    function navigateGallery(direction) {
        if (!gallerySlides.length || isGalleryAnimating) return; // Prevent action if animating
        isGalleryAnimating = true; // Set animating flag

        // Disable buttons temporarily
        if (prevGalleryBtn) prevGalleryBtn.disabled = true;
        if (nextGalleryBtn) nextGalleryBtn.disabled = true;

        galleryCurrentIndex = (galleryCurrentIndex + direction + gallerySlides.length) % gallerySlides.length;
        updateGalleryPosition();
    }
    
    // Go to specific gallery slide
    function goToGallerySlide(index) {
        if (index < 0 || index >= gallerySlides.length || index === galleryCurrentIndex || isGalleryAnimating) return; // Prevent action if animating or same slide
        isGalleryAnimating = true; // Set animating flag

        // Disable buttons temporarily
        if (prevGalleryBtn) prevGalleryBtn.disabled = true;
        if (nextGalleryBtn) nextGalleryBtn.disabled = true;

        galleryCurrentIndex = index;
        updateGalleryPosition();
    }
    
    // Update gallery slider position
    function updateGalleryPosition() {
        if (!galleryTrack || !gallerySlides.length) return;
        
        // Get current slide width
        const slideWidth = gallerySlides[0].offsetWidth;
        
        // Apply transform with smooth animation
        galleryTrack.style.transition = 'transform 0.5s ease';
        galleryTrack.style.transform = `translateX(-${galleryCurrentIndex * slideWidth}px)`;
        
        // Re-enable buttons and reset flag after transition
        setTimeout(() => {
            isGalleryAnimating = false;
            if (prevGalleryBtn) prevGalleryBtn.disabled = false;
            if (nextGalleryBtn) nextGalleryBtn.disabled = false;
        }, 500); // Match transition duration

        // Update dots
        const galleryDots = document.querySelectorAll('.gallery-dot');
        galleryDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === galleryCurrentIndex);
            dot.setAttribute('aria-current', index === galleryCurrentIndex ? 'true' : 'false');
        });
        
        // Announce slide change for screen readers
        const liveRegion = document.getElementById('gallery-live-region') || createLiveRegion('gallery-live-region');
        liveRegion.textContent = `Showing slide ${galleryCurrentIndex + 1} of ${gallerySlides.length}`;
    }
    
    // Start gallery autoplay
    function startGalleryAutoplay() {
        if (!gallerySlides.length) return;
        clearInterval(galleryAutoplay);
        galleryAutoplay = setInterval(() => {
            navigateGallery(1);
        }, 5000);
    }
    
    // Reset gallery autoplay
    function resetGalleryAutoplay() {
        clearInterval(galleryAutoplay);
        startGalleryAutoplay();
    }

    /*===== VIDEO GALLERY SLIDER =====*/

    // Initialize video gallery slider
    function initVideoGallery() {
        if (!videoGalleryTrack || !videoGallerySlides.length) return;

        // Create dots for video gallery navigation
        createVideoGalleryDots();

        // Set initial position
        updateVideoGalleryPosition();
    }

    // Create dots for video gallery navigation
    function createVideoGalleryDots() {
        if (!videoGalleryDotsContainer || !videoGallerySlides.length) return;

        videoGalleryDotsContainer.innerHTML = ''; // Clear existing dots

        videoGallerySlides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('video-gallery-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Video ${index + 1}`);
            dot.setAttribute('tabindex', '0');

            dot.addEventListener('click', () => {
                goToVideoGallerySlide(index);
            });

            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToVideoGallerySlide(index);
                }
            });

            videoGalleryDotsContainer.appendChild(dot);
        });
    }

    // Navigate video gallery by direction
    function navigateVideoGallery(direction) {
        if (!videoGallerySlides.length) return;
        videoGalleryCurrentIndex = (videoGalleryCurrentIndex + direction + videoGallerySlides.length) % videoGallerySlides.length;
        updateVideoGalleryPosition();
    }

    // Go to specific video gallery slide
    function goToVideoGallerySlide(index) {
        if (index < 0 || index >= videoGallerySlides.length) return;
        videoGalleryCurrentIndex = index;
        updateVideoGalleryPosition();
    }

    // Update video gallery slider position
    function updateVideoGalleryPosition() {
        if (!videoGalleryTrack || !videoGallerySlides.length) return;

        const slideWidth = videoGallerySlides[0].offsetWidth;

        videoGalleryTrack.style.transition = 'transform 0.5s ease';
        videoGalleryTrack.style.transform = `translateX(-${videoGalleryCurrentIndex * slideWidth}px)`;

        // Update dots
        const videoDots = document.querySelectorAll('.video-gallery-dot');
        videoDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === videoGalleryCurrentIndex);
            dot.setAttribute('aria-current', index === videoGalleryCurrentIndex ? 'true' : 'false');
        });

        // Announce slide change for screen readers
        const liveRegion = document.getElementById('video-gallery-live-region') || createLiveRegion('video-gallery-live-region');
        liveRegion.textContent = `Showing video ${videoGalleryCurrentIndex + 1} of ${videoGallerySlides.length}`;

        // Pause videos in non-active slides
        videoGallerySlides.forEach((slide, index) => {
            const iframe = slide.querySelector('iframe');
            if (iframe && index !== videoGalleryCurrentIndex) {
                if (iframe.src.includes('youtube.com')) {
                    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                }
                if (iframe.src.includes('facebook.com')) {
                    const currentSrc = iframe.src;
                    iframe.src = '';
                    setTimeout(() => { iframe.src = currentSrc; }, 100);
                }
            }
        });
    }
    
    /*===== TESTIMONIALS SLIDER =====*/
    
    // Initialize testimonials slider
    function initTestimonials() {
        if (!testimonialSlides.length) return;
        
        // Set up testimonial navigation
        if (prevTestimonialBtn && nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', () => {
                navigateTestimonial(1);
                resetTestimonialAutoplay();
            });
            
            prevTestimonialBtn.addEventListener('click', () => {
                navigateTestimonial(-1);
                resetTestimonialAutoplay();
            });
        }
        
        if (testimonialDots) {
            testimonialDots.forEach((dot, index) => {
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `Testimonial ${index + 1}`);
                dot.setAttribute('tabindex', '0');
                dot.setAttribute('aria-current', index === 0 ? 'true' : 'false');
                
                dot.addEventListener('click', () => {
                    goToTestimonialSlide(index);
                    resetTestimonialAutoplay();
                });
                
                // Add keyboard support
                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        goToTestimonialSlide(index);
                        resetTestimonialAutoplay();
                    }
                });
            });
        }
        
        // Set initial state
        updateTestimonialPosition();
        
        // Start testimonial autoplay
        startTestimonialAutoplay();
    }
    
    // Navigate testimonial by direction
    function navigateTestimonial(direction) {
        if (!testimonialSlides.length) return;
        testimonialCurrentIndex = (testimonialCurrentIndex + direction + testimonialSlides.length) % testimonialSlides.length;
        updateTestimonialPosition();
    }
    
    // Go to specific testimonial slide
    function goToTestimonialSlide(index) {
        if (index < 0 || index >= testimonialSlides.length) return;
        testimonialCurrentIndex = index;
        updateTestimonialPosition();
    }
    
    // Update testimonial slider position
    function updateTestimonialPosition() {
        // Hide all slides and show current
        testimonialSlides.forEach((slide, index) => {
            slide.classList.remove('active');
            slide.setAttribute('aria-hidden', 'true');
            
            // Prepare slide for animation if it will be activated
            if (index === testimonialCurrentIndex) {
                // Force reflow to restart animation
                void slide.offsetWidth;
            }
        });
        
        // Show active slide with animation
        testimonialSlides[testimonialCurrentIndex].classList.add('active');
        testimonialSlides[testimonialCurrentIndex].setAttribute('aria-hidden', 'false');
        
        // Update dots
        if (testimonialDots) {
            testimonialDots.forEach((dot, index) => {
                dot.classList.toggle('active', index === testimonialCurrentIndex);
                dot.setAttribute('aria-current', index === testimonialCurrentIndex ? 'true' : 'false');
            });
        }
        
        // Announce for screen readers
        const liveRegion = document.getElementById('testimonial-live-region') || createLiveRegion('testimonial-live-region');
        liveRegion.textContent = `Showing testimonial ${testimonialCurrentIndex + 1} of ${testimonialSlides.length}`;
    }
    
    // Start testimonial autoplay
    function startTestimonialAutoplay() {
        if (!testimonialSlides.length) return;
        clearInterval(testimonialAutoplay);
        testimonialAutoplay = setInterval(() => {
            navigateTestimonial(1);
        }, 8000); // Slightly longer interval for testimonials
    }
    
    // Reset testimonial autoplay
    function resetTestimonialAutoplay() {
        clearInterval(testimonialAutoplay);
        startTestimonialAutoplay();
    }
    
    /*===== BACK TO TOP =====*/
    
    // Initialize back to top button
    function initBackToTop() {
        if (!backToTopBtn) return;
        
        // Check initial scroll position
        if (window.pageYOffset > 600) {
            backToTopBtn.style.display = 'flex';
            backToTopBtn.classList.add('active');
        }
    }
    
    // Scroll to top function
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    /*===== SCROLL ANIMATIONS =====*/
    
    // Initialize basic scroll animations
    function initScrollAnimations() {
        // Simple fallback for browsers that don't support IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            animatedElements.forEach(element => {
                if (isInViewport(element)) {
                    element.classList.add('is-visible');
                }
            });
        }
    }
    
    // Initialize IntersectionObserver for more efficient animations
    function initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // For feature cards, add a delay
                    if (entry.target.classList.contains('feature-card')) {
                        const index = Array.from(document.querySelectorAll('.feature-card')).indexOf(entry.target);
                        setTimeout(() => {
                            entry.target.classList.add('card-animated');
                        }, index * 150);
                    }
                    
                    // Unobserve once animation is applied
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe all animated elements
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    /*===== INITIALIZE =====*/
    // Start the application once DOM is loaded
    init();
    
    // Handle page load
    window.addEventListener('load', () => {
        // Ensure gallery position is correct after all assets load
        if (galleryTrack) {
            updateGalleryPosition();
        }
        // Ensure video gallery position is correct after all assets load
        if (videoGalleryTrack) {
            updateVideoGalleryPosition();
        }

        // Add loaded class to body for potential page entrance animations
        document.body.classList.add('page-loaded');
        
        // Fix any layout issues after all assets loaded
        setTimeout(handleResize, 300);
    });
});