/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.3-SNAPSHOT - b6cd4fa41d52049bf33e1f2d5bb6ddc2601fffe4
 * Contact: documentation@kimios.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface UpdateNoticeMessage { 
    token?: string;
    sessionId?: string;
    updateNoticeType?: UpdateNoticeMessage.UpdateNoticeTypeEnum;
    message?: string;
}
export namespace UpdateNoticeMessage {
    export type UpdateNoticeTypeEnum = 'SHARES_BY_ME' | 'SHARES_WITH_ME' | 'DOCUMENT' | 'FOLDER' | 'WORKSPACE' | 'PREVIEW_READY' | 'PREVIEW_PROCESSING' | 'KEEP_ALIVE_PING' | 'KEEP_ALIVE_PONG' | 'USER_GROUP_ADD' | 'USER_GROUP_REMOVE' | 'USER_CREATED' | 'USER_MODIFIED' | 'USER_REMOVED' | 'GROUP_CREATED' | 'GROUP_REMOVED' | 'GROUP_MODIFIED' | 'WORKSPACE_CREATED' | 'WORKSPACE_UPDATED' | 'WORKSPACE_REMOVED' | 'FOLDER_CREATED' | 'FOLDER_UPDATED' | 'FOLDER_REMOVED' | 'DOCUMENT_CREATED' | 'DOCUMENT_UPDATE' | 'DOCUMENT_REMOVED' | 'DOCUMENT_CHECKOUT' | 'DOCUMENT_CHECKIN' | 'DOCUMENT_ADD_RELATED' | 'DOCUMENT_REMOVE_RELATED' | 'DOCUMENT_VERSION_CREATE' | 'DOCUMENT_VERSION_CREATE_FROM_LATEST' | 'DOCUMENT_VERSION_UPDATE' | 'DOCUMENT_VERSION_READ' | 'META_VALUE_UPDATE' | 'DOCUMENT_VERSION_COMMENT_CREATE' | 'DOCUMENT_VERSION_COMMENT_UPDATE' | 'DOCUMENT_VERSION_COMMENT_DELETE' | 'DOCUMENT_TRASH' | 'DOCUMENT_UNTRASH' | 'DOCUMENT_SHARED' | 'NEW_TAG';
    export const UpdateNoticeTypeEnum = {
        SHARESBYME: 'SHARES_BY_ME' as UpdateNoticeTypeEnum,
        SHARESWITHME: 'SHARES_WITH_ME' as UpdateNoticeTypeEnum,
        DOCUMENT: 'DOCUMENT' as UpdateNoticeTypeEnum,
        FOLDER: 'FOLDER' as UpdateNoticeTypeEnum,
        WORKSPACE: 'WORKSPACE' as UpdateNoticeTypeEnum,
        PREVIEWREADY: 'PREVIEW_READY' as UpdateNoticeTypeEnum,
        PREVIEWPROCESSING: 'PREVIEW_PROCESSING' as UpdateNoticeTypeEnum,
        KEEPALIVEPING: 'KEEP_ALIVE_PING' as UpdateNoticeTypeEnum,
        KEEPALIVEPONG: 'KEEP_ALIVE_PONG' as UpdateNoticeTypeEnum,
        USERGROUPADD: 'USER_GROUP_ADD' as UpdateNoticeTypeEnum,
        USERGROUPREMOVE: 'USER_GROUP_REMOVE' as UpdateNoticeTypeEnum,
        USERCREATED: 'USER_CREATED' as UpdateNoticeTypeEnum,
        USERMODIFIED: 'USER_MODIFIED' as UpdateNoticeTypeEnum,
        USERREMOVED: 'USER_REMOVED' as UpdateNoticeTypeEnum,
        GROUPCREATED: 'GROUP_CREATED' as UpdateNoticeTypeEnum,
        GROUPREMOVED: 'GROUP_REMOVED' as UpdateNoticeTypeEnum,
        GROUPMODIFIED: 'GROUP_MODIFIED' as UpdateNoticeTypeEnum,
        WORKSPACECREATED: 'WORKSPACE_CREATED' as UpdateNoticeTypeEnum,
        WORKSPACEUPDATED: 'WORKSPACE_UPDATED' as UpdateNoticeTypeEnum,
        WORKSPACEREMOVED: 'WORKSPACE_REMOVED' as UpdateNoticeTypeEnum,
        FOLDERCREATED: 'FOLDER_CREATED' as UpdateNoticeTypeEnum,
        FOLDERUPDATED: 'FOLDER_UPDATED' as UpdateNoticeTypeEnum,
        FOLDERREMOVED: 'FOLDER_REMOVED' as UpdateNoticeTypeEnum,
        DOCUMENTCREATED: 'DOCUMENT_CREATED' as UpdateNoticeTypeEnum,
        DOCUMENTUPDATE: 'DOCUMENT_UPDATE' as UpdateNoticeTypeEnum,
        DOCUMENTREMOVED: 'DOCUMENT_REMOVED' as UpdateNoticeTypeEnum,
        DOCUMENTCHECKOUT: 'DOCUMENT_CHECKOUT' as UpdateNoticeTypeEnum,
        DOCUMENTCHECKIN: 'DOCUMENT_CHECKIN' as UpdateNoticeTypeEnum,
        DOCUMENTADDRELATED: 'DOCUMENT_ADD_RELATED' as UpdateNoticeTypeEnum,
        DOCUMENTREMOVERELATED: 'DOCUMENT_REMOVE_RELATED' as UpdateNoticeTypeEnum,
        DOCUMENTVERSIONCREATE: 'DOCUMENT_VERSION_CREATE' as UpdateNoticeTypeEnum,
        DOCUMENTVERSIONCREATEFROMLATEST: 'DOCUMENT_VERSION_CREATE_FROM_LATEST' as UpdateNoticeTypeEnum,
        DOCUMENTVERSIONUPDATE: 'DOCUMENT_VERSION_UPDATE' as UpdateNoticeTypeEnum,
        DOCUMENTVERSIONREAD: 'DOCUMENT_VERSION_READ' as UpdateNoticeTypeEnum,
        METAVALUEUPDATE: 'META_VALUE_UPDATE' as UpdateNoticeTypeEnum,
        DOCUMENTVERSIONCOMMENTCREATE: 'DOCUMENT_VERSION_COMMENT_CREATE' as UpdateNoticeTypeEnum,
        DOCUMENTVERSIONCOMMENTUPDATE: 'DOCUMENT_VERSION_COMMENT_UPDATE' as UpdateNoticeTypeEnum,
        DOCUMENTVERSIONCOMMENTDELETE: 'DOCUMENT_VERSION_COMMENT_DELETE' as UpdateNoticeTypeEnum,
        DOCUMENTTRASH: 'DOCUMENT_TRASH' as UpdateNoticeTypeEnum,
        DOCUMENTUNTRASH: 'DOCUMENT_UNTRASH' as UpdateNoticeTypeEnum,
        DOCUMENTSHARED: 'DOCUMENT_SHARED' as UpdateNoticeTypeEnum,
        NEWTAG: 'NEW_TAG' as UpdateNoticeTypeEnum
    };
}
