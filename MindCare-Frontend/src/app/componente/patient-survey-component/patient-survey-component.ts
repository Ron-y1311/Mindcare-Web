import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { EncuestaService } from '../../services/encuesta-service';
import { RespuestaService } from '../../services/respuesta-service';
import { CatalogoItem, CatalogoService } from '../../services/catalogo-service';
import { MatButtonModule } from '@angular/material/button';

interface SurveyQuestion {
  idPregunta?: number;
  texto: string;
}

import { SidebarComponent } from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-patient-survey',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, SidebarComponent],
  templateUrl: './patient-survey-component.html',
  styleUrl: './patient-survey-component.css',
})
export class PatientSurveyComponent implements OnInit {
  score = 0;
  currentIndex = 0;
  loading = false;
  errorMessage = '';
  answers: number[] = [];
  options = [1, 2, 3, 4, 5];
  surveyMode: 'diaria' | 'inicial' = 'diaria';
  questions: SurveyQuestion[] = [
    { idPregunta: 1, texto: 'Como describirias tu estado emocional actual?' },
    { idPregunta: 2, texto: 'Que tan intensa fue tu emocion principal hoy?' },
    { idPregunta: 3, texto: 'Dormiste adecuadamente?' },
    { idPregunta: 4, texto: 'Tuviste pensamientos negativos recurrentes?' },
  ];

  constructor(
    private auth: AuthService,
    private encuestaService: EncuestaService,
    private respuestaService: RespuestaService,
    private catalogoService: CatalogoService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.auth.requireUser();
    this.surveyMode = this.route.snapshot.routeConfig?.path === 'initial-survey' ? 'inicial' : 'diaria';
    this.cargarPreguntas();
  }

  cargarPreguntas(): void {
    this.catalogoService.listarPreguntas().subscribe({
      next: (preguntas: CatalogoItem[]) => {
        const oficiales = preguntas
          .filter((pregunta) => !!pregunta.texto)
          .map((pregunta) => ({ idPregunta: pregunta.idPregunta, texto: pregunta.texto || '' }));
        if (oficiales.length > 0) {
          this.questions = oficiales;
        } else {
          this.useFallbackQuestions();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar las preguntas oficiales. Se usaran preguntas base.';
        this.useFallbackQuestions();
        this.cdr.detectChanges();
      },
    });
  }

  useFallbackQuestions(): void {
    this.questions = [
      { idPregunta: 1, texto: 'Como describirias tu estado emocional actual?' },
      { idPregunta: 2, texto: 'Que tan intensa fue tu emocion principal hoy?' },
      { idPregunta: 3, texto: 'Dormiste adecuadamente?' },
      { idPregunta: 4, texto: 'Tuviste pensamientos negativos recurrentes?' },
    ];
  }

  get completed(): boolean {
    return this.currentIndex >= this.questions.length;
  }

  get questionCounter(): string {
    return `${Math.min(this.currentIndex + 1, this.questions.length)}/${this.questions.length}`;
  }

  get questionText(): string {
    return this.completed ? 'Encuesta completada. Puedes finalizar para ver tus resultados.' : this.questions[this.currentIndex].texto;
  }

  get progress(): number {
    return Math.round((this.answers.length / this.questions.length) * 100);
  }

  get liveScore(): string {
    return this.answers.length === 0 ? '--' : `${this.currentBienestar(this.answers.length)}%`;
  }

  get liveScoreDescription(): string {
    if (this.answers.length === 0) return 'Responde las preguntas para calcular tu bienestar del dia.';
    return this.interpretation(this.currentBienestar(this.answers.length));
  }

  get surveyTitle(): string {
    return this.surveyMode === 'inicial' ? 'Encuesta inicial' : 'Encuesta diaria';
  }

  get surveySubtitle(): string {
    return this.surveyMode === 'inicial'
      ? 'Completa tu primera evaluacion para iniciar tu seguimiento'
      : 'Dedica unos minutos a conocer mejor tu estado emocional';
  }

  selectAnswer(value: number): void {
    if (this.completed) return;
    this.answers.push(value);
    this.score += value;
    this.currentIndex++;
  }

  currentBienestar(answered = this.questions.length): number {
    return Math.round((this.score / (answered * 5)) * 100);
  }

  interpretation(bienestar: number): string {
    if (bienestar >= 80) return 'Excelente nivel de bienestar emocional.';
    if (bienestar >= 60) return 'Buen nivel de bienestar. Manten tus habitos positivos.';
    if (bienestar >= 40) return 'Bienestar moderado. Considera tomar una pausa.';
    return 'Nivel bajo de bienestar. Te recomendamos practicar una tecnica de relajacion.';
  }

  finish(): void {
    this.errorMessage = '';
    if (!this.completed) return;

    const user = this.auth.requireUser();
    if (!user.pacienteId) {
      this.errorMessage = 'No se encontro perfil de paciente.';
      return;
    }

    const bienestar = this.currentBienestar();
    const encuestaPayload = {
      pacienteId: user.pacienteId,
      resultadoTotal: bienestar,
      interpretacionResultado: this.interpretation(bienestar),
    };

    this.loading = true;
    const guardarEncuesta = this.surveyMode === 'inicial'
      ? this.encuestaService.crearInicial(encuestaPayload)
      : this.encuestaService.crearDiaria(encuestaPayload);

    guardarEncuesta.pipe(
      switchMap((encuesta) => {
        if (!encuesta.encuestaId) return of([]);
        const respuestas = this.questions
          .map((question, index) => ({ question, answer: this.answers[index] }))
          .filter((item) => !!item.question.idPregunta)
          .map((item) => this.respuestaService.registrar({
            encuestaId: encuesta.encuestaId as number,
            preguntaId: item.question.idPregunta as number,
            contenido: String(item.answer),
          }));
        return respuestas.length > 0 ? forkJoin(respuestas) : of([]);
      }),
    ).subscribe({
      next: () => this.router.navigate(['/emotion-results']),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'No se pudo guardar la encuesta.';
        this.cdr.detectChanges();
      },
    });
  }

  verResultados(): void {
    this.router.navigate(['/emotion-results']);
  }

  goBack(): void {
    this.router.navigate(['/patient-dashboard']);
  }

  logout(): void {
    this.auth.logout();
  }
}