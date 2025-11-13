import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements AfterViewInit {
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

  // Hardcoded text
  private texts: { [key: string]: string } = {
    pageTitle: "Let's Create Something Extraordinary Together",
    pageSubtitle: "Your vision deserves a partner who understands the art of digital transformation. Share your dreams with us, and watch as we turn them into breathtaking reality. Every great journey begins with a single conversation.",
    formTitle: "Start Your Transformation",
    nameLabel: "Your Name",
    namePlaceholder: "How should we address you?",
    emailLabel: "Email Address",
    emailPlaceholder: "your.best@email.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Let's connect directly",
    messageLabel: "Your Vision",
    messagePlaceholder: "Tell us about your dreams, your goals, your wildest ambitions. What do you want to build? What impact do you want to make? We're listening...",
    submitButton: "Launch My Project",
    submittingButton: "Weaving Your Future...",
    successMessage: "Your message has been received! We're already envisioning the possibilities. Expect to hear from us within 24 hours—we can't wait to bring your vision to life.",
    errorMessage: "Something unexpected happened. Please try again, or reach out directly—we're here to help make this work.",
    contactInfoTitle: "Connect With Us",
    addressLabel: "Our Location",
    addressValue: "123 Business Street, Suite 100",
    cityValue: "New York, NY 10001",
    phone: "Direct Line",
    phoneValue: "+1 (555) 123-4567",
    email: "Email",
    emailValue: "hello@spiders.dev",
    hoursLabel: "When We're Available",
    hoursValue: "Monday - Friday: 9:00 AM - 6:00 PM",
    followUs: "Join Our Journey",
    socialDescription: "Follow our creative journey and stay inspired by the extraordinary work we're crafting every day"
  };

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  getText(key: string): string {
    return this.texts[key] || '';
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

