import {DMEntity, DocumentVersion} from 'app/kimios-client-api';

export class EntityCacheData {
    entity: DMEntity;

    constructor(entity: DMEntity) {
        this.entity = entity;
    }
}

export class DocumentCacheData extends EntityCacheData {
    private _versions: Array<DocumentVersion>;

    constructor(entity: DMEntity) {
        super(entity);
        this._versions = null;
    }


    get versions(): Array<DocumentVersion> {
        return this._versions;
    }

    set versions(value: Array<DocumentVersion>) {
        this._versions = value;
    }
}
