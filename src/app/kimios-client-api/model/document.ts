/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.2.1 - 7fdc88b413cfe49ca0d23a002cafdcc0ee5ee6ab
 * Contact: documentation@kimios.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { DMEntityAttribute } from './dMEntityAttribute';
import { DocumentVersion } from './documentVersion';
import { Folder } from './folder';
import { Lock } from './lock';
import { Share } from './share';


export interface Document { 
    uid?: number;
    type?: number;
    path?: string;
    name?: string;
    owner?: string;
    ownerSource?: string;
    creationDate?: Date;
    updateDate?: Date;
    attributes?: { [key: string]: DMEntityAttribute; };
    addOnDatas?: string;
    trashed?: boolean;
    shareSet?: Array<Share>;
    folderUid?: number;
    folder?: Folder;
    mimeType?: string;
    extension?: string;
    lock?: Lock;
    relatedDocuments?: Array<Document>;
    parentsRelatedDocuments?: Array<Document>;
    versionList?: Array<DocumentVersion>;
    checkedOut?: boolean;
    checkoutLock?: Lock;
}
