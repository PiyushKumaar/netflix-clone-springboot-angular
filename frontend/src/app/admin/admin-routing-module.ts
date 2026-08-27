import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoList } from './video-list/video-list';
import { UserList } from './user-list/user-list';

const routes: Routes = [
  {
    path : '',
    children:[
      {path:'',redirectTo:'videos',pathMatch:'full'},
      {path:'videos', component:VideoList},
      {path:'users',component:UserList}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
