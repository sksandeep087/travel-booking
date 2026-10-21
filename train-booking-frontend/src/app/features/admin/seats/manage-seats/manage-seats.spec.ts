import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSeats } from './manage-seats';

describe('ManageSeats', () => {
  let component: ManageSeats;
  let fixture: ComponentFixture<ManageSeats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSeats],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageSeats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
