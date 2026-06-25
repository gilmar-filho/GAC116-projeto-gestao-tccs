import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'unidades',
    loadComponent: () =>
      import('./features/unidades/unidade-list.component').then((m) => m.UnidadeListComponent),
  },
  {
    path: 'departamentos',
    loadComponent: () =>
      import('./features/departamentos/departamento-list.component').then(
        (m) => m.DepartamentoListComponent,
      ),
  },
  {
    path: 'cursos',
    loadComponent: () =>
      import('./features/cursos/curso-list.component').then((m) => m.CursoListComponent),
  },
  {
    path: 'alunos',
    loadComponent: () =>
      import('./features/alunos/aluno-list.component').then((m) => m.AlunoListComponent),
  },
  {
    path: 'professores',
    loadComponent: () =>
      import('./features/professores/professor-list.component').then(
        (m) => m.ProfessorListComponent,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
