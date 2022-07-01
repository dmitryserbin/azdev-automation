import Debug from "debug";

import { IAzDevClient } from "../interfaces/common/azdevclient";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IEndpointHelper } from "../interfaces/helpers/endpointhelper";

export class EndpointHelper implements IEndpointHelper {

    private azdevClient: IAzDevClient;
    private debugLogger: Debug.Debugger;

    constructor(azdevClient: IAzDevClient, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.azdevClient = azdevClient;

    }

    public async getServiceEndpoints(projectName: string): Promise<any[]> {

        const debug = this.debugLogger.extend(this.getServiceEndpoints.name);

        let results: any[] = [];

        const existingServiceEndpoints: any = await this.azdevClient.get<any>(`${projectName}/_apis/serviceendpoint/endpoints`);

        if (existingServiceEndpoints || existingServiceEndpoints.value.length !== 0) {

            results = existingServiceEndpoints.value;

        }

        debug(`Found <${projectName}> project <${results.length}> service connection(s)`);

        return results;

    }

    public async createGenericServiceEndpoint(name: string, url: string, description: string, projectName: string, projectId: string): Promise<any> {

        const debug = this.debugLogger.extend(this.createGenericServiceEndpoint.name);

        const body: any = {

            name,
            description,
            type: "generic",
            url,
            authorization: {
                parameters: {
                    username: "",
                    password: "",
                },
                scheme: "UsernamePassword",
            },
            isShared: false,
            isReady: true,
            serviceEndpointProjectReferences: [
                {
                    projectReference: {
                        name: projectName,
                        id: projectId,
                    },
                    name,
                },
            ],

        };

        const result: any = await this.azdevClient.post<any>("_apis/serviceendpoint/endpoints", "7.1-preview.4", body);

        debug(result);

        return result;

    }

    public async fakeServiceEndpoint(projectName: string, projectId: string): Promise<void> {

        const debug = this.debugLogger.extend(this.fakeServiceEndpoint.name);

        const body: any = {

            name: "",
            description: "",
            type: "generic",
            url: "",
            authorization: {
                parameters: {
                    username: "",
                    password: "",
                },
                scheme: "UsernamePassword",
            },
            isShared: false,
            isReady: true,
            serviceEndpointProjectReferences: [
                {
                    projectReference: {
                        name: projectName,
                        id: projectId,
                    },
                    name: "",
                },
            ],

        };

        try {

            const result: any = await this.azdevClient.postNoRetry<any>("_apis/serviceendpoint/endpoints", "7.1-preview.4", body);

        } catch {

            debug("Must have initialized fake service endpoint");

        }

    }

}
