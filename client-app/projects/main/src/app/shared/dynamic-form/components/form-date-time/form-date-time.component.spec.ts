import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDateTimeComponent } from './form-date-time.component';

describe('FormDateTimeComponent', () => {
  let component: FormDateTimeComponent;
  let fixture: ComponentFixture<FormDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDateTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
