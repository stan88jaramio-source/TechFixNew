import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenResponse, User, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('token'));
  loading = signal(true);

  constructor() {
    if (this.token()) {
      this.fetchMe();
    } else {
      this.loading.set(false);
    }
  }

  login(email: string, password: string) {
    return this.http.post<TokenResponse>(`${this.api}/login`, { email, password }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<TokenResponse>(`${this.api}/register`, { name, email, password }).pipe(
      tap(res => this.storeSession(res))
    );
  }

  fetchMe() {
    return this.http.get<User>(`${this.api}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.loading.set(false);
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    ).subscribe();
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.currentUser.set(null);
    this.loading.set(false);
    this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return !!this.token();
  }

  private storeSession(res: TokenResponse) {
    localStorage.setItem('token', res.accessToken);
    this.token.set(res.accessToken);
    this.currentUser.set(res.user);
  }
}
