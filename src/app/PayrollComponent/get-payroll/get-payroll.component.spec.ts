import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetPayrollComponent } from './get-payroll.component';

describe('GetPayrollComponent', () => {
  let component: GetPayrollComponent;
  let fixture: ComponentFixture<GetPayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetPayrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
