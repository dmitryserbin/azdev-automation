import Debug from "debug";

import * as rc from "typed-rest-client/RestClient";

import { AzDevApiType, IAzDevClient } from "../interfaces/common/azdevclient";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { Retryable } from "./retry";

export class AzDevClient implements IAzDevClient {

    private client: rc.RestClient;
    private apiType: AzDevApiType;
    private accountName: string;
    private debugLogger: Debug.Debugger;

    constructor(client: rc.RestClient, apiType: AzDevApiType, accountName: string, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.client = client;
        this.apiType = apiType;
        this.accountName = accountName;

    }

    @Retryable()
    public async get<T>(path: string, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.get.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const response: rc.IRestResponse<any> = await this.client.get(url);

        return response.result;

    }

    @Retryable()
    public async post<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.post.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: rc.IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: rc.IRestResponse<any> = await this.client.create(url, body, requestOptions);

        return response.result;

    }

    public async postNoRetry<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.post.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: rc.IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: rc.IRestResponse<any> = await this.client.create(url, body, requestOptions);

        return response.result;

    }

    @Retryable()
    public async patch<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.patch.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: rc.IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: rc.IRestResponse<any> = await this.client.update(url, body, requestOptions);

        return response.result;

    }

    @Retryable()
    public async put<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.put.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: rc.IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: rc.IRestResponse<any> = await this.client.replace(url, body, requestOptions);

        return response.result;

    }

    @Retryable()
    public async delete<T>(path: string, apiVersion?: string, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.delete.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: rc.IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: rc.IRestResponse<any> = await this.client.del(url, requestOptions);

        return response.result;

    }

    private newUrl(path: string, type: AzDevApiType): string {

        const debug = this.debugLogger.extend(this.newUrl.name);

        const prefix: string = type.toString();
        const base = `https://${prefix}.azure.com`;
        const suffix = `${this.accountName}/${path}`;
        const url = `${base}${suffix}`;

        return url;

    }

}
