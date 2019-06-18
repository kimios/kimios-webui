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

import { DataTransaction } from '../model/dataTransaction';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class FiletransferService {

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
     * @param documentVersionId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createTokenDownloadTransaction(sessionId?: string, documentVersionId?: number, observe?: 'body', reportProgress?: boolean): Observable<DataTransaction>;
    public createTokenDownloadTransaction(sessionId?: string, documentVersionId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<DataTransaction>>;
    public createTokenDownloadTransaction(sessionId?: string, documentVersionId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<DataTransaction>>;
    public createTokenDownloadTransaction(sessionId?: string, documentVersionId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentVersionId !== undefined && documentVersionId !== null) {
            queryParameters = queryParameters.set('documentVersionId', <any>documentVersionId);
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

        return this.httpClient.get<DataTransaction>(`${this.basePath}/filetransfer/createTokenDownload`,
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
     * @param transactionId 
     * @param inline 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public downloadDocument(sessionId?: string, transactionId?: number, inline?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public downloadDocument(sessionId?: string, transactionId?: number, inline?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public downloadDocument(sessionId?: string, transactionId?: number, inline?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public downloadDocument(sessionId?: string, transactionId?: number, inline?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {




        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (transactionId !== undefined && transactionId !== null) {
            queryParameters = queryParameters.set('transactionId', <any>transactionId);
        }
        if (inline !== undefined && inline !== null) {
            queryParameters = queryParameters.set('inline', <any>inline);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/octet-stream'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/filetransfer/downloadDocument`,
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

        return this.httpClient.get<any>(`${this.basePath}/filetransfer/downloadDocumentByToken`,
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
     * @param transactionId 
     * @param inline 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public downloadDocumentVersion(sessionId?: string, transactionId?: number, inline?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public downloadDocumentVersion(sessionId?: string, transactionId?: number, inline?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public downloadDocumentVersion(sessionId?: string, transactionId?: number, inline?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public downloadDocumentVersion(sessionId?: string, transactionId?: number, inline?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {




        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (transactionId !== undefined && transactionId !== null) {
            queryParameters = queryParameters.set('transactionId', <any>transactionId);
        }
        if (inline !== undefined && inline !== null) {
            queryParameters = queryParameters.set('inline', <any>inline);
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/octet-stream',
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/filetransfer/downloadDocumentVersion`,
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
     * @param transactionId 
     * @param inline 
     * @param metaIds 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public downloadDocument_1(sessionId?: string, transactionId?: number, inline?: boolean, metaIds?: Array<number>, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public downloadDocument_1(sessionId?: string, transactionId?: number, inline?: boolean, metaIds?: Array<number>, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public downloadDocument_1(sessionId?: string, transactionId?: number, inline?: boolean, metaIds?: Array<number>, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public downloadDocument_1(sessionId?: string, transactionId?: number, inline?: boolean, metaIds?: Array<number>, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {





        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (transactionId !== undefined && transactionId !== null) {
            queryParameters = queryParameters.set('transactionId', <any>transactionId);
        }
        if (inline !== undefined && inline !== null) {
            queryParameters = queryParameters.set('inline', <any>inline);
        }
        if (metaIds) {
            metaIds.forEach((element) => {
                queryParameters = queryParameters.append('metaIds', <any>element);
            })
        }

        let headers = this.defaultHeaders;

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/octet-stream'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/filetransfer/downloadDocumentWithCustomFileName`,
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
     * @param transactionId 
     * @param md5 
     * @param sha1 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public endUploadTransaction(sessionId?: string, transactionId?: number, md5?: string, sha1?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public endUploadTransaction(sessionId?: string, transactionId?: number, md5?: string, sha1?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public endUploadTransaction(sessionId?: string, transactionId?: number, md5?: string, sha1?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public endUploadTransaction(sessionId?: string, transactionId?: number, md5?: string, sha1?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {





        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (transactionId !== undefined && transactionId !== null) {
            queryParameters = queryParameters.set('transactionId', <any>transactionId);
        }
        if (md5 !== undefined && md5 !== null) {
            queryParameters = queryParameters.set('md5', <any>md5);
        }
        if (sha1 !== undefined && sha1 !== null) {
            queryParameters = queryParameters.set('sha1', <any>sha1);
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

        return this.httpClient.get<any>(`${this.basePath}/filetransfer/endUploadTransaction`,
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
     * @param transactionId 
     * @param data 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public sendChunk(sessionId?: string, transactionId?: number, data?: Array<string>, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public sendChunk(sessionId?: string, transactionId?: number, data?: Array<string>, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public sendChunk(sessionId?: string, transactionId?: number, data?: Array<string>, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public sendChunk(sessionId?: string, transactionId?: number, data?: Array<string>, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {




        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (transactionId !== undefined && transactionId !== null) {
            queryParameters = queryParameters.set('transactionId', <any>transactionId);
        }
        if (data) {
            data.forEach((element) => {
                queryParameters = queryParameters.append('data', <any>element);
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

        return this.httpClient.get<any>(`${this.basePath}/filetransfer/sendChunk`,
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
     * @param documentVersionId 
     * @param isCompressed 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public startDownloadTransaction(sessionId?: string, documentVersionId?: number, isCompressed?: boolean, observe?: 'body', reportProgress?: boolean): Observable<DataTransaction>;
    public startDownloadTransaction(sessionId?: string, documentVersionId?: number, isCompressed?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<DataTransaction>>;
    public startDownloadTransaction(sessionId?: string, documentVersionId?: number, isCompressed?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<DataTransaction>>;
    public startDownloadTransaction(sessionId?: string, documentVersionId?: number, isCompressed?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {




        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentVersionId !== undefined && documentVersionId !== null) {
            queryParameters = queryParameters.set('documentVersionId', <any>documentVersionId);
        }
        if (isCompressed !== undefined && isCompressed !== null) {
            queryParameters = queryParameters.set('isCompressed', <any>isCompressed);
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

        return this.httpClient.get<DataTransaction>(`${this.basePath}/filetransfer/startDownloadTransaction`,
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
     * @param isCompressed 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public startUploadTransaction(sessionId?: string, documentId?: number, isCompressed?: boolean, observe?: 'body', reportProgress?: boolean): Observable<DataTransaction>;
    public startUploadTransaction(sessionId?: string, documentId?: number, isCompressed?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<DataTransaction>>;
    public startUploadTransaction(sessionId?: string, documentId?: number, isCompressed?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<DataTransaction>>;
    public startUploadTransaction(sessionId?: string, documentId?: number, isCompressed?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {




        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (isCompressed !== undefined && isCompressed !== null) {
            queryParameters = queryParameters.set('isCompressed', <any>isCompressed);
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

        return this.httpClient.get<DataTransaction>(`${this.basePath}/filetransfer/startUploadTransaction`,
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
     * @param transactionId 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public uploadDocument(sessionId?: string, transactionId?: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public uploadDocument(sessionId?: string, transactionId?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public uploadDocument(sessionId?: string, transactionId?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public uploadDocument(sessionId?: string, transactionId?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (transactionId !== undefined && transactionId !== null) {
            queryParameters = queryParameters.set('transactionId', <any>transactionId);
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
            'multipart/form-data'
        ];

        return this.httpClient.post<any>(`${this.basePath}/filetransfer/uploadDocument`,
            null,
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
