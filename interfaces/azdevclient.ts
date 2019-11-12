export interface IAzDevClient {

    get<T>(path: string, type?: AzDevApiType): Promise<T>;
    post<T>(path: string, apiVersion?: string, body?: any, type?: AzDevApiType): Promise<T>;
    patch<T>(path: string, apiVersion?: string, body?: any, type?: AzDevApiType): Promise<T>;
    put<T>(path: string, apiVersion?: string, body?: any, type?: AzDevApiType): Promise<T>;
    delete<T>(path: string, apiVersion?: string, type?: AzDevApiType): Promise<T>;

}

export enum AzDevApiType {

    Core = "dev",
    Graph = "vssps.dev",

}
