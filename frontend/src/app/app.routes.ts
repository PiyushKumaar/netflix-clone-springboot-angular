import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Signup } from './signup/signup';

export const routes: Routes = [
    {path:'',component:Landing},
    {path:'signup',component:Signup},
    {path:'**',redirectTo:'',pathMatch:'full'}
    //login
];
