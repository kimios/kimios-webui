import {Component, OnInit} from '@angular/core';
import {DocumentType, DocumentVersionService, Meta, StudioService} from 'app/kimios-client-api';
import {AdminService} from 'app/services/admin.service';
import {concatMap, filter, startWith, tap} from 'rxjs/operators';
import {SessionService} from 'app/services/session.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MetaDataSource, METAS_DEFAULT_DISPLAYED_COLUMNS} from './meta-data-source';
import {DMEntitySort} from 'app/main/model/dmentity-sort';
import {Sort} from '@angular/material';
import {MetaDataTypeMapping} from 'app/main/model/meta-data-type.enum';
import {combineLatest, iif, Observable, of} from 'rxjs';

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
  displayedColumns = [ 'remove', 'name', 'type', 'mandatory' ];
  sort = <DMEntitySort> {
    name: 'name',
    direction: 'asc',
    type: 'string'
  };
  metaDataPossibleTypes: Map<number, string>;
  metaDataPossibleTypesKey: Array<number>;
  metaDataTypesValue = {};
  filteredDocumentTypes$: Observable<Array<DocumentType>>;
  allDocumentTypes: Array<DocumentType>;
  documentTypesLoaded: boolean;
  
  constructor(
      private documentVersionService: DocumentVersionService,
      private adminService: AdminService,
      private studioService: StudioService,
      private sessionService: SessionService,
      private fb: FormBuilder
  ) {
    this.metaDataSource = new MetaDataSource(this.sessionService, this.documentVersionService);
    this.formGroup = this.fb.group({
      'documentTypeName': this.fb.control(''),
      'inheritedDocumentType': this.fb.control(null),
      'filterControl_inheritedDocumentType': this.fb.control(''),
      'documentTypeMetas': this.fb.group({})
    });
    this.metaDataPossibleTypes = new Map<number, string>();
    Object.keys(MetaDataTypeMapping).forEach(key => {
      this.metaDataPossibleTypes.set(Number(key), MetaDataTypeMapping[key]);
    });
    this.metaDataPossibleTypesKey = Array.from(this.metaDataPossibleTypes.keys());
    this.filteredDocumentTypes$ = new Observable<Array<DocumentType>>(null);
    this.documentTypesLoaded = false;
    this.allDocumentTypes = new Array<DocumentType>();
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
            this.documentVersionService.getUnheritedMetas(this.sessionService.sessionToken, docTypeUid),
            docType.documentTypeUid != null ?
                this.studioService.getDocumentType(this.sessionService.sessionToken, docType.documentTypeUid) :
                null
        )),
        tap(([docType, metas, inheritedDocType]) => {
          metas.forEach(meta => this.metaDataTypesValue[meta.uid] = MetaDataTypeMapping[meta.metaType]);
          this.formGroup = this.initDocumentTypeFormGroup(docType, metas, inheritedDocType);
          this.metaDataSource.setData(metas);
          this.documentType = docType;
        })
    ).subscribe();

    this.adminService.newDocumentType$.pipe(
        filter(val => val === true),
        tap(() => {
          this.documentType = null;
          this.metaDataSource.setData([]);
          this.formGroup = this.initDocumentTypeFormGroup(null, [], null);
        })
    ).subscribe();

    this.filteredDocumentTypes$ = this.formGroup.get('filterControl_inheritedDocumentType').valueChanges.pipe(
        startWith(null),
        tap(inputVal => console.log('inputVal : ' + inputVal)),
        concatMap(inputVal => iif(
            () => inputVal == null || inputVal === '',
            this.initAndReturnAllDocumentTypes(),
            of(this.filterDocumentTypes(inputVal, this.allDocumentTypes, null))
        ))
    );
  }

  removeMetaData(row: Meta): void {
    // remove from form
    (this.formGroup.get('documentTypeMetas') as FormGroup).removeControl(row.uid.toString());
    // remove from dataSource
    const data: Array<Meta> = this.metaDataSource.connect().getValue();
    const index = data.findIndex(meta => meta.uid === row.uid);
    if (index !== -1) {
      data.splice(index, 1);
      this.metaDataSource.setData(data);
    }
  }

  sortData($event: Sort): void {
    this.sort.name = $event.active !== 'type' ? $event.active : 'metaType';
    this.sort.direction =
        $event.direction.toString() === 'desc' ?
            'desc' :
            'asc';
    this.metaDataSource.sortData1(this.sort);
  }

  private initDocumentTypeFormGroup(docType: DocumentType, metas: Array<Meta>, inheritedDocType: DocumentType): FormGroup {
    const formGroup = this.fb.group({});
    formGroup.addControl('documentTypeName', this.fb.control(docType != null ? docType.name : ''));
    formGroup.addControl('inheritedDocumentType', this.fb.control(inheritedDocType != null ? inheritedDocType : null));
    formGroup.addControl('filterControl_inheritedDocumentType', this.fb.control(''));
    formGroup.addControl('documentTypeMetas', this.fb.group({}));
    metas.forEach(meta =>
        (formGroup.get('documentTypeMetas') as FormGroup)
            .addControl(
                meta.uid.toString(),
                this.fb.group({
                  'metaDataName': this.fb.control(meta.name),
                  'metaDataType': this.fb.control(meta.metaType),
                  'metaDataMandatory': this.fb.control(meta.mandatory),
                  'metaDataPosition': this.fb.control(meta.position)
                })
            )
    );
    return formGroup;
  }

  addMetaData(): void {
    const notExistingYetMetas = this.findNotExistingMetasInDataSource(this.metaDataSource);
    const metaWithLowestUid = notExistingYetMetas.length > 0 ?
        notExistingYetMetas.sort((a, b) => a.uid < b.uid ? -1 : 1)[0] :
        null;

    const metaDataSourceData = this.metaDataSource.connect().getValue();

    const emptyMeta = <Meta> {
      uid: metaWithLowestUid == null ? -1 : metaWithLowestUid.uid - 1,
      name: '',
      documentTypeUid: -1,
      metaFeedUid: -1,
      metaType: null,
      mandatory: false,
      position: metaDataSourceData.slice().sort((a, b) => a.position < b.position ? 1 : -1)[0].position + 1
    };
    this.createFormGroupForMeta(this.formGroup.get('documentTypeMetas') as FormGroup, emptyMeta);
    this.metaDataSource.setData(metaDataSourceData.concat(emptyMeta));
  }

  onSelectDocumentTypeInheritedChange(value: any): void {
    /*this.formGroup.get('filterControl_inheritedDocumentType').setValue('');*/
  }

  onPanelClose(): void {

  }

  inputDocumentTypeInherited(): void {

  }

  private initAndReturnAllDocumentTypes(): Observable<Array<DocumentType>> {
    return this.studioService.getDocumentTypes(this.sessionService.sessionToken).pipe(
        tap(res => this.allDocumentTypes = res)
    );
  }

  private filterDocumentTypes(inputVal: string, allDocumentTypes: Array<DocumentType>, selectedDocTypeUid: number): Array<DocumentType> {
    return allDocumentTypes.filter(docType =>
        docType.name.toLowerCase().includes(inputVal.toLowerCase())
        && (selectedDocTypeUid == null || docType.uid !== selectedDocTypeUid)
    );
  }

  resetDocumentTypeInheritedValue(): void {
    this.formGroup.get('inheritedDocumentType').setValue('');
    this.formGroup.get('filterControl_inheritedDocumentType').setValue('');
  }

  private findNotExistingMetasInDataSource(metaDataSource: MetaDataSource): Array<Meta> {
    return metaDataSource.connect().getValue().filter(meta => meta.uid < 0);
  }

  private createFormGroupForMeta(documentTypeMetas: FormGroup, emptyMeta: Meta): void {
    documentTypeMetas.addControl(
        emptyMeta.uid.toString(), this.fb.group({
          'metaDataName': this.fb.control(emptyMeta.name),
          'metaDataType': this.fb.control(emptyMeta.metaType),
          'metaDataMandatory': this.fb.control(emptyMeta.mandatory),
          'metaDataPosition': this.fb.control(emptyMeta.position)
        })
    );
  }

  submit(): void {
    const xmlStream = this.makeXmlStreamFromFormGroup(this.formGroup);

    this.studioService.updateDocumentType(this.sessionService.sessionToken, xmlStream).subscribe();
  }

  cancel(): void {
    if (this.documentType == null) {
      this.adminService.newDocumentType$.next(true);
    } else {
      this.adminService.selectedDocumentType$.next(this.documentType.uid);
    }
  }

  private makeXmlStreamFromFormGroup(formGroup: FormGroup): string {
    let xmlStream = '<?xml version="1.0" encoding="UTF-8"?>';

    let uid = -1;
    const name = formGroup.get('documentTypeName').value ;
    const parentUid = formGroup.get('inheritedDocumentType').value != null ?
        formGroup.get('inheritedDocumentType').value.uid :
        -1;
    if (this.documentType != null) {
      uid = this.documentType.uid;
    }

    xmlStream += '<document-type uid="' + uid + '" name="' + name + '" document-type-uid="' + parentUid + '">';
    Object.keys((formGroup.get('documentTypeMetas') as FormGroup).controls).forEach(keyControl => {
      const keyControlStr = Number(keyControl);
      const metaFormGroup = formGroup.get('documentTypeMetas').get(keyControl);
      xmlStream += this.makeMetaXmlElement(
          uid,
          Number(metaFormGroup.get('metaDataType').value),
          metaFormGroup.get('metaDataName').value,
          // metaFormGroup.get('metaDataType').value,
          -1,
          metaFormGroup.get('metaDataMandatory').value,
          metaFormGroup.get('metaDataPosition').value
      );
    });
    xmlStream += '</document-type>';

    return xmlStream;
  }

  private makeMetaXmlElement(uid: number, type: number, name: string, metaFeed: number, mandatory: boolean, position: number): string {
    return '<meta meta_type="' + type
        + '" uid="' + uid
        + '" name="' + name
        + '" meta_feed="' + metaFeed
        + '" mandatory="' + mandatory
        + '" position="' + position +
        '"/>';
  }
}
