import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Confirm } from './confirm';

@Component({
  imports: [Confirm],
  template: `<button type="button" [appConfirm]="question()" (confirmed)="count = count + 1">Usuń</button>`,
})
class Host {
  question = signal('Na pewno?');
  count = 0;
}

describe('Confirm directive', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function setUp() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    return { fixture, button, host: fixture.componentInstance };
  }

  it('should ask the question and run the action only after "OK"', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { button, host } = setUp();

    button.click();

    expect(confirmSpy).toHaveBeenCalledWith('Na pewno?');
    expect(host.count).toBe(1);
  });

  it('should do nothing after "Cancel"', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { button, host } = setUp();

    button.click();

    expect(host.count).toBe(0);
  });

  it('should run the action without asking when the question is empty', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const { fixture, button, host } = setUp();
    host.question.set('');
    fixture.detectChanges();

    button.click();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(host.count).toBe(1);
  });
});
