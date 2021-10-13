import {Component, OnInit, ViewChild} from '@angular/core';
import {DocumentExportService} from 'app/services/document-export.service';
import {filter, tap} from 'rxjs/operators';

@Component({
  selector: 'app-cart-content',
  templateUrl: './cart-content.component.html',
  styleUrls: ['./cart-content.component.scss']
})
export class CartContentComponent implements OnInit {
  nodes = [];
  treeOptions = {};
  @ViewChild('tree') tree;

  constructor(
      private documentExportService: DocumentExportService
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
}
