import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { navbarMocks } from '../../../core/mocks/navbar-mocks';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentLanguageIndex = 0;
  private texts = navbarMocks;
  private languageSubscription!: Subscription;
  
  isLanguageDropdownOpen = false;
  isMobileMenuOpen = false;
  
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ];

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.currentLanguageIndex = this.languageService.getCurrentLanguage();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (index) => {
        this.currentLanguageIndex = index;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getText(key: string): string {
    return this.texts[key][this.currentLanguageIndex];
  }

  setLanguage(index: number): void {
    this.languageService.setLanguage(index);
    this.isLanguageDropdownOpen = false;
  }

  toggleLanguageDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-dropdown')) {
      this.isLanguageDropdownOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  getCurrentLanguageText(): string {
    return this.availableLanguages[this.currentLanguageIndex].name;
  }

  getRoute(route: string): string {
    const langCode = this.languageService.getCurrentLanguageCode();
    return `/${langCode}${route}`;
  }
}

