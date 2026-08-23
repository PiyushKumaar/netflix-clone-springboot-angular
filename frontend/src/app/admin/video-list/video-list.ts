import { Component } from '@angular/core';
import { DialogService } from '../../services/dialog-service';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-video-list',
  imports: [MatIcon],
  templateUrl: './video-list.html',
  styleUrl: './video-list.css',
})
export class VideoList {

  constructor(private dialogService : DialogService){}

  createNew(){
    const dialogRef = this.dialogService.openVideoFromDialog('create');
  }
}
