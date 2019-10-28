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

import { Rule } from '../model/rule';
import { RuleBean } from '../model/ruleBean';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';


@Injectable()
export class RuleService {

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
     * @param conditionJavaClass 
     * @param path 
     * @param ruleName 
     * @param xmlStream 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createRule(sessionId?: string, conditionJavaClass?: string, path?: string, ruleName?: string, xmlStream?: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public createRule(sessionId?: string, conditionJavaClass?: string, path?: string, ruleName?: string, xmlStream?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public createRule(sessionId?: string, conditionJavaClass?: string, path?: string, ruleName?: string, xmlStream?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public createRule(sessionId?: string, conditionJavaClass?: string, path?: string, ruleName?: string, xmlStream?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {






        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (conditionJavaClass !== undefined && conditionJavaClass !== null) {
            queryParameters = queryParameters.set('conditionJavaClass', <any>conditionJavaClass);
        }
        if (path !== undefined && path !== null) {
            queryParameters = queryParameters.set('path', <any>path);
        }
        if (ruleName !== undefined && ruleName !== null) {
            queryParameters = queryParameters.set('ruleName', <any>ruleName);
        }
        if (xmlStream !== undefined && xmlStream !== null) {
            queryParameters = queryParameters.set('xmlStream', <any>xmlStream);
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

        return this.httpClient.get<any>(`${this.basePath}/rule/createRule`,
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
    public getAvailablesRules(sessionId?: string, observe?: 'body', reportProgress?: boolean): Observable<Array<string>>;
    public getAvailablesRules(sessionId?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<string>>>;
    public getAvailablesRules(sessionId?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<string>>>;
    public getAvailablesRules(sessionId?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {


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

        return this.httpClient.get<Array<string>>(`${this.basePath}/rule/getAvailablesRules`,
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
    public getBeans(observe?: 'body', reportProgress?: boolean): Observable<Array<RuleBean>>;
    public getBeans(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<RuleBean>>>;
    public getBeans(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<RuleBean>>>;
    public getBeans(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

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

        return this.httpClient.get<Array<RuleBean>>(`${this.basePath}/rule/getBeans`,
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
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getRuleItems(observe?: 'body', reportProgress?: boolean): Observable<Array<Rule>>;
    public getRuleItems(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<Rule>>>;
    public getRuleItems(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<Rule>>>;
    public getRuleItems(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

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

        return this.httpClient.get<Array<Rule>>(`${this.basePath}/rule/getRuleItems`,
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
     * @param javaClassName 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getRuleParam(sessionId?: string, javaClassName?: string, observe?: 'body', reportProgress?: boolean): Observable<string>;
    public getRuleParam(sessionId?: string, javaClassName?: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<string>>;
    public getRuleParam(sessionId?: string, javaClassName?: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<string>>;
    public getRuleParam(sessionId?: string, javaClassName?: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (sessionId !== undefined && sessionId !== null) {
            queryParameters = queryParameters.set('sessionId', <any>sessionId);
        }
        if (javaClassName !== undefined && javaClassName !== null) {
            queryParameters = queryParameters.set('javaClassName', <any>javaClassName);
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

        return this.httpClient.get<string>(`${this.basePath}/rule/getRuleParam`,
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
    public sendList(observe?: 'body', reportProgress?: boolean): Observable<any>;
    public sendList(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public sendList(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public sendList(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

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

        return this.httpClient.get<any>(`${this.basePath}/rule/sendList`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
