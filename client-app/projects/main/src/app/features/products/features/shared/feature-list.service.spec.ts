import { TestBed } from '@angular/core/testing';

import { FeatureListService } from './feature-list.service';

describe('FeatureListService', () => {
  let service: FeatureListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
