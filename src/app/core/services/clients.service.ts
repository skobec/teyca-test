import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { Client, ClientsResponse } from '../models/client.models';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  getClients(page: number, per_page: number, search?: string): Observable<ClientsResponse> {
    const url = this.auth.api('passes');
    const offset = (page - 1) * per_page;

    let params = new HttpParams()
      .set('limit', String(per_page))
      .set('offset', String(offset));

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        const source = response?.passes || response?.data || response?.items || [];
        const meta = response?.meta || {};
        const total = meta?.size || meta?.total || response?.total || source.length;

        return {
          data: source,
          total: total,
          page: page,
          per_page: per_page,
          total_pages: Math.ceil(total / per_page)
        };
      }),
      catchError(() => of<ClientsResponse>({
        data: [],
        total: 0,
        page: 1,
        per_page: per_page,
        total_pages: 1
      }))
    );
  }
}
