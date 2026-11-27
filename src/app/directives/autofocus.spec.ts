import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Autofocus } from './autofocus';

@Component({
  imports: [Autofocus],
  template: `<input id="first"><input id="second" appAutofocus>`,
})
class Host {}

describe('Autofocus directive', () => {
  it('should put the cursor in the marked field after it is shown', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement?.id).toBe('second');
    fixture.nativeElement.remove();
  });
});
