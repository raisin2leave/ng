import { computed, inject, Injectable, signal } from '@angular/core';
import { Users } from './users';

const SESSION_KEY = 'foodapp-session';

@Injectable({ providedIn: 'root' })
export class Auth {
  private usersService = inject(Users);

  private currentUserId = signal(localStorage.getItem(SESSION_KEY) ?? '');

  currentUser = computed(() => {
    const id = this.currentUserId();

    if (id === '') {
      return undefined;
    }

    return this.usersService.getById(id);
  });

  isLoggedIn = computed(() => this.currentUser() !== undefined);

  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  login(email: string, password: string) {
    const user = this.usersService.findByLogin(email, password);

    if (!user) {
      return false;
    }

    this.currentUserId.set(user.id);
    localStorage.setItem(SESSION_KEY, user.id);
    return true;
  }

  logout() {
    this.currentUserId.set('');
    localStorage.removeItem(SESSION_KEY);
  }
}
