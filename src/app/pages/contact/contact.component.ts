import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { contactMocks } from '../../../core/mocks/contact-mocks';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit, OnDestroy, AfterViewInit {
  private currentLanguageIndex = 0;
  private texts = contactMocks;
  private languageSubscription!: Subscription;

  // Form model
  contactForm = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;

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

  onSubmit(): void {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    this.submitMessage = '';
    
    // Simulate form submission (frontend only)
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.submitMessage = this.getText('successMessage');
      
      // Reset form
      this.contactForm = {
        name: '',
        email: '',
        phone: '',
        message: ''
      };
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.submitMessage = '';
      }, 5000);
    }, 1500);
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

    document.querySelectorAll('.contact-form-section, .contact-info-section, .info-item').forEach(el => {
      observer.observe(el);
    });
  }
}

