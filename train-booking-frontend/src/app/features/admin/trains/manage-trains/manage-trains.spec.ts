import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTrains } from './manage-trains';

describe('ManageTrains', () => {
  let component: ManageTrains;
  let fixture: ComponentFixture<ManageTrains>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTrains],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageTrains);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
