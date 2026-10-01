import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestList } from './rest-list';

describe('RestList', () => {
  let component: RestList;
  let fixture: ComponentFixture<RestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestList],
    }).compileComponents();

    fixture = TestBed.createComponent(RestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
