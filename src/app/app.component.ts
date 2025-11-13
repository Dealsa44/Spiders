import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  cursorX = 50; // Percentage from left (0-100)
  cursorY = 50; // Percentage from top (0-100)
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private rafId?: number;
  private routerSubscription?: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupCursorTracking();
    this.setupScrollToTop();
  }

  ngOnDestroy(): void {
    if (this.mouseMoveHandler) {
      window.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private setupScrollToTop(): void {
    // Scroll to top on every route change
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
  }

  private setupCursorTracking(): void {
    let targetX = 50;
    let targetY = 50;
    
    // Track mouse position globally
    this.mouseMoveHandler = (e: MouseEvent) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Always use viewport coordinates (fixed positioning)
      targetX = (e.clientX / viewportWidth) * 100;
      targetY = (e.clientY / viewportHeight) * 100;
      
      // Clamp values
      targetX = Math.max(0, Math.min(100, targetX));
      targetY = Math.max(0, Math.min(100, targetY));
      
      // Use requestAnimationFrame for smooth updates
      if (this.rafId === undefined) {
        const update = () => {
          // Smooth interpolation for lag-free following
          const smoothing = 0.3; // Higher = smoother but slower (0.3 = very responsive)
          this.cursorX += (targetX - this.cursorX) * smoothing;
          this.cursorY += (targetY - this.cursorY) * smoothing;
          
          this.cdr.detectChanges();
          
          // Continue animation if still needs to catch up
          const distanceX = Math.abs(targetX - this.cursorX);
          const distanceY = Math.abs(targetY - this.cursorY);
          
          if (distanceX > 0.1 || distanceY > 0.1) {
            this.rafId = requestAnimationFrame(update);
          } else {
            // Reached target, stop animation
            this.cursorX = targetX;
            this.cursorY = targetY;
            this.rafId = undefined;
            this.cdr.detectChanges();
          }
        };
        this.rafId = requestAnimationFrame(update);
      }
    };
    
    window.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
  }
}
