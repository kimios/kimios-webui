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


export interface EditorData { 
    documentId?: number;
    createdVersionId?: number;
    userId?: string;
    userSource?: string;
    proxyName?: string;
    cookiesDatas?: { [key: string]: string; };
}
