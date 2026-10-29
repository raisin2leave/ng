import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <div class="forbidden-page">
      <h1>Brak dostępu</h1>
      <p>Ta część aplikacji jest dostępna tylko dla administratorów.</p>
      <a routerLink="/" class="btn btn-primary">Wróć do restauracji</a>
    </div>
  `,
  styles: `
    .forbidden-page {
      max-width: 600px;
      margin: 60px auto;
      padding: 0 30px;
      text-align: center;
    }
  `,
})
export class Forbidden {}
