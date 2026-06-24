import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Aluno } from '../models';

@Injectable({ providedIn: 'root' })
export class AlunoService extends CrudService<Aluno> {
  protected readonly resource = 'alunos';
}
