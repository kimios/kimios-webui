/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.2.2-SNAPSHOT - 73e8d1925ff0716b0a39dff428b76dec7209db16
 * Contact: documentation@kimios.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { DMEntity } from './dMEntity';
import { MetaValue } from './metaValue';


export interface Document extends DMEntity { 
    lastVersionId?: number;
    versionCreationDate?: Date;
    versionUpdateDate?: Date;
    folderUid?: number;
    mimeType?: string;
    extension?: string;
    checkedOut?: boolean;
    checkoutUser?: string;
    checkoutUserSource?: string;
    checkoutDate?: Date;
    length?: number;
    customVersion?: string;
    customVersionPending?: string;
    lastUpdateAuthor?: string;
    lastUpdateAuthorSource?: string;
    workflowStatusUid?: number;
    workflowStatusName?: string;
    validatorUserName?: string;
    validatorUserSource?: string;
    workflowName?: string;
    documentTypeName?: string;
    documentTypeUid?: number;
    indexScore?: number;
    outOfWorkflow?: boolean;
}
