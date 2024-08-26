import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadRegionsComponent } from './upload-regions.component';

describe('UploadRegionsComponent', () => {
  let component: UploadRegionsComponent;
  let fixture: ComponentFixture<UploadRegionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadRegionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadRegionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
