import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {SessionService} from 'app/services/session.service';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DynamicDatabase} from './dynamic-database';
import {DynamicFlatNodeWithUid} from './dynamic-flat-node-with-uid';
import {DynamicDataSourceDMEntity} from './dynamic-data-source-dmentity';
import {BehaviorSubject, from, of, zip} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {concatMap, switchMap} from 'rxjs/operators';

interface EntityNode {
  uid: number;
  label: string;
  children?: EntityNode[];
}

@Component({
  selector: 'browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [DynamicDatabase]
})
export class BrowseComponent implements OnInit, AfterViewInit {

  /*treeControl = new NestedTreeControl<EntityNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<EntityNode>();
*/

  treeControl: FlatTreeControl<DynamicFlatNodeWithUid>;
  dataSource: DynamicDataSourceDMEntity;
  selectedEntity$: BehaviorSubject<DMEntity>;
  loadedEntities$: BehaviorSubject<Array<DynamicFlatNodeWithUid>>;
  nodeUidsToExpand$: BehaviorSubject<Array<DMEntity>>;

  @Input()
  entityId: number;

  @ViewChild('matTree', {read: ElementRef}) matTree: ElementRef;

  constructor(
      private sessionService: SessionService,
      private browseEntityService: BrowseEntityService,
      private route: ActivatedRoute,
      private router: Router,
      database: DynamicDatabase
  ) {
    this.treeControl = new FlatTreeControl<DynamicFlatNodeWithUid>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSourceDMEntity(this.treeControl, database, browseEntityService);

    this.selectedEntity$ = new BehaviorSubject<DMEntity>(undefined);
    this.loadedEntities$ = new BehaviorSubject<Array<DynamicFlatNodeWithUid>>([]);
    this.nodeUidsToExpand$ = new BehaviorSubject<Array<DMEntity>>([]);
  }

  getLevel = (node: DynamicFlatNodeWithUid) => node.level;

  isExpandable = (node: DynamicFlatNodeWithUid) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNodeWithUid) => _nodeData.expandable;

  ngOnInit(): void {
    this.dataSource.setInitialData().subscribe(
        res => {
          const value = this.loadedEntities$.getValue();
          this.loadedEntities$.next(value.concat(res));
        }
    );

    this.browseEntityService.findAllParents(this.entityId)
        .subscribe(
            res => this.nodeUidsToExpand$.next(res)
        );
  }

  ngAfterViewInit(): void {
    this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          this.entityId = Number(params.get('entityId'));
          // this.dataSource.setInitialDataWithOpenFolder(this.entityId != null && this.entityId !== undefined ? this.entityId : null, this.matTree);

          return of();
        })
    ).subscribe();

    zip(this.loadedEntities$, this.nodeUidsToExpand$).pipe(
        concatMap(
            ([loaded, toExpand]) => {
              from(toExpand.reverse()).pipe(
                  concatMap(
                      entity => {
                        loaded.filter(node1 => toExpand.map(e => e.uid).includes(node1.uid))
                            .forEach(node1 => {
                              if (!this.treeControl.isExpanded(node1)) {
                                this.treeControl.expand(node1);
                              }
                            });
                        return of(entity);
                      }
                  )
              );
              return of();
            }
        )
    ).subscribe();
  }

  expandNodes(): void {}

  selectNode(uid: number): void {
    this.selectedEntity$.next(this.dataSource.entities.get(uid));
  }
}
