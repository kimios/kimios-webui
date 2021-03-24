import {Component, OnInit} from '@angular/core';
import {DocumentType, DocumentVersionService, StudioService} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MetaDataSource, METAS_DEFAULT_DISPLAYED_COLUMNS} from './meta-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';

@Component({
  selector: 'studio-document-type-admin',
  templateUrl: './studio-document-type-admin.component.html',
  styleUrls: ['./studio-document-type-admin.component.scss']
})
export class StudioDocumentTypeAdminComponent implements OnInit {

  documentType: DocumentType;
  formGroup: FormGroup;
  metaDataSource: MetaDataSource;
  columnsDescription = METAS_DEFAULT_DISPLAYED_COLUMNS;
  displayedColumns = [ 'name', 'type', 'mandatory' ];
  sort = <DMEntitySort> {
    name: 'name',
    direction: 'asc',
    type: 'string'
  };
  
  constructor(
      private documentVersionService: DocumentVersionService,
      private adminService: AdminService,
      private studioService: StudioService,
      private sessionService: SessionService,
      private fb: FormBuilder
  ) {
    this.metaDataSource = new MetaDataSource(this.sessionService, this.documentVersionService);
    this.formGroup = this.fb.group({
      'documentTypeName': this.fb.control('')
    });
  }

  ngOnInit(): void {
    this.adminService.selectedDocumentType$.pipe(
        filter(docTypeUid => docTypeUid !== 0),
        tap(docTypeUid => this.metaDataSource.loadData(docTypeUid)),
        concatMap(docTypeUid => this.studioService.getDocumentType(this.sessionService.sessionToken, docTypeUid)),
        tap(docType => {
          this.formGroup.get('documentTypeName').setValue(docType.name);
          this.documentType = docType;
        })
    ).subscribe();
  }

  removeFromData(row: any): void {

  }

  sortData($event: Sort): void {
    this.sort.name = $event.active !== 'type' ? $event.active : 'metaType';
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    this.metaDataSource.sortData1(this.sort);
  }
}
