import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/user-service';
import { NotificationService } from '../../../services/notification-service';
import { ErrorHandlerService } from '../../../services/error-handler-service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatFormFieldModule, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from "@angular/material/button";
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-manage-user',
  imports: [ReactiveFormsModule,MatInput, MatIcon, MatFormFieldModule, MatLabel, MatPrefix, MatError, MatButtonModule, MatSuffix,MatOption,MatSelectModule],
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.css',
})
export class ManageUser {
  
  userForm!:FormGroup;
  creating = signal(false);
  hidePassword = signal(true);
  isEditMode = signal<boolean>(false);

  constructor(
    private fb:FormBuilder,
    private userService : UserService,
    private notification : NotificationService,
    private errorHandlerService : ErrorHandlerService,
    public dialogRef : MatDialogRef<ManageUser>,
    @Inject(MAT_DIALOG_DATA) public data:any  
  ){
    this.isEditMode.set(data.mode === 'edit')

    this.userForm = this.fb.group({
      fullName : [data.user?.fullName || '', Validators.required],
      email : [data.user?.email || '',[Validators.required,Validators.email]],
      password:['',this.isEditMode() ? [] : [Validators.required,Validators.minLength(6)]],
      role:[data.user?.role || 'USER', Validators.required]
    });
  }

  onCancel(){
    this.dialogRef.close();
  }

  onSave(){
    this.creating.set(true);
    const formData = this.userForm.value;

    const data={
      email:formData.email?.trim().toLowerCase(),
      password:formData.password,
      fullName:formData.fullName,
      role:formData.role
    };

    const op$ = this.isEditMode()
    ? this.userService.updateUser(this.data.user.id,data)
    : this.userService.createUser(data);

    op$.subscribe({
      next:(response:any)=>{
        this.creating.set(false);
        this.notification.success(response?.message);
        this.dialogRef.close(true);
      },
      error:(err)=>{
        this.creating.set(false);
        this.errorHandlerService.handle(err,'Failed to save user.');
      }
    })
  }
}
