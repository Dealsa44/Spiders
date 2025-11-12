import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';
import { portfolioMocks } from '../../../core/mocks/portfolio-mocks';
import { CtaComponent } from '../../components/cta/cta.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, CtaComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit, OnDestroy, AfterViewInit {
  private currentLanguageIndex = 0;
  private texts = portfolioMocks;
  private languageSubscription!: Subscription;
  
  projectItems = portfolioMocks.projectItems;
  selectedFilter = 'all';
  filteredProjects = portfolioMocks.projectItems;
  projectImages: Map<number, string> = new Map();

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.currentLanguageIndex = this.languageService.getCurrentLanguage();
    this.languageSubscription = this.languageService.currentLanguage$.subscribe(
      (index) => {
        this.currentLanguageIndex = index;
      }
    );
    
    // Generate random images for all projects
    this.generateProjectImages();
  }
  
  private generateProjectImages(): void {
    // Use Picsum Photos for reliable random images
    const width = 600;
    const height = 400;
    
    // Generate unique random IDs for each project
    const baseTime = Date.now();
    this.projectItems.forEach((project: any, index: number) => {
      const randomId = Math.floor(Math.random() * 10000) + baseTime + (index * 1000);
      this.projectImages.set(index, `https://picsum.photos/seed/${randomId}/${width}/${height}`);
    });
  }
  
  getProjectImage(project: any): string {
    // Find the original index of the project in projectItems
    const originalIndex = this.projectItems.findIndex((item: any) => 
      item.title[0] === project.title[0] && item.category[0] === project.category[0]
    );
    return this.projectImages.get(originalIndex) || '';
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

  getProjectText(item: any, key: string): string {
    return item[key][this.currentLanguageIndex];
  }

  getRoute(route: string): string {
    const langCode = this.languageService.getCurrentLanguageCode();
    return `/${langCode}${route}`;
  }

  getProjectCategory(project: any): string {
    const category = this.getProjectText(project, 'category');
    if (category.includes('E-Commerce') || category.includes('Comercio')) {
      return 'ecommerce';
    } else if (category.includes('Development') || category.includes('Desarrollo')) {
      return 'development';
    } else if (category.includes('Design') || category.includes('Diseño')) {
      return 'web-design';
    } else if (category.includes('Business') || category.includes('Negocio')) {
      return 'business';
    }
    return 'all';
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    
    if (filter === 'all') {
      this.filteredProjects = this.projectItems;
    } else {
      this.filteredProjects = this.projectItems.filter((project: any) => {
        const category = this.getProjectCategory(project);
        return category === filter;
      });
    }
    
    // Re-trigger animations for filtered items
    setTimeout(() => {
      this.checkVisibility();
    }, 100);
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

    document.querySelectorAll('.project-item').forEach(el => {
      observer.observe(el);
    });
  }
}

