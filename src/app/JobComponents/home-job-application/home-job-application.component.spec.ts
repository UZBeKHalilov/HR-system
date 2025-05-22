import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeJobApplicationComponent } from './home-job-application.component';

describe('HomeJobApplicationComponent', () => {
  let component: HomeJobApplicationComponent;
  let fixture: ComponentFixture<HomeJobApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeJobApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeJobApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
