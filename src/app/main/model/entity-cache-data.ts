import {DMEntity, Document as KimiosDocument, DocumentVersion, Folder, MetaValue, Workspace} from 'app/kimios-client-api';

export class EntityCacheData {
    entity: Folder | Workspace | KimiosDocument;

    constructor(entity: Folder | Workspace | KimiosDocument) {
        this.entity = entity;
    }
}

export class DocumentCacheData extends EntityCacheData {
    private _versions: Array<DocumentVersionWithMetaValues>;

    constructor(entity: KimiosDocument) {
        super(entity);
        this._versions = null;
    }


    get versions(): Array<DocumentVersionWithMetaValues> {
        return this._versions;
    }

    set versions(value: Array<DocumentVersionWithMetaValues>) {
        this._versions = value;
    }
}

export class DocumentVersionWithMetaValues {
    private _documentVersion: DocumentVersion;
    private _metaValues: Array<MetaValue>;

    constructor(docVersion: DocumentVersion, metaValues: Array<MetaValue>) {
        this._documentVersion = docVersion;
        this._metaValues = metaValues;
    }

    get documentVersion(): DocumentVersion {
        return this._documentVersion;
    }

    get metaValues(): Array<MetaValue> {
        return this._metaValues;
    }

    set metaValues(value: Array<MetaValue>) {
        this._metaValues = value;
    }
}
