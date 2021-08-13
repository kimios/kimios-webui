import {Component, OnInit} from '@angular/core';
import {DocumentType, DocumentVersionService, Meta, StudioService} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MetaDataSource, METAS_DEFAULT_DISPLAYED_COLUMNS} from './meta-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {MetaDataTypeMapping} from 'app/main/model/meta-data-type.enum';
import {combineLatest, of} from 'rxjs';

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
  metaDataPossibleTypes: Map<number, string>;
  metaDataPossibleTypesKey: Array<number>;
  metaDataTypesValue = {};
  
  constructor(
      private documentVersionService: DocumentVersionService,
      private adminService: AdminService,
      private studioService: StudioService,
      private sessionService: SessionService,
      private fb: FormBuilder
  ) {
    this.metaDataSource = new MetaDataSource(this.sessionService, this.documentVersionService);
    this.formGroup = this.fb.group({});
    this.metaDataPossibleTypes = new Map<number, string>();
    Object.keys(MetaDataTypeMapping).forEach(key => {
      this.metaDataPossibleTypes.set(Number(key), MetaDataTypeMapping[key]);
    });
    this.metaDataPossibleTypesKey = Array.from(this.metaDataPossibleTypes.keys());
  }

  ngOnInit(): void {
    this.adminService.selectedDocumentType$.pipe(
        filter(docTypeUid => docTypeUid !== 0),
        concatMap(docTypeUid => combineLatest(
            of(docTypeUid),
            this.studioService.getDocumentType(this.sessionService.sessionToken, docTypeUid)
        )),
        concatMap(([docTypeUid, docType]) => combineLatest(
            of(docType),
            this.documentVersionService.getUnheritedMetas(this.sessionService.sessionToken, docTypeUid)
        )),
        tap(([docType, metas]) => {
          metas.forEach(meta => this.metaDataTypesValue[meta.uid] = MetaDataTypeMapping[meta.metaType]);
          this.formGroup = this.initDocumentTypeFormGroup(docType, metas);
          this.metaDataSource.setData(metas);
          this.documentType = docType;
        })
    ).subscribe();

    this.adminService.newDocumentType$.pipe(
        filter(val => val === true),
        tap(() => this.formGroup = this.initDocumentTypeFormGroup(null, []))
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

  private initDocumentTypeFormGroup(docType: DocumentType, metas: Array<Meta>): FormGroup {
    const formGroup = this.fb.group({});
    formGroup.addControl('documentTypeName', this.fb.control(docType != null ? docType.name : ''));
    formGroup.addControl('documentTypeMetas', this.fb.group({}));
    metas.forEach(meta =>
        (formGroup.get('documentTypeMetas') as FormGroup)
            .addControl(
                meta.uid.toString(),
                this.fb.group({
                  'metaDataName': this.fb.control(meta.name),
                  'metaDataType': this.fb.control(meta.metaType),
                  'metaDataMandatory': this.fb.control(meta.mandatory)
                })
            )
    );
    return formGroup;
  }
}
