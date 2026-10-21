import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCoaches } from './manage-coaches';

describe('ManageCoaches', () => {
  let component: ManageCoaches;
  let fixture: ComponentFixture<ManageCoaches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCoaches],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageCoaches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
