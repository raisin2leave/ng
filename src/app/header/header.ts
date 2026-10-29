import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private auth = inject(Auth);
  private router = inject(Router);

  currentUser = this.auth.currentUser;
  isAdmin = this.auth.isAdmin;

  logOut() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
