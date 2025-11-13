import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { servicesMocks } from '../../../core/mocks/services-mocks';
import { CtaComponent } from '../../components/cta/cta.component';

interface Particle {
  x: number;
  y: number;
  delay: number;
  duration: number;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, CtaComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('headerSection', { static: false }) headerSection!: ElementRef;

  private currentLanguageIndex = 0;
  private texts = servicesMocks;
  private languageSubscription!: Subscription;
  private scrollSubscription?: Subscription;
  private animationFrameId?: number;
  private intersectionObserver?: IntersectionObserver;
  private mousePositions: Map<number, { x: number; y: number }> = new Map();
  
  serviceItems = servicesMocks.serviceItems;
  particles: Particle[] = [];
  titleWords: string[] = [];
  headerVisible = false;
  serviceVisible: boolean[] = [];

  constructor(private languageService: LanguageService) {
    this.generateParticles();
  }

  ngOnInit(): void {
    this.currentLanguageIndex = this.languageService.getCurrentLanguage();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (index) => {
        this.currentLanguageIndex = index;
        this.updateTitleWords();
      }
    );
    this.updateTitleWords();
    this.serviceVisible = new Array(this.serviceItems.length).fill(false);
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.setupScrollAnimations();
      this.setupParallax();
      this.headerVisible = true;
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
    return this.texts[key][this.currentLanguageIndex];
  }

  getServiceText(item: any, key: string): string {
    return item[key][this.currentLanguageIndex];
  }

  getFeatureText(feature: string[]): string {
    return feature[this.currentLanguageIndex];
  }

  getRoute(route: string): string {
    const langCode = this.languageService.getCurrentLanguageCode();
    return `/${langCode}${route}`;
  }

  onServiceHover(index: number, event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement;
    element.style.willChange = 'transform';
  }

  onServiceLeave(index: number, event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement;
    element.style.willChange = 'auto';
    this.mousePositions.delete(index);
  }

  onServiceMove(index: number, event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 20;
    
    this.mousePositions.set(index, { x, y });
    
    requestAnimationFrame(() => {
      const hoverEffect = element.querySelector('.service-hover-effect') as HTMLElement;
      if (hoverEffect) {
        hoverEffect.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateParallax();
        this.animationFrameId = undefined;
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.generateParticles();
  }

  private generateParticles(): void {
    const particleCount = window.innerWidth > 768 ? 20 : 10;
    this.particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10
    }));
  }

  private updateTitleWords(): void {
    const title = this.getText('pageTitle');
    this.titleWords = title.split(' ');
  }

  private setupScrollAnimations(): void {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          if (!isNaN(index)) {
            this.serviceVisible[index] = true;
          }
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    });

    setTimeout(() => {
      document.querySelectorAll('.service-item').forEach((el, index) => {
        this.intersectionObserver?.observe(el);
      });
    }, 100);
  }

  private setupParallax(): void {
    this.updateParallax();
  }

  private updateParallax(): void {
    if (!this.headerSection) return;
    
    const scrollY = window.scrollY;
    const headerElement = this.headerSection.nativeElement;
    const orbs = headerElement.querySelectorAll('.orb');
    
    orbs.forEach((orb: HTMLElement, index: number) => {
      const speed = 0.3 + (index * 0.1);
      const yPos = scrollY * speed;
      orb.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }
}

