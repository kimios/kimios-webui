/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.2.2-SNAPSHOT - 5f6a4372e643efa3abc97a7070cf07d4bb09747d
 * Contact: documentation@kimios.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent }                           from '@angular/common/http';
import { CustomHttpUrlEncodingCodec }                        from '../encoder';

import { Observable }                                        from 'rxjs/Observable';

import { DocumentWorkflowStatusRequest } from '../model/documentWorkflowStatusRequest';
import { WorkflowStatus } from '../model/workflowStatus';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class NotificationService {

    protected basePath = 'http://localhost/rest/';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
            this.basePath = basePath || configuration.basePath || this.basePath;
        }
    }

    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    private canConsumeForm(consumes: string[]): boolean {
        const form = 'multipart/form-data';
        for (const consume of consumes) {
            if (form === consume) {
                return true;
            }
        }
        return false;
    }


    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param workflowStatusId 
     * @param userName 
     * @param userSource 
     * @param statusDate 
     * @param comment 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public acceptRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public acceptRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public acceptRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public acceptRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {








        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (workflowStatusId !== undefined && workflowStatusId !== null) {
            queryParameters = queryParameters.set('workflowStatusId', <any>workflowStatusId);
        }
        if (userName !== undefined && userName !== null) {
            queryParameters = queryParameters.set('userName', <any>userName);
        }
        if (userSource !== undefined && userSource !== null) {
            queryParameters = queryParameters.set('userSource', <any>userSource);
        }
        if (statusDate !== undefined && statusDate !== null) {
            queryParameters = queryParameters.set('statusDate', <any>statusDate.toISOString());
        }
        if (comment !== undefined && comment !== null) {
            queryParameters = queryParameters.set('comment', <any>comment);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/notification/acceptRequest`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public cancelWorkflow(sessionId?: string, documentId?: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public cancelWorkflow(sessionId?: string, documentId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public cancelWorkflow(sessionId?: string, documentId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public cancelWorkflow(sessionId?: string, documentId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/notification/cancelWorkflow`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param workflowStatusId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public createRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public createRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public createRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {




        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (workflowStatusId !== undefined && workflowStatusId !== null) {
            queryParameters = queryParameters.set('workflowStatusId', <any>workflowStatusId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/notification/createRequest`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param workflowStatusId 
     * @param userName 
     * @param userSource 
     * @param requestDate 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getDocumentWorkflowStatusRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, observe?: 'body', reportProgress?: boolean): Observable<DocumentWorkflowStatusRequest>;
    public getDocumentWorkflowStatusRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<DocumentWorkflowStatusRequest>>;
    public getDocumentWorkflowStatusRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<DocumentWorkflowStatusRequest>>;
    public getDocumentWorkflowStatusRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {







        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (workflowStatusId !== undefined && workflowStatusId !== null) {
            queryParameters = queryParameters.set('workflowStatusId', <any>workflowStatusId);
        }
        if (userName !== undefined && userName !== null) {
            queryParameters = queryParameters.set('userName', <any>userName);
        }
        if (userSource !== undefined && userSource !== null) {
            queryParameters = queryParameters.set('userSource', <any>userSource);
        }
        if (requestDate !== undefined && requestDate !== null) {
            queryParameters = queryParameters.set('requestDate', <any>requestDate.toISOString());
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<DocumentWorkflowStatusRequest>(`${this.basePath}/notification/getDocumentWorkflowStatusRequest`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getLastWorkflowStatus(sessionId?: string, documentId?: number, observe?: 'body', reportProgress?: boolean): Observable<WorkflowStatus>;
    public getLastWorkflowStatus(sessionId?: string, documentId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<WorkflowStatus>>;
    public getLastWorkflowStatus(sessionId?: string, documentId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<WorkflowStatus>>;
    public getLastWorkflowStatus(sessionId?: string, documentId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<WorkflowStatus>(`${this.basePath}/notification/getLastWorkflowStatus`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getPendingRequests(sessionId?: string, observe?: 'body', reportProgress?: boolean): Observable<Array<DocumentWorkflowStatusRequest>>;
    public getPendingRequests(sessionId?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<DocumentWorkflowStatusRequest>>>;
    public getPendingRequests(sessionId?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<DocumentWorkflowStatusRequest>>>;
    public getPendingRequests(sessionId?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<Array<DocumentWorkflowStatusRequest>>(`${this.basePath}/notification/getPendingRequests`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getRequests(sessionId?: string, documentId?: number, observe?: 'body', reportProgress?: boolean): Observable<Array<DocumentWorkflowStatusRequest>>;
    public getRequests(sessionId?: string, documentId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<DocumentWorkflowStatusRequest>>>;
    public getRequests(sessionId?: string, documentId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<DocumentWorkflowStatusRequest>>>;
    public getRequests(sessionId?: string, documentId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<Array<DocumentWorkflowStatusRequest>>(`${this.basePath}/notification/getRequests`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param workflowStatusId 
     * @param userName 
     * @param userSource 
     * @param statusDate 
     * @param comment 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public rejectRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public rejectRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public rejectRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public rejectRequest(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, statusDate?: Date, comment?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {








        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (workflowStatusId !== undefined && workflowStatusId !== null) {
            queryParameters = queryParameters.set('workflowStatusId', <any>workflowStatusId);
        }
        if (userName !== undefined && userName !== null) {
            queryParameters = queryParameters.set('userName', <any>userName);
        }
        if (userSource !== undefined && userSource !== null) {
            queryParameters = queryParameters.set('userSource', <any>userSource);
        }
        if (statusDate !== undefined && statusDate !== null) {
            queryParameters = queryParameters.set('statusDate', <any>statusDate.toISOString());
        }
        if (comment !== undefined && comment !== null) {
            queryParameters = queryParameters.set('comment', <any>comment);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/notification/rejectRequest`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * 
     * 
     * @param sessionId 
     * @param documentId 
     * @param workflowStatusId 
     * @param userName 
     * @param userSource 
     * @param requestDate 
     * @param newComment 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateDocumentWorkflowStatusRequestComment(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, newComment?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public updateDocumentWorkflowStatusRequestComment(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, newComment?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public updateDocumentWorkflowStatusRequestComment(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, newComment?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public updateDocumentWorkflowStatusRequestComment(sessionId?: string, documentId?: number, workflowStatusId?: number, userName?: string, userSource?: string, requestDate?: Date, newComment?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {








        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (workflowStatusId !== undefined && workflowStatusId !== null) {
            queryParameters = queryParameters.set('workflowStatusId', <any>workflowStatusId);
        }
        if (userName !== undefined && userName !== null) {
            queryParameters = queryParameters.set('userName', <any>userName);
        }
        if (userSource !== undefined && userSource !== null) {
            queryParameters = queryParameters.set('userSource', <any>userSource);
        }
        if (requestDate !== undefined && requestDate !== null) {
            queryParameters = queryParameters.set('requestDate', <any>requestDate.toISOString());
        }
        if (newComment !== undefined && newComment !== null) {
            queryParameters = queryParameters.set('newComment', <any>newComment);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/notification/updateDocumentWorkflowStatusRequestComment`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
