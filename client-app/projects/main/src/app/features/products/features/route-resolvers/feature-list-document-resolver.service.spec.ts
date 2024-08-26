import { TestBed } from '@angular/core/testing';

import { FeatureListDocumentResolverService } from './feature-list-document-resolver.service';

describe('FeatureListVersionListResolverService', () => {
  let service: FeatureListDocumentResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureListDocumentResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
