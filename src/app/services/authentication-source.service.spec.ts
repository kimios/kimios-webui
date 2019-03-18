import { TestBed } from '@angular/core/testing';

import { AuthenticationSourceService } from './authentication-source.service';

describe('AuthenticationSourceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthenticationSourceService = TestBed.get(AuthenticationSourceService);
    expect(service).toBeTruthy();
  });
});
