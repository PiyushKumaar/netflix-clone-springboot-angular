import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Signup } from './signup/signup';
import { Login } from './login/login';
import { VerifyEmail } from './verify-email/verify-email';

export const routes: Routes = [
    {path:'',component:Landing},
    {path:'signup',component:Signup},
    {path:'login',component:Login},
    {path:'verify-email',component:VerifyEmail},
    {path:'**',redirectTo:'',pathMatch:'full'}
];
