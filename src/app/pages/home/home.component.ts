import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [
    trigger('serviceChange', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateX(-50%) translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateX(-50%) translateY(0)' }))
      ])
    ]),
    trigger('processSlide', [
      transition('out => in', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition('in => out', [
        animate('400ms ease-in', style({ opacity: 0, transform: 'translateY(-50px)' }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  isNavbarFixed = false;
  navbarTransform = 'translateY(0)'; // Transform for smooth movement
  currentServiceIndex = 0;
  currentProcessIndex = 0;
  portfolioOffset = 0;
  currentPortfolioIndex = 0; // Current visible portfolio item index
  isServicesFixed = false; // Track if services section is fixed
  servicesContentTransform = 'translateY(0)'; // Transform for smooth push-up transition
  isScrollingUpServices = false; // Track scroll direction for services section
  isProcessesFixed = false; // Track if processes section is fixed
  processesContentTransform = 'translateY(0)'; // Transform for smooth push-up transition
  isScrollingUpProcesses = false; // Track scroll direction for processes section
  isPortfolioFixed = false; // Track if portfolio section is fixed
  portfolioContentTransform = 'translateY(0)'; // Transform for smooth push-up transition
  isScrollingUpPortfolio = false; // Track scroll direction for portfolio section
  
  private scrollThreshold = 100;
  private navbarHeight = 80; // Approximate navbar height
  private viewportHeight = 0;
  private serviceScrollPositions: number[] = [];
  private processScrollPositions: number[] = [];
  private aboutSectionTop = 0; // Top position of about section
  private portfolioScrollStart = 0;
  private portfolioScrollEnd = 0;
  private statsScrollStart = 0;
  private scrollHandler?: () => void;
  private servicesSectionTop = 0; // Top position of services section
  private servicesSectionHeight = 0; // Height of services section
  private servicesFixedStart = 0; // Scroll position where fixing starts
  private servicesFixedEnd = 0; // Scroll position where fixing ends
  private processesSectionTop = 0; // Top position of processes section
  private processesSectionHeight = 0; // Height of processes section
  private processesFixedStart = 0; // Scroll position where fixing starts
  private processesFixedEnd = 0; // Scroll position where fixing ends
  private portfolioSectionTop = 0; // Top position of portfolio section
  private portfolioSectionHeight = 0; // Height of portfolio section
  private portfolioFixedStart = 0; // Scroll position where fixing starts
  private portfolioFixedEnd = 0; // Scroll position where fixing ends
  private lastScrollY = 0; // Track last scroll position for direction
  private resizeHandler?: () => void;

  services = [
    {
      name: 'Custom Website Development',
      description: 'Breathtaking, lightning-fast websites that don\'t just look stunning—they perform flawlessly. Every pixel meticulously crafted, every interaction thoughtfully designed to captivate your audience and convert visitors into loyal customers.',
      icon: '🌐'
    },
    {
      name: 'Web Application Development',
      description: 'Powerful, intelligent applications that transform complex workflows into seamless experiences. We build custom solutions that don\'t just automate—they revolutionize how your business operates, unlocking efficiency you never knew was possible.',
      icon: '⚙️'
    },
    {
      name: 'Full-Stack Solutions',
      description: 'End-to-end excellence from pixel-perfect interfaces to bulletproof infrastructure. We orchestrate every layer of your digital ecosystem, ensuring seamless integration, peak performance, and a user experience that leaves competitors in the dust.',
      icon: '⚡'
    },
    {
      name: 'E-Commerce Development',
      description: 'Revenue-generating machines disguised as beautiful online stores. Complete with intelligent payment systems, smart inventory management, and conversion-optimized experiences that don\'t just sell products—they build empires.',
      icon: '🛒'
    },
    {
      name: 'UI/UX Design',
      description: 'Interfaces so intuitive, so beautiful, so perfectly crafted that users can\'t help but fall in love. We don\'t just design—we engineer emotional connections that turn casual browsers into passionate advocates and drive conversions through the roof.',
      icon: '🎨'
    },
    {
      name: 'Website Maintenance & Support',
      description: 'Your digital presence never sleeps, and neither do we. With proactive monitoring, instant security updates, and lightning-fast support, we ensure your site doesn\'t just run smoothly—it runs flawlessly, 24/7, while you focus on growing your business.',
      icon: '🔧'
    }
  ];

  portfolioProjects = [
    { 
      name: 'Revolutionary E-Commerce Experience', 
      image: 'https://picsum.photos/400/300?random=1'
    },
    { 
      name: 'Elite Corporate Digital Presence', 
      image: 'https://picsum.photos/400/300?random=2'
    },
    { 
      name: 'Stunning Creative Portfolio', 
      image: 'https://picsum.photos/400/300?random=3'
    },
    { 
      name: 'Next-Gen SaaS Platform', 
      image: 'https://picsum.photos/400/300?random=4'
    },
    { 
      name: 'Captivating Mobile Experience', 
      image: 'https://picsum.photos/400/300?random=5'
    },
    { 
      name: 'Gourmet Dining Experience', 
      image: 'https://picsum.photos/400/300?random=6'
    },
    { 
      name: 'Premium Fitness Ecosystem', 
      image: 'https://picsum.photos/400/300?random=7'
    },
    { 
      name: 'Luxury Real Estate Platform', 
      image: 'https://picsum.photos/400/300?random=8'
    }
  ];

  processes = [
    {
      title: 'Product Requirements',
      description: 'We dive deep into your vision, uncovering not just what you want, but what you truly need. Through strategic discovery sessions, we transform your ideas into a crystal-clear roadmap—ensuring every feature, every interaction, every detail serves your ultimate goals.',
      icon: '📋'
    },
    {
      title: '2-Week Sprint',
      description: 'Velocity meets precision. Our laser-focused 2-week sprints deliver tangible results at breakneck speed. Each sprint begins with strategic planning and culminates in a powerful demo—you\'ll witness your vision come to life, iteration by iteration, faster than you ever imagined.',
      icon: '⚡'
    },
    {
      title: 'Weekly Reports',
      description: 'Transparency is our superpower. Every week, you receive comprehensive updates that paint a vivid picture of progress. No surprises, no mysteries—just crystal-clear insights into what\'s been accomplished, what\'s in motion, and what exciting developments await.',
      icon: '📊'
    },
    {
      title: 'Communication',
      description: 'We\'re not just your developers—we\'re your partners. Through real-time messaging and regular strategic check-ins, you\'ll have instant access to our team. No waiting, no wondering, no guesswork. Just seamless collaboration that keeps your project moving forward, always.',
      icon: '💬'
    }
  ];

  stats = [
    { value: '60+', label: 'Success Stories Delivered', icon: '🚀' },
    { value: '2-3', label: 'Months to Market Domination', icon: '📅' },
    { value: '30+', label: 'Elite Specialists at Your Service', icon: '👥' },
    { value: '€15000', label: 'Investment in Excellence', icon: '€' }
  ];

  techStack = [
    { name: 'WordPress', logo: '/svgs/wordpress.svg' },
    { name: 'ReactJS', logo: '/svgs/reactjs.svg' },
    { name: 'Python', logo: '/svgs/python.svg' },
    { name: 'Angular', logo: '/svgs/angular.svg' },
    { name: 'Canvas', logo: '/svgs/canvas.svg' },
    { name: 'Node.js', logo: '/svgs/nodejs.svg' },
    { name: 'PostgreSQL', logo: '/svgs/postgresql.svg' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Calculate scroll positions for different sections
    setTimeout(() => {
      this.calculateScrollPositions();
    }, 100);
  }

  ngAfterViewInit(): void {
    this.viewportHeight = window.innerHeight;
    
    // Set CSS variables for services and processes count early
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.style.setProperty('--services-count', String(this.services.length));
    }
    
    const processesSection = document.getElementById('processes');
    if (processesSection) {
      processesSection.style.setProperty('--processes-count', String(this.processes.length));
    }
    
    // Recalculate positions after a longer delay to ensure DOM is fully settled
    setTimeout(() => {
      this.calculateScrollPositions();
    }, 500);
    
    // Add resize listener to recalculate positions
    this.resizeHandler = () => {
      setTimeout(() => {
        this.calculateScrollPositions();
      }, 100);
    };
    window.addEventListener('resize', this.resizeHandler);
    
    this.setupScrollListeners();
    // Initial navbar position at bottom
    this.updateNavbarPosition(0);
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private calculateScrollPositions(): void {
    const servicesSection = document.getElementById('services');
    const processesSection = document.getElementById('processes');
    const portfolioSection = document.getElementById('portfolio');
    const statsSection = document.getElementById('stats');

    if (servicesSection) {
      const rect = servicesSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const sectionTop = rect.top + scrollTop;
      const sectionHeight = rect.height;
      
      this.servicesSectionTop = sectionTop;
      this.servicesSectionHeight = sectionHeight;
      
      // Calculate when section becomes fully visible (top reaches viewport top)
      // This is when the top of the section reaches the top of the viewport
      this.servicesFixedStart = sectionTop;
      
      // Calculate end position: after scrolling through all services
      // Each service should take approximately viewport height to scroll through
      const viewportHeight = window.innerHeight;
      const scrollPerService = viewportHeight; // Each service takes full viewport height
      this.servicesFixedEnd = this.servicesFixedStart + (this.services.length * scrollPerService);
      
      // Set CSS variable for services count
      servicesSection.style.setProperty('--services-count', String(this.services.length));
      
      // Calculate positions for each service
      const serviceHeight = sectionHeight / this.services.length;
      this.serviceScrollPositions = this.services.map((_, i) => sectionTop + (i * serviceHeight));
    }

    if (processesSection) {
      const rect = processesSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const sectionTop = rect.top + scrollTop;
      const sectionHeight = rect.height;
      
      this.processesSectionTop = sectionTop;
      this.processesSectionHeight = sectionHeight;
      
      // Calculate when section becomes fully visible (top reaches viewport top)
      this.processesFixedStart = sectionTop;
      
      // Calculate end position: after scrolling through all processes
      // Each process should take approximately viewport height to scroll through
      const viewportHeight = window.innerHeight;
      const scrollPerProcess = viewportHeight; // Each process takes full viewport height
      this.processesFixedEnd = this.processesFixedStart + (this.processes.length * scrollPerProcess);
      
      // Set CSS variable for processes count
      processesSection.style.setProperty('--processes-count', String(this.processes.length));
      
      // Calculate positions for each process
      const processHeight = sectionHeight / this.processes.length;
      this.processScrollPositions = this.processes.map((_, i) => sectionTop + (i * processHeight));
    }

    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      const rect = aboutSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.aboutSectionTop = rect.top + scrollTop;
    }

    if (portfolioSection) {
      const rect = portfolioSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.portfolioScrollStart = rect.top + scrollTop;
      this.portfolioScrollEnd = this.portfolioScrollStart + rect.height;
    }

    if (statsSection) {
      const rect = statsSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.statsScrollStart = rect.top + scrollTop;
    }
  }

  private setupScrollListeners(): void {
    this.scrollHandler = () => this.onScroll();
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.onScroll(); // Initial check
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Update navbar position smoothly
    this.updateNavbarPosition(scrollY);
    
    // Services section - change content as you scroll
    this.updateServicesSection(scrollY);
    
    // Portfolio section - horizontal scroll
    this.updatePortfolioSection(scrollY);
    
    // Processes section - slide up animation
    this.updateProcessesSection(scrollY);
    
    this.lastScrollY = scrollY;
    this.cdr.detectChanges();
  }

  private updateNavbarPosition(scrollY: number): void {
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress (0 to 1) over one viewport height
    const scrollProgress = Math.min(1, Math.max(0, scrollY / windowHeight));
    
    // Distance to move = windowHeight - navbarHeight (from bottom to top)
    const distanceToMove = windowHeight - this.navbarHeight;
    
    // Always use transform - no switching positioning methods
    // When scrollProgress = 0, navbar is at bottom (translateY(0))
    // When scrollProgress = 1, navbar is at top (translateY(-distanceToMove))
    const translateY = -(scrollProgress * distanceToMove);
    this.navbarTransform = `translateY(${translateY}px)`;
    
    // Track if we're at the top for styling purposes
    this.isNavbarFixed = scrollProgress >= 1;
  }

  private updateServicesSection(scrollY: number): void {
    const servicesSection = document.getElementById('services');
    const aboutSection = document.getElementById('about');
    if (!servicesSection || !aboutSection) return;

    const viewportHeight = window.innerHeight;

    // Use cached positions, but recalculate about section position dynamically
    // since it might have shifted due to layout changes
    // About section is not fixed, so we can always get its accurate position
    const servicesTop = this.servicesSectionTop;
    const aboutRect = aboutSection.getBoundingClientRect();
    const aboutTop = aboutRect.top + (window.pageYOffset || document.documentElement.scrollTop);
    // Update cached value for consistency
    this.aboutSectionTop = aboutTop;

    if (!servicesTop || !aboutTop) return;

    // Absolute scroll ranges
    const pinStart = servicesTop;                 // when services reach viewport top
    // Use servicesFixedEnd to ensure all services are shown
    // Recalculate if not set (fallback)
    const scrollPerService = viewportHeight;
    const calculatedPinEnd = this.servicesFixedEnd || (servicesTop + (this.services.length * scrollPerService));
    const maxPinEnd = aboutTop - viewportHeight;    // Don't overlap with about section
    // Use calculatedPinEnd to show all services, but don't exceed about section start
    const pinEnd = Math.min(calculatedPinEnd, maxPinEnd);
    const transitionEnd = aboutTop;                // when about top hits viewport top

    const rect = servicesSection.getBoundingClientRect();
    const isScrollingUp = scrollY < this.lastScrollY;
    this.isScrollingUpServices = isScrollingUp;

    // ---------- BEFORE SERVICES ----------
    if (scrollY < pinStart) {
      this.isServicesFixed = false;
      this.servicesContentTransform = 'translateY(0)';
      this.currentServiceIndex = 0;
      return;
    }

    // ---------- AFTER EVERYTHING (ABOUT FULLY ENTERED) ----------
    if (scrollY >= transitionEnd) {
      this.isServicesFixed = false;
      this.servicesContentTransform = 'translateY(0)';
      this.currentServiceIndex = this.services.length - 1;
      return;
    }

    // ---------- SPECIAL CASE: SCROLLING UP ----------
    // While scrolling UP, don't snap to fixed until BOTH:
    // 1. The scroll position reaches pinStart (where section should be pinned)
    // 2. The section top is actually at viewport top
    // This prevents that "jump to top" when services first come back into view.
    if (isScrollingUp) {
      // If scroll position hasn't reached pinStart yet, keep it unfixed
      // This ensures natural scrolling until we reach the correct scroll position
      if (scrollY < pinStart) {
        this.isServicesFixed = false;
        this.servicesContentTransform = 'translateY(0)';
        this.currentServiceIndex = 0;
        return;
      }
      
      // If section top is still below viewport top, keep it unfixed
      // This allows the section to scroll naturally into view
      if (rect.top > 0) {
        this.isServicesFixed = false;
        this.servicesContentTransform = 'translateY(0)';
        // Calculate which service to show based on scroll position
        if (scrollY >= pinStart && scrollY <= pinEnd) {
          const totalFixedRange = pinEnd - pinStart;
          if (totalFixedRange > 0) {
            const progress = (scrollY - pinStart) / totalFixedRange;
      const newIndex = Math.min(
              this.services.length - 1,
              Math.max(0, Math.floor(progress * this.services.length))
            );
            this.currentServiceIndex = newIndex;
          }
        } else if (scrollY > pinEnd) {
          // In transition zone while scrolling up - show last service
          this.currentServiceIndex = this.services.length - 1;
        }
        return;
      }
      
      // If we're scrolling up and still in transition zone, continue with transform
      if (scrollY > pinEnd) {
        // Still in transition zone, keep calculating transform
        const transitionRange = transitionEnd - pinEnd || 1;
        const transitionProgress = (scrollY - pinEnd) / transitionRange;
        const translateY = -transitionProgress * viewportHeight;
        this.servicesContentTransform = `translateY(${translateY}px)`;
        this.isServicesFixed = true; // Keep fixed during transition
        this.currentServiceIndex = this.services.length - 1;
        return;
      }
      
      // Only pin when scrolling up if:
      // - scrollY >= pinStart (correct scroll position)
      // - rect.top <= 0 (section is at top)
      // - scrollY <= pinEnd (not in transition zone)
      // If all conditions met, fall through to pinned range below
    }

    // ---------- PINNED RANGE (HEADER FIXED) ----------
    // Pin when scrolling down OR when all conditions are met while scrolling up
    this.isServicesFixed = true;

    // A) NORMAL PIN (no push yet) – just change services on scroll
    if (scrollY <= pinEnd) {
      this.servicesContentTransform = 'translateY(0)';

      const totalFixedRange = pinEnd - pinStart;
      if (totalFixedRange > 0) {
        const progress = (scrollY - pinStart) / totalFixedRange;
        const newIndex = Math.min(
          this.services.length - 1,
          Math.max(0, Math.floor(progress * this.services.length))
        );
        this.currentServiceIndex = newIndex;
      }
    } 
    // B) TRANSITION RANGE – about enters, services get pushed up
    else {
      const transitionRange = transitionEnd - pinEnd || 1;
      const transitionProgress = (scrollY - pinEnd) / transitionRange; // 0 → 1
      const translateY = -transitionProgress * viewportHeight;          // 0 → -100vh

      this.servicesContentTransform = `translateY(${translateY}px)`;
      this.currentServiceIndex = this.services.length - 1; // keep last service while pushing
    }
  }

  private updatePortfolioSection(scrollY: number): void {
    const portfolioSection = document.getElementById('portfolio');
    const processesSection = document.getElementById('processes');
    if (!portfolioSection || !processesSection) return;

    const viewportHeight = window.innerHeight;

    const portfolioTop = this.portfolioSectionTop;
    const processesTop = this.processesSectionTop;

    if (!portfolioTop || !processesTop) return;

    // Absolute scroll ranges
    const pinStart = portfolioTop;                 // when portfolio reaches viewport top
    const pinEnd = processesTop - viewportHeight; // when processes top hits viewport bottom
    const transitionEnd = processesTop;           // when processes top hits viewport top

    const rect = portfolioSection.getBoundingClientRect();
    const isScrollingUp = scrollY < this.lastScrollY;
    this.isScrollingUpPortfolio = isScrollingUp;

    // ---------- BEFORE PORTFOLIO ----------
    if (scrollY < pinStart) {
      this.isPortfolioFixed = false;
      this.portfolioContentTransform = 'translateY(0)';
      this.updatePortfolioOffset(); // Update offset based on current index
      return;
    }

    // ---------- AFTER EVERYTHING (PROCESSES FULLY ENTERED) ----------
    if (scrollY >= transitionEnd) {
      this.isPortfolioFixed = false;
      this.portfolioContentTransform = 'translateY(0)';
      this.updatePortfolioOffset(); // Update offset based on current index
      return;
    }

    // ---------- SPECIAL CASE: SCROLLING UP ----------
    // While scrolling UP, don't snap to fixed until BOTH:
    // 1. The scroll position reaches pinStart (where section should be pinned)
    // 2. The section top is actually at viewport top
    if (isScrollingUp) {
      // If scroll position hasn't reached pinStart yet, keep it unfixed
      if (scrollY < pinStart) {
        this.isPortfolioFixed = false;
        this.portfolioContentTransform = 'translateY(0)';
        this.updatePortfolioOffset();
        return;
      }
      
      // If section top is still below viewport top, keep it unfixed
      if (rect.top > 0) {
        this.isPortfolioFixed = false;
        this.portfolioContentTransform = 'translateY(0)';
        this.updatePortfolioOffset();
        return;
      }
      
      // If we're scrolling up and still in transition zone, continue with transform
      if (scrollY > pinEnd) {
        // Still in transition zone, keep calculating transform
        const transitionRange = transitionEnd - pinEnd || 1;
        const transitionProgress = (scrollY - pinEnd) / transitionRange;
        const translateY = -transitionProgress * viewportHeight;
        this.portfolioContentTransform = `translateY(${translateY}px)`;
        this.isPortfolioFixed = true; // Keep fixed during transition
        this.updatePortfolioOffset();
        return;
      }
    }

    // ---------- PINNED RANGE (HEADER FIXED) ----------
    // Pin when scrolling down OR when all conditions are met while scrolling up
    this.isPortfolioFixed = true;

    // A) NORMAL PIN (no push yet) – keep current horizontal position
    if (scrollY <= pinEnd) {
      this.portfolioContentTransform = 'translateY(0)';
      this.updatePortfolioOffset(); // Update offset based on current index
    } 
    // B) TRANSITION RANGE – processes enters, portfolio gets pushed up
    else {
      const transitionRange = transitionEnd - pinEnd || 1;
      const transitionProgress = (scrollY - pinEnd) / transitionRange; // 0 → 1
      const translateY = -transitionProgress * viewportHeight;          // 0 → -100vh

      this.portfolioContentTransform = `translateY(${translateY}px)`;
      this.updatePortfolioOffset(); // Update offset based on current index
    }
  }

  private updatePortfolioOffset(): void {
    // Calculate offset based on current index
    // Each item is 400px wide + 2rem gap (32px) = 432px total per item
    // On mobile, item is 300px + 1.5rem gap (24px) = 324px
    const isMobile = window.innerWidth <= 768;
    const itemWidth = isMobile ? 324 : 432; // 300px + 24px on mobile, 400px + 32px on desktop
    const maxIndex = Math.max(0, this.portfolioProjects.length - 3); // Show 3 items at a time
    const clampedIndex = Math.min(this.currentPortfolioIndex, maxIndex);
    this.portfolioOffset = -(clampedIndex * itemWidth);
  }

  scrollPortfolioLeft(): void {
    if (this.currentPortfolioIndex > 0) {
      this.currentPortfolioIndex--;
      this.updatePortfolioOffset();
    }
  }

  scrollPortfolioRight(): void {
    const maxIndex = Math.max(0, this.portfolioProjects.length - 3);
    if (this.currentPortfolioIndex < maxIndex) {
      this.currentPortfolioIndex++;
      this.updatePortfolioOffset();
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    // Only handle horizontal scrolling when portfolio section is fixed
    if (this.isPortfolioFixed) {
      const portfolioContainer = document.querySelector('.portfolio-container');
      const portfolioContent = document.querySelector('.portfolio-content');
      
      // Check if event target is within portfolio section
      if (portfolioContent && portfolioContent.contains(event.target as Node)) {
        // Check if horizontal scroll (shift + wheel or trackpad horizontal scroll)
        const isHorizontalScroll = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
        
        if (isHorizontalScroll) {
          event.preventDefault();
          event.stopPropagation();
          
          // Determine scroll direction
          if (event.shiftKey) {
            // Shift + wheel: deltaY determines direction
            if (event.deltaY > 0) {
              this.scrollPortfolioRight();
            } else if (event.deltaY < 0) {
              this.scrollPortfolioLeft();
            }
          } else {
            // Trackpad horizontal scroll: deltaX determines direction
            if (event.deltaX > 0) {
              this.scrollPortfolioRight();
            } else if (event.deltaX < 0) {
              this.scrollPortfolioLeft();
            }
          }
        }
      }
    }
  }

  private updateProcessesSection(scrollY: number): void {
    const processesSection = document.getElementById('processes');
    const statsSection = document.getElementById('stats');
    if (!processesSection || !statsSection) return;

    const viewportHeight = window.innerHeight;

    // Recalculate processes section position dynamically
    // This ensures accurate positioning even after content changes (like text updates)
    const processesRect = processesSection.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const processesTop = processesRect.top + scrollTop;
    // Update cached value for consistency
    this.processesSectionTop = processesTop;

    // Recalculate stats section position dynamically
    // since it might have shifted due to layout changes
    const statsRect = statsSection.getBoundingClientRect();
    const statsTop = statsRect.top + scrollTop;
    // Update cached value for consistency
    this.statsScrollStart = statsTop;

    if (!processesTop || !statsTop) return;

    // Absolute scroll ranges
    const pinStart = processesTop;                 // when processes reach viewport top
    const pinEnd = statsTop - viewportHeight; // when stats top hits viewport bottom
    const transitionEnd = statsTop;           // when stats top hits viewport top

    const rect = processesSection.getBoundingClientRect();
    const isScrollingUp = scrollY < this.lastScrollY;
    this.isScrollingUpProcesses = isScrollingUp;

    // ---------- BEFORE PROCESSES ----------
    if (scrollY < pinStart) {
      this.isProcessesFixed = false;
      this.processesContentTransform = 'translateY(0)';
      this.currentProcessIndex = 0;
      return;
    }

    // ---------- AFTER EVERYTHING (STATS FULLY ENTERED) ----------
    if (scrollY >= transitionEnd) {
      this.isProcessesFixed = false;
      this.processesContentTransform = 'translateY(0)';
      this.currentProcessIndex = this.processes.length - 1;
      return;
    }

    // ---------- SPECIAL CASE: SCROLLING UP ----------
    // While scrolling UP, don't snap to fixed until BOTH:
    // 1. The scroll position reaches pinStart (where section should be pinned)
    // 2. The section top is actually at viewport top
    // This prevents that "jump to top" when processes first come back into view.
    if (isScrollingUp) {
      // If scroll position hasn't reached pinStart yet, keep it unfixed
      // This ensures natural scrolling until we reach the correct scroll position
      if (scrollY < pinStart) {
        this.isProcessesFixed = false;
        this.processesContentTransform = 'translateY(0)';
        this.currentProcessIndex = 0;
        return;
      }
      
      // If section top is still below viewport top, keep it unfixed
      // This allows the section to scroll naturally into view
      if (rect.top > 0) {
        this.isProcessesFixed = false;
        this.processesContentTransform = 'translateY(0)';
        // Calculate which process to show based on scroll position
        if (scrollY >= pinStart && scrollY <= pinEnd) {
          const totalFixedRange = pinEnd - pinStart;
          if (totalFixedRange > 0) {
            const progress = (scrollY - pinStart) / totalFixedRange;
      const newIndex = Math.min(
              this.processes.length - 1,
              Math.max(0, Math.floor(progress * this.processes.length))
            );
            this.currentProcessIndex = newIndex;
          }
        } else if (scrollY > pinEnd) {
          // In transition zone while scrolling up - show last process
          this.currentProcessIndex = this.processes.length - 1;
        }
        return;
      }
      
      // If we're scrolling up and still in transition zone, continue with transform
      if (scrollY > pinEnd) {
        // Still in transition zone, keep calculating transform
        const transitionRange = transitionEnd - pinEnd || 1;
        const transitionProgress = (scrollY - pinEnd) / transitionRange;
        const translateY = -transitionProgress * viewportHeight;
        this.processesContentTransform = `translateY(${translateY}px)`;
        this.isProcessesFixed = true; // Keep fixed during transition
        this.currentProcessIndex = this.processes.length - 1;
        return;
      }
      
      // Only pin when scrolling up if:
      // - scrollY >= pinStart (correct scroll position)
      // - rect.top <= 0 (section is at top)
      // - scrollY <= pinEnd (not in transition zone)
      // If all conditions met, fall through to pinned range below
    }

    // ---------- PINNED RANGE (HEADER FIXED) ----------
    // Pin when scrolling down OR when all conditions are met while scrolling up
    this.isProcessesFixed = true;

    // A) NORMAL PIN (no push yet) – just change processes on scroll
    if (scrollY <= pinEnd) {
      this.processesContentTransform = 'translateY(0)';

      const totalFixedRange = pinEnd - pinStart;
      if (totalFixedRange > 0) {
        const progress = (scrollY - pinStart) / totalFixedRange;
        const newIndex = Math.min(
          this.processes.length - 1,
          Math.max(0, Math.floor(progress * this.processes.length))
        );
        this.currentProcessIndex = newIndex;
      }
    } 
    // B) TRANSITION RANGE – stats enters, processes get pushed up
    else {
      const transitionRange = transitionEnd - pinEnd || 1;
      const transitionProgress = (scrollY - pinEnd) / transitionRange; // 0 → 1
      const translateY = -transitionProgress * viewportHeight;          // 0 → -100vh

      this.processesContentTransform = `translateY(${translateY}px)`;
      this.currentProcessIndex = this.processes.length - 1; // keep last process while pushing
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      // Get the element's bounding rect and current scroll position
      const elementRect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate the absolute position of the element's top edge in the document
      const elementTop = elementRect.top + scrollTop;
      
      // Scroll to align the section's top edge with the viewport top (no offset, no space)
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
    }
  }

  formatProcessNumber(num: number): string {
    return String(num).padStart(2, '0');
  }
}
