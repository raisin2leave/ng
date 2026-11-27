import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { UserProfile } from '../models/user';
import { Auth } from '../services/auth';

@Directive({
  selector: '[appIfRole]',
})
export class IfRole {
  private template = inject(TemplateRef);
  private container = inject(ViewContainerRef);
  private auth = inject(Auth);

  appIfRole = input.required<UserProfile['role']>();

  private isShown = false;

  constructor() {
    effect(() => {
      const hasRole = this.auth.currentUser()?.role === this.appIfRole();

      if (hasRole && !this.isShown) {
        this.container.createEmbeddedView(this.template);
        this.isShown = true;
      } else if (!hasRole && this.isShown) {
        this.container.clear();
        this.isShown = false;
      }
    });
  }
}
