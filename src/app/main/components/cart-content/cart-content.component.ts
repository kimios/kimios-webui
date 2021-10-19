import {Component, OnInit, ViewChild} from '@angular/core';
import {DocumentExportService} from 'app/services/document-export.service';
import {filter, tap} from 'rxjs/operators';
import {DMEntity} from 'app/kimios-client-api';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {IconService} from 'app/services/icon.service';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {TreeNode} from 'angular-tree-component';

@Component({
  selector: 'app-cart-content',
  templateUrl: './cart-content.component.html',
  styleUrls: ['./cart-content.component.scss']
})
export class CartContentComponent implements OnInit {
  nodes = [];
  treeOptions = {
    actionMapping: {
      mouse: {
        dblClick: (tree, node, $event) => {
          if (node.data.isFolder === true) {
            DocumentUtils.navigateToFolderOrWorkspace(this.router, node.id);
          } else {
            DocumentUtils.navigateToFile(this.router, node.id);
          }
        }
      }
    }
  };
  @ViewChild('tree') tree;

  constructor(
      private documentExportService: DocumentExportService,
      private iconService: IconService,
      private bes: BrowseEntityService,
      private router: Router
  ) {

  }

  ngOnInit(): void {
    this.nodes = this.documentExportService.nodes;
    this.documentExportService.nodesModified$.pipe(
        filter(node => node === true),
        tap(() => this.nodes = this.documentExportService.nodes)
    ).subscribe();
  }

  onFocus($event: any): void {

  }

  addNodeToTree(node: any): void {
    // console.dir(this.nodes);
    // const nodes = this.nodes;
    this.nodes.push(node);
    // this.nodes = nodes;
    this.tree.treeModel.update();
  }

  retrieveDocumentIcon(element: DMEntity, iconPrefix: string): string {
    return DMEntityUtils.retrieveEntityIconName(this.iconService, element, iconPrefix);
  }

  removeNode(node: TreeNode): void {
    this.removeNodeInNodes(node.id, this.nodes);
    this.tree.treeModel.update();
  }

  removeNodeInNodes(nodeId: number, nodes: Array<any>): boolean {
    const idx = nodes.findIndex(node => node.id === nodeId);
    if (idx !== -1) {
      nodes.splice(idx, 1);
      return true;
    } else {
      let removed = false;
      let i = 0;
      while (i < nodes.length && removed === false) {
        const node = nodes[i];
        if (node.children == null || node.children === undefined || node.children.length === 0) {
          continue;
        }
        if (this.removeNodeInNodes(nodeId, node['children'])) {
          removed = true;
        }
        i++;
      }
      return removed;
    }
  }
}
