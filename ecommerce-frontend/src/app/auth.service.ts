import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Pointing to your existing Node.js local environment
  private apiUrl = 'http://localhost:3000/api/auth';

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Save the token and role when login is successful
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userName', response.name);
        localStorage.setItem('userEmail', response.email);
        if (response.image) {
          localStorage.setItem('userImage', response.image);
        }
      }),
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.clear();
      }),
    );
  }

  updateProfile(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put<any>(`${this.apiUrl}/profile`, data, { headers }).pipe(
      tap((response) => {
        localStorage.setItem('userName', response.name);
        localStorage.setItem('userEmail', response.email);
        if (response.image) {
          localStorage.setItem('userImage', response.image);
        } else {
          localStorage.removeItem('userImage');
        }
      }),
    );
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserDetails() {
    return {
      name: localStorage.getItem('userName') || 'Admin User',
      email: localStorage.getItem('userEmail') || '',
      image:
        localStorage.getItem('userImage') ||
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    };
  }
}
