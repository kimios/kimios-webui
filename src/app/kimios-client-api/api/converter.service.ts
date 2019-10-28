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
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent }                           from '@angular/common/http';
import { CustomHttpUrlEncodingCodec }                        from '../encoder';

import { Observable }                                        from 'rxjs/Observable';


import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';
import { ConverterDescriptor } from '../model/converterDescriptor';


@Injectable()
export class ConverterService {

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
     * @param converterImpl 
     * @param outputFormat 
     * @param inline 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public convertDocument(sessionId?: string, documentId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public convertDocument(sessionId?: string, documentId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public convertDocument(sessionId?: string, documentId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public convertDocument(sessionId?: string, documentId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {






        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (converterImpl !== undefined && converterImpl !== null) {
            queryParameters = queryParameters.set('converterImpl', <any>converterImpl);
        }
        if (outputFormat !== undefined && outputFormat !== null) {
            queryParameters = queryParameters.set('outputFormat', <any>outputFormat);
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

        return this.httpClient.get<any>(`${this.basePath}/converter/convertDocument`,
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
     * @param outputFormat 
     * @param converterImpl 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public convertDocumentUrlOnly(sessionId?: string, documentId?: number, outputFormat?: string, converterImpl?: string, observe?: 'body', reportProgress?: boolean): Observable<string>;
    public convertDocumentUrlOnly(sessionId?: string, documentId?: number, outputFormat?: string, converterImpl?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<string>>;
    public convertDocumentUrlOnly(sessionId?: string, documentId?: number, outputFormat?: string, converterImpl?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<string>>;
    public convertDocumentUrlOnly(sessionId?: string, documentId?: number, outputFormat?: string, converterImpl?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {





        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId !== undefined && documentId !== null) {
            queryParameters = queryParameters.set('documentId', <any>documentId);
        }
        if (outputFormat !== undefined && outputFormat !== null) {
            queryParameters = queryParameters.set('outputFormat', <any>outputFormat);
        }
        if (converterImpl !== undefined && converterImpl !== null) {
            queryParameters = queryParameters.set('converterImpl', <any>converterImpl);
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

        return this.httpClient.get<string>(`${this.basePath}/converter/convertDocumentUrlOnly`,
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
     * @param versionId 
     * @param converterImpl 
     * @param outputFormat 
     * @param inline 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public convertDocumentVersion(sessionId?: string, versionId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public convertDocumentVersion(sessionId?: string, versionId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public convertDocumentVersion(sessionId?: string, versionId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public convertDocumentVersion(sessionId?: string, versionId?: number, converterImpl?: string, outputFormat?: string, inline?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {






        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (versionId !== undefined && versionId !== null) {
            queryParameters = queryParameters.set('versionId', <any>versionId);
        }
        if (converterImpl !== undefined && converterImpl !== null) {
            queryParameters = queryParameters.set('converterImpl', <any>converterImpl);
        }
        if (outputFormat !== undefined && outputFormat !== null) {
            queryParameters = queryParameters.set('outputFormat', <any>outputFormat);
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

        return this.httpClient.get<any>(`${this.basePath}/convertDocumentVersion`,
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
     * @param versionId 
     * @param converterImpl 
     * @param outputFormat 
     * @param inline 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public convertDocumentVersions(sessionId?: string, versionId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public convertDocumentVersions(sessionId?: string, versionId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public convertDocumentVersions(sessionId?: string, versionId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public convertDocumentVersions(sessionId?: string, versionId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {






        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (versionId) {
            versionId.forEach((element) => {
                queryParameters = queryParameters.append('versionId', <any>element);
            })
        }
        if (converterImpl !== undefined && converterImpl !== null) {
            queryParameters = queryParameters.set('converterImpl', <any>converterImpl);
        }
        if (outputFormat !== undefined && outputFormat !== null) {
            queryParameters = queryParameters.set('outputFormat', <any>outputFormat);
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

        return this.httpClient.get<any>(`${this.basePath}/convertDocumentVersions`,
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
     * @param converterImpl 
     * @param outputFormat 
     * @param inline 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public convertDocuments(sessionId?: string, documentId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public convertDocuments(sessionId?: string, documentId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public convertDocuments(sessionId?: string, documentId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public convertDocuments(sessionId?: string, documentId?: Array<number>, converterImpl?: string, outputFormat?: string, inline?: boolean, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {






        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (documentId) {
            documentId.forEach((element) => {
                queryParameters = queryParameters.append('documentId', <any>element);
            })
        }
        if (converterImpl !== undefined && converterImpl !== null) {
            queryParameters = queryParameters.set('converterImpl', <any>converterImpl);
        }
        if (outputFormat !== undefined && outputFormat !== null) {
            queryParameters = queryParameters.set('outputFormat', <any>outputFormat);
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

        return this.httpClient.get<any>(`${this.basePath}/convertDocuments`,
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
    public descriptors(sessionId?: string, observe?: 'body', reportProgress?: boolean): Observable<{ [key: string]: Array<ConverterDescriptor>; }>;
    public descriptors(sessionId?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<{ [key: string]: Array<ConverterDescriptor>; }>>;
    public descriptors(sessionId?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<{ [key: string]: Array<ConverterDescriptor>; }>>;
    public descriptors(sessionId?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


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

        return this.httpClient.get<{ [key: string]: Array<ConverterDescriptor>; }>(`${this.basePath}/descriptors`,
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
     * @param idpreview 
     * @param respath 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public previewPathSession(idpreview: string, respath: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public previewPathSession(idpreview: string, respath: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public previewPathSession(idpreview: string, respath: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public previewPathSession(idpreview: string, respath: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        if (idpreview === null || idpreview === undefined) {
            throw new Error('Required parameter idpreview was null or undefined when calling previewPathSession.');
        }

        if (respath === null || respath === undefined) {
            throw new Error('Required parameter respath was null or undefined when calling previewPathSession.');
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

        return this.httpClient.get<any>(`${this.basePath}/preview/p/${encodeURIComponent(String(idpreview))}/${encodeURIComponent(String(respath))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
