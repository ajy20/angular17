import { TestBed } from '@angular/core/testing';

import { PlanningMenuService } from './planning-menu.service';

describe('PlanningMenuService', () => {
  let service: PlanningMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
