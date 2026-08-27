import { Component, HostListener, Signal, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';
import { DialogService } from '../../services/dialog-service';
import { NotificationService } from '../../services/notification-service';
import { ErrorHandlerService } from '../../services/error-handler-service';
import { MatAnchor, MatIconButton } from "@angular/material/button";
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-list',
  imports: [MatAnchor, MatIcon, MatIconButton, MatTooltip,MatProgressBar,MatProgressSpinner],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList {

  pagedinatedUsers = signal<any[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  error = signal(false);
  currentUserEmail = signal<string | null>(null);
  searchQuery = signal<string>('');

  pageSize = signal(10);
  currentPage = signal(0);
  totalPages = signal(0);
  totalUsers= signal(0) ;
  hasMoreUsers = signal(true);

  constructor(
    private userService : UserService,
    private authService : AuthService,
    private dialogService : DialogService,
    private notificationService : NotificationService,
    private errorHandlerService : ErrorHandlerService
  ){}

  ngOnInit() : void{
    const currenUser = this.authService.getCurrentUser();
    this.currentUserEmail.set(currenUser?.email || null);
    this.loadUsers();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200 && !this.loadingMore() && !this.loading() && this.hasMoreUsers()) {
      this.loadMoreUsers();
    }
  }

  loadUsers(){
    this.loading.set(true);
    this.error.set(false);
    this.currentPage.set(0);
    this.pagedinatedUsers.set([]);
    const search = this.searchQuery().trim() || undefined;

    this.userService.getALlUsers(this.currentPage(),this.pageSize(),search).subscribe({
      next:(response:any) => {
        this.pagedinatedUsers.set(response.content);
        this.totalUsers.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.currentPage);
        this.hasMoreUsers.set(this.currentPage() < this.totalPages() - 1);
        this.loading.set(false);
      },
      error:(err)=>{
        this.error.set(true);
        this.loading.set(false);
        this.errorHandlerService.handle(err,'Failed to load users.');
      }
    });
  }

  loadMoreUsers(){
    if(this.loadingMore() || !this.hasMoreUsers()) return;

    this.loadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    const search = this.searchQuery().trim() || undefined;

    this.userService.getALlUsers(nextPage, this.pageSize() , search).subscribe({
      next:(response : any) =>{
        this.pagedinatedUsers.set([...this.pagedinatedUsers(),...response.content]);
        this.currentPage.set(response.number);
        this.hasMoreUsers.set(this.currentPage() < this.totalPages() -1);
        this.loadingMore.set(false);
      },
      error : (err)=>{
        this.loadingMore.set(false);
        this.errorHandlerService.handle(err,'Failed to load more users.');
      }
    })
  }

  onSearchChange(event:Event){
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(0);
    this.loadUsers();
  }

  clearSearch(){
    this.searchQuery.set('');
    this.currentPage.set(0);
    this.loadUsers();
  }

  createUser(){
    const dialogRef = this.dialogService.openManageUserDialog('create');
    dialogRef.afterClosed().subscribe(response =>{
      if(response){
        this.loadUsers();
      }
    })
  }

  editUser(user:any){
    const dialogRef = this.dialogService.openManageUserDialog('edit',user);
    dialogRef.afterClosed().subscribe(response =>{
      if(response){
        this.loadUsers();
      }
    })
  }

  isCurrentUser(user:any) : boolean{
    return user.email === this.currentUserEmail();
  }

  toggleUserStatus(user:any):void{
    this.userService.toggleUserStatus(user.id).subscribe({
      next:(response:any)=>{
        this.notificationService.success(response.message);
        this.loadUsers();
      },
      error:(err)=>{
        this.errorHandlerService.handle(err,"Failed to update user status.");
      }
    })
  }

  deleteUser(user:any){
    this.dialogService.openConfirmation(
      'Delete User?',
      `Are you sure you want to delete user "${user.fullName}"? This action cannot be undone`,
      'Delete',
      'Cancel',
      'danger'
    ).subscribe(response => {
      if(response){
        this.userService.deleteUser(user.id).subscribe({
          next:(response:any)=>{
            this.notificationService.success(response?.message);
            this.loadUsers();
          },
          error : (err)=>{
            this.errorHandlerService.handle(err,'Failed to delete user.');
          }
        });
      }
    })
  }

  changeUserRole(user:any){
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    this.dialogService.openConfirmation(
      'Change User Role?',
      `Are you sure you want to change ${user.fullName}'s role to ${newRole}`,
      'Change Role',
      'Cancel',
      'warning'
    ).subscribe(response => {
      if(response){
        this.userService.changeUserRole(user.id,newRole).subscribe({
          next:(response:any) =>{
            this.notificationService.success(response?.message);
            this.loadUsers();
          },
          error:(err)=>{
            this.errorHandlerService.handle(err,'Failed to change user role.');
          }
        });
      }
    });
  }

  getRoleBadgeClass(role:string) : string{
    return role === 'ADMIN' ? 'role-badge admin' : 'role-badge user';
  }

  getStatusBadgeClass(active:boolean) : string{
    return active ? 'status-badge active' : 'status-badge inactive';
  }

  formatDate(dateString : string) : string{
    return new Date(dateString).toLocaleDateString('en-US',{
      year : 'numeric',
      month : 'short',
      day : 'numeric'
    })
  }
}
