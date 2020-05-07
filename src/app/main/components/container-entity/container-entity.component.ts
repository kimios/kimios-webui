import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {DMEntity} from 'app/kimios-client-api';
import {BrowseEntityService} from 'app/services/browse-entity.service';
import {tap} from 'rxjs/operators';
import {DMEntityUtils} from 'app/main/utils/dmentity-utils';

@Component({
  selector: 'container-entity',
  templateUrl: './container-entity.component.html',
  styleUrls: ['./container-entity.component.scss']
})
export class ContainerEntityComponent implements OnInit {

  @Input()
  entityId: number;

  entityData$: Observable<DMEntity>;
  entityType: string;
  constructor(
      private browseEntityService: BrowseEntityService
  ) { }

  ngOnInit(): void {
    this.entityData$ = this.browseEntityService.retrieveContainerEntity(this.entityId).pipe(
        tap(next =>
            this.entityType = DMEntityUtils.dmEntityIsFolder(next) ?
            'folder' :
                DMEntityUtils.dmEntityIsWorkspace(next) ?
                    'workspace' :
                    ''
        )
    );
  }

}
