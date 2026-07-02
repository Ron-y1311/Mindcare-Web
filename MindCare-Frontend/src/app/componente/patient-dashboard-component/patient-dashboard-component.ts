//Implemenatacion de la pantalla de Dashboard del paciente en TypeScript
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { DashboardService } from '../../services/dashboard-service';
import { RecomendacionService } from '../../services/recomendacion-service';
import { CitaService } from '../../services/cita-service';
import { MedicacionPacienteService } from '../../services/medicacion-paciente-service';
import { MedicacionPaciente } from '../../model/medicacion-paciente';
import { Tracking } from '../../model/tracking';
import { finalize, timeout } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { SidebarComponent } from '../sidebar-component/sidebar-component';

interface ChartPoint {
  x: number;
  y: number;
  value: number;
}

interface RecommendationItem {
  text: string;
  category: 'Terapia' | 'Autocuidado' | 'Relajación' | 'Seguimiento';
  icon: string;
  completed: boolean;
  rating: 'like' | 'dislike' | null;
  priority: 'Alta' | 'Media' | 'Baja';
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatCheckboxModule, SidebarComponent],
  templateUrl: './patient-dashboard-component.html',
  styleUrl: './patient-dashboard-component.css',
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  userName = 'Paciente';
  mood = 'Sin registro';
  survey = 'Pendiente';
  aptDate = 'Sin cita';
  aptTime = '--:--';
  wellbeingText = 'Registra tu estado emocional';
  progress = 40;
  tipText = 'Recuerda tomar pausas breves y registrar como te sientes hoy.';
  recommendationLevel = 'SIN_DATOS';
  recommendationScore = 0;
  recommendationTrend = 'Sin historial suficiente';
  recommendationActionLabel = 'Ver historial';
  recommendationActionPath = '/emotion-history';
  recommendationFactors: string[] = [];
  detectedFactors: string[] = [];
  chartPoints: ChartPoint[] = [];
  chartLine = '';
  chartArea = '';

  // Medication and self-care list
  medications: MedicacionPaciente[] = [];
  medicationsLoaded = false;

  // Breathing widget state
  breathingActive = false;
  breathingText = 'Comenzar';
  breathingPhase = 'idle'; // 'inhale', 'hold', 'exhale', 'idle'
  breathingTimer: any = null;

  // IA recommendations state
  mappedRecommendations: RecommendationItem[] = [];
  feedbackMessage = '';
  showFeedbackToast = false;
  toastTimeout: any = null;

  get totalTasksCount(): number {
    return this.mappedRecommendations.length;
  }

  get completedTasksCount(): number {
    return this.mappedRecommendations.filter(r => r.completed).length;
  }

  get progressPercentage(): number {
    if (this.totalTasksCount === 0) return 0;
    return Math.round((this.completedTasksCount / this.totalTasksCount) * 100);
  }

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private citaService: CitaService,
    private recomendacionService: RecomendacionService,
    private medicacionService: MedicacionPacienteService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    let user;
    try {
      user = this.auth.requireUser();
    } catch {
      this.renderEmpty();
      this.cdr.detectChanges();
      return;
    }

    this.userName = user.nombre || 'Paciente';
    const pacienteId = Number(user.pacienteId || 0);

    if (!pacienteId) {
      this.renderEmpty();
      this.cdr.detectChanges();
      return;
    }

    this.loadDashboard(pacienteId);
    this.loadAppointments(pacienteId);
    this.loadEvolution(pacienteId);
    this.loadRecommendations(pacienteId);
    this.loadMedications(pacienteId);
  }

  ngOnDestroy(): void {
    if (this.breathingTimer) {
      clearTimeout(this.breathingTimer);
    }
  }

  loadDashboard(pacienteId: number): void {
    this.dashboardService.visualizarPaciente(pacienteId)
      .pipe(timeout(8000), finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: dashboard => {
          const data = dashboard || {};
          const intensidad = Number(data.ultimaIntensidad);
          const hasIntensity = Number.isFinite(intensidad);

          if (data.ultimoEstadoAnimo) {
            this.mood = data.ultimoEstadoAnimo;
          }

          if (hasIntensity) {
            this.survey = `${intensidad}/10`;
            this.wellbeingText = `Intensidad ${intensidad}/10`;
            this.progress = Math.max(0, Math.min(100, intensidad * 10));
          }
        },
        error: () => this.renderSummaryEmpty(),
      });
  }

  loadAppointments(pacienteId: number): void {
    this.citaService.listarPorPaciente(pacienteId)
      .pipe(timeout(8000), finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: citas => {
          const lista = Array.isArray(citas) ? citas : [];
          const cita = lista.find(c => c.estadoCitaId !== 4 && c.estadoCitaId !== 5) || lista[0];
          const fecha = cita?.fecha ? new Date(cita.fecha) : null;
          const isValidDate = !!fecha && !Number.isNaN(fecha.getTime());

          this.aptDate = isValidDate ? fecha.toLocaleDateString() : 'Sin cita';
          this.aptTime = isValidDate ? fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        },
        error: () => {
          this.aptDate = 'Sin cita';
          this.aptTime = '--:--';
        },
      });
  }

  loadEvolution(pacienteId: number): void {
    this.dashboardService.evolucionEmocional(pacienteId)
      .pipe(timeout(8000), finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: tracking => {
          const registros = Array.isArray(tracking) ? tracking : [];
          this.prepareEmotionChart(registros);
          this.applyLatestTrackingSummary(registros);
        },
        error: () => this.prepareEmotionChart([]),
      });
  }

  loadRecommendations(pacienteId: number): void {
    this.recomendacionService.resumen(pacienteId)
      .pipe(timeout(8000), finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: recomendacion => {
          this.recommendationLevel = recomendacion?.nivelRiesgo || 'SIN_DATOS';
          this.recommendationTrend = recomendacion?.tendencia || this.recommendationTrend || 'Sin historial suficiente';
          this.tipText = recomendacion?.mensajePrincipal || 'Registra tu estado emocional para recibir recomendaciones personalizadas.';
          this.recommendationFactors = (recomendacion?.recomendaciones || []).slice(0, 3);
          this.detectedFactors = (recomendacion?.factoresDetectados || []).slice(0, 3);
          this.recommendationScore = this.resolveEmotionalScore(
            recomendacion?.ultimoBienestar,
            recomendacion?.ultimaIntensidad,
            recomendacion?.puntajeRiesgo,
          );
          this.configureRecommendationAction();
          this.mapRecommendationsFromBackend(this.recommendationFactors);
        },
        error: () => {
          this.recommendationLevel = 'SIN_DATOS';
          this.recommendationTrend = this.recommendationTrend || 'Sin historial suficiente';
          this.tipText = 'No se pudieron cargar recomendaciones. Verifica que el backend este activo.';
          this.recommendationFactors = [];
          this.detectedFactors = [];
          this.recommendationScore = this.resolveEmotionalScore();
          this.configureRecommendationAction();
          this.mapRecommendationsFromBackend([]);
        },
      });
  }

  renderEmpty(): void {
    this.renderSummaryEmpty();
    this.aptDate = 'Sin cita';
    this.aptTime = '--:--';
    this.prepareEmotionChart([]);
  }

  renderSummaryEmpty(): void {
    this.mood = 'Sin registro';
    this.survey = 'Pendiente';
    this.wellbeingText = 'Registra tu estado emocional';
    this.progress = 40;
  }

  prepareEmotionChart(registros: Tracking[] = []): void {
    const safeRegistros = Array.isArray(registros) ? registros : [];

    if (safeRegistros.length === 0) {
      this.chartPoints = [];
      this.chartLine = '';
      this.chartArea = '';
      return;
    }

    const width = 500;
    const height = 200;
    const left = 45;
    const right = 25;
    const top = 28;
    const bottom = 38;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const data = safeRegistros.slice(-8).map((e, i) => ({
      index: i + 1,
      intensidad: this.resolveTrackingIntensity(e),
    }));
    const x = (i: number) => left + (i * chartWidth) / Math.max(data.length - 1, 1);
    const y = (value: number) => top + chartHeight - (value / 10) * chartHeight;

    this.chartPoints = data.map((d, i) => ({
      x: x(i),
      y: y(d.intensidad),
      value: d.intensidad,
    }));
    this.chartLine = this.chartPoints.map(point => `${point.x},${point.y}`).join(' ');
    this.chartArea = `${left},${height - bottom} ${this.chartLine} ${width - right},${height - bottom}`;
  }

  applyLatestTrackingSummary(registros: Tracking[]): void {
    const latest = this.findLatestTracking(registros);
    if (!latest) {
      return;
    }

    const intensity = this.resolveTrackingIntensity(latest);
    const moodName = this.resolveTrackingMoodName(latest);
    if (moodName) {
      this.mood = moodName;
    }

    if (intensity > 0) {
      this.survey = `${intensity}/10`;
      this.wellbeingText = `Intensidad ${intensity}/10`;
      this.progress = Math.max(0, Math.min(100, intensity * 10));
    }
  }

  findLatestTracking(registros: Tracking[]): Tracking | null {
    const safeRegistros = Array.isArray(registros) ? registros.filter(Boolean) : [];
    if (!safeRegistros.length) {
      return null;
    }

    return [...safeRegistros].sort((a, b) => {
      const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      return Number(b.idTracking || 0) - Number(a.idTracking || 0);
    })[0];
  }
  resolveTrackingMoodName(registro: Tracking): string {
    if (registro.estadoAnimoNombre) {
      return registro.estadoAnimoNombre;
    }

    if (registro.estadoAnimo?.nombre) {
      return registro.estadoAnimo.nombre;
    }

    const names: Record<number, string> = {
      1: 'Tranquilo',
      2: 'Ansioso',
      3: 'Triste',
      4: 'Motivado',
      5: 'Feliz',
      6: 'Estresado',
    };

    return names[Number(registro.estadoAnimoId || 0)] || '';
  }
  resolveEmotionalScore(ultimoBienestar?: number, ultimaIntensidad?: number, puntajeRiesgo?: number): number {
    if (Number.isFinite(Number(ultimoBienestar))) {
      return this.clampScore(Number(ultimoBienestar));
    }

    if (Number.isFinite(Number(ultimaIntensidad)) && Number(ultimaIntensidad) > 0) {
      return this.clampScore(Number(ultimaIntensidad) * 10);
    }

    const latest = this.latestHistoryIntensity();
    if (latest > 0) {
      return this.clampScore(latest * 10);
    }

    if (Number.isFinite(Number(puntajeRiesgo)) && Number(puntajeRiesgo) > 0) {
      return this.clampScore(100 - Number(puntajeRiesgo));
    }

    return 0;
  }

  resolveTrackingIntensity(registro: Tracking): number {
    const intensity = Number(registro.numeroIntensidad || 0);
    if (!Number.isFinite(intensity) || intensity <= 0) {
      return 0;
    }

    return Math.max(1, Math.min(10, Math.round(intensity)));
  }

  latestHistoryIntensity(): number {
    if (!this.chartPoints.length) {
      return 0;
    }

    return Math.max(0, Math.min(10, Math.round(this.chartPoints[this.chartPoints.length - 1].value)));
  }

  resolveHistoryTrend(): string {
    if (this.chartPoints.length < 2) {
      return 'Sin historial suficiente';
    }

    const current = this.chartPoints[this.chartPoints.length - 1].value;
    const previous = this.chartPoints[this.chartPoints.length - 2].value;

    if (current >= previous + 15) {
      return 'Mejora emocional reciente';
    }

    if (current <= previous - 15) {
      return 'Deterioro emocional reciente';
    }

    return 'Estable';
  }

  clampScore(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
  wellbeingClass(): string {
    if (this.recommendationScore < 50) {
      return 'wellbeing-low';
    }

    if (this.recommendationScore < 75) {
      return 'wellbeing-medium';
    }

    return 'wellbeing-high';
  }
  riskLabel(): string {
    const level = (this.recommendationLevel || 'SIN_DATOS').toUpperCase();
    const labels: Record<string, string> = {
      BAJO: 'Riesgo bajo',
      MODERADO: 'Riesgo moderado',
      ALTO: 'Riesgo alto',
      CRITICO: 'Riesgo critico',
      SIN_DATOS: 'Sin datos suficientes',
    };

    return labels[level] || 'Analisis disponible';
  }

  riskClass(): string {
    const level = (this.recommendationLevel || 'SIN_DATOS').toLowerCase();
    return 'risk-' + level;
  }

  riskIcon(): string {
    const level = (this.recommendationLevel || 'SIN_DATOS').toUpperCase();
    if (level === 'ALTO' || level === 'CRITICO') {
      return 'warning';
    }

    if (level === 'MODERADO') {
      return 'monitor_heart';
    }

    if (level === 'BAJO') {
      return 'verified';
    }

    return 'auto_awesome';
  }

  configureRecommendationAction(): void {
    const level = (this.recommendationLevel || 'SIN_DATOS').toUpperCase();
    if (level === 'ALTO' || level === 'CRITICO') {
      this.recommendationActionLabel = 'Agendar cita';
      this.recommendationActionPath = '/agendar-cita';
      return;
    }

    if (level === 'MODERADO') {
      this.recommendationActionLabel = 'Registrar emocion';
      this.recommendationActionPath = '/emotion-log';
      return;
    }

    this.recommendationActionLabel = 'Ver historial';
    this.recommendationActionPath = '/emotion-history';
  }

  go(path: string): void {
    this.router.navigateByUrl(path);
  }

  loadMedications(pacienteId: number): void {
    this.medicacionService.listarPorPaciente(pacienteId)
      .pipe(timeout(8000), finalize(() => {
        this.medicationsLoaded = true;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: list => {
          this.medications = (list || []).filter(m => m.activo || m.tratamientoActivo);
        },
        error: () => {
          this.medications = [];
        }
      });
  }

  toggleBreathing(): void {
    if (this.breathingActive) {
      this.stopBreathing();
    } else {
      this.startBreathing();
    }
  }

  startBreathing(): void {
    this.breathingActive = true;
    this.runBreathingCycle();
  }

  stopBreathing(): void {
    this.breathingActive = false;
    this.breathingPhase = 'idle';
    this.breathingText = 'Comenzar';
    if (this.breathingTimer) {
      clearTimeout(this.breathingTimer);
      this.breathingTimer = null;
    }
    this.cdr.detectChanges();
  }

  runBreathingCycle(): void {
    if (!this.breathingActive) return;

    this.breathingPhase = 'inhale';
    this.breathingText = 'Inhala...';
    this.cdr.detectChanges();

    this.breathingTimer = setTimeout(() => {
      if (!this.breathingActive) return;

      this.breathingPhase = 'hold';
      this.breathingText = 'Retén...';
      this.cdr.detectChanges();

      this.breathingTimer = setTimeout(() => {
        if (!this.breathingActive) return;

        this.breathingPhase = 'exhale';
        this.breathingText = 'Exhala...';
        this.cdr.detectChanges();

        this.breathingTimer = setTimeout(() => {
          this.runBreathingCycle();
        }, 8000);
      }, 7000);
    }, 4000);
  }

  logout(): void {
    this.auth.logout();
  }

  mapRecommendationsFromBackend(backendRecs: string[]): void {
    const list: RecommendationItem[] = [];
    const rawRecs = [...backendRecs];

    // Fallback if backend returned empty list
    if (rawRecs.length === 0) {
      if (this.recommendationLevel === 'SIN_DATOS') {
        rawRecs.push("Registra tu estado emocional diario para iniciar el análisis.");
        rawRecs.push("Completa la encuesta de bienestar general.");
        rawRecs.push("Realiza un ejercicio corto de respiración guiada.");
      } else {
        rawRecs.push("Mantener hábitos de descanso, respiración y registro emocional diario.");
        rawRecs.push("Revisa tu historial semanal para reconocer patrones positivos.");
      }
    }

    rawRecs.forEach(text => {
      let category: 'Terapia' | 'Autocuidado' | 'Relajación' | 'Seguimiento' = 'Autocuidado';
      let icon = 'spa';
      let priority: 'Alta' | 'Media' | 'Baja' = 'Media';

      const lower = text.toLowerCase();
      if (lower.includes('cita') || lower.includes('profesional') || lower.includes('médico') || lower.includes('medico') || lower.includes('terapeuta')) {
        category = 'Terapia';
        icon = 'medical_services';
      } else if (lower.includes('respiración') || lower.includes('respiracion') || lower.includes('relajación') || lower.includes('relajacion') || lower.includes('pausa')) {
        category = 'Relajación';
        icon = 'self_improvement';
      } else if (lower.includes('historial') || lower.includes('registro') || lower.includes('encuesta') || lower.includes('comparar')) {
        category = 'Seguimiento';
        icon = 'analytics';
      } else if (lower.includes('descanso') || lower.includes('sueño') || lower.includes('dormir') || lower.includes('hábitos') || lower.includes('habitos')) {
        category = 'Autocuidado';
        icon = 'bedtime';
      }

      // Priority based on risk level and content keywords
      const level = (this.recommendationLevel || 'SIN_DATOS').toUpperCase();
      if (level === 'ALTO' || level === 'CRITICO') {
        priority = category === 'Terapia' ? 'Alta' : 'Media';
      } else if (level === 'MODERADO') {
        priority = 'Media';
      } else {
        priority = 'Baja';
      }

      list.push({
        text,
        category,
        icon,
        completed: false,
        rating: null,
        priority
      });
    });

    this.mappedRecommendations = list;
  }

  calificarRecomendacion(rec: RecommendationItem, rating: 'like' | 'dislike'): void {
    rec.rating = rating;
    const emoji = rating === 'like' ? '👍' : '👎';
    const msg = `¡Gracias! Calificación ${emoji} registrada. La IA de MindCare utilizará tu retroalimentación para refinar futuras recomendaciones en base a tu estado de ánimo (${this.mood}) e intensidad (${this.survey}).`;
    this.triggerFeedbackToast(msg);
  }

  triggerFeedbackToast(message: string): void {
    this.feedbackMessage = message;
    this.showFeedbackToast = true;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.showFeedbackToast = false;
      this.cdr.detectChanges();
    }, 4500);
    this.cdr.detectChanges();
  }
}







