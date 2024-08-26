import { TestBed } from '@angular/core/testing';

import { WorkItemListResolverService } from './work-item-list-resolver.service';

describe('WorkItemListResolverService', () => {
  let service: WorkItemListResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkItemListResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
