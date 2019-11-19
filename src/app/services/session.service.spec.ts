import {TestBed} from '@angular/core/testing';

import {SessionService} from './session.service';
import {HttpClientModule} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {BASE_PATH} from '../kimios-client-api';
import {APP_CONFIG} from '../app-config/config';

describe('SessionService', () => {
  // let httpClientSpy: { get: jasmine.Spy };
  let service: SessionService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [
        {
          provide: BASE_PATH,
          useValue: APP_CONFIG.KIMIOS_API_BASE_PATH
        },
          SessionService,
        CookieService,
        {
          provide: Router,
          useClass: class { navigate = jasmine.createSpy('navigate'); }
        }
      ]
    }).compileComponents();
    service = TestBed.get(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect', () => {
    let token;
    service.connect('admin', 'kimios', 'kimios2018').subscribe(
        res => token = res,
        error => fail('error  not expected: ' + error),
        () => {
          expect(service.sessionAlive).toBeDefined();
          expect(service.sessionAlive).toBeTruthy();
        }
    );
  });

  it('should disconnect', () => {
    service.disconnect().subscribe(
        res => expect(service.sessionToken).toBe(''),
        null,
        () => expect(service.sessionToken).toBe('')
    );
 //       error => fail('error  not expected: ' + error)

  });
});
