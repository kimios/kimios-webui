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
import { User } from './user';


export interface Group { 
    gid?: string;
    name?: string;
    authenticationSourceName?: string;
    users?: Array<User>;
    type?: number;
    id?: string;
}
