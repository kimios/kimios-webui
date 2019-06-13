/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.2.2-SNAPSHOT - 15226bb41add52f1b97721abffc758435d074049
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

import { Log } from '../model/log';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class LogService {

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
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getDocumentLogs(sessionId?: string, documentId?: number, observe?: 'body', reportProgress?: boolean): Observable<Array<Log>>;
    public getDocumentLogs(sessionId?: string, documentId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<Log>>>;
    public getDocumentLogs(sessionId?: string, documentId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<Log>>>;
    public getDocumentLogs(sessionId?: string, documentId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



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

        return this.httpClient.get<Array<Log>>(`${this.basePath}/log/getDocumentLogs`,
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
     * @param folderId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getFolderLogs(sessionId?: string, folderId?: number, observe?: 'body', reportProgress?: boolean): Observable<Array<Log>>;
    public getFolderLogs(sessionId?: string, folderId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<Log>>>;
    public getFolderLogs(sessionId?: string, folderId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<Log>>>;
    public getFolderLogs(sessionId?: string, folderId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (folderId !== undefined && folderId !== null) {
            queryParameters = queryParameters.set('folderId', <any>folderId);
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

        return this.httpClient.get<Array<Log>>(`${this.basePath}/log/getFolderLogs`,
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
     * @param workspaceId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getWorkspaceLogs(sessionId?: string, workspaceId?: number, observe?: 'body', reportProgress?: boolean): Observable<Array<Log>>;
    public getWorkspaceLogs(sessionId?: string, workspaceId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<Log>>>;
    public getWorkspaceLogs(sessionId?: string, workspaceId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<Log>>>;
    public getWorkspaceLogs(sessionId?: string, workspaceId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (workspaceId !== undefined && workspaceId !== null) {
            queryParameters = queryParameters.set('workspaceId', <any>workspaceId);
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

        return this.httpClient.get<Array<Log>>(`${this.basePath}/log/getWorkspaceLogs`,
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
