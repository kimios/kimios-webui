import {Meta, MetaFeed} from 'app/kimios-client-api';

export interface MetaWithMetaFeed extends Meta {
    metaFeed: MetaFeed;
}

export class MetaWithMetaFeedImpl implements MetaWithMetaFeed {
    documentTypeUid: number;
    mandatory: boolean;
    metaFeedUid: number;
    metaType: number;
    name: string;
    position: number;
    uid: number;
    metaFeed: MetaFeed;
    
    constructor(
        documentTypeUid,
        mandatory,
        metaFeedUid,
        metaType,
        name,
        position,
        uid,
        metaFeed
    ) {
        this.documentTypeUid = documentTypeUid;
        this.mandatory = mandatory;
        this.metaFeedUid = metaFeedUid;
        this.metaType = metaType;
        this.name = name;
        this.position = position;
        this.uid = uid;
        this.metaFeed = metaFeed;
    }
    
    public static fromMeta(meta: Meta): MetaWithMetaFeedImpl {
        return new MetaWithMetaFeedImpl(
            meta.documentTypeUid,
            meta.mandatory,
            meta.metaFeedUid,
            meta.metaType,
            meta.name,
            meta.position,
            meta.uid,
            null
        );
    }

    public static fromMetaWithMetaFeed(meta: Meta, metaFeed: MetaFeed): MetaWithMetaFeedImpl {
        const newMeta = MetaWithMetaFeedImpl.fromMeta(meta);
        newMeta.metaFeed = metaFeed;

        return newMeta;
    }
}
