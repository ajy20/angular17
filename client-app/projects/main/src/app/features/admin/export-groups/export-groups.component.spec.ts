import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportGroupsComponent } from './export-groups.component';

describe('ExportGroupsComponent', () => {
  let component: ExportGroupsComponent;
  let fixture: ComponentFixture<ExportGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportGroupsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExportGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
