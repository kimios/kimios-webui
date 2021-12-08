/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.3-SNAPSHOT - 53ec478d1b5c1e2c1b7b3fd7f3dff17dca94e01b
 * Contact: documentation@kimios.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface UpdateNoticeMessage { 
    updateNoticeType?: UpdateNoticeMessage.UpdateNoticeTypeEnum;
    token?: string;
    message?: string;
    sessionId?: string;
}
export namespace UpdateNoticeMessage {
    export type UpdateNoticeTypeEnum = 'SHARES_BY_ME' | 'SHARES_WITH_ME' | 'DOCUMENT' | 'FOLDER' | 'WORKSPACE' | 'PREVIEW_READY' | 'PREVIEW_PROCESSING' | 'KEEP_ALIVE_PING' | 'KEEP_ALIVE_PONG';
    export const UpdateNoticeTypeEnum = {
        SHARESBYME: 'SHARES_BY_ME' as UpdateNoticeTypeEnum,
        SHARESWITHME: 'SHARES_WITH_ME' as UpdateNoticeTypeEnum,
        DOCUMENT: 'DOCUMENT' as UpdateNoticeTypeEnum,
        FOLDER: 'FOLDER' as UpdateNoticeTypeEnum,
        WORKSPACE: 'WORKSPACE' as UpdateNoticeTypeEnum,
        PREVIEWREADY: 'PREVIEW_READY' as UpdateNoticeTypeEnum,
        PREVIEWPROCESSING: 'PREVIEW_PROCESSING' as UpdateNoticeTypeEnum,
        KEEPALIVEPING: 'KEEP_ALIVE_PING' as UpdateNoticeTypeEnum,
        KEEPALIVEPONG: 'KEEP_ALIVE_PONG' as UpdateNoticeTypeEnum
    };
}
