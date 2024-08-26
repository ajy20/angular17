import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacklogTableComponent } from './backlog-table.component';

describe('BacklogTableComponent', () => {
  let component: BacklogTableComponent;
  let fixture: ComponentFixture<BacklogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacklogTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BacklogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
