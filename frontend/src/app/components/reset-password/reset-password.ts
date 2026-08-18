import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared-module';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { NotificationService } from '../../services/notification-service';

@Component({
  selector: 'app-reset-password',
  imports: [SharedModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  resetPasswordForm!:FormGroup;
  loading = false;
  tokenValid = false;
  token = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb : FormBuilder,
    private route : ActivatedRoute,
    private router : Router,
    private authService : AuthService,
    private notification : NotificationService
  ){
    this.resetPasswordForm = this.fb.group({
      password:['',[Validators.required,Validators.minLength(6)]],
      confirmPassword:['',[Validators.required,this.authService.passwordMatchValidator('password')]]
    });
  }

  ngOnInit():void{
    const token = this.route.snapshot.queryParamMap.get('token');
    if(token){
      this.token = token;
      this.tokenValid = true;
    }else{
      this.tokenValid = false;
    }
  }

  submit(){
    this.loading = true;
    const newPassword = this.resetPasswordForm.value.password;
    this.authService.resetPassword(this.token,newPassword).subscribe({
      next:(response:any)=>{
        this.loading=false;
        this.notification.success(response.message || 'Passwordreset successfully.')
        this.router.navigate(['/login']);
      },
      error:(err)=>{
        this.loading = false;
        const errorMsg = err.error?.error || 'Failed to reset password. Please try again.';
        if(errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid')){
          this.tokenValid = false;
        }else{
          this.notification.error(errorMsg);
        }
      }
    })
  }
}
