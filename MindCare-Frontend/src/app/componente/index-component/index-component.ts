//actualizacion del ts 
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface FeatureSlide {
  image: string;
  alt: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './index-component.html',
  styleUrl: './index-component.css',
})
export class IndexComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  perView = 3;
  isHeaderScrolled = false;
  carouselInterval: ReturnType<typeof setInterval> | null = null;
  subscribeEmail = '';
  subscribeMessage = '';
  subscribeMessageColor = '#ffffff';
  subscribing = false;
  problemCardTransforms = ['', '', '', ''];

  features: FeatureSlide[] = [
    {
      image: 'assets/images/Imagen_Seguimiento_Emocional.png',
      alt: 'Seguimiento Emocional',
      title: 'Seguimiento Emocional',
      description: 'Registra tu estado de ánimo diario y visualiza patrones a lo largo del tiempo. MindCare analiza tus datos para identificar tendencias.',
    },
    {
      image: 'assets/images/Imagen_Tecnicas_Guiadas.png',
      alt: 'Técnicas Guiadas',
      title: 'Técnicas Guiadas',
      description: 'Accede a ejercicios de respiración, meditación guiada y prácticas de mindfulness diseñadas para reducir estrés y ansiedad.',
    },
    {
      image: 'assets/images/Imagen_ML_Simulado.png',
      alt: 'ML Simulado',
      title: 'ML Simulado',
      description: 'Algoritmos inteligentes que procesan tus datos y generan recomendaciones personalizadas basadas en patrones de comportamiento.',
    },
    {
      image: 'assets/images/Imagen_Alertas_Preventivas.png',
      alt: 'Alertas Preventivas',
      title: 'Alertas Preventivas',
      description: 'Recibe notificaciones cuando detectemos cambios significativos en tu bienestar. Prevención activa de crisis emocionales.',
    },
    {
      image: 'assets/images/Imagen_Acceso_Multiplataforma.png',
      alt: 'Acceso Multiplataforma',
      title: 'Acceso Multiplataforma',
      description: 'Utiliza MindCare desde tu computadora, tablet o teléfono. Tu información sincronizada en todos tus dispositivos.',
    },
    {
      image: 'assets/images/Imagen_Recusos_Apoyo.png',
      alt: 'Recursos de Apoyo',
      title: 'Recursos de Apoyo',
      description: 'Enlaces a recursos psicológicos profesionales, líneas de ayuda y comunidades de apoyo seguras y monitoreadas.',
    },
  ];

  ngOnInit(): void {
    this.updateView();
    this.updateHeaderState();
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.pauseAutoplay();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateView();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.updateHeaderState();
  }

  get carouselTransform(): string {
    const slidePercent = 100 / this.perView;
    return `translateX(-${this.currentSlide * slidePercent}%)`;
  }

  get dots(): number[] {
    return Array.from({ length: Math.ceil(this.features.length / this.perView) }, (_, index) => index);
  }

  activeDot(index: number): boolean {
    return index === Math.floor(this.currentSlide / this.perView);
  }

  goToDot(index: number): void {
    this.currentSlide = index * this.perView;
    this.startAutoplay();
  }

  startAutoplay(): void {
    this.pauseAutoplay();
    this.carouselInterval = setInterval(() => {
      const maxSlide = Math.max(0, this.features.length - this.perView);
      this.currentSlide = this.currentSlide >= maxSlide ? 0 : this.currentSlide + 1;
    }, 3000);
  }

  pauseAutoplay(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  updateView(): void {
    if (window.innerWidth <= 768) this.perView = 1;
    else if (window.innerWidth <= 1024) this.perView = 2;
    else this.perView = 3;

    const maxSlide = Math.max(0, this.features.length - this.perView);
    if (this.currentSlide > maxSlide) this.currentSlide = maxSlide;
  }

  updateHeaderState(): void {
    this.isHeaderScrolled = window.scrollY > 50;
  }

  scrollToSection(id: string): void {
    window.location.hash = id;
  }

  handleTilt(index: number, event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -20;
    const rotateY = (x - 0.5) * 20;
    this.problemCardTransforms[index] = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  }

  resetTilt(index: number): void {
    this.problemCardTransforms[index] = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }

  handleSubscribe(): void {
    const email = this.subscribeEmail.trim();

    if (!email.includes('@') || email.length <= 5) {
      this.subscribeMessage = 'Por favor, introduce un correo electrónico válido.';
      this.subscribeMessageColor = '#ffcfcf';
      return;
    }

    this.subscribing = true;
    this.subscribeMessage = '';

    setTimeout(() => {
      this.subscribing = false;
      this.subscribeEmail = '';
      this.subscribeMessage = '¡Gracias! Te hemos enviado un correo de bienvenida.';
      this.subscribeMessageColor = '#ffffff';

      setTimeout(() => {
        this.subscribeMessage = '';
      }, 3000);
    }, 1200);
  }
}
