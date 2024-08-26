import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCheckboxListComponent } from './form-checkbox-list.component';

describe('FormCheckboxListComponent', () => {
  let component: FormCheckboxListComponent;
  let fixture: ComponentFixture<FormCheckboxListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormCheckboxListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCheckboxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
