import { TestBed } from '@angular/core/testing';

import { DocumentDetailService } from './document-detail.service';

describe('DocumentDetailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocumentDetailService = TestBed.get(DocumentDetailService);
    expect(service).toBeTruthy();
  });
});
