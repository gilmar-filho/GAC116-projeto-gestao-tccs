import { Injectable, inject, signal } from '@angular/core';
import { CursoService } from './curso.service';
import { ProfessorService } from './professor.service';
import { DepartamentoService } from './departamento.service';
import { UnidadeAcademicaService } from './unidade-academica.service';
import { Curso, Departamento, Professor, UnidadeAcademica } from '../models';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private cursoService = inject(CursoService);
  private professorService = inject(ProfessorService);
  private departamentoService = inject(DepartamentoService);
  private unidadeService = inject(UnidadeAcademicaService);

  readonly cursos = signal<Curso[]>([]);
  readonly professores = signal<Professor[]>([]);
  readonly departamentos = signal<Departamento[]>([]);
  readonly unidades = signal<UnidadeAcademica[]>([]);

  carregar(): void {
    this.cursoService.getAll().subscribe((d) => this.cursos.set(d));
    this.professorService.getAll().subscribe((d) => this.professores.set(d));
    this.departamentoService.getAll().subscribe((d) => this.departamentos.set(d));
    this.unidadeService.getAll().subscribe((d) => this.unidades.set(d));
  }

  nomeCurso(id: number | null): string {
    return this.nome(this.cursos(), id);
  }

  nomeProfessor(id: number | null): string {
    return this.nome(this.professores(), id);
  }

  nomeDepartamento(id: number | null): string {
    return this.nome(this.departamentos(), id);
  }

  nomeUnidade(id: number | null): string {
    return this.nome(this.unidades(), id);
  }

  private nome(lista: { id: number; nome: string }[], id: number | null): string {
    if (id == null) {
      return '—';
    }
    return lista.find((item) => item.id === id)?.nome ?? '—';
  }
}
