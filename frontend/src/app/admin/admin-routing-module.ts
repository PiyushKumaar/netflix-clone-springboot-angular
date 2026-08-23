import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoList } from './video-list/video-list';

const routes: Routes = [
  {
    path : '',
    children:[
      {path:'',redirectTo:'videos',pathMatch:'full'},
      {path:'videos', component:VideoList}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
