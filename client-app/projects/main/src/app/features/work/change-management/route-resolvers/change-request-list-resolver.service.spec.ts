import { TestBed } from '@angular/core/testing';

import { ChangeRequestListResolverService } from './change-request-list-resolver.service';

describe('ChangeRequestListResolverService', () => {
  let service: ChangeRequestListResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeRequestListResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
