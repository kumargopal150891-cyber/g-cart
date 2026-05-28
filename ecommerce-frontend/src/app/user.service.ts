import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/users';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user, {
      headers: this.getHeaders(),
    });
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user, {
      headers: this.getHeaders(),
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  toggleUserStatus(id: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${id}/toggle-status`,
      {},
      { headers: this.getHeaders() },
    );
  }
}
