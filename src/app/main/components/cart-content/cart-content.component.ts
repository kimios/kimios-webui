import {Component, OnInit, ViewChild} from '@angular/core';
import {DocumentExportService} from 'app/services/document-export.service';
import {filter, tap} from 'rxjs/operators';
import {DMEntity} from 'app/kimios-client-api';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';
import {IconService} from 'app/services/icon.service';
import {DocumentUtils} from 'app/main/utils/document-utils';
import {Router} from '@angular/router';

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
          DocumentUtils.navigateToFile(this.router, node.id);
        }
      }
    }
  };
  @ViewChild('tree') tree;

  constructor(
      private documentExportService: DocumentExportService,
      private iconService: IconService,
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
}
