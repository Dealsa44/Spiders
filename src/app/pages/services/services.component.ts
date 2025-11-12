import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { servicesMocks } from '../../../core/mocks/services-mocks';
import { CtaComponent } from '../../components/cta/cta.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, CtaComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  private currentLanguageIndex = 0;
  private texts = servicesMocks;
  private languageSubscription!: Subscription;
  
  serviceItems = servicesMocks.serviceItems;

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

    document.querySelectorAll('.service-item, .cta-content').forEach(el => {
      observer.observe(el);
    });
  }
}

