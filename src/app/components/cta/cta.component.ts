import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { ctaMocks } from '../../../core/mocks/cta-mocks';

interface Particle {
  x: number;
  y: number;
  delay: number;
}

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss'
})
export class CtaComponent implements OnInit, OnDestroy {
  @Input() pageType: 'home' | 'about' | 'services' | 'portfolio' = 'home';
  
  private currentLanguageIndex = 0;
  private texts = ctaMocks;
  private languageSubscription!: Subscription;
  
  particles: Particle[] = [];

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.currentLanguageIndex = this.languageService.getCurrentLanguage();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (index) => {
        this.currentLanguageIndex = index;
      }
    );
    
    // Generate particles for CTA section
    this.generateParticles();
    
    // Setup animation observer
    setTimeout(() => {
      this.setupScrollAnimations();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getText(key: string): string {
    if (key === 'ctaButton') {
      return this.texts[key]?.[this.currentLanguageIndex] || '';
    }
    const pageKey = `${this.pageType}${key.charAt(0).toUpperCase() + key.slice(1)}`;
    return this.texts[pageKey]?.[this.currentLanguageIndex] || '';
  }

  getRoute(route: string): string {
    const langCode = this.languageService.getCurrentLanguageCode();
    return `/${langCode}${route}`;
  }

  private generateParticles(): void {
    // Generate 20 particles with random positions
    this.particles = Array.from({ length: 20 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
  }

  private setupScrollAnimations(): void {
    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    // Observe CTA content
    const ctaContent = document.querySelector('.cta-content');
    if (ctaContent) {
      observer.observe(ctaContent);
    }
  }
}
