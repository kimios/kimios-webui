import {AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {AuthenticationSource, DMEntitySecurity, Group, SecurityService, User} from 'app/kimios-client-api';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {AdminService} from 'app/services/admin.service';
import {UserOrGroup} from 'app/main/model/user-or-group';
import {DMEntitySecurityType} from 'app/main/model/dmentity-security-type.enum';

@Component({
  selector: 'users-groups-search-panel',
  templateUrl: './users-groups-search-panel.component.html',
  styleUrls: ['./users-groups-search-panel.component.scss']
})
export class UsersGroupsSearchPanelComponent implements OnInit, AfterViewChecked {

  allUsers$: BehaviorSubject<User[]>;
  allGroups$: BehaviorSubject<Group[]>;
  allSources$: BehaviorSubject<AuthenticationSource[]>;

  @Input()
  cdkDropListConnectedTo_var;
  @Input()
  groupListId;
  @Input()
  userListId;
  @Input()
  currentSecurities: Array<DMEntitySecurity>;

  @ViewChild('tabGroup', {read: ElementRef}) tabGroup: ElementRef;

  constructor(
      private sessionService: SessionService,
      private securityService: SecurityService,
      private adminService: AdminService
  ) {
    this.allUsers$ = new BehaviorSubject<User[]>([]);
    this.allGroups$ = new BehaviorSubject<Group[]>([]);
    this.allSources$ = new BehaviorSubject<AuthenticationSource[]>([]);
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
            source => this.securityService.getUsers(this.sessionService.sessionToken, source.name)
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
        map(
            users => this.allUsers$.next(this.allUsers$.getValue().concat(users))
        )
    ).subscribe();

      source$.pipe(
          concatMap(
              source => this.securityService.getGroups(this.sessionService.sessionToken, source.name)
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
          map(
              groups => this.allGroups$.next(this.allGroups$.getValue().concat(groups))
          )
      ).subscribe();
  }

    dragEnd($event: CdkDragEnd<any>): void {
        $event.source._dragRef.reset();
    }

    handleDblClick(userOrGroup: UserOrGroup): void {
      this.adminService.addUserOrGroupToPermissions$.next(userOrGroup);
    }

    ngAfterViewChecked(): void {
      console.log(this.tabGroup.nativeElement);
      this.tabGroup.nativeElement.childNodes.forEach(node => {
        if (node.classList.contains('mat-tab-body-wrapper')) {
          console.dir(node); node.style['flex-grow'] = 1;
        }
      });
    }
}
