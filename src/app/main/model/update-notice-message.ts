import {Serializable} from './serializable';

export enum UpdateNoticeType {
    SHARES_BY_ME = 'shares by me',
    SHARES_WITH_ME = 'shares with me',
    DOCUMENT = 'document',
    FOLDER = 'folder',
    WORKSPACE = 'workspace',
    PREVIEW_READY = 'preview ready',
    PREVIEW_PROCESSING = 'preview processing',
    ALIVE = 'alive'
}

export class UpdateNoticeMessage implements Serializable<UpdateNoticeMessage> {
    private _updateNoticeType: UpdateNoticeType;
    private _message: string;

    constructor() {}

    get updateNoticeType(): UpdateNoticeType {
        return this._updateNoticeType;
    }

    get message(): string {
        return this._message;
    }

    set updateNoticeType(value: UpdateNoticeType) {
        this._updateNoticeType = value;
    }

    set message(value: string) {
        this._message = value;
    }

    deserialize(input: Object): UpdateNoticeMessage {
        this._message = input['message'];
        this._updateNoticeType = input['updateNoticeType'];
        return this;
    }
}
