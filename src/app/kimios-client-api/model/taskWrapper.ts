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
import { CommentWrapper } from './commentWrapper';
import { ProcessWrapper } from './processWrapper';
import { UserWrapper } from './userWrapper';


export interface TaskWrapper { 
    id?: number;
    name?: string;
    description?: string;
    claimedDate?: Date;
    expectedEndDate?: Date;
    priority?: string;
    displayDescription?: string;
    displayName?: string;
    executedBy?: number;
    flownodeDefinitionId?: number;
    lastUpdateDate?: Date;
    parentContainerId?: number;
    parentProcessInstanceId?: number;
    reachedStateDate?: Date;
    rootContainerId?: number;
    state?: string;
    stateCategory?: string;
    type?: string;
    processDefinitionId?: number;
    url?: string;
    processWrapper?: ProcessWrapper;
    commentWrappers?: Array<CommentWrapper>;
    actor?: UserWrapper;
    assignee?: UserWrapper;
}
