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
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent }                           from '@angular/common/http';
import { CustomHttpUrlEncodingCodec }                        from '../encoder';

import { Observable }                                        from 'rxjs/Observable';

import { MailContact } from '../model/mailContact';
import { Share } from '../model/share';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class ShareService {

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
     * @param token 
     * @param password 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public downloadDocumentByToken(token?: string, password?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public downloadDocumentByToken(token?: string, password?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public downloadDocumentByToken(token?: string, password?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public downloadDocumentByToken(token?: string, password?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (token !== undefined && token !== null) {
            queryParameters = queryParameters.set('token', <any>token);
        }
        if (password !== undefined && password !== null) {
            queryParameters = queryParameters.set('password', <any>password);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/octet-stream',
            'application/x-www-form-urlencoded'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/downloadDocumentByToken`,
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
     * @param token 
     * @param password 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public downloadDocumentByTokenAndPassword(token?: string, password?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public downloadDocumentByTokenAndPassword(token?: string, password?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public downloadDocumentByTokenAndPassword(token?: string, password?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public downloadDocumentByTokenAndPassword(token?: string, password?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/octet-stream',
            'application/x-www-form-urlencoded'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/x-www-form-urlencoded'
        ];

        const canConsumeForm = this.canConsumeForm(consumes);

        let formParams: any | { append(param: string, value: any): void; };
        let useForm = false;
        let convertFormParamsToString = false;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        }

        if (token !== undefined) {
            formParams = formParams.append('token', <any>token) || formParams;
        }
        if (password !== undefined) {
            formParams = formParams.append('password', <any>password) || formParams;
        }

        return this.httpClient.post<any>(`${this.basePath}/downloadDocumentByTokenAndPassword`,
            convertFormParamsToString ? formParams.toString() : formParams,
            {
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
    public listEntitiesSharedByMe(sessionId?: string, observe?: 'body', reportProgress?: boolean): Observable<Array<Share>>;
    public listEntitiesSharedByMe(sessionId?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<Share>>>;
    public listEntitiesSharedByMe(sessionId?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<Share>>>;
    public listEntitiesSharedByMe(sessionId?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<Array<Share>>(`${this.basePath}/by-me`,
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
    public listEntitiesSharedWithMe(sessionId?: string, observe?: 'body', reportProgress?: boolean): Observable<Array<Share>>;
    public listEntitiesSharedWithMe(sessionId?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<Share>>>;
    public listEntitiesSharedWithMe(sessionId?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<Share>>>;
    public listEntitiesSharedWithMe(sessionId?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<Array<Share>>(`${this.basePath}/with-me`,
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
     * @param sessionId sessionId
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public loadDefaultTemplate(sessionId: string, observe?: 'body', reportProgress?: boolean): Observable<string>;
    public loadDefaultTemplate(sessionId: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<string>>;
    public loadDefaultTemplate(sessionId: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<string>>;
    public loadDefaultTemplate(sessionId: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (sessionId === null || sessionId === undefined) {
            throw new Error('Required parameter sessionId was null or undefined when calling loadDefaultTemplate.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<string>(`${this.basePath}/load-default-template`,
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
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public removeShare(observe?: 'body', reportProgress?: boolean): Observable<any>;
    public removeShare(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public removeShare(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public removeShare(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'multipart/form-data'
        ];

        return this.httpClient.post<any>(`${this.basePath}/remove`,
            null,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * List Contact
     * Provide list of previously used contacts
     * @param sessionId sessionId
     * @param query query
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public searchContact(sessionId: string, query: string, observe?: 'body', reportProgress?: boolean): Observable<Array<MailContact>>;
    public searchContact(sessionId: string, query: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<MailContact>>>;
    public searchContact(sessionId: string, query: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<MailContact>>>;
    public searchContact(sessionId: string, query: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (sessionId === null || sessionId === undefined) {
            throw new Error('Required parameter sessionId was null or undefined when calling searchContact.');
        }

        if (query === null || query === undefined) {
            throw new Error('Required parameter query was null or undefined when calling searchContact.');
        }

        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (query !== undefined && query !== null) {
            queryParameters = queryParameters.set('query', <any>query);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<Array<MailContact>>(`${this.basePath}/search-contact`,
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
     * Share provided documents by email
     * Share documents by email. An exception will be thrown if the total size exceed the parameters
     * @param sessionId sessionId
     * @param documentIds documentIds
     * @param body recipients
     * @param subject subject
     * @param content content
     * @param senderAddress senderAddress
     * @param senderName senderName
     * @param defaultSender Default Sender
     * @param password password
     * @param expirationDate expirationDate
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public shareByEmailFullContact(sessionId?: string, documentIds?: Array<number>, body?: Array<MailContact>, subject?: string, content?: string, senderAddress?: string, senderName?: string, defaultSender?: boolean, password?: string, expirationDate?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public shareByEmailFullContact(sessionId?: string, documentIds?: Array<number>, body?: Array<MailContact>, subject?: string, content?: string, senderAddress?: string, senderName?: string, defaultSender?: boolean, password?: string, expirationDate?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public shareByEmailFullContact(sessionId?: string, documentIds?: Array<number>, body?: Array<MailContact>, subject?: string, content?: string, senderAddress?: string, senderName?: string, defaultSender?: boolean, password?: string, expirationDate?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public shareByEmailFullContact(sessionId?: string, documentIds?: Array<number>, body?: Array<MailContact>, subject?: string, content?: string, senderAddress?: string, senderName?: string, defaultSender?: boolean, password?: string, expirationDate?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {











        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentIds) {
            documentIds.forEach((element) => {
                queryParameters = queryParameters.append('documentIds', <any>element);
            })
        }
        if (subject !== undefined && subject !== null) {
            queryParameters = queryParameters.set('subject', <any>subject);
        }
        if (content !== undefined && content !== null) {
            queryParameters = queryParameters.set('content', <any>content);
        }
        if (senderAddress !== undefined && senderAddress !== null) {
            queryParameters = queryParameters.set('senderAddress', <any>senderAddress);
        }
        if (senderName !== undefined && senderName !== null) {
            queryParameters = queryParameters.set('senderName', <any>senderName);
        }
        if (defaultSender !== undefined && defaultSender !== null) {
            queryParameters = queryParameters.set('defaultSender', <any>defaultSender);
        }
        if (password !== undefined && password !== null) {
            queryParameters = queryParameters.set('password', <any>password);
        }
        if (expirationDate !== undefined && expirationDate !== null) {
            queryParameters = queryParameters.set('expirationDate', <any>expirationDate);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.post<any>(`${this.basePath}/share-by-mail`,
            body,
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
     * @param dmEntityId 
     * @param targetUserId 
     * @param targetUserSource 
     * @param read 
     * @param write 
     * @param fullAccess 
     * @param expirationDate 
     * @param notify 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public shareDocument(sessionId?: string, dmEntityId?: number, targetUserId?: string, targetUserSource?: string, read?: boolean, write?: boolean, fullAccess?: boolean, expirationDate?: string, notify?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public shareDocument(sessionId?: string, dmEntityId?: number, targetUserId?: string, targetUserSource?: string, read?: boolean, write?: boolean, fullAccess?: boolean, expirationDate?: string, notify?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public shareDocument(sessionId?: string, dmEntityId?: number, targetUserId?: string, targetUserSource?: string, read?: boolean, write?: boolean, fullAccess?: boolean, expirationDate?: string, notify?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public shareDocument(sessionId?: string, dmEntityId?: number, targetUserId?: string, targetUserSource?: string, read?: boolean, write?: boolean, fullAccess?: boolean, expirationDate?: string, notify?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {










        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/x-www-form-urlencoded'
        ];

        const canConsumeForm = this.canConsumeForm(consumes);

        let formParams: any | { append(param: string, value: any): void; };
        let useForm = false;
        let convertFormParamsToString = false;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        }

        if (sessionId !== undefined) {
            formParams = formParams.append('sessionId', <any>sessionId) || formParams;
        }
        if (dmEntityId !== undefined) {
            formParams = formParams.append('dmEntityId', <any>dmEntityId) || formParams;
        }
        if (targetUserId !== undefined) {
            formParams = formParams.append('targetUserId', <any>targetUserId) || formParams;
        }
        if (targetUserSource !== undefined) {
            formParams = formParams.append('targetUserSource', <any>targetUserSource) || formParams;
        }
        if (read !== undefined) {
            formParams = formParams.append('read', <any>read) || formParams;
        }
        if (write !== undefined) {
            formParams = formParams.append('write', <any>write) || formParams;
        }
        if (fullAccess !== undefined) {
            formParams = formParams.append('fullAccess', <any>fullAccess) || formParams;
        }
        if (expirationDate !== undefined) {
            formParams = formParams.append('expirationDate', <any>expirationDate) || formParams;
        }
        if (notify !== undefined) {
            formParams = formParams.append('notify', <any>notify) || formParams;
        }

        return this.httpClient.post<any>(`${this.basePath}/share-document`,
            convertFormParamsToString ? formParams.toString() : formParams,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
