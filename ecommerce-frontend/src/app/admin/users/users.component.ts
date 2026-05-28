import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../user.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-users',
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
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  isCameraOpen = false;
  mediaStream: MediaStream | null = null;
  imagePreview: string | null = null;

  users: any[] = [];
  currentUserRole: string | null = '';
  displayedColumns: string[] = [
    'image',
    'name',
    'email',
    'role',
    'status',
    'actions',
  ];

  isModalOpen = false;
  isEditMode = false;

  formData = {
    _id: '',
    name: '',
    email: '',
    role: 'buyer',
    password: '',
    image: '',
  };

  defaultImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

  ngOnInit() {
    this.currentUserRole = this.authService.getUserRole();
    if (!this.isAdmin) {
      this.displayedColumns = ['image', 'name', 'email', 'role', 'status'];
    }
    this.loadUsers();
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading users', err),
    });
  }

  openCreateModal() {
    if (!this.isAdmin) return;
    this.isEditMode = false;
    this.formData = {
      _id: '',
      name: '',
      email: '',
      role: 'buyer',
      password: '',
      image: '',
    };
    this.imagePreview = null;
    this.isModalOpen = true;
  }

  openEditModal(user: any) {
    if (!this.isAdmin) return;
    this.isEditMode = true;
    this.formData = { ...user, password: '', image: user.image || '' };
    this.imagePreview = user.image || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.closeCamera();
  }

  saveUser() {
    if (!this.isAdmin) return;

    const payload = { ...this.formData, image: this.imagePreview };

    const apiCall = this.isEditMode
      ? this.userService.updateUser(payload._id, payload)
      : this.userService.createUser(payload);

    apiCall.subscribe({
      next: () => {
        this.loadUsers();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving user', err);
        alert(err.error?.message || 'Failed to save user');
      },
    });
  }

  deleteUser(id: string) {
    if (!this.isAdmin) return;
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error deleting user', err),
      });
    }
  }

  toggleStatus(id: string) {
    if (!this.isAdmin) return;
    this.userService.toggleUserStatus(id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => console.error('Error toggling status', err),
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  async openCamera() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.isCameraOpen = true;
      this.cdr.detectChanges();
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.mediaStream;
        this.videoElement.nativeElement.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Camera not available or permission denied.');
    }
  }

  capturePhoto() {
    if (this.videoElement && this.canvasElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.imagePreview = canvas.toDataURL('image/png');
        this.closeCamera();
        this.cdr.detectChanges();
      }
    }
  }

  closeCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.isCameraOpen = false;
  }
}
