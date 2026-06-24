import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from './crud.service';
import { TCC } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TccService extends CrudService<TCC> {
  protected readonly resource = 'tccs';

  createWithFile(data: FormData): Observable<TCC> {
    return this.http.post<TCC>(this.baseUrl, data);
  }

  updateWithFile(id: number, data: FormData): Observable<TCC> {
    return this.http.put<TCC>(`${this.baseUrl}${id}/`, data);
  }

  arquivoUrl(tcc: TCC): string | null {
    if (!tcc.arquivo) {
      return null;
    }
    return tcc.arquivo.startsWith('http')
      ? tcc.arquivo
      : `${environment.apiUrl}${tcc.arquivo.startsWith('/') ? '' : '/media/'}${tcc.arquivo}`;
  }
}
