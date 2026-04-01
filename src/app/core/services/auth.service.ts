import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private KEY = 'token';

  setToken(token: string) {
    localStorage.setItem(this.KEY, token);
  }

  getToken() {
    return localStorage.getItem(this.KEY);
  }

  isAuth() {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.KEY);
  }
}
