import { Routes } from '@angular/router';
import { AppointmentSuccessComponent } from './componente/appointment-success-component/appointment-success-component';
import { BookAppointmentComponent } from './componente/book-appointment-component/book-appointment-component';
import { EmotionHistoryComponent } from './componente/emotion-history-component/emotion-history-component';
import { EmotionLogComponent } from './componente/emotion-log-component/emotion-log-component';
import { EmotionResultsComponent } from './componente/emotion-results-component/emotion-results-component';
import { ForgotPasswordComponent } from './componente/forgot-password-component/forgot-password-component';
import { ResetPasswordComponent } from './componente/reset-password-component/reset-password-component';
import { IndexComponent } from './componente/index-component/index-component';
import { LoginComponent } from './componente/login-component/login-component';
import { MedicationManagementComponent } from './componente/medication-management-component/medication-management-component';
import { PatientDashboardComponent } from './componente/patient-dashboard-component/patient-dashboard-component';
import { PatientSurveyComponent } from './componente/patient-survey-component/patient-survey-component';
import { PatientProfileComponent } from './componente/patient-profile-component/patient-profile-component';
import { RegisterComponent } from './componente/register-component/register-component';
import { ReprogramAppointmentComponent } from './componente/reprogram-appointment-component/reprogram-appointment-component';
import { ReprogramSuccessComponent } from './componente/reprogram-success-component/reprogram-success-component';
import { ProfessionalRegisterComponent } from './componente/professional-register-component/professional-register-component';
import { ProfessionalDashboardComponent } from './componente/professional-dashboard-component/professional-dashboard-component';
import { ProfessionalAgendaComponent } from './componente/professional-agenda-component/professional-agenda-component';
import { ProfessionalPatientsComponent } from './componente/professional-patients-component/professional-patients-component';
import { PatientClinicalHistoryComponent } from './componente/patient-clinical-history-component/patient-clinical-history-component';
import { ProfessionalProfileComponent } from './componente/professional-profile-component/professional-profile-component';
import { AdminLoginComponent } from './componente/admin-login-component/admin-login-component';
import { AdminDashboardComponent } from './componente/admin-dashboard-component/admin-dashboard-component';
import { AdminUsersComponent } from './componente/admin-users-component/admin-users-component';
import { AdminValidateProfessionalsComponent } from './componente/admin-validate-professionals-component/admin-validate-professionals-component';
import { AdminSettingsComponent } from './componente/admin-settings-component/admin-settings-component';
import { AdminReportsComponent } from './componente/admin-reports-component/admin-reports-component';
import { AgendarCitaComponent } from './componente/agendar-cita-component/agendar-cita-component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'agendar-cita', component: AgendarCitaComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'appointment-success', component: AppointmentSuccessComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'book-appointment', component: BookAppointmentComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'emotion-history', component: EmotionHistoryComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'emotion-log', component: EmotionLogComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'emotion-results', component: EmotionResultsComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'restablecer-password', component: ResetPasswordComponent },
  { path: 'home', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'medication-management', component: MedicationManagementComponent, canActivate: [roleGuard], data: { roles: ['PROFESIONAL'] } },
  { path: 'patient-dashboard', component: PatientDashboardComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'patient-profile', component: PatientProfileComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'patient-survey', component: PatientSurveyComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'initial-survey', component: PatientSurveyComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'register', component: RegisterComponent },
  { path: 'reprogram-appointment', component: ReprogramAppointmentComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'reprogram-success', component: ReprogramSuccessComponent, canActivate: [roleGuard], data: { roles: ['PACIENTE'] } },
  { path: 'professional-register', component: ProfessionalRegisterComponent },
  { path: 'professional-dashboard', component: ProfessionalDashboardComponent, canActivate: [roleGuard], data: { roles: ['PROFESIONAL'] } },
  { path: 'professional-agenda', component: ProfessionalAgendaComponent, canActivate: [roleGuard], data: { roles: ['PROFESIONAL'] } },
  { path: 'professional-patients', component: ProfessionalPatientsComponent, canActivate: [roleGuard], data: { roles: ['PROFESIONAL'] } },
  { path: 'patient-clinical-history', component: PatientClinicalHistoryComponent, canActivate: [roleGuard], data: { roles: ['PROFESIONAL'] } },
  { path: 'professional-profile', component: ProfessionalProfileComponent, canActivate: [roleGuard], data: { roles: ['PROFESIONAL'] } },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin-users', component: AdminUsersComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin-validate-professionals', component: AdminValidateProfessionalsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin-settings', component: AdminSettingsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: 'admin-reports', component: AdminReportsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
  { path: '**', redirectTo: 'home' },
];
