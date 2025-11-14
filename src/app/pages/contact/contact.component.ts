import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../../core/services/contact.service';

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


  // Calendar state
  currentDate = new Date();
  selectedDate: Date | null = null;
  selectedTimeSlot: string | null = null;
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: Array<{ day: number; date: Date; otherMonth: boolean }> = [];
  
  // Time slots (9 AM to 6 PM, 30-minute intervals)
  allTimeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];
  
  // Mock booked slots (in real app, this would come from backend)
  bookedSlots: Set<string> = new Set();

  constructor(private contactService: ContactService) {}

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
    addressLabel: "How We Connect",
    addressValue: "Online via virtual meetings",
    cityValue: "Available worldwide",
    phone: "WhatsApp",
    phoneValue: "+34 632 63 54 44",
    email: "Email",
    emailValue: "intrinsicspiderlab@gmail.com",
    hoursLabel: "Available Anytime",
    hoursValue: "24/7 - Your vision doesn't sleep, and neither do we",
    followUs: "Join Our Journey",
    socialDescription: "Follow our creative journey and stay inspired by the extraordinary work we're crafting every day",
    bookingTitle: "Book Your Consultation",
    bookingSubtitle: "Choose a date and time that works for you. Let's discuss how we can transform your vision into reality.",
    selectTime: "Select Your Preferred Time",
    bookingDetails: "Complete Your Booking",
    selectedDate: "Date",
    selectedTime: "Time",
    confirmBooking: "Confirm Booking",
    bookingSubmitting: "Securing Your Spot...",
    bookingMessagePlaceholder: "Tell us what you'd like to discuss or any specific requirements...",
    selectDatePrompt: "Select a date from the calendar above to see available time slots",
    noSlotsAvailable: "No available slots for this date. Please select another date.",
    bookingSuccessMessage: "Your consultation has been booked successfully! We'll send you a confirmation email shortly.",
    bookingErrorMessage: "Something went wrong. Please try again or contact us directly."
  };

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
    this.generateCalendar();
    // Mock some booked slots for demonstration
    this.mockBookedSlots();
  }

  getText(key: string): string {
    return this.texts[key] || '';
  }

  getWhatsAppUrl(): string {
    const phoneNumber = this.getText('phoneValue').replace(/[^0-9]/g, '');
    return `https://wa.me/${phoneNumber}`;
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    this.submitMessage = '';
    
    // Check if booking is selected
    const hasBooking = this.selectedDate && this.selectedTimeSlot;
    
    // Prepare form data
    const formData = {
      name: this.contactForm.name,
      email: this.contactForm.email,
      phone: this.contactForm.phone,
      message: this.contactForm.message,
      selectedDate: this.selectedDate,
      selectedTimeSlot: this.selectedTimeSlot
    };
    
    // Submit to backend
    this.contactService.submitContactForm(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        
        // Show appropriate success message
        if (hasBooking) {
          this.submitMessage = this.getText('bookingSuccessMessage');
          
          // Mark slot as booked
          if (this.selectedDate) {
            const dateKey = this.getDateKey(this.selectedDate);
            this.bookedSlots.add(`${dateKey}-${this.selectedTimeSlot}`);
          }
          
          // Reset booking selection
          this.selectedDate = null;
          this.selectedTimeSlot = null;
        } else {
          this.submitMessage = this.getText('successMessage');
        }
        
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
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.isSubmitting = false;
        this.submitSuccess = false;
        this.submitMessage = this.getText('errorMessage');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.submitMessage = '';
        }, 5000);
      }
    });
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

  // ============================================
  // CALENDAR METHODS
  // ============================================
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    this.calendarDays = [];
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      this.calendarDays.push({ day, date, otherMonth: true });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push({ day, date, otherMonth: false });
    }
    
    // Next month days to fill the grid (always show 6 rows = 42 days)
    const remainingDays = Math.max(0, 42 - this.calendarDays.length); // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push({ day, date, otherMonth: true });
    }
  }

  getCurrentMonthYear(): string {
    return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    if (this.canGoToPreviousMonth()) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.generateCalendar();
      // Don't clear selected date - keep it selected even when navigating months
    }
  }

  canGoToPreviousMonth(): boolean {
    const today = new Date();
    const currentMonth = this.currentDate.getMonth();
    const currentYear = this.currentDate.getFullYear();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    // Can go to previous month if current displayed month is after today's month
    if (currentYear > todayYear) {
      return true;
    }
    if (currentYear === todayYear && currentMonth > todayMonth) {
      return true;
    }
    return false;
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
    // Don't clear selected date - keep it selected even when navigating months
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelectedDate(date: Date): boolean {
    if (!this.selectedDate) return false;
    return date.toDateString() === this.selectedDate.toDateString();
  }

  isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  }

  selectDate(date: Date, isOtherMonth?: boolean): void {
    // Prevent selecting dates from other months - check the flag first
    if (isOtherMonth) {
      return;
    }
    
    // Also double-check by comparing months
    const currentMonth = this.currentDate.getMonth();
    const currentYear = this.currentDate.getFullYear();
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();
    
    // Check if date is from different month
    if (dateMonth !== currentMonth || dateYear !== currentYear) {
      return;
    }
    
    // Check if date is in the past
    if (this.isDateDisabled(date)) {
      return;
    }
    
    // Toggle selection: if clicking the same date, deselect it
    if (this.selectedDate && date.toDateString() === this.selectedDate.toDateString()) {
      this.selectedDate = null;
      this.selectedTimeSlot = null;
      return;
    }
    
    this.selectedDate = new Date(date);
    this.selectedTimeSlot = null;
    this.generateAvailableTimeSlots();
  }

  // ============================================
  // TIME SLOTS METHODS
  // ============================================
  get availableTimeSlots(): string[] {
    if (!this.selectedDate) return [];
    
    const dateKey = this.getDateKey(this.selectedDate);
    return this.allTimeSlots.filter(slot => {
      const slotKey = `${dateKey}-${slot}`;
      return !this.bookedSlots.has(slotKey);
    });
  }

  generateAvailableTimeSlots(): void {
    // In real app, this would fetch from backend
    // For now, we just filter out booked slots
  }

  isSlotBooked(slot: string): boolean {
    if (!this.selectedDate) return false;
    const dateKey = this.getDateKey(this.selectedDate);
    return this.bookedSlots.has(`${dateKey}-${slot}`);
  }

  selectTimeSlot(slot: string): void {
    if (this.isSlotBooked(slot)) return;
    this.selectedTimeSlot = slot;
  }

  getDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  mockBookedSlots(): void {
    // Mock some booked slots for demonstration
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.bookedSlots.add(`${this.getDateKey(tomorrow)}-10:00`);
    this.bookedSlots.add(`${this.getDateKey(tomorrow)}-14:30`);
    this.bookedSlots.add(`${this.getDateKey(tomorrow)}-16:00`);
  }

}

