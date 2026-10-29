import { computed, Injectable, signal } from '@angular/core';
import bcrypt from 'bcryptjs';
import {
  AdminRegistration,
  CustomerRegistration,
  ProfileChanges,
  StoredUser,
  UserProfile,
} from '../models/user';
import usersData from '../data/users.json';

const STORAGE_KEY = 'foodapp-users';

@Injectable({ providedIn: 'root' })
export class Users {
  private users = signal<StoredUser[]>(this.loadFromStorage());

  private profiles = computed(() => {
    const result: UserProfile[] = [];

    for (const user of this.users()) {
      result.push(this.toProfile(user));
    }

    return result;
  });

  getAll() {
    return this.profiles;
  }

  getById(id: string) {
    for (const user of this.users()) {
      if (user.id === id) {
        return this.toProfile(user);
      }
    }

    return undefined;
  }

  isEmailTaken(email: string, exceptUserId = '') {
    const wanted = this.normalizeEmail(email);

    for (const user of this.users()) {
      if (user.email === wanted && user.id !== exceptUserId) {
        return true;
      }
    }

    return false;
  }

  findByLogin(email: string, password: string) {
    const wanted = this.normalizeEmail(email);

    for (const user of this.users()) {
      if (user.email === wanted && bcrypt.compareSync(password, user.passwordHash)) {
        return this.toProfile(user);
      }
    }

    return undefined;
  }

  registerCustomer(data: CustomerRegistration) {
    if (this.isEmailTaken(data.email)) {
      return undefined;
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email: this.normalizeEmail(data.email),
      phone: data.phone.trim(),
      role: 'customer',
      deliveryAddress: data.deliveryAddress,
      passwordHash: this.hashPassword(data.password),
    };

    this.saveAll([...this.users(), newUser]);
    return this.toProfile(newUser);
  }

  createAdmin(data: AdminRegistration) {
    if (this.isEmailTaken(data.email)) {
      return undefined;
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email: this.normalizeEmail(data.email),
      phone: data.phone.trim(),
      role: 'admin',
      passwordHash: this.hashPassword(data.password),
    };

    this.saveAll([...this.users(), newUser]);
    return this.toProfile(newUser);
  }

  updateProfile(id: string, changes: ProfileChanges) {
    if (this.isEmailTaken(changes.email, id)) {
      return false;
    }

    const updatedList: StoredUser[] = [];

    for (const user of this.users()) {
      if (user.id !== id) {
        updatedList.push(user);
      } else if (user.role === 'customer' && changes.deliveryAddress) {
        updatedList.push({
          ...user,
          name: changes.name.trim(),
          email: this.normalizeEmail(changes.email),
          phone: changes.phone.trim(),
          deliveryAddress: changes.deliveryAddress,
        });
      } else {
        updatedList.push({
          ...user,
          name: changes.name.trim(),
          email: this.normalizeEmail(changes.email),
          phone: changes.phone.trim(),
        });
      }
    }

    this.saveAll(updatedList);
    return true;
  }

  resetPassword(id: string, newPassword: string) {
    const updatedList: StoredUser[] = [];

    for (const user of this.users()) {
      if (user.id === id) {
        updatedList.push({ ...user, passwordHash: this.hashPassword(newPassword) });
      } else {
        updatedList.push(user);
      }
    }

    this.saveAll(updatedList);
  }

  deleteUser(id: string) {
    const keptUsers: StoredUser[] = [];

    for (const user of this.users()) {
      if (user.id !== id) {
        keptUsers.push(user);
      }
    }

    this.saveAll(keptUsers);
  }

  resetToOriginal() {
    localStorage.removeItem(STORAGE_KEY);
    this.users.set(usersData as StoredUser[]);
  }

  private toProfile(user: StoredUser): UserProfile {
    const { passwordHash, ...profile } = user;
    return profile;
  }

  private hashPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private saveAll(users: StoredUser[]) {
    this.users.set(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  private loadFromStorage(): StoredUser[] {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    return usersData as StoredUser[];
  }
}
