import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormStaticAreaComponent } from './form-static-area.component';

describe('FormStaticAreaComponent', () => {
  let component: FormStaticAreaComponent;
  let fixture: ComponentFixture<FormStaticAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormStaticAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormStaticAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
