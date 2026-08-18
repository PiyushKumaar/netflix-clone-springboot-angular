import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Signup } from './signup/signup';
import { Login } from './login/login';
import { VerifyEmail } from './components/verify-email/verify-email';
import { Home } from './user/home/home';
import { authGuard } from './shared/guards/auth-guard';
import { adminGuard } from './shared/guards/admin-guard';
import { ForgotPassword } from './components/forgot-password/forgot-password';

export const routes: Routes = [
    {path:'',component:Landing},
    {path:'signup',component:Signup},
    {path:'login',component:Login},
    {path:'verify-email',component:VerifyEmail},
    {path:'forgot-password',component:ForgotPassword},
    {path:'home',component:Home, canActivate:[authGuard]},
    {
        path:'admin',
        loadChildren:()=>import('./admin/admin-module').then(m=>m.AdminModule),
        canActivate:[adminGuard]
    },
    {path:'**',redirectTo:'',pathMatch:'full'}
];
