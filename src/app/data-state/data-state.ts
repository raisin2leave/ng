import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-data-state',
  imports: [],
  template: `
    @if (failed()) {
      <div class="data-state error" role="alert">
        <p>Unable to load data.</p>
        <button type="button" class="btn btn-primary" (click)="retry.emit()">Retry</button>
      </div>
    } @else if (loading()) {
      <div class="data-state" role="status">
        <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
        <span>{{ loadingText() }}</span>
      </div>
    }
  `,
  styles: `
    .data-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin: 40px auto;
      color: #6c757d;
      text-align: center;
    }

    .error p {
      margin: 0;
      font-size: 1.25rem;
      color: #842029;
    }
  `,
})
export class DataState {
  loading = input(false);
  failed = input(false);
  loadingText = input('Ładowanie danych…');

  retry = output<void>();
}
