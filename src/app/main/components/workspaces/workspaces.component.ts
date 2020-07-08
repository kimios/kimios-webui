import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {BrowseEntityService} from 'app/services/browse-entity.service';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit {

  constructor(
      private browseEntityService: BrowseEntityService,
      private location: Location
  ) { }

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
  }

}
