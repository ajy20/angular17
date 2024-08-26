import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormImagePreviewComponent } from './form-image-preview.component';

describe('FormImagePreviewComponent', () => {
  let component: FormImagePreviewComponent;
  let fixture: ComponentFixture<FormImagePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormImagePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormImagePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
