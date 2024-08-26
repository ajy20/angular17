import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormStaticComponent } from './form-static.component';

describe('FormStaticComponent', () => {
  let component: FormStaticComponent;
  let fixture: ComponentFixture<FormStaticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormStaticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
