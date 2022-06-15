import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {DocumentService, DocumentType as KimiosDocumentType, DocumentVersionRestOnlyService, DocumentVersionService, Meta, MetaValue, StudioService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {concatMap, filter, map, startWith, tap, toArray} from 'rxjs/operators';
import {BehaviorSubject, combineLatest, from, iif, Observable, of} from 'rxjs';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn} from '@angular/forms';
import {DocumentTypeUtils} from 'app/main/utils/document-type-utils';
import {MatAutocompleteTrigger} from '@angular/material';
import {UpdateDocumentVersionMetaDataParam} from 'app/kimios-client-api/model/updateDocumentVersionMetaDataParam';
import {DocumentDetailService} from 'app/services/document-detail.service';
import {EntityCacheService} from 'app/services/entity-cache.service';

@Component({
  selector: 'document-meta-data',
  templateUrl: './document-meta-data.component.html',
  styleUrls: ['./document-meta-data.component.scss']
})
export class DocumentMetaDataComponent implements OnInit {

  @Input()
  documentId: number;
  documentId$: BehaviorSubject<number>;
  documentType: KimiosDocumentType;
  documentMetasMap: Map<number, MetaValue>;
  documentTypeMetas: Array<Meta>;
  selectedDocumentType: BehaviorSubject<KimiosDocumentType>;
  filteredDocumentTypes$: Observable<Array<KimiosDocumentType>>;
  formGroup: FormGroup;
  allDocumentTypes: Array<KimiosDocumentType>;
  documentTypeMetaDataValuesMap: Map<number, Array<string | number>>;
  metaValuesLoaded = false;
  @ViewChild(MatAutocompleteTrigger, {read: MatAutocompleteTrigger}) trigger: MatAutocompleteTrigger;

  constructor(
      private sessionService: SessionService,
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private documentVersionRestOnlyService: DocumentVersionRestOnlyService,
      private fb: FormBuilder,
      private studioService: StudioService,
      private documentDetailService: DocumentDetailService,
      private entityCacheService: EntityCacheService
  ) {
    this.documentMetasMap = new Map<number, MetaValue>();
    this.documentType = null;
    this.selectedDocumentType = new BehaviorSubject<DocumentType>(null);
    this.filteredDocumentTypes$ = new Observable<Array<DocumentType>>();
    this.allDocumentTypes = new Array<KimiosDocumentType>();
    this.documentTypeMetaDataValuesMap = new Map<number, Array<string | number>>();
    this.formGroup = this.fb.group({
      'documentType': this.fb.control(''),
      'metas': this.fb.group({})
    });
    this.documentId$ = new BehaviorSubject<number>(null);
  }

  ngOnInit(): void {
    this.documentId$.pipe(
        filter(documentId => documentId != null),
        concatMap(documentId => this.documentVersionService.getLastDocumentVersion(this.sessionService.sessionToken, documentId)),
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
          this.formGroup.get('documentType').setValue(documentType);
        }),
        tap(() => this.initFormMetas((this.formGroup.get('metas') as FormGroup), this.documentMetasMap, this.documentTypeMetas)),
        concatMap(([metaValues, metas, documentType]) => this.initMetaFeedValues(metas, this.documentTypeMetaDataValuesMap)),
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

    this.selectedDocumentType.pipe(
        tap(() => this.metaValuesLoaded = false),
        tap(() => this.resetFormMetas()),
        tap(documentType => this.documentType = documentType),
        filter(documentType => documentType != null),
        concatMap(documentType => this.documentVersionService.getMetas(this.sessionService.sessionToken, documentType.uid)),
        tap(metas => {
          this.documentTypeMetas = metas;
          this.initFormMetas((this.formGroup.get('metas') as FormGroup), null, this.documentTypeMetas);
          metas.forEach(meta => this.documentMetasMap.set(meta.uid, null));
          // this.formGroup.get('documentType').setValue(documentType);
        }),
        concatMap(metas => this.initMetaFeedValues(metas, this.documentTypeMetaDataValuesMap)),
        tap(() => this.metaValuesLoaded = true)
    ).subscribe();

    if (this.documentId == null) {
      this.documentDetailService.currentDocumentId$.pipe(
        filter(docId => docId != null),
        tap(docId => this.documentId = docId),
        tap(docId => this.documentId$.next(docId))
      ).subscribe();
    } else {
      this.documentId$.next(this.documentId);
    }

    this.entityCacheService.documentVersionUpdated$.pipe(
      tap(docVersionWithMetaData =>
        this.updateFormMetaValues(this.formGroup.get('metas') as FormGroup, docVersionWithMetaData.metaValues))
    ).subscribe();
  }

  displayAutoCompleteDocumentType(docType: KimiosDocumentType): string {
    return docType == null || docType === undefined ? '' : docType.name;
  }

  onSubmit(): void {

  }

  selectDocumentType(): void {
    this.selectedDocumentType.next(this.formGroup.get('documentType').value);
  }

  deselectDocumentType(): void {
    this.selectedDocumentType.next(null);
    this.formGroup.get('documentType').setValue('');
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
    documentMetas.forEach(meta => formGroup.addControl(
        meta.uid.toString(),
        this.fb.control(
          documentMetasMap && documentMetasMap.get(meta.uid) ?
            meta.metaType === 3 ?
              (new Date(Number(documentMetasMap.get(meta.uid)))) :
              documentMetasMap.get(meta.uid) :
            null,
          this.determineValidator(meta)
        )
    ));
  }

  private updateFormMetaValues(
    formGroup: FormGroup,
    metaValues: Array<MetaValue>
  ): void {
    metaValues.forEach(metaValue =>
      this.updateFormControlIfExists((formGroup.get(metaValue.metaId.toString()) as FormControl), metaValue.value)
    );
  }

  private resetFormMetas(): void {
    this.formGroup.removeControl('metas');
    this.formGroup.addControl('metas', this.fb.group({}));
  }

  private initMetaFeedValues(
      metas: Array<Meta>,
      documentTypeMetaDataValuesMap: Map<number, Array<string | number>>
  ): Observable<boolean> {
    return from(metas).pipe(
        map(meta => meta),
        tap(meta => documentTypeMetaDataValuesMap.set(meta.uid, null)),
        filter(meta => meta.metaFeedUid !== -1),
        concatMap(meta => combineLatest(
            of(meta),
            this.studioService.getMetaFeedValues(this.sessionService.sessionToken, meta.metaFeedUid)
        )),
        tap(([meta, metaFeedValues]) => documentTypeMetaDataValuesMap.set(meta.uid, metaFeedValues)),
        toArray(),
        map(array => true)
    );
  }

  handleClick(): void {
    this.trigger.openPanel();
  }

  submit($event: MouseEvent): void {
    if (! this.formGroup.valid) {
      return;
    }
    // handle document type property removed from document
    const documentTypeUid = this.documentType == null ?
      -1 :
      this.documentType.uid;
    const metaValues = {};
    Object.keys((this.formGroup.get('metas') as FormGroup).controls).forEach(metaUidStr =>
        metaValues[metaUidStr] = this.formGroup.get('metas').get(metaUidStr).value);
    Object.keys(metaValues).forEach(metaUidStr => {
      if (this.documentTypeMetas.filter(m => m.uid.toString() === metaUidStr)[0].metaType === 3
      && metaValues[metaUidStr] != null
      && metaValues[metaUidStr] !== '') {
        metaValues[metaUidStr] = metaValues[metaUidStr]._d ?
          metaValues[metaUidStr]._d.getTime() :
          metaValues[metaUidStr].getTime();
      }
    });
    this.documentVersionRestOnlyService.updateDocumentMetaData(
        <UpdateDocumentVersionMetaDataParam> {
          sessionId: this.sessionService.sessionToken,
          createNewVersion: true,
          documentUid: this.documentId,
          documentTypeUid: documentTypeUid,
          metaValues: metaValues
        }
    ).subscribe(
      null,
      null,
      () => {
        Object.keys(metaValues).forEach(metaUidStr => {
          if (this.documentTypeMetas.filter(m => m.uid.toString() === metaUidStr)[0].metaType === 3
            && metaValues[metaUidStr] != null
            && metaValues[metaUidStr] !== '') {
            this.formGroup.get('metas').get(metaUidStr).setValue(new Date(metaValues[metaUidStr]));
          }
        });
      }
    );
  }

  cancel($event: MouseEvent): void {

  }

  metaDataFieldTitle(meta: Meta): string {
    return meta.name + (meta.mandatory && meta.mandatory === true ? ' *' : '');
  }

  private determineValidator(meta: Meta): ValidatorFn {
    let validator;
    switch (meta.metaType) {
      case 2:
        validator = (control: AbstractControl): {[key: string]: any} | null => {
          const naN = isNaN(control.value);
          return naN ? {'NaN': {value: control.value}} : null;
        };
        break;
    }
    return validator;
  }

  private updateFormControlIfExists(formControl: FormControl, value: any): void {
    if (formControl != null) {
      formControl.setValue(value);
    }
  }
}
