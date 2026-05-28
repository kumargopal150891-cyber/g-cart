import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isSidebarOpen = true;
  isProfileMenuOpen = false;
  isProfileModalOpen = false;

  userDetails = this.authService.getUserDetails();
  updateData = {
    name: this.userDetails.name,
    email: this.userDetails.email,
    password: '',
  };

  selectedImageFile: File | null = null;
  imagePreview: string | null = null;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  isCameraOpen = false;
  mediaStream: MediaStream | null = null;

  ngOnDestroy() {
    this.closeCamera();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  openProfileModal() {
    this.isProfileModalOpen = true;
    this.isProfileMenuOpen = false;
  }

  closeProfileModal() {
    this.isProfileModalOpen = false;
    this.closeCamera();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        localStorage.clear(); // Fallback: clear storage even if API fails
        this.router.navigate(['/login']);
      },
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges(); // Update view after async file read
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
      this.cdr.detectChanges(); // Force Angular to render the view so @ViewChild is available immediately
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
        this.selectedImageFile = null; // Clear out the file selection
        this.closeCamera();
        this.cdr.detectChanges(); // Force UI update with captured photo
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

  updateProfile() {
    const payload = {
      name: this.updateData.name,
      email: this.updateData.email,
      password: this.updateData.password,
      image: this.imagePreview, // Passing the base64 string
    };

    this.authService.updateProfile(payload).subscribe({
      next: (res) => {
        this.userDetails = this.authService.getUserDetails(); // Refresh local variables
        this.updateData.password = ''; // Clear out the password
        this.closeProfileModal();
        this.cdr.detectChanges(); // Tell Angular to refresh the UI in zoneless mode
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.cdr.detectChanges();
      },
    });
  }
}
