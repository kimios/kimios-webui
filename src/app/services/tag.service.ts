import {Injectable, OnInit} from '@angular/core';
import {DocumentType, DocumentVersionService, Meta, StudioService} from '../kimios-client-api';
import {Observable, of, Subject} from 'rxjs';
import {SessionService} from './session.service';
import {concatMap, first, map, tap} from 'rxjs/operators';

export const DOC_TYPE_TAGGABLE = 'Taggable';
export const TAG_META_DATA_PREFIX = 'MetaDataString_';

@Injectable({
    providedIn: 'root'
})
export class TagService implements OnInit {

    static TAG_NAME_PREFIX = 'TAG_';
    static TAG_META_DATA_NAME_PREFIX = 'MetaDataString_';

    allTagsMap: Map<number, { uid: number; name: string; }>;
    documentType: DocumentType;

    constructor(
        private studioService: StudioService,
        private sessionService: SessionService,
        private documentVersionService: DocumentVersionService
    ) {
        this.allTagsMap = new Map<number, { uid: number; name: string; }>();
    }

    ngOnInit(): void {
        this.loadTagsRaw()
            .subscribe();
    }

    loadTagsRaw(): Observable<{ uid: number; name: string; }[]> {
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
            )
            .pipe(
                map(
                    (res) => res.map((meta) => ({ 'name': meta.name, 'uid': meta.uid }))
                        .filter(val => val.name.startsWith(TagService.TAG_NAME_PREFIX))
                )
            )
            .pipe(
                tap(
                    (res) => res.forEach(
                        tag => this.allTagsMap.set(tag.uid, tag)
                    )
                )
            );
    }

    loadTags(): Observable<{ uid: number; name: string; }[]> {
        return this.loadTagsRaw()
            .pipe(
                map(array => {
                    array.forEach(val => {
                        val.name = val.name.replace(new RegExp('^' + TagService.TAG_NAME_PREFIX), '');
                    });
                    return array;
                })
            );
    }

    createTag(value: string): Observable<any> {
        return this.studioService.createTag(
            this.sessionService.sessionToken,
            TagService.TAG_NAME_PREFIX + value,
            this.documentType.uid
        );
    }
}
