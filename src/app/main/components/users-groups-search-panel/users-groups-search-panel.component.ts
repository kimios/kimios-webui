import {Component, Input, OnInit} from '@angular/core';
import {SessionService} from '../../../services/session.service';
import {AuthenticationSource, Group, SecurityService, User} from '../../../kimios-client-api';
import {BehaviorSubject, from, pipe, ReplaySubject} from 'rxjs';
import {concatMap, map, mergeMap, tap} from 'rxjs/operators';
import {CdkDragEnd} from '@angular/cdk/drag-drop';

@Component({
  selector: 'users-groups-search-panel',
  templateUrl: './users-groups-search-panel.component.html',
  styleUrls: ['./users-groups-search-panel.component.scss']
})
export class UsersGroupsSearchPanelComponent implements OnInit {

  allUsers$: BehaviorSubject<User[]>;
  allGroups$: BehaviorSubject<Group[]>;
  allSources$: BehaviorSubject<AuthenticationSource[]>;

  @Input()
  cdkDropListConnectedTo_var;
  @Input()
  groupListId;
  @Input()
  userListId;

  constructor(
      private sessionService: SessionService,
      private securityService: SecurityService
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
        map(
            users => this.allUsers$.next(this.allUsers$.getValue().concat(users))
        )
    ).subscribe();

      source$.pipe(
          concatMap(
              source => this.securityService.getGroups(this.sessionService.sessionToken, source.name)
          ),
          map(
              groups => this.allGroups$.next(this.allGroups$.getValue().concat(groups))
          )
      ).subscribe();
  }

    dragEnd($event: CdkDragEnd<any>): void {
        $event.source._dragRef.reset();
    }

}