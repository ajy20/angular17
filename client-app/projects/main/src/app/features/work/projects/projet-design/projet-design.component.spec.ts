import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetDesignComponent } from './projet-design.component';

describe('ProjetDesignComponent', () => {
  let component: ProjetDesignComponent;
  let fixture: ComponentFixture<ProjetDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetDesignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
