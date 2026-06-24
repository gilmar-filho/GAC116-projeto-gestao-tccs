import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Curso } from '../models';

@Injectable({ providedIn: 'root' })
export class CursoService extends CrudService<Curso> {
  protected readonly resource = 'cursos';
}
