import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { aboutMocks } from '../../../core/mocks/about-mocks';
import { CtaComponent } from '../../components/cta/cta.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CtaComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, OnDestroy, AfterViewInit {
  private currentLanguageIndex = 0;
  private texts = aboutMocks;
  private languageSubscription!: Subscription;

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.currentLanguageIndex = this.languageService.getCurrentLanguage();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (index) => {
        this.currentLanguageIndex = index;
      }
    );
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getText(key: string): string {
    return this.texts[key][this.currentLanguageIndex];
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    this.checkVisibility();
  }

  private setupScrollAnimations(): void {
    setTimeout(() => {
      this.checkVisibility();
    }, 100);
  }

  private checkVisibility(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.section-content, .value-card, .team-card, .section-header').forEach(el => {
      observer.observe(el);
    });
  }
}

