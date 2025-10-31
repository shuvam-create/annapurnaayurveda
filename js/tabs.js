/*===== TABS MODULE =====*/
import { getDeviceType, debounce } from './utils.js';

export class Tabs {
    constructor() {
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.tabsContainer = document.querySelector('.tabs');
        
        if (this.tabBtns.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.setupTabs();
        this.setupEventListeners();
        this.setupMobileScrollIndicators();
    }
    
    setupTabs() {
        // Make sure first tab is active on load
        if (this.tabBtns[0] && !this.tabBtns[0].classList.contains('active')) {
            this.tabBtns[0].classList.add('active');
            this.tabBtns[0].setAttribute('aria-selected', 'true');
            
            const firstTabId = this.tabBtns[0].getAttribute('data-id');
            const firstTab = document.getElementById(firstTabId);
            if (firstTab) {
                firstTab.classList.add('active');
            }
        }
    }
    
    setupEventListeners() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleTabClick(btn));
        });
    }
    
    setupMobileScrollIndicators() {
        if (!this.tabsContainer) return;
        
        const deviceType = getDeviceType();
        if (deviceType !== 'desktop') {
            this.tabsContainer.classList.add('has-overflow');
            
            // Scroll active tab into view
            const activeTab = this.tabsContainer.querySelector('.tab-btn.active');
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
            this.tabsContainer.addEventListener('scroll', debounce(() => {
                this.updateScrollIndicators();
            }, 100), { passive: true });
            
            // Initial check for scroll indicators
            this.updateScrollIndicators();
        }
    }
    
    handleTabClick(clickedBtn) {
        // Remove active class from all buttons and contents
        this.tabBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        
        this.tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        clickedBtn.classList.add('active');
        clickedBtn.setAttribute('aria-selected', 'true');
        
        const tabId = clickedBtn.getAttribute('data-id');
        const tabContent = document.getElementById(tabId);
        
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        // If on mobile, scroll tab into view
        const deviceType = getDeviceType();
        if (deviceType !== 'desktop') {
            clickedBtn.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
    
    updateScrollIndicators() {
        if (!this.tabsContainer) return;
        
        const maxScrollLeft = this.tabsContainer.scrollWidth - this.tabsContainer.clientWidth;
        
        if (this.tabsContainer.scrollLeft > 20) {
            this.tabsContainer.classList.add('scroll-left');
        } else {
            this.tabsContainer.classList.remove('scroll-left');
        }
        
        if (this.tabsContainer.scrollLeft < maxScrollLeft - 20) {
            this.tabsContainer.classList.add('scroll-right');
        } else {
            this.tabsContainer.classList.remove('scroll-right');
        }
    }
}
