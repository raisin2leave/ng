import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestCard } from './rest-card';

describe('RestCard', () => {
  let component: RestCard;
  let fixture: ComponentFixture<RestCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RestCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
