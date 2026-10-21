import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStations } from './manage-stations';

describe('ManageStations', () => {
  let component: ManageStations;
  let fixture: ComponentFixture<ManageStations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStations],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageStations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
