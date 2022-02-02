import {AfterViewChecked, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {AuthenticationSource, DMEntitySecurity, Group, SecurityService, User} from 'app/kimios-client-api';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {concatMap, filter, map, tap} from 'rxjs/operators';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {AdminService} from 'app/services/admin.service';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {DMEntitySecurityType} from 'app/main/model/dmentity-security-type.enum';
import {EntityCreationService} from 'app/services/entity-creation.service';
import {MatTabGroup, PageEvent} from '@angular/material';
import {UsersCacheService} from 'app/services/users-cache.service';

@Component({
  selector: 'users-groups-search-panel',
  templateUrl: './users-groups-search-panel.component.html',
  styleUrls: ['./users-groups-search-panel.component.scss']
})
export class UsersGroupsSearchPanelComponent implements OnInit, AfterViewChecked, AfterViewInit {

  allUsers: Array<User>;
  allGroups: Array<Group>;
  allSources$: BehaviorSubject<AuthenticationSource[]>;
  filteredUsers$: BehaviorSubject<Array<User>>;
  filteredGroups$: BehaviorSubject<Array<Group>>;
  itemOver: UserOrGroup;

  @Input()
  cdkDropListConnectedTo_var;
  @Input()
  groupListId;
  @Input()
  userListId;
  @Input()
  currentSecurities: Array<DMEntitySecurity>;
  @Input()
  mode: 'containerEntityCreation' | 'other' = 'other';

  @ViewChild('tabGroup', {read: ElementRef}) tabGroup: ElementRef;
  @ViewChild('tabGroup', {read: MatTabGroup}) matTabGroup: MatTabGroup;

  length: number;
  pageSize = 10;
  pageSizeOptions: [5, 10, 20];
  pageIndex = 0;

  constructor(
      private sessionService: SessionService,
      private securityService: SecurityService,
      private adminService: AdminService,
      private entityCreationService: EntityCreationService,
      private usersCacheService: UsersCacheService
  ) {
    this.allUsers = new Array<User>();
    this.allGroups = new Array<Group>();
    this.allSources$ = new BehaviorSubject<AuthenticationSource[]>([]);
    this.filteredUsers$ = new BehaviorSubject<Array<User>>([]);
    this.filteredGroups$ = new BehaviorSubject<Array<Group>>([]);
    this.itemOver = null;
  }

  ngOnInit(): void {
    this.securityService.getAuthenticationSources().subscribe(
        sources => this.allSources$.next(sources)
    );
    const source$ = new ReplaySubject<AuthenticationSource>();
    this.allSources$.subscribe(
        sources => sources.forEach(s => source$.next(s))
    );

    source$.pipe(
        concatMap(
            source => this.usersCacheService.findUsersInCache(source.name)
        ),
        map(users => {
          if (this.currentSecurities) {
            const secIds = this.currentSecurities
                .filter(sec => sec.type === DMEntitySecurityType.USER)
                .map(sec => [sec.name, sec.source].join('@'));
            return users.filter(user => ! secIds.includes([user.uid, user.source].join('@')));
          } else {
            return users;
          }
        }),
        tap(
            users => this.allUsers = this.allUsers.concat(users)
        ),
        tap(users => this.length = this.allUsers.length),
        tap(users => this.filteredUsers$.next(this.makePage(this.allUsers, this.pageSize, this.pageIndex)))
    ).subscribe();

    source$.pipe(
          concatMap(
              source => this.usersCacheService.findGroupsInCache(source.name)
          ),
          map(groups => {
            if (this.currentSecurities) {
              const secIds = this.currentSecurities
                  .filter(sec => sec.type === DMEntitySecurityType.GROUP)
                  .map(sec => [sec.name, sec.source].join('@'));
              return groups.filter(group => ! secIds.includes([group.gid, group.source].join('@')));
            } else {
              return groups;
            }
          }),
          tap(groups => this.allGroups = this.allGroups.concat(groups)),
          // tap(groups => this.length = groups.length),
          tap(
              groups => this.filteredGroups$.next(this.makePage(this.allGroups, this.pageSize, this.pageIndex))
          )
      ).subscribe();

      this.adminService.selectedUsersAndGroups$.pipe(
          filter(userAndGroups => userAndGroups != null),
          tap(userAndGroups => {
            if (this.matTabGroup.selectedIndex === 0) {
              const filteredUsers = this.allUsers
                  .filter(user => userAndGroups
                      .findIndex(
                          element => element.type === 'user'
                              && element.element['uid'] === user.uid
                              && element.element.source === user.source) === -1);
              this.length = filteredUsers.length;
              this.filteredUsers$.next(this.makePage(filteredUsers, this.pageSize, this.pageIndex));
            }
          }),
          tap(userAndGroups => {
            if (this.matTabGroup.selectedIndex === 1) {
              const filteredGroups = this.allGroups
                  .filter(group => userAndGroups
                      .findIndex(
                          element => element.type === 'group'
                              && element.element['gid'] === group.gid
                              && element.element.source === group.source) === -1);
              this.length = filteredGroups.length;
              this.filteredGroups$.next(this.makePage(filteredGroups, this.pageSize, this.pageIndex));
            }
          })
      ).subscribe();
  }

  dragEnd($event: CdkDragEnd<any>): void {
    $event.source._dragRef.reset();
  }

  handleDblClick(userOrGroup: UserOrGroup): void {
    console.log('handleDblClick(): ');
    console.dir(userOrGroup);
    if (this.mode === 'containerEntityCreation') {
      this.entityCreationService.newUserOrGroupTmp$.next(userOrGroup);
    } else {
      this.adminService.addUserOrGroupToPermissions$.next(userOrGroup);
    }
  }

  ngAfterViewChecked(): void {
    this.tabGroup.nativeElement.childNodes.forEach(node => {
      if (node.classList.contains('mat-tab-body-wrapper')) {
        node.style['flex-grow'] = 1;
      }
    });
  }

  handleMouseEnter(item: UserOrGroup): void {
    this.itemOver = item;
  }

  handleMouseLeave(item: UserOrGroup): void {
    this.itemOver = null;
  }

  mousePointerIsOverItem(item: UserOrGroup): boolean {
    return this.itemOver != null
        && this.itemOver.type === item.type
        && (
            (this.itemOver.element['uid'] && item.element['uid'] && this.itemOver.element['uid'] === item.element['uid'])
            || (this.itemOver.element['gid'] && item.element['gid'] && this.itemOver.element['gid'] === item.element['gid'])
        ) && this.itemOver.element.source === item.element.source;

  }

  paginatorHandler($event: PageEvent): void {
    this.pageSize = $event.pageSize;
    this.pageIndex = $event.pageIndex;
    this.adminService.selectedUsersAndGroups$.next([]);
  }

  makePage(elements: Array<User> | Array<Group>, pageSize: number, pageIndex: number): Array<User> | Array<Group> {
    const indexStart = pageSize * (pageIndex - 0);
    const indexEnd = indexStart + pageSize;
    return elements.slice(indexStart, indexEnd);
  }

  ngAfterViewInit(): void {
    this.matTabGroup.selectedIndexChange.pipe(
        tap(() => {
          this.pageIndex = 0;
          this.adminService.selectedUsersAndGroups$.next([]);
        })
    ).subscribe();
  }
}
