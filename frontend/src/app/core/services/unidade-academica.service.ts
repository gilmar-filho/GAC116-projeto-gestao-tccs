import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { UnidadeAcademica } from '../models';

@Injectable({ providedIn: 'root' })
export class UnidadeAcademicaService extends CrudService<UnidadeAcademica> {
  protected readonly resource = 'unidades-academicas';
}
