/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.3-SNAPSHOT - 060527aa7377af83c5d622370343fc4fa7da64a7
 * Contact: documentation@kimios.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface DocumentWorkflowStatusRequest { 
    userName?: string;
    userSource?: string;
    validatorUserName?: string;
    validatorUserSource?: string;
    documentUid?: number;
    workflowStatusUid?: number;
    date?: Date;
    status?: number;
    comment?: string;
    validationDate?: Date;
}
