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
import { DMEntity } from './dMEntity';
import { MetaValue } from './metaValue';


export interface SymbolicLink extends DMEntity { 
    dmEntityUid?: number;
    dmEntityType?: number;
    parentUid?: number;
    parentType?: number;
    target?: DMEntity;
}
