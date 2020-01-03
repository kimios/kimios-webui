import { Component, OnInit } from '@angular/core';
import {PageEvent} from '@angular/material';

@Component({
  selector: 'kimios-nav-bar',
  templateUrl: './kimios-nav-bar.component.html',
  styleUrls: ['./kimios-nav-bar.component.scss']
})
export class KimiosNavBarComponent implements OnInit {

  pageSize: number;
  pageIndex: number;
  pageSizeOptions = [5, 10, 20];

  length: number;

  explorerMode: 'browse' | 'search';

  constructor() {
  }

  ngOnInit(): void {
  }

  paginatorHandler($event: PageEvent): void {
    /*this.searchEntityService.changePage($event.pageIndex, $event.pageSize).subscribe(
        null,
        null,
        () => {
          this.pageIndex = $event.pageIndex;
          this.pageSize = $event.pageSize;
        }
    );*/
  }
}
