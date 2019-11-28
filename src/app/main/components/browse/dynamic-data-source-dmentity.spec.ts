import {DynamicDataSourceDMEntity} from './dynamic-data-source-dmentity';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import {BASE_PATH, DocumentService, FolderService, WorkspaceService} from '../../../kimios-client-api';
import {APP_CONFIG} from '../../../app-config/config';
import {BrowseEntityService} from '../../../services/browse-entity.service';
import {CookieService} from 'ngx-cookie-service';
import {SessionService} from '../../../services/session.service';
import {Observable, Subject} from 'rxjs';
import {BrowseComponent} from './browse.component';
import {FileManagerModule} from '../../file-manager/file-manager.module';
import {RouterTestingModule} from '@angular/router/testing';
import {FuseConfigService} from '../../../../@fuse/services/config.service';
import {MockFuseConfigService} from '../../../tests/mock/mock-fuse-config-service';

function createFolder(folderService: FolderService, sessionService: SessionService, dirName: string, parentId: number): Observable<number> {
  return folderService.createFolder(sessionService.sessionToken, dirName, parentId, true);
}

describe('DynamicDataSourceDMEntity', () => {
  let fixture: ComponentFixture<BrowseComponent>;
  let sessionService: SessionService;
  let dataSource: DynamicDataSourceDMEntity;

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

  /*beforeAll(() => {
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
  });*/

  /*afterAll(() => {
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
  });*/

  beforeEach(() => {
    console.log('beforeEach');
    TestBed.overrideProvider(FuseConfigService, {useValue: new MockFuseConfigService()});
    TestBed.configureTestingModule({
      imports: [
        FileManagerModule,
        RouterTestingModule.withRoutes([]),
        HttpClientModule
      ],
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
        /*{
          provide: Router,
          useClass: class {
            navigate = jasmine.createSpy('navigate');
          }
        },*/
        SessionService,
        {
          provide: 'fuseCustomConfig',
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseComponent);
    dataSource = fixture.componentInstance.dataSource;

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

  it('should have been created when component have been created', () => {
    expect(dataSource).toBeTruthy();
    expect(dataSource).toBeDefined();
  });
});
