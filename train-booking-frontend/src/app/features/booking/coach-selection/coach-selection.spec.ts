import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachSelection } from './coach-selection';

describe('CoachSelection', () => {
  let component: CoachSelection;
  let fixture: ComponentFixture<CoachSelection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachSelection],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachSelection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
