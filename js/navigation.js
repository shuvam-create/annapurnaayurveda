/*===== NAVIGATION MODULE =====*/
import { debounce, throttle, smoothScrollTo, preventBodyScroll, allowBodyScroll, createLiveRegion } from './utils.js';

export class Navigation {
    constructor() {
        // DOM elements
        this.header = document.querySelector('.header');
        this.navMenu = document.querySelector('.nav-menu');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.backToTopBtn = document.getElementById('backToTop');
        
        // State
        this.lastScrollPosition = 0;
        this.isHeaderHidden = false;
        this.scrollYBeforeMenuOpen = 0;
        
        this.init();
    }
    
    init() {
        if (!this.header) return;
        
        // Initial setup
        this.setupHeader();
        this.setupMobileMenu();
        this.setupNavLinks();
        this.setupBackToTop();
        this.setupScrollBehavior();
        
        // Event listeners
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100), { passive: true });
        window.addEventListener('resize', debounce(() => this.handleResize(), 200));
        
        // Prevent auto-scroll on page load
        this.preventInitialScroll();
    }
    
    setupHeader() {
        // Show header with animation after load
        setTimeout(() => {
            this.header.classList.add('header-visible');
        }, 200);
        
        // Check initial scroll position
        if (window.pageYOffset > 100) {
            this.header.classList.add('scrolled');
        }
    }
    
    setupMobileMenu() {
        if (!this.hamburger || !this.navMenu) return;
        
        // Hamburger click handler
        this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        
        // Add touch feedback
        this.hamburger.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        this.hamburger.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        }, { passive: true });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navMenu.classList.contains('active')) {
                if (!this.navMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
        
        // Add transition delays to links
        this.navLinks.forEach((link, index) => {
            link.style.transitionDelay = `${0.1 + index * 0.05}s`;
        });
    }
    
    setupNavLinks() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e));
        });
    }
    
    setupBackToTop() {
        if (!this.backToTopBtn) return;
        
        this.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Check initial scroll position
        if (window.pageYOffset > 600) {
            this.backToTopBtn.style.display = 'flex';
            this.backToTopBtn.classList.add('active');
        }
    }
    
    setupScrollBehavior() {
        // Prevent auto-scroll restoration that can cause random scrolling
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }
    
    preventInitialScroll() {
        // If there's a hash in URL, handle it properly without auto-scroll
        if (window.location.hash) {
            // Temporarily remove the hash
            const hash = window.location.hash;
            window.location.hash = '';
            
            // Wait for page to fully load, then scroll smoothly
            setTimeout(() => {
                const targetElement = document.querySelector(hash);
                if (targetElement) {
                    const headerHeight = this.header.offsetHeight;
                    smoothScrollTo(targetElement, headerHeight);
                }
            }, 500);
        }
    }
    
    handleScroll() {
        const scrollPosition = window.pageYOffset;
        
        // Header behavior (hide on scroll down, show on scroll up)
        if (scrollPosition > 100) {
            // Only hide header on mobile and when scrolling down significantly
            if (scrollPosition > this.lastScrollPosition + 50 && 
                !this.isHeaderHidden && 
                scrollPosition > 300) {
                this.header.classList.add('header-hidden');
                this.isHeaderHidden = true;
            } else if (scrollPosition < this.lastScrollPosition - 10 && this.isHeaderHidden) {
                this.header.classList.remove('header-hidden');
                this.isHeaderHidden = false;
            }
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled', 'header-hidden');
            this.isHeaderHidden = false;
        }
        
        // Back to top button visibility
        if (scrollPosition > 600) {
            if (this.backToTopBtn) {
                this.backToTopBtn.style.display = 'flex';
                setTimeout(() => {
                    this.backToTopBtn.classList.add('active');
                }, 10);
            }
        } else {
            if (this.backToTopBtn) {
                this.backToTopBtn.classList.remove('active');
                setTimeout(() => {
                    if (window.pageYOffset <= 600) {
                        this.backToTopBtn.style.display = 'none';
                    }
                }, 300);
            }
        }
        
        // Update active navigation link
        this.updateActiveNavLink();
        
        // Save current scroll position
        this.lastScrollPosition = scrollPosition;
    }
    
    handleResize() {
        // Close mobile menu if open on resize to desktop
        if (window.innerWidth > 768 && this.navMenu && this.navMenu.classList.contains('active')) {
            this.closeMobileMenu();
        }
        
        // Ensure hamburger is displayed correctly
        if (this.hamburger) {
            if (window.innerWidth <= 768) {
                this.hamburger.style.display = 'flex';
            } else {
                this.hamburger.style.display = 'none';
            }
        }
    }
    
    handleNavLinkClick(e) {
        e.preventDefault();
        
        // Close mobile menu if open
        this.closeMobileMenu();
        
        // Get target section
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        // Scroll to target section
        if (targetElement) {
            const headerHeight = this.header.offsetHeight;
            smoothScrollTo(targetElement, headerHeight);
            
            // Update URL without triggering scroll
            if (history.pushState) {
                history.pushState(null, null, targetId);
            }
        }
    }
    
    toggleMobileMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Toggle aria-expanded for accessibility
        const expanded = this.hamburger.getAttribute('aria-expanded') === 'true' || false;
        this.hamburger.setAttribute('aria-expanded', !expanded);
        
        if (this.navMenu.classList.contains('active')) {
            // Store current scroll position
            this.scrollYBeforeMenuOpen = window.scrollY;
            
            // Add fade-in class to links for animation
            this.navLinks.forEach((link, index) => {
                link.classList.remove('fade-in');
                void link.offsetWidth; // Force reflow
                link.style.transitionDelay = `${0.1 + index * 0.05}s`;
                link.classList.add('fade-in');
            });
            
            // Prevent background scrolling
            preventBodyScroll();
            
            // Announce menu opened for screen readers
            const liveRegion = createLiveRegion('menu-live-region');
            liveRegion.textContent = "Navigation menu opened";
        } else {
            this.navLinks.forEach(link => {
                link.classList.remove('fade-in');
                link.style.transitionDelay = "";
            });
            
            // Allow scrolling of background content
            allowBodyScroll();
            
            // Announce menu closed for screen readers
            const liveRegion = createLiveRegion('menu-live-region');
            liveRegion.textContent = "Navigation menu closed";
        }
    }
    
    closeMobileMenu() {
        if (!this.hamburger || !this.navMenu) return;
        
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');
        
        this.navLinks.forEach(link => {
            link.classList.remove('fade-in');
            link.style.transitionDelay = "";
        });
        
        // Allow scrolling of background content
        allowBodyScroll();
    }
    
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        
        // Find the section currently in view
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - this.header.offsetHeight - 20;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        // Update active class on nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href').substring(1);
            if (linkHref === currentSectionId) {
                link.classList.add('active');
            }
        });
    }
}
