import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export abstract class CrudService<T> {
  protected http = inject(HttpClient);
  protected abstract readonly resource: string;

  protected get baseUrl(): string {
    return `${environment.apiUrl}/api/${this.resource}/`;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl);
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${id}/`);
  }

  create(data: Partial<T>): Observable<T> {
    return this.http.post<T>(this.baseUrl, data);
  }

  update(id: number, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  search(term: string): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl, { params: { search: term } });
  }
}
