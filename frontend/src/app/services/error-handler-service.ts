import { Injectable } from '@angular/core';
import { NotificationService } from './notification-service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private notification : NotificationService){}

  handle(err:any,fallBackMessage:string){
    const errorMsg = err.error?.error || fallBackMessage;
    this.notification.error(errorMsg);
    console.error('API Error:',err)
  }
}
