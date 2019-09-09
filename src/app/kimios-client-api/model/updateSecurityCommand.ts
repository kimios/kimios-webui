/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.2.2-SNAPSHOT - 282608d038dbfdf7754fa4e049f180f36e0f635a
 * Contact: documentation@kimios.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { DMEntitySecurity } from './dMEntitySecurity';


export interface UpdateSecurityCommand { 
    sessionId?: string;
    dmEntityId?: number;
    appendMode?: boolean;
    securities?: Array<DMEntitySecurity>;
    recursive?: boolean;
}