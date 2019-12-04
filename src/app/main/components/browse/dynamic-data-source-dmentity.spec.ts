import {DynamicDataSourceDMEntity} from './dynamic-data-source-dmentity';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import {BASE_PATH, DocumentService, FolderService, WorkspaceService} from '../../../kimios-client-api';
import {APP_CONFIG} from '../../../app-config/config';
import {BrowseEntityService} from '../../../services/browse-entity.service';
import {CookieService} from 'ngx-cookie-service';
import {SessionService} from '../../../services/session.service';
import {BehaviorSubject, combineLatest, from, Observable, of, Subject} from 'rxjs';
import {BrowseComponent} from './browse.component';
import {FileManagerModule} from '../../file-manager/file-manager.module';
import {RouterTestingModule} from '@angular/router/testing';
import {FuseConfigService} from '../../../../@fuse/services/config.service';
import {MockFuseConfigService} from '../../../tests/mock/mock-fuse-config-service';
import {catchError, concatMap, filter, switchMap, takeWhile, tap, toArray} from 'rxjs/operators';

function createFolder(folderService: FolderService, sessionService: SessionService, dirName: string, parentId: number): Observable<number> {
  return folderService.createFolder(sessionService.sessionToken, dirName, parentId, true);
}

function getChildrenRec(dir: string, dirsTestElement: any, mapParam: Map<string, string>): void {
    if (dirsTestElement !== null) {
        let elements = new Array<string>();
        if (Array.isArray(dirsTestElement)) {
            elements = dirsTestElement;
        } else {
            if (typeof dirsTestElement === 'object' && dirsTestElement !== null) {
                elements = Object.keys(dirsTestElement);
            }
        }
        elements.forEach(elem => {
            mapParam.set(elem, dir);
            if (dirsTestElement[elem] !== null) {
                getChildrenRec(elem, dirsTestElement[elem], mapParam);
            }
        });
    }
}

describe('DynamicDataSourceDMEntity', () => {
  let fixture: ComponentFixture<BrowseComponent>;
  let sessionService: SessionService;
    let ws: WorkspaceService;
    let fs: FolderService;
    let ds: DocumentService;
    
  let dataSource: DynamicDataSourceDMEntity;
  let wId: number;

  const entitiesId = new Array<number>();

  const dirsTest = {
    'dir1': {
        'dir1.1': ['dir1.1.1', 'dir1.1.2', 'dir1.1.3'],
        'dir1.2': ['dir1.2.1', 'dir1.2.2', 'dir1.2.3'],
        'dir1.3': ['dir1.3.1', 'dir1.3.2', 'dir1.3.3']
      },
    'dir2': {
        'dir2.1': ['dir2.1.1', 'dir2.1.2', 'dir2.1.3'],
        'dir2.2': ['dir2.2.1', 'dir2.2.2', 'dir2.2.3'],
        'dir2.3': ['dir2.3.1', 'dir2.3.2', 'dir2.3.3']
    },
    'dir3': {
        'dir3.1': ['dir3.1.1', 'dir3.1.2', 'dir3.1.3'],
        'dir3.2': ['dir3.2.1', 'dir3.2.2', 'dir3.2.3'],
        'dir3.3': ['dir3.3.1', 'dir3.3.2', 'dir3.3.3']
    }
  };

  const initDone$ = new BehaviorSubject<string>('');
  const allTestsDone$ = new BehaviorSubject<string>('');

  const TEST1 = 'test1';
  const testList = [TEST1];

  const markTestDone = function (testName: string): void {
      const indexTestName = testList.indexOf(testName);
      if (indexTestName !== -1) {
          testList.splice(indexTestName, 1);
      }
      if (testList.length === 0) {
          allTestsDone$.next('yes');
      }
  };

  const before = function(resolve): void {
      console.log('beforeAll');
      TestBed.overrideProvider(FuseConfigService, {useValue: new MockFuseConfigService()});
      TestBed.configureTestingModule({
          imports: [
              HttpClientModule,
              FileManagerModule,
              RouterTestingModule.withRoutes([])
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
      ws = TestBed.get(WorkspaceService);
      fs = TestBed.get(FolderService);
      ds = TestBed.get(DocumentService);

      const workspaceName = 'workspace_' + (new Date().valueOf());

      const parents = new Map<string, string>();
      Object.keys(dirsTest).forEach(dir => {
          parents.set(dir, workspaceName);
          getChildrenRec(dir, dirsTest[dir], parents);
      });
      const dirsTestTmp = Array.from(parents.keys());

      const entitiesIdMap = new Map<string, number>();

      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

      sessionService.connect('admin', 'kimios', 'kimios2018').pipe(
          concatMap(
              res => ws.createWorkspace(sessionService.sessionToken, workspaceName)
          ),
          concatMap(
              workspaceId => {
                  entitiesId.push(workspaceId);
                  wId = workspaceId;
                  entitiesIdMap.set(workspaceName, workspaceId);
                  return of(workspaceId);
              }
          ),
          concatMap(
              workspaceId => from(Array.from(parents.keys())).pipe(
                  concatMap(
                      folderName => combineLatest(of(folderName), createFolder(fs, sessionService, folderName, entitiesIdMap.get(parents.get(folderName))))
                  ),
                  tap(([folderN, folderId]) => {
                      entitiesIdMap.set(folderN, folderId);
                      const folderIndex = dirsTestTmp.indexOf(folderN);
                      dirsTestTmp.splice(folderIndex, 1);
                  })
              )
          ),
          takeWhile(
              res => dirsTestTmp.length > 0
          ),
          toArray(),
      ).subscribe(
          res => {
              console.log('entities created ');
              console.dir(res);
          },
          error => {
              console.log('error while create entity : ');
              console.log(error);
          },
          () => {
              console.log('entities all created');

              initDone$.next('go');
              resolve();
          }
      );

  };

  beforeAll( () => {
      new Promise(before).then(() => {
          console.log('done beforeAll');
      });
  });

 it('should have been created when component have been created', function(done): void {
      // jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000000;
    initDone$.pipe(
        filter(res => res !== '')
    ).subscribe(
        res => {
            console.log('test now');
            expect(dataSource).toBeTruthy();
            expect(dataSource).toBeDefined();
            markTestDone(TEST1);
            console.log('test finished');
            done();
        }
    );
  });


  afterAll((doneAfterAll) => {

      ws.deleteWorkspace(sessionService.sessionToken, wId)
      //        )
      //    )
          .pipe(
              switchMap(
                  res => of(res).catch(error => of(error))
              ),
              tap(
                  res => console.log('removed workspace')
              ),
              catchError(error => {
                  console.log('error while deleting ' + wId + ' ' + error);
                  return of('uh');
              }),
              concatMap(
                  res => {
                      console.log('disconnection now');
                      return sessionService.disconnect();
                  }
              )
          ).subscribe(
          null,
          null,
          () => {
              console.log('removed workspace and disconnected');
              doneAfterAll();
          }
      );
  });

});
