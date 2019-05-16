import {Injectable, OnInit} from '@angular/core';
import {DocumentType, DocumentVersionService, Meta, StudioService} from '../kimios-client-api';
import {Observable, of, Subject} from 'rxjs';
import {SessionService} from './session.service';
import {concatMap, map} from 'rxjs/operators';

const DOC_TYPE_TAGGABLE = 'Taggable';
const TAG_NAME_PREFIX = 'TAG_';

@Injectable({
  providedIn: 'root'
})
export class TagService implements OnInit {

  tags$: Observable<Array<string>>;
  documentType: DocumentType;

  constructor(
      private studioService: StudioService,
      private sessionService: SessionService,
      private documentVersionService: DocumentVersionService
  ) {
    this.tags$ = this.loadTags();
  }

  ngOnInit(): void {}

  loadTags(): Observable<string[]> {
    return this.studioService.getDocumentTypes(this.sessionService.sessionToken)
        .pipe(
            concatMap(
                (res) => {
                  const docTypes = res.filter(docType => docType.name === DOC_TYPE_TAGGABLE);
                  let metas = new Observable<Meta[]>();
                  if (docTypes.length === 0) {
                    this.documentType = null;
                  } else {
                    this.documentType = docTypes[0];

                    metas = this.documentVersionService.getUnheritedMetas(
                        this.sessionService.sessionToken,
                        this.documentType.uid
                    );
                  }
                  return metas;
                }
            )
        ).pipe(
            map(
                (res) => res.map(meta => meta.name)
                    .filter(value => value.startsWith(TAG_NAME_PREFIX))
                    .map(value => value.replace(new RegExp('^' + TAG_NAME_PREFIX), ''))
            )
        );
  }
}
