import {Component, OnInit, ViewChild} from '@angular/core';
import {ITreeOptions} from 'angular-tree-component';
import {AdministrationService, Session, User as KimiosUser} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {filter, map, tap} from 'rxjs/operators';
import {SessionDataSource, SESSIONS_DEFAULT_DISPLAYED_COLUMNS} from './session-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {AdminService} from 'app/services/admin.service';
import {ITreeNode} from 'angular-tree-component/dist/defs/api';

const sortTypeMapping = {
  'lastUse' : 'number'
};

@Component({
  selector: 'admin-special-tasks-sessions',
  templateUrl: './admin-special-tasks-sessions.component.html',
  styleUrls: ['./admin-special-tasks-sessions.component.scss']
})
export class AdminSpecialTasksSessionsComponent implements OnInit {

  options: ITreeOptions = {
    actionMapping: {
      mouse: {
        click: (tree, node, $event) => {
          this.onClick(node);
        }
      }
    }
  };
  nodes: Array<{}>;

  // key is domain (user source), value is array of users from this source
  domainsUsers: Map<string, Array<string>>;
  users: Map<string, KimiosUser>;
  dataSource: SessionDataSource = null;
  sort: DMEntitySort;
  columnsDescription = SESSIONS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns: Array<string>;
  @ViewChild('tree') tree;

  constructor(
      private administrationService: AdministrationService,
      private sessionService: SessionService,
      private adminService: AdminService
  ) {
    this.domainsUsers = new Map<string, Array<string>>();
    this.users = new Map<string, KimiosUser>();
    this.sort = <DMEntitySort> {
      name: 'lastUse',
      direction: 'asc',
      type: 'number'
    };
    this.displayedColumns = this.columnsDescription.map(colDesc => colDesc.id);
    this.displayedColumns.unshift('remove');
  }

  ngOnInit(): void {
    this.administrationService.getConnectedUsers(this.sessionService.sessionToken).pipe(
        map(users => users.forEach(user => {
          if (this.domainsUsers.get(user.source) == null) {
            this.domainsUsers.set(user.source, new Array<string>());
          }
          this.domainsUsers.get(user.source).push(user.uid);
          this.users.set(user.uid, user);
        }))
    ).subscribe(
        null,
        null,
        () => this.nodes = this._initTreeData()
    );

    this.adminService.selectedUser$.pipe(
        tap(user => {
          if (user == null) {
            this.dataSource.data = [];
          }
        }),
        filter(user => user != null)
    ).subscribe(
        user => {
          if (this.dataSource == null) {
            this.dataSource = new SessionDataSource(this.sessionService, this.administrationService);
            this.dataSource.connect().subscribe(
                data => console.dir(data)
            );
          }
          this.dataSource.loadData(user, this.sort, null);
        }
    );
  }

  /*ngAfterViewInit(): void {
  }*/

  private _initTreeData(): Array<{}> {
    const nodes = new Array<{}>();
    this.domainsUsers.forEach((users, domain) => {
      const children = users.map(uid => {
        const user = this.users.get(uid);
        return {
          name: user.lastName + ', ' + user.firstName + ' (' + user.uid + '@' + user.source + ')',
          id: user.uid,
          children: null,
          isLoading: false,
          type: 'user',
          userData: user
        };
      });
      nodes.push({
        name: domain,
        id: domain,
        children: children,
        isLoading: false,
        type: 'domain'
      });
   });

    return nodes;
  }

  sortData($event: Sort): void {
    this.sort.name = $event.active;
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    if (sortTypeMapping[this.sort.name] != null) {
      this.sort.type = sortTypeMapping[this.sort.name];
    }
    this.dataSource.loadData(
        this.adminService.selectedUser$.getValue(),
        this.sort,
        null
    );
  }

  endAllSessions(row: KimiosUser): void {
    this.administrationService.removeEnabledSessions(this.sessionService.sessionToken, row.uid, row.source).subscribe(
        () => this.dataSource.loadData(this.adminService.selectedUser$.getValue(), this.sort, null)
    );
  }

  endSession(row: Session): void {
    this.administrationService.removeEnabledSession(this.sessionService.sessionToken, row.sessionUid).subscribe(
        () => this.dataSource.loadData(this.adminService.selectedUser$.getValue(), this.sort, null)
    );
  }


  private onClick(node: ITreeNode): void {
    if (node.data.type
        && node.data.type === 'user') {
      this.adminService.selectedUser$.next(node.data.userData);
    } else {
      this.tree.treeModel.getNodeById(node.id).toggleExpanded();
      this.adminService.selectedUser$.next(null);
    }
  }

  /*onFocusNode($event): void {
    // $event.node.data
  }*/

  onToggleExpanded($event): void {
    this.tree.treeModel.getNodeById($event.node.id).expand();
  }

  /*selectNode($event): void {
    if ($event.node.data['type'] && $event.node.data['type'] === 'domain') {
      // if domain clicked
      this.onToggleExpanded($event);
    }
  }*/
}
