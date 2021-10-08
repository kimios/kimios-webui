import {Component, Input, OnInit} from '@angular/core';
import {DocumentService, DocumentType as KimiosDocumentType, DocumentVersionService, Meta, MetaValue, StudioService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {concatMap, filter, map, startWith, tap} from 'rxjs/operators';
import {combineLatest, iif, Observable, of} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DocumentTypeUtils} from 'app/main/utils/document-type-utils';

@Component({
  selector: 'document-meta-data',
  templateUrl: './document-meta-data.component.html',
  styleUrls: ['./document-meta-data.component.scss']
})
export class DocumentMetaDataComponent implements OnInit {

  @Input()
  documentId: number;
  documentType: KimiosDocumentType;
  documentMetasMap: Map<number, MetaValue>;
  documentTypeMetas: Array<Meta>;
  selectedDocumentType: KimiosDocumentType;
  filteredDocumentTypes$: Observable<Array<KimiosDocumentType>>;
  formGroup: FormGroup;
  allDocumentTypes: Array<KimiosDocumentType>;
  documentTypeMetaDataValuesMap: Map<number, Array<string | number>>;
  metaValuesLoaded = false;

  constructor(
      private sessionService: SessionService,
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private fb: FormBuilder,
      private studioService: StudioService
  ) {
    this.documentMetasMap = new Map<number, MetaValue>();
    this.documentType = null;
    this.selectedDocumentType = null;
    this.filteredDocumentTypes$ = new Observable<Array<DocumentType>>();
    this.allDocumentTypes = new Array<KimiosDocumentType>();
    this.documentTypeMetaDataValuesMap = new Map<number, Array<string | number>>();
    this.formGroup = this.fb.group({
      'documentType': this.fb.control(''),
      'metas': this.fb.group({})
    });
  }

  ngOnInit(): void {
    this.documentVersionService.getLastDocumentVersion(this.sessionService.sessionToken, this.documentId).pipe(
        filter(docVersion => docVersion.documentTypeUid != null && docVersion.documentTypeUid !== undefined),
        concatMap(docVersion => combineLatest(
            this.documentVersionService.getMetaValues(this.sessionService.sessionToken, docVersion.uid),
            this.documentVersionService.getMetas(this.sessionService.sessionToken, docVersion.documentTypeUid),
            this.studioService.getDocumentType(this.sessionService.sessionToken, docVersion.documentTypeUid))
        ),
        tap(([metaValues, metas, documentType]) => {
          this.documentType = documentType;
          this.documentTypeMetas = metas;
          metas.forEach(meta => this.documentMetasMap.set(meta.uid, null));
          metaValues.forEach(metaValue => this.documentMetasMap.set(metaValue.meta.uid, metaValue.value));
        }),
        tap(() => this.initFormMetas(this.formGroup, this.documentMetasMap, this.documentTypeMetas)),
        concatMap(([metaValues, metas, documentType]) => metas),
        map(meta => meta),
        tap(meta => this.documentTypeMetaDataValuesMap.set(meta.uid, null)),
        filter(meta => meta.metaFeedUid !== -1),
        concatMap(meta => combineLatest(
            of(meta),
            this.studioService.getMetaFeedValues(this.sessionService.sessionToken, meta.metaFeedUid)
        )),
        tap(([meta, metaFeedValues]) => this.documentTypeMetaDataValuesMap.set(meta.uid, metaFeedValues)),
        tap(() => this.metaValuesLoaded = true)
    ).subscribe();

    this.filteredDocumentTypes$ = this.formGroup.get('documentType').valueChanges.pipe(
        filter(value =>  ! (value instanceof Object)),
        startWith(null),
        concatMap(inputVal => iif(
            () => inputVal != null,
            of(DocumentTypeUtils.filterDocumentTypes(this.allDocumentTypes, inputVal, this.documentType)),
            this.initAndReturnAllDocumentTypes()
        ))
    );
  }

  displayAutoCompleteDocumentType(docType: KimiosDocumentType): string {
    return docType == null || docType === undefined ? '' : docType.name;
  }

  onSubmit(): void {

  }

  selectDocumentType(): void {

  }

  deselectDocumentType(): void {

  }

  private initAndReturnAllDocumentTypes(): Observable<Array<KimiosDocumentType>> {
    return this.studioService.getDocumentTypes(this.sessionService.sessionToken).pipe(
        tap(res => this.allDocumentTypes = res)
    );
  }

  resetMetaValue(uid: number): void {
    (this.formGroup.get('metas') as FormGroup).get(uid.toString()).setValue('');
  }

  private initFormMetas(
      formGroup: FormGroup,
      documentMetasMap: Map<number, MetaValue>,
      documentMetas: Array<Meta>
  ): void {
    documentMetas.forEach(meta => (formGroup.get('metas') as FormGroup).addControl(
        meta.uid.toString(),
        this.fb.control(documentMetasMap.get(meta.uid) ? documentMetasMap.get(meta.uid) : '')
    ));
  }
}
