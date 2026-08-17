import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { SharedModule } from '../shared/shared-module';

@Component({
  selector: 'app-verify-email',
  imports: [SharedModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  loading = true;
  success = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.loading = false;
      this.success = false;
      this.message = 'Invalid verification link , No token provided.'
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
        this.message = response.message || 'Email  verified succesfully! You can now login.'
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        this.message = err.error?.error ||'Verification failed. The link may have expired or is invalid.'
        this.cdr.detectChanges();
      }
    })
  }
}
