import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Professor } from '../models';

@Injectable({ providedIn: 'root' })
export class ProfessorService extends CrudService<Professor> {
  protected readonly resource = 'professores';
}
