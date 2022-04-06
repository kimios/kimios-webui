import {DMEntity, Document as KimiosDocument, DocumentVersion, Folder, MetaValue, Workspace} from 'app/kimios-client-api';

export class EntityCacheData {
    entity: Folder | Workspace | KimiosDocument;
    private _canRead: boolean;
    private _canWrite: boolean;
    private _hasFullAccess: boolean;

    constructor(
      entity: Folder | Workspace | KimiosDocument,
      canRead: boolean,
      canWrite: boolean,
      hasFullAccess: boolean
    ) {
        this.entity = entity;
        this.canRead = canRead;
        this.canWrite = canWrite;
        this.hasFullAccess = hasFullAccess;
    }

    get canRead(): boolean {
        return this._canRead;
    }

    set canRead(value: boolean) {
        this._canRead = value;
    }

    get canWrite(): boolean {
        return this._canWrite;
    }

    set canWrite(value: boolean) {
        this._canWrite = value;
    }

    get hasFullAccess(): boolean {
        return this._hasFullAccess;
    }

    set hasFullAccess(value: boolean) {
        this._hasFullAccess = value;
    }
}

export class DocumentCacheData extends EntityCacheData {
    private _versions: Array<DocumentVersionWithMetaValues>;

    constructor(
      entity: KimiosDocument,
      canRead: boolean,
      canWrite: boolean,
      hasFullAccess: boolean
    ) {
        super(entity, canRead, canWrite, hasFullAccess);
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
