import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPayrollComponent } from './setting-payroll.component';

describe('SettingPayrollComponent', () => {
  let component: SettingPayrollComponent;
  let fixture: ComponentFixture<SettingPayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingPayrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
