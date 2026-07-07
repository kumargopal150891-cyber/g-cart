import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CategoryService } from '../../category.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  categories: any[] = [];
  parentCategories: any[] = [];
  displayedColumns: string[] = ['name', 'slug', 'parent', 'actions'];
  currentUserRole: string | null = '';

  isModalOpen = false;
  isEditMode = false;

  formData = { _id: '', name: '', slug: '', parent_id: '' };

  ngOnInit() {
    this.currentUserRole = this.authService.getUserRole();
    if (!this.canEdit) {
      this.displayedColumns = ['name', 'slug', 'parent'];
    }
    this.loadCategories();
  }

  get canEdit(): boolean {
    return (
      this.currentUserRole === 'admin' || this.currentUserRole === 'co-admin'
    );
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading categories', err),
    });
  }

  openCreateModal() {
    if (!this.canEdit) return;
    this.isEditMode = false;
    this.formData = { _id: '', name: '', slug: '', parent_id: '' };
    this.parentCategories = this.categories;
    this.isModalOpen = true;
  }

  openEditModal(category: any) {
    if (!this.canEdit) return;
    this.isEditMode = true;
    this.formData = {
      _id: category._id,
      name: category.name,
      slug: category.slug || '',
      parent_id: category.parent_id?._id || '',
    };
    this.parentCategories = this.categories.filter(
      (c) => c._id !== category._id,
    );
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCategory() {
    if (!this.canEdit) return;
    const payload = {
      name: this.formData.name,
      slug: this.formData.slug,
      parent_id: this.formData.parent_id || null,
    };

    const apiCall = this.isEditMode
      ? this.categoryService.updateCategory(this.formData._id, payload)
      : this.categoryService.createCategory(payload);

    apiCall.subscribe({
      next: () => {
        this.loadCategories();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving category', err);
        alert(err.error?.message || 'Failed to save category');
      },
    });
  }

  deleteCategory(id: string) {
    if (!this.canEdit) return;
    if (
      confirm(
        'Are you sure you want to delete this category? (Child categories will become top-level categories)',
      )
    ) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error('Error deleting category', err),
      });
    }
  }
}
