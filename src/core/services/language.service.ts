import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<number>(0);
  public currentLanguage$: Observable<number> = this.currentLanguageSubject.asObservable();

  private readonly STORAGE_KEY = 'selectedLanguageIndex';
  private readonly LANGUAGE_CODES = ['en', 'es'];

  constructor(private router: Router) {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Try to get language from URL first
    const urlPath = window.location.pathname;
    const urlLangCode = urlPath.split('/')[1];

    if (urlLangCode && this.LANGUAGE_CODES.includes(urlLangCode)) {
      const index = this.LANGUAGE_CODES.indexOf(urlLangCode);
      this.setLanguage(index, false);
    } else {
      // Try to get from localStorage
      const savedIndex = localStorage.getItem(this.STORAGE_KEY);
      if (savedIndex !== null) {
        const index = parseInt(savedIndex, 10);
        if (index === 0 || index === 1) {
          this.setLanguage(index, false);
        } else {
          this.setLanguage(0, false);
        }
      } else {
        // Default to English
        this.setLanguage(0, false);
      }
    }
  }

  getCurrentLanguage(): number {
    return this.currentLanguageSubject.value;
  }

  getCurrentLanguageCode(): string {
    return this.LANGUAGE_CODES[this.currentLanguageSubject.value];
  }

  setLanguage(index: number, updateUrl: boolean = true): void {
    if (index !== 0 && index !== 1) {
      return;
    }

    this.currentLanguageSubject.next(index);
    localStorage.setItem(this.STORAGE_KEY, index.toString());

    if (updateUrl) {
      const currentPath = this.router.url;
      const pathWithoutLang = currentPath.replace(/^\/(en|es)/, '') || '/';
      const newPath = `/${this.LANGUAGE_CODES[index]}${pathWithoutLang}`;
      this.router.navigateByUrl(newPath);
    }
  }

  setLanguageFromCode(code: string): void {
    const index = this.LANGUAGE_CODES.indexOf(code);
    if (index !== -1) {
      this.setLanguage(index);
    }
  }
}

