import {TestBed} from '@angular/core/testing';

import {BrowseEntityService} from './browse-entity.service';
import {BASE_PATH, DMEntity, DocumentService, FolderService, WorkspaceService} from '../kimios-client-api';
import {SessionService} from './session.service';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {APP_CONFIG} from 'app/app-config/config';

describe('BrowseEntityService', () => {
  let service: BrowseEntityService;
  let sessionService: SessionService;

    beforeEach(() => {
        console.log('beforeEach');
      TestBed.configureTestingModule({
          imports: [HttpClientModule],
          providers: [
              {
                  provide: BASE_PATH,
                  useValue: APP_CONFIG.KIMIOS_API_BASE_PATH
              },
              BrowseEntityService,
              DocumentService,
              WorkspaceService,
              FolderService,
              CookieService,
              {
                  provide: Router,
                  useClass: class {
                      navigate = jasmine.createSpy('navigate');
                  }
              },
              SessionService
          ]
      }).compileComponents();

          service = TestBed.get(BrowseEntityService);

          sessionService = TestBed.get(SessionService);
        console.log('sessionService: ' + sessionService);
        if (!sessionService.sessionAlive) {
              sessionService.connect('admin', 'kimios', 'kimios2018').subscribe(
                  null,
                  error => console.log('connect failed'),
                  () => {
                      console.log('sessionToken: ' + sessionService.sessionToken);
                      console.log('sessionAlive: ' + sessionService.sessionAlive);
                  });
          }
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
  });

  afterEach(() => {
      console.log('afterEach');
      sessionService = TestBed.get(SessionService);
      if (sessionService.sessionAlive) {
          sessionService.disconnect();
      }
      console.log('sessionToken: ' + sessionService.sessionToken);
  });

    it('should be created', () => {
        expect(service).toBeDefined();
    });

    it('entity should exists', (done: DoneFn) => {

        service.retrieveContainerEntity(600).subscribe(
            res => {
                console.log('res: ');
                console.log(res);
                expect(res).toBeDefined();
                expect(res.uid).toBe(600);
                done();
            },
            error => {
                fail('error');
                console.log('error: ' + error);
                done();
            },
            () => console.log('done')
        );
    });


    it('folder should exists', (done: DoneFn) => {
        let entity: DMEntity;
        service.retrieveFolderEntity(600).subscribe(
            res => entity = res,
            error => {
                console.log('error during retrieveFolderEntity() ' + error);
                done();
            },
            () => {
                console.log('complete retrieveFolderEntity()');
                expect(entity).toBeDefined();
                expect(entity.uid).toBe(600);
                done();
            }
        );
    });

  it('entity should have parents', (done: DoneFn) => {
    const parents = new Array<DMEntity>();
    service.findAllParents(600).subscribe(
        res => {
            parents.push(res);
            console.log('parents.length: ' + parents.length);
            console.log('found parent: ');
            console.log(res);
        },
        error => fail('error during findAllParents() ' + error),
        () => {
            console.log('parents fetched');
            expect(parents.map(elem => elem.uid)).toEqual([599, 35, 34]);
            done();
        }
    );
  });

    it('entity should have parents and be included in results', (done: DoneFn) => {
        const parents = new Array<DMEntity>();
        service.findAllParents(600, true).subscribe(
            res => {
                parents.push(res);
                console.log('parents.length: ' + parents.length);
                console.log('found parent: ');
                console.log(res);
            },
            error => fail('error during findAllParents() ' + error),
            () => {
                expect(parents.length).toBeGreaterThan(0);
                expect(parents.length).toBe(4);
                expect(parents.map(entity => entity.uid)).toEqual([600, 599, 35, 34]);
                done();
            }
        );
    });
});
