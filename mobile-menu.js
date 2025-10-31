/*===== MOBILE-OPTIMIZED STANDALONE SCRIPT =====*/
/*===== Works without ES6 modules for maximum compatibility =====*/

(function() {
    'use strict';
    
    console.log('📱 Mobile menu script loading...');
    
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Wait for DOM - with multiple checks for reliability
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    ready(init);
    
    function init() {
        console.log('🌿 Annapurna Ayurveda - Mobile Menu Initializing...');
        
        // Remove loading class
        document.documentElement.classList.remove('loading');
        
        // Fix iOS viewport
        fixIOSViewport();
        
        // Initialize mobile menu with retry mechanism
        let menuInitAttempts = 0;
        const maxAttempts = 5;
        
        function tryInitMenu() {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            if (hamburger && navMenu) {
                initMobileMenu();
                console.log('✅ Mobile menu initialized successfully');
            } else {
                menuInitAttempts++;
                if (menuInitAttempts < maxAttempts) {
                    console.log(`⏳ Menu elements not ready, retrying... (${menuInitAttempts}/${maxAttempts})`);
                    setTimeout(tryInitMenu, 100);
                } else {
                    console.error('❌ Failed to initialize menu after', maxAttempts, 'attempts');
                    console.log('Hamburger:', hamburger, 'NavMenu:', navMenu);
                }
            }
        }
        
        tryInitMenu();
        
        // Initialize header
        initHeader();
        
        // Initialize back to top
        initBackToTop();
        
        // Initialize smooth scroll
        initSmoothScroll();
    }
    
    // Fix iOS viewport height
    function fixIOSViewport() {
        if (/iPhone|iPod|iPad/.test(navigator.userAgent)) {
            function setVH() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
            }
            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);
        }
    }
    
    // Mobile menu functionality
    function initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        if (!hamburger || !navMenu) {
            console.log('⚠️ Menu elements not found');
            return;
        }
        
        console.log('🍔 Hamburger menu initialized');
        
        // Toggle menu
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking links
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href');
                closeMenu();
                
                // Smooth scroll to section
                setTimeout(function() {
                    const element = document.querySelector(target);
                    if (element) {
                        const header = document.querySelector('.header');
                        const headerHeight = header ? header.offsetHeight : 0;
                        const elementPosition = element.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 300);
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                    closeMenu();
                }
            }
        });
        
        function toggleMenu() {
            const isActive = hamburger.classList.contains('active');
            
            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        }
        
        function openMenu() {
            hamburger.classList.add('active');
            navMenu.classList.add('active');
            document.body.classList.add('menu-open');
            
            // Lock scroll
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = '-' + scrollY + 'px';
            document.body.style.width = '100%';
            
            hamburger.setAttribute('aria-expanded', 'true');
            
            console.log('📱 Menu opened');
        }
        
        function closeMenu() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            
            // Unlock scroll
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
            
            hamburger.setAttribute('aria-expanded', 'false');
            
            console.log('📱 Menu closed');
        }
    }
    
    // Header scroll behavior
    function initHeader() {
        const header = document.querySelector('.header');
        if (!header) return;
        
        let lastScrollPosition = 0;
        let isHeaderHidden = false;
        
        // Show header
        setTimeout(function() {
            header.classList.add('header-visible');
        }, 200);
        
        // Check initial scroll
        if (window.pageYOffset > 100) {
            header.classList.add('scrolled');
        }
        
        // Scroll handler with throttle
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(function() {
                const scrollPosition = window.pageYOffset;
                
                // Add/remove scrolled class
                if (scrollPosition > 100) {
                    header.classList.add('scrolled');
                    
                    // Hide header on scroll down (only on mobile)
                    if (window.innerWidth <= 768) {
                        if (scrollPosition > lastScrollPosition + 50 && 
                            !isHeaderHidden && 
                            scrollPosition > 300) {
                            header.classList.add('header-hidden');
                            isHeaderHidden = true;
                        } else if (scrollPosition < lastScrollPosition - 10 && isHeaderHidden) {
                            header.classList.remove('header-hidden');
                            isHeaderHidden = false;
                        }
                    }
                } else {
                    header.classList.remove('scrolled', 'header-hidden');
                    isHeaderHidden = false;
                }
                
                lastScrollPosition = scrollPosition;
                
                // Update active nav link
                updateActiveNavLink();
            }, 50);
        }, { passive: true });
        
        // Update active nav link based on scroll position
        function updateActiveNavLink() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            
            let currentSectionId = '';
            sections.forEach(function(section) {
                const sectionTop = section.offsetTop - (header.offsetHeight + 20);
                const sectionHeight = section.offsetHeight;
                
                if (window.pageYOffset >= sectionTop && 
                    window.pageYOffset < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(function(link) {
                link.classList.remove('active');
                const linkHref = link.getAttribute('href').substring(1);
                if (linkHref === currentSectionId) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Back to top button
    function initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;
        
        // Show/hide based on scroll
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 600) {
                backToTopBtn.style.display = 'flex';
                setTimeout(function() {
                    backToTopBtn.classList.add('active');
                }, 10);
            } else {
                backToTopBtn.classList.remove('active');
                if (window.pageYOffset <= 600) {
                    setTimeout(function() {
                        backToTopBtn.style.display = 'none';
                    }, 300);
                }
            }
        }, { passive: true });
        
        // Click handler
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Smooth scroll for all anchor links
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        const header = document.querySelector('.header');
        
        links.forEach(function(link) {
            // Skip if already handled by nav links
            if (link.classList.contains('nav-link')) return;
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href');
                
                if (target === '#') return;
                
                const element = document.querySelector(target);
                if (element) {
                    const headerHeight = header ? header.offsetHeight : 0;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
})();
