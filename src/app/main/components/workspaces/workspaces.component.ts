import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { Location } from '@angular/common';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {PageEvent} from '@angular/material';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit, AfterViewInit {

  @ViewChild('contentColumn') contentColumn: ElementRef;
  @ViewChild('browsePathRow') browsePathRow: ElementRef;
  @ViewChild('treeAndGridRow') treeAndGridRow: ElementRef;

  // paginator
  length: number;
  pageSize: number;
  pageSizeOptions: number[] = [10, 20, 50];
  pageIndex: number;

  constructor(
      private browseEntityService: BrowseEntityService,
      private location: Location
  ) {
    console.log('in workspace constructor');
  }

  ngOnInit(): void {
    this.browseEntityService.selectedEntity$.subscribe(
        entity => {
          if (entity !== undefined) {
            const path = this.location.path();
            console.log('current location path: ' + path);
            const newPath = path.replace(new RegExp('(?:\/workspaces.*)?$'), '/workspaces/' + entity.uid);
            console.log('new location path: ' + newPath);
            this.location.replaceState(newPath);
          }
        }
    );

    this.browseEntityService.totalEntitiesToDisplay$.subscribe(
        next => this.length = next.length
    );
  }

  ngAfterViewInit(): void {
    console.log(this.treeAndGridRow.nativeElement.style.height + ' = ' + this.contentColumn.nativeElement.offsetHeight + ' - ' + this.browsePathRow.nativeElement.offsetHeight);
    this.treeAndGridRow.nativeElement.style.height = this.contentColumn.nativeElement.offsetHeight - this.browsePathRow.nativeElement.offsetHeight + 'px';
    console.log(this.treeAndGridRow.nativeElement.style.height + ' = ' + this.contentColumn.nativeElement.offsetHeight + ' - ' + this.browsePathRow.nativeElement.offsetHeight);
   }

  paginatorHandler($event: PageEvent): void {
    this.browseEntityService.makePage($event.pageIndex, $event.pageSize);
  }
}
