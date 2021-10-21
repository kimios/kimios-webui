import {AfterViewChecked, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DocumentExportService} from 'app/services/document-export.service';
import {filter, tap} from 'rxjs/operators';
import {DMEntity} from 'app/kimios-client-api';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {IconService} from 'app/services/icon.service';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {TreeNode} from 'angular-tree-component';
import {DMEntityTree} from 'app/kimios-client-api/model/dMEntityTree';
import {DMEntityTreeNode} from 'app/kimios-client-api/model/dMEntityTreeNode';
import {ZipRestOnlyService} from 'app/kimios-client-api/api/zipRestOnly.service';
import {DMEntityTreeParam} from 'app/kimios-client-api/model/dMEntityTreeParam';
import {SessionService} from 'app/services/session.service';
import {APP_CONFIG} from 'app/app-config/config';

@Component({
  selector: 'app-cart-content',
  templateUrl: './cart-content.component.html',
  styleUrls: ['./cart-content.component.scss']
})
export class CartContentComponent implements OnInit, AfterViewChecked {
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
  @ViewChild('cartContainerWrapper') cartContainerWrapper: ElementRef;

  constructor(
      private documentExportService: DocumentExportService,
      private iconService: IconService,
      private bes: BrowseEntityService,
      private router: Router,
      private zipService: ZipRestOnlyService,
      private sessionService: SessionService
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

  doZip(): void {
    const dmEntityTree = this.makeDmEntityTreeFromTreeNodes(this.nodes);
    this.zipService.make(
        <DMEntityTreeParam> {
          sessionId: this.sessionService.sessionToken,
          dmEntityTree: dmEntityTree
        }
    ).subscribe(
        res => {
          const link = document.createElement('a');
          link.href = APP_CONFIG.KIMIOS_API_BASE_PATH
              + '/filetransfer/downloadFile?sessionId='
              + this.sessionService.sessionToken
              + '&transactionId='
              + res;
          window.open(link.href);
        }
    );
  }

  emptyCart(): void {

  }

  makeDmEntityTreeFromTreeNodes(nodes: Array<any>): DMEntityTree {
    const dmEntityTree = <DMEntityTree>{
      treeNodeList: nodes.map(node => this.makeDmEntityTreeNodeFromTreeNode(node))
    };

    return dmEntityTree;
  }

  makeDmEntityTreeNodeFromTreeNode(node: any): DMEntityTreeNode {
    const dmEntityTreeNode = <DMEntityTreeNode> {
      dmEntityUid: node.id,
      children: new Array<DMEntityTreeNode>()
    };
    if (node.children != null && node.children.length > 0) {
      node.children.forEach(child => dmEntityTreeNode.children.push(this.makeDmEntityTreeNodeFromTreeNode(child)));
    }

    return dmEntityTreeNode;
  }

  ngAfterViewChecked(): void {
    const windowTotalScreen = window.innerHeight;
    const cartContainerWrapperOffSetTop = this.cartContainerWrapper.nativeElement.getBoundingClientRect().top;
    const height = windowTotalScreen - cartContainerWrapperOffSetTop;
    this.cartContainerWrapper.nativeElement.style.height = height + 'px';
    this.cartContainerWrapper.nativeElement.style.minHeight = height + 'px';
    this.cartContainerWrapper.nativeElement.style.maxHeight = height + 'px';
  }

}
