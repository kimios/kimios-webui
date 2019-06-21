/**
 * Kimios API
 * Kimios Sample API
 *
 * OpenAPI spec version: 1.2.2-SNAPSHOT - 0e4caa5c6f07ea69fb28705b90f227cac1cd6682
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

import { Folder } from '../model/folder';
import { MetaValue } from '../model/metaValue';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class FolderService {

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
     * @param name 
     * @param parentId 
     * @param isSecurityInherited 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createFolder(sessionId?: string, name?: string, parentId?: number, isSecurityInherited?: boolean, observe?: 'body', reportProgress?: boolean): Observable<number>;
    public createFolder(sessionId?: string, name?: string, parentId?: number, isSecurityInherited?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<number>>;
    public createFolder(sessionId?: string, name?: string, parentId?: number, isSecurityInherited?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<number>>;
    public createFolder(sessionId?: string, name?: string, parentId?: number, isSecurityInherited?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {





        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (name !== undefined && name !== null) {
            queryParameters = queryParameters.set('name', <any>name);
        }
        if (parentId !== undefined && parentId !== null) {
            queryParameters = queryParameters.set('parentId', <any>parentId);
        }
        if (isSecurityInherited !== undefined && isSecurityInherited !== null) {
            queryParameters = queryParameters.set('isSecurityInherited', <any>isSecurityInherited);
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

        return this.httpClient.get<number>(`${this.basePath}/folder/createFolder`,
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
    public deleteFolder(sessionId?: string, folderId?: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public deleteFolder(sessionId?: string, folderId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public deleteFolder(sessionId?: string, folderId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public deleteFolder(sessionId?: string, folderId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



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

        return this.httpClient.get<any>(`${this.basePath}/folder/deleteFolder`,
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
    public getFolder(sessionId?: string, folderId?: number, observe?: 'body', reportProgress?: boolean): Observable<Folder>;
    public getFolder(sessionId?: string, folderId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Folder>>;
    public getFolder(sessionId?: string, folderId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Folder>>;
    public getFolder(sessionId?: string, folderId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



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

        return this.httpClient.get<Folder>(`${this.basePath}/folder/getFolder`,
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
    public getFolderMetaValues(sessionId?: string, folderId?: number, observe?: 'body', reportProgress?: boolean): Observable<Array<MetaValue>>;
    public getFolderMetaValues(sessionId?: string, folderId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<MetaValue>>>;
    public getFolderMetaValues(sessionId?: string, folderId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<MetaValue>>>;
    public getFolderMetaValues(sessionId?: string, folderId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



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

        return this.httpClient.get<Array<MetaValue>>(`${this.basePath}/folder/getFolderMetaValues`,
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
     * @param parentId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getFolders(sessionId?: string, parentId?: number, observe?: 'body', reportProgress?: boolean): Observable<Array<Folder>>;
    public getFolders(sessionId?: string, parentId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<Folder>>>;
    public getFolders(sessionId?: string, parentId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<Folder>>>;
    public getFolders(sessionId?: string, parentId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (parentId !== undefined && parentId !== null) {
            queryParameters = queryParameters.set('parentId', <any>parentId);
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

        return this.httpClient.get<Array<Folder>>(`${this.basePath}/folder/getFolders`,
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
     * @param foldersId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getFoldersWithMetaValues(sessionId?: string, foldersId?: Array<number>, observe?: 'body', reportProgress?: boolean): Observable<{ [key: string]: Array<MetaValue>; }>;
    public getFoldersWithMetaValues(sessionId?: string, foldersId?: Array<number>, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<{ [key: string]: Array<MetaValue>; }>>;
    public getFoldersWithMetaValues(sessionId?: string, foldersId?: Array<number>, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<{ [key: string]: Array<MetaValue>; }>>;
    public getFoldersWithMetaValues(sessionId?: string, foldersId?: Array<number>, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (foldersId) {
            foldersId.forEach((element) => {
                queryParameters = queryParameters.append('foldersId', <any>element);
            })
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

        return this.httpClient.get<{ [key: string]: Array<MetaValue>; }>(`${this.basePath}/folder/getFoldersWithMetaValues`,
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
     * @param name 
     * @param parentId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateFolder(sessionId?: string, folderId?: number, name?: string, parentId?: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public updateFolder(sessionId?: string, folderId?: number, name?: string, parentId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public updateFolder(sessionId?: string, folderId?: number, name?: string, parentId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public updateFolder(sessionId?: string, folderId?: number, name?: string, parentId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {





        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (folderId !== undefined && folderId !== null) {
            queryParameters = queryParameters.set('folderId', <any>folderId);
        }
        if (name !== undefined && name !== null) {
            queryParameters = queryParameters.set('name', <any>name);
        }
        if (parentId !== undefined && parentId !== null) {
            queryParameters = queryParameters.set('parentId', <any>parentId);
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

        return this.httpClient.get<any>(`${this.basePath}/folder/updateFolder`,
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
