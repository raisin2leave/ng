import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../services/auth';
import { Cart } from '../services/cart';
import { IfRole } from '../directives/if-role';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, IfRole],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private auth = inject(Auth);
  private router = inject(Router);

  currentUser = this.auth.currentUser;
  cartCount = inject(Cart).itemCount;
  cartCountWord = computed(() => productWord(this.cartCount()));

  logOut() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}

export function productWord(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (count === 1) {
    return 'produkt';
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return 'produkty';
  }

  return 'produktów';
}
