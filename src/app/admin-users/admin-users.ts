import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserProfile } from '../models/user';
import { Auth } from '../services/auth';
import { Users } from '../services/users';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers {
  private usersService = inject(Users);
  private auth = inject(Auth);

  users = this.usersService.getAll();
  currentUser = this.auth.currentUser;

  roleFilter = signal('all');

  visibleUsers = computed(() => {
    const role = this.roleFilter();
    const result: UserProfile[] = [];

    for (const user of this.users()) {
      if (role === 'all' || user.role === role) {
        result.push(user);
      }
    }

    return result;
  });

  resettingUserId = signal('');
  newPassword = signal('');
  resetError = signal('');
  message = signal('');

  isMe(user: UserProfile) {
    return user.id === this.currentUser()?.id;
  }

  startReset(user: UserProfile) {
    this.resettingUserId.set(user.id);
    this.newPassword.set('');
    this.resetError.set('');
    this.message.set('');
  }

  cancelReset() {
    this.resettingUserId.set('');
    this.resetError.set('');
  }

  saveReset(event: Event, user: UserProfile) {
    event.preventDefault();

    if (this.newPassword().length < 8) {
      this.resetError.set('Nowe hasło musi mieć co najmniej 8 znaków.');
      return;
    }

    this.usersService.resetPassword(user.id, this.newPassword());
    this.cancelReset();
    this.message.set(`Hasło użytkownika ${user.name} zostało zmienione.`);
  }

  deleteUser(user: UserProfile) {
    if (this.isMe(user)) {
      return;
    }

    if (confirm(`Czy na pewno usunąć konto „${user.name}” (${user.email})?`)) {
      this.usersService.deleteUser(user.id);
      this.message.set(`Konto ${user.name} zostało usunięte.`);
    }
  }
}
