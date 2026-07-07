import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/categories';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, category, {
      headers: this.getHeaders(),
    });
  }

  updateCategory(id: string, category: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, category, {
      headers: this.getHeaders(),
    });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
