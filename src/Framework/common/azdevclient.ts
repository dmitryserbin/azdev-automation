import { IRequestOptions, IRestResponse, RestClient } from "typed-rest-client/RestClient";

import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { AzDevApiType, IAzDevClient } from "./iazdevclient";
import { Retryable } from "./retry";

export class AzDevClient implements IAzDevClient {

    private debugLogger: IDebug;

    private client: RestClient;
    private apiType: AzDevApiType;
    private accountName: string;

    constructor(client: RestClient, apiType: AzDevApiType, accountName: string, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.client = client;
        this.apiType = apiType;
        this.accountName = accountName;

    }

    @Retryable()
    public async get<T>(path: string, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.get.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const response: IRestResponse<any> = await this.client.get(url);

        return response.result;

    }

    @Retryable()
    public async post<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.post.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: IRestResponse<any> = await this.client.create(url, body, requestOptions);

        return response.result;

    }

    public async postNoRetry<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.post.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: IRestResponse<any> = await this.client.create(url, body, requestOptions);

        return response.result;

    }

    @Retryable()
    public async patch<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.patch.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: IRestResponse<any> = await this.client.update(url, body, requestOptions);

        return response.result;

    }

    @Retryable()
    public async put<T>(path: string, apiVersion?: string, body?: any, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.put.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: IRestResponse<any> = await this.client.replace(url, body, requestOptions);

        return response.result;

    }

    @Retryable()
    public async delete<T>(path: string, apiVersion?: string, type: AzDevApiType = this.apiType): Promise<T> {

        const debug = this.debugLogger.extend(this.delete.name);

        const url: string = this.newUrl(path, type);

        debug(url);

        const requestOptions: IRequestOptions = {};

        if (apiVersion) {

            requestOptions.acceptHeader = `api-version=${apiVersion}`;

        }

        const response: IRestResponse<any> = await this.client.del(url, requestOptions);

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
