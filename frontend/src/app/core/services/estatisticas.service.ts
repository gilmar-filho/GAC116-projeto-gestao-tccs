import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstatisticasTCC } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstatisticasService {
  private http = inject(HttpClient);

  getEstatisticas(): Observable<EstatisticasTCC> {
    return this.http.get<EstatisticasTCC>(`${environment.apiUrl}/api/tccs/estatisticas/`);
  }
}
