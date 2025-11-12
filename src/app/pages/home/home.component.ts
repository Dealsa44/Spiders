import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { homeMocks } from '../../../core/mocks/home-mocks';
import { CtaComponent } from '../../components/cta/cta.component';

interface Particle {
  x: number;
  y: number;
  delay: number;
  duration?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CtaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private currentLanguageIndex = 0;
  private texts = homeMocks;
  private languageSubscription!: Subscription;
  private intersectionObserver?: IntersectionObserver;
  private parallaxElements: HTMLElement[] = [];
  private parallaxOriginalTops: Map<HTMLElement, number> = new Map();
  private animationFrameId?: number;
  private lastScrollY = 0;
  private scrollDirection: 'up' | 'down' = 'down';
  
  projectImages: string[] = [];
  particles: Particle[] = [];
  featureParticles: Particle[] = [];

  constructor(
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentLanguageIndex = this.languageService.getCurrentLanguage();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (index) => {
        this.currentLanguageIndex = index;
      }
    );
    
    // Generate random project images from Unsplash
    this.generateProjectImages();
    
    // Generate particles for CTA section
    this.generateParticles();
    
    // Generate particles for features section
    this.generateFeatureParticles();
  }

  ngAfterViewInit(): void {
    // Setup scroll animations with Intersection Observer
    this.setupScrollAnimations();
    
    // Setup parallax scrolling
    this.setupParallax();
    
    // Initial check - don't apply parallax on initial load
    requestAnimationFrame(() => {
      this.checkVisibility();
      // Reset all parallax elements to initial state
      this.resetParallax();
      // Initialize scroll reveals
      this.updateScrollReveals();
    });
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  getText(key: string): string {
    return this.texts[key]?.[this.currentLanguageIndex] || '';
  }

  getRoute(route: string): string {
    const langCode = this.languageService.getCurrentLanguageCode();
    return `/${langCode}${route}`;
  }

  private generateProjectImages(): void {
    // Use Picsum Photos for reliable random images
    // Each project gets a unique, high-quality random image
    const width = 800;
    const height = 600;
    
    // Generate unique random IDs for each project
    // Using timestamp + random number + index for uniqueness
    const baseTime = Date.now();
    this.projectImages = Array.from({ length: 3 }, (_, index) => {
      const randomId = Math.floor(Math.random() * 10000) + baseTime + (index * 1000);
      return `https://picsum.photos/seed/${randomId}/${width}/${height}`;
    });
    
    // Log for debugging (remove in production)
    console.log('Generated project images:', this.projectImages);
  }

  private generateParticles(): void {
    // Generate 20 particles with random positions
    this.particles = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
  }

  private generateFeatureParticles(): void {
    // Generate floating particles for features section
    this.featureParticles = Array.from({ length: 15 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4 // 8-12 seconds
    }));
  }

  private setupScrollAnimations(): void {
    // Use Intersection Observer for better performance
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const delay = element.getAttribute('data-delay') || '0';
            const delayMs = parseFloat(delay) * 1000;
            
            setTimeout(() => {
              element.classList.add('visible');
            }, delayMs);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll('[data-animate]');
    animatableElements.forEach(el => {
      this.intersectionObserver?.observe(el);
    });
  }

  private setupParallax(): void {
    // Collect all parallax elements (excluding hero section)
    const allParallaxElements = Array.from(
      document.querySelectorAll('[data-parallax]')
    ) as HTMLElement[];
    
    // Filter out hero section and store original positions
    this.parallaxElements = allParallaxElements.filter(el => {
      if (el.classList.contains('hero-section')) {
        return false; // Skip hero section
      }
      // Store original top position before any transforms
      const rect = el.getBoundingClientRect();
      this.parallaxOriginalTops.set(el, rect.top + window.scrollY);
      el.style.willChange = 'transform';
      return true;
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    // Detect scroll direction
    const currentScrollY = window.scrollY || window.pageYOffset;
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
    this.lastScrollY = currentScrollY;
    
    // Throttle scroll events using requestAnimationFrame
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateParallax();
        this.updateScrollReveals();
        this.animationFrameId = undefined;
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // Recalculate on resize
    this.updateParallax();
  }

  private resetParallax(): void {
    // Reset all parallax elements to initial state (no transform)
    this.parallaxElements.forEach(element => {
      element.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  private updateParallax(): void {
    const scrollY = window.scrollY || window.pageYOffset;
    
    // Always reset hero section to prevent any gaps
    const heroSection = document.querySelector('.hero-section') as HTMLElement;
    if (heroSection) {
      heroSection.style.transform = 'translate3d(0, 0, 0)';
    }
    
    this.parallaxElements.forEach(element => {
      // Double-check: never apply parallax to hero section
      if (element.classList.contains('hero-section')) {
        element.style.transform = 'translate3d(0, 0, 0)';
        return;
      }
      
      const speed = parseFloat(element.getAttribute('data-parallax') || '0.5');
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const originalTop = this.parallaxOriginalTops.get(element) || 0;
      
      // Only apply parallax when element has been scrolled past its original position
      // and is currently in or below viewport
      if (scrollY > originalTop && rect.top < windowHeight + 200) {
        // Calculate how much we've scrolled past the element's original position
        const scrollPast = scrollY - originalTop;
        // Apply parallax: element moves at (1 - speed) rate, creating depth effect
        // Use negative value to move element up relative to scroll (slower movement)
        const parallaxOffset = -scrollPast * speed;
        
        // Apply transform
        element.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
      } else if (scrollY <= originalTop) {
        // Reset when scroll is at or above element's original position
        element.style.transform = 'translate3d(0, 0, 0)';
      }
    });
  }

  private checkVisibility(): void {
    // Initial visibility check
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) {
        const delay = el.getAttribute('data-delay') || '0';
        const delayMs = parseFloat(delay) * 1000;
        setTimeout(() => {
          el.classList.add('visible');
        }, delayMs);
      }
    });
  }

  private updateScrollReveals(): void {
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset;
    
    revealElements.forEach((element, index) => {
      const el = element as HTMLElement;
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const elementCenter = elementTop + elementHeight / 2;
      const viewportCenter = scrollY + windowHeight / 2;
      
      // Check if it's a stat item or feature item for different animations
      const isStatItem = el.classList.contains('stat-item');
      
      // Calculate progress based on how close element center is to viewport center
      // Progress is 0 when element is far away, 1 when centered
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
      const maxDistance = windowHeight * 0.8; // Start animating when within 80% of viewport
      let progress = Math.max(0, Math.min(1, 1 - distanceFromCenter / maxDistance));
      
      // Apply smoother easing function (ease-in-out cubic with more smoothing)
      const easeInOutCubic = (t: number): number => {
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      
      // Apply additional smoothing with ease-out-quart for even smoother feel
      const smoothProgress = easeInOutCubic(progress);
      const extraSmooth = 1 - Math.pow(1 - smoothProgress, 4);
      
      // Different animation styles for stats vs features vs projects vs testimonials
      const isProjectCard = el.classList.contains('project-card');
      const isTestimonialCard = el.classList.contains('testimonial-card');
      
      if (isStatItem) {
        // Stats: Come from sides with rotation
        const statIndex = parseInt(el.getAttribute('data-index') || '0');
        const sideOffset = statIndex % 2 === 0 ? -80 : 80; // Alternate sides
        
        if (this.scrollDirection === 'down') {
          const translateX = (1 - extraSmooth) * sideOffset;
          const translateY = (1 - extraSmooth) * 80;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.8 + extraSmooth * 0.2;
          const rotateX = (1 - extraSmooth) * 15;
          el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateX(${rotateX}deg)`;
          el.style.opacity = opacity.toString();
        } else {
          // Reverse for scroll up
          const translateX = (1 - extraSmooth) * -sideOffset;
          const translateY = (1 - extraSmooth) * -80;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.8 + extraSmooth * 0.2;
          const rotateX = (1 - extraSmooth) * -15;
          el.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateX(${rotateX}deg)`;
          el.style.opacity = opacity.toString();
        }
      } else if (isProjectCard) {
        // Projects: Slide in from sides with 3D rotation
        const projectIndex = parseInt(el.getAttribute('data-index') || '0');
        const sideOffset = projectIndex % 2 === 0 ? -150 : 150; // Alternate sides
        
        if (this.scrollDirection === 'down') {
          const translateX = (1 - extraSmooth) * sideOffset;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.85 + extraSmooth * 0.15;
          const rotateY = (1 - extraSmooth) * (projectIndex % 2 === 0 ? 20 : -20);
          el.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`;
          el.style.opacity = opacity.toString();
        } else {
          // Reverse for scroll up
          const translateX = (1 - extraSmooth) * -sideOffset;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.85 + extraSmooth * 0.15;
          const rotateY = (1 - extraSmooth) * (projectIndex % 2 === 0 ? -20 : 20);
          el.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`;
          el.style.opacity = opacity.toString();
        }
      } else if (isTestimonialCard) {
        // Testimonials: Vertical reveal with 3D rotation
        if (this.scrollDirection === 'down') {
          const translateY = (1 - extraSmooth) * 120;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.9 + extraSmooth * 0.1;
          const rotateX = (1 - extraSmooth) * 10;
          el.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotateX(${rotateX}deg)`;
          el.style.opacity = opacity.toString();
        } else {
          // Reverse for scroll up
          const translateY = (1 - extraSmooth) * -120;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.9 + extraSmooth * 0.1;
          const rotateX = (1 - extraSmooth) * -10;
          el.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotateX(${rotateX}deg)`;
          el.style.opacity = opacity.toString();
        }
      } else {
        // Features: Standard vertical reveal with rotation
        if (this.scrollDirection === 'down') {
          const translateY = (1 - extraSmooth) * 120;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.75 + extraSmooth * 0.25;
          const rotate = (1 - extraSmooth) * 3;
          el.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
          el.style.opacity = opacity.toString();
        } else {
          // Reverse animation when scrolling up
          const translateY = (1 - extraSmooth) * -120;
          const opacity = Math.max(0, Math.min(1, extraSmooth));
          const scale = 0.75 + extraSmooth * 0.25;
          const rotate = (1 - extraSmooth) * -3;
          el.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
          el.style.opacity = opacity.toString();
        }
      }
      
      // Add visible class when in viewport
      if (rect.top < windowHeight + 100 && rect.bottom > -100) {
        el.classList.add('in-viewport');
      } else {
        el.classList.remove('in-viewport');
      }
    });
  }
}
