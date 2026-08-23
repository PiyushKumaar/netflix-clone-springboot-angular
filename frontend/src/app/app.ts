import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/commonComp/header/header';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('netflix-clone');
  showHeader = signal(false);

  constructor(private router: Router) {

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {

        const url = event.urlAfterRedirects;

        this.showHeader.set(
          url.startsWith('/home') ||
          url.startsWith('/my-favourites') ||
          url.startsWith('/admin')
        );
      });
  }
}
