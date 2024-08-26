import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionPageTemplateComponent } from './version-page-template.component';

describe('VersionPageTemplateComponent', () => {
  let component: VersionPageTemplateComponent;
  let fixture: ComponentFixture<VersionPageTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VersionPageTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VersionPageTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
