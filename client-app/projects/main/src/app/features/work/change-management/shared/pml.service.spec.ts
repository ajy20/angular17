import { TestBed } from '@angular/core/testing';

import { PLMService } from './plm.service';

describe('PLMService', () => {
  let service: PLMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PLMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
