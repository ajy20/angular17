import { TestBed } from '@angular/core/testing';

import { DimensionListResolverService } from './dimension-list-resolver.service';

describe('DimensionListResolverService', () => {
  let service: DimensionListResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DimensionListResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
