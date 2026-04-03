import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly AUTH_URL = 'https://api.teyca.ru/test-auth-only';

  readonly token = signal<string | null>(localStorage.getItem('auth_token'));

  login(login: string, password: string): Observable<{ auth_token: string }> {
    return this.http.post<{ auth_token: string }>(this.AUTH_URL, { login, password }).pipe(
      tap(res => {
        this.token.set(res.auth_token);
        localStorage.setItem('auth_token', res.auth_token);
      })
    );
  }

  logout(): void {
    this.token.set(null);
    localStorage.removeItem('auth_token');
  }

  api(endpoint: string): string {
    const t = this.token();
    if (!t) throw new Error('No token');
    return `https://api.teyca.ru/v1/${t}/${endpoint}`;
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }
}
