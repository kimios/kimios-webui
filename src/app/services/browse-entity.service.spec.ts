import {TestBed} from '@angular/core/testing';

import {BrowseEntityService} from './browse-entity.service';
import {BASE_PATH, DMEntity, DocumentService, FolderService, WorkspaceService} from '../kimios-client-api';
import {SessionService} from './session.service';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {APP_CONFIG} from 'app/app-config/config';
import {concatMap, filter, tap} from 'rxjs/operators';
import {combineLatest, from, Observable, of, Subject} from 'rxjs';

function createFolder(folderService: FolderService, sessionService: SessionService, dirName: string, parentId: number): Observable<number> {
    return folderService.createFolder(sessionService.sessionToken, dirName, parentId, true);
}

describe('BrowseEntityService', () => {
  let service: BrowseEntityService;
  let sessionService: SessionService;
    const entitiesId = new Array<number>();

    const dirsTest = [
        {
            'dir1' : [
                {
                    'dir1.1' : ['dir1.1.1', 'dir1.1.2', 'dir1.1.3']
                },
                {
                    'dir1.2' : ['dir1.2.1', 'dir1.2.2', 'dir1.2.3']
                },
                {
                    'dir1.3' : ['dir1.3.1', 'dir1.3.2', 'dir1.3.3']
                }
            ]
        },
        {
            'dir2' : [
                {
                    'dir2.1' : ['dir2.1.1', 'dir2.1.2', 'dir2.1.3']
                },
                {
                    'dir2.2' : ['dir2.2.1', 'dir2.2.2', 'dir2.2.3']
                },
                {
                    'dir2.3' : ['dir2.3.1', 'dir2.3.2', 'dir2.3.3']
                }
            ]
        },
        {
            'dir3' : [
                {
                    'dir3.1' : ['dir3.1.1', 'dir3.1.2', 'dir3.1.3']
                },
                {
                    'dir3.2' : ['dir3.2.1', 'dir3.2.2', 'dir3.2.3']
                },
                {
                    'dir3.3' : ['dir3.3.1', 'dir3.3.2', 'dir3.3.3']
                }
            ]
        }
    ];

    const sessionToken$ = new Subject<string>();

    beforeAll(() => {
        console.log('beforeAll');
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

        const ws: WorkspaceService = TestBed.get(WorkspaceService);
        const fs: FolderService = TestBed.get(FolderService);
        const ds: DocumentService = TestBed.get(DocumentService);

        ws.createWorkspace(sessionService.sessionToken, 'workspace_karma_test').pipe(
            tap(
                folderId => entitiesId.push(folderId)
            ),
            concatMap(
                workspaceId => from(Object.keys(dirsTest)).pipe(
                    concatMap(
                        folderName1 => combineLatest(of(folderName1), createFolder(fs, sessionService, folderName1, workspaceId))
                    ),
                    tap(
                        ([folderName, folderId]) => entitiesId.push(folderId)
                    ),
                    concatMap(
                        ([folderName1, folderId1]) => from(Object.keys(dirsTest[folderName1])).pipe(
                            concatMap(
                                folderName2 => combineLatest(of(folderName2), createFolder(fs, sessionService, folderName2, folderId1))

                            ),
                            tap(
                                ([folderName, folderId]) => entitiesId.push(folderId)
                            ),
                            concatMap(
                                ([folderName2, folderId2]) => from(Object.keys(dirsTest[folderName1][folderName2])).pipe(
                                    concatMap(
                                        folderName3 => createFolder(fs, sessionService, folderName3, folderId2)
                                    ),
                                    tap(
                                        folderId => entitiesId.push(folderId)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    });

    afterAll(() => {
        console.log('afterAll');

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

        const ws: WorkspaceService = TestBed.get(WorkspaceService);
        const fs: FolderService = TestBed.get(FolderService);
        const ds: DocumentService = TestBed.get(DocumentService);

        const wId: number = entitiesId.shift();

        from(entitiesId.reverse()).pipe(
            concatMap(
                entityId => fs.deleteFolder(sessionService.sessionToken, entityId)
            )
        ).pipe(
            concatMap(
                res => ws.deleteWorkspace(sessionService.sessionToken, wId)
            )
        );
    });

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
                      sessionToken$.next(sessionService.sessionToken);
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
        sessionToken$.pipe(
            tap(
                res => console.log('sessionToken$: ' + res)
            ),
            filter(
                res => res !== undefined && res !== ''
            ),
            concatMap(res =>
                service.retrieveContainerEntity(600)
            )
        ).subscribe(
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
    service.findAllParentsRec(600).subscribe(
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
        service.findAllParentsRec(600, true).subscribe(
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

    it('entity should have parents (array result)', (done: DoneFn) => {
        service.findAllParents(600, ).subscribe(
            parents => {
                expect(parents.map(elem => elem.uid)).toEqual([599, 35, 34]);
                done();
            }
        );
    });
});
