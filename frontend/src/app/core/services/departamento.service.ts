import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { Departamento } from '../models';

@Injectable({ providedIn: 'root' })
export class DepartamentoService extends CrudService<Departamento> {
  protected readonly resource = 'departamentos';
}
