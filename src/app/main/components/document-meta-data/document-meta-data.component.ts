import {Component, Input, OnInit} from '@angular/core';
import {DocumentService, DocumentType as KimiosDocumentType, DocumentVersionService, MetaValue, StudioService} from 'app/kimios-client-api';
import {SessionService} from 'app/services/session.service';
import {concatMap, filter, startWith, tap} from 'rxjs/operators';
import {iif, Observable, of} from 'rxjs';
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
  documentMetas: Array<MetaValue>;
  filteredDocumentTypes$: Observable<Array<KimiosDocumentType>>;
  formGroup: FormGroup;
  allDocumentTypes: Array<KimiosDocumentType>;

  constructor(
      private sessionService: SessionService,
      private documentService: DocumentService,
      private documentVersionService: DocumentVersionService,
      private fb: FormBuilder,
      private studioService: StudioService
  ) {
    this.documentMetas = new Array<MetaValue>();
    this.documentType = null;
    this.filteredDocumentTypes$ = new Observable<Array<DocumentType>>();
    this.allDocumentTypes = new Array<KimiosDocumentType>();
    this.formGroup = this.fb.group({
      'documentType': this.fb.control(''),
      'metas': this.fb.group({})
    });
  }

  ngOnInit(): void {
    this.documentVersionService.getLastDocumentVersion(this.sessionService.sessionToken, this.documentId).pipe(
        filter(docVersion => docVersion.documentTypeUid != null && docVersion.documentTypeUid !== undefined),
        concatMap(docVersion => this.documentVersionService.getMetaValues(this.sessionService.sessionToken, docVersion.uid)
        ),
        filter(metaValues => metaValues != null),
        tap(metaValues => this.documentMetas = metaValues)
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
}
