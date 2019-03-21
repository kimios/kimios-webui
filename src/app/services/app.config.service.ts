import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {throwError} from 'rxjs';

@Injectable()
export class AppConfig {

    private config: Object = null;
    private env:    Object = null;

    constructor(
        private http: HttpClient,
    ) {

    }

    /**
     * Use to get the data found in the second file (config file)
     */
    public getConfig(key: any): string {
        return this.config[key];
    }

    /**
     * Use to get the data found in the first file (env file)
     */
    public getEnv(key: any): string {
        return this.env[key];
    }

    /**
     * This method:
     *   a) Loads "env.json" to get the current working environment (e.g.: 'production', 'development')
     *   b) Loads "config.[env].json" to get all env's variables (e.g.: 'config.development.json')
     */
    public load(data: Object): any {
        this.config = data;

        /*const data = require('assets/app-config/env.json') || {};

        if (data['env'] != null) {
            this.env = data['env'];
            const envData = require('assets/app-config/env.' + this.env + '.json') || {};

            console.log(envData);

            this.config = envData;
        } else {
            console.log('fail to load app config');
        }*/
    }
}
