import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {BrowseEntityService} from './browse-entity.service';
import {TreeNode} from 'angular-tree-component';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {concatMap, map, tap, toArray} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocumentExportService {

  private _nodes = [];
  treeNodes: Array<TreeNode>;
  cartSize$: BehaviorSubject<number>;

  nodesModified$: BehaviorSubject<boolean>;

  constructor(
      private browseEntityService: BrowseEntityService
  ) {
    this.nodesModified$ = new BehaviorSubject<boolean>(false);
    this.cartSize$ = new BehaviorSubject<number>(0);
  }

  addToCart(entity: DMEntity): void {
    this.makeNodeFromDMEntity(entity).pipe(
        tap(node => this._nodes.push(node)),
        tap(() => this.nodesModified$.next(true))
    ).subscribe();
  }

  private makeNodeFromDMEntity(entity: DMEntity): Observable<any> {
    if (DMEntityUtils.dmEntityIsDocument(entity)) {
      return of({
        name: entity.name,
        id: entity.uid,
        children: [],
        isFolder: false,
      });
    } else {
      return this.makeNodeFromFolder(entity);
    }
  }


  get nodes(): any[] {
    return this._nodes;
  }

  private makeNodeFromFolder(entity: DMEntity): Observable<any> {
    const node = {
      name: entity.name,
      id: entity.uid,
      children: [],
      isFolder: true,
    };
    return this.browseEntityService.findEntitiesAtPath(entity).pipe(
        concatMap(children => children),
        concatMap(child => this.makeNodeFromDMEntity(child)),
        tap(nodeChild => node.children.push(nodeChild)),
        toArray(),
        map(() => node)
    );
  }
}
