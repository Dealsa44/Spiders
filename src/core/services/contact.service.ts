import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  selectedDate?: Date | null;
  selectedTimeSlot?: string | null;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitContactForm(data: ContactFormData): Observable<ContactResponse> {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      message: data.message || '',
      selectedDate: data.selectedDate ? data.selectedDate.toISOString() : null,
      selectedTimeSlot: data.selectedTimeSlot || null
    };

    return this.http.post<ContactResponse>(`${this.apiUrl}/contact`, payload);
  }
}

