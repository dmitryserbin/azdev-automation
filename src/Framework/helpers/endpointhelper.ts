import Debug from "debug";

import { ICoreApi } from "azure-devops-node-api/CoreApi";

import { IAzDevClient } from "../interfaces/common/azdevclient";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IEndpointHelper } from "../interfaces/helpers/endpointhelper";

export class EndpointHelper implements IEndpointHelper {

    private azdevClient: IAzDevClient;
    private coreApi: ICoreApi;
    private debugLogger: Debug.Debugger;

    constructor(coreApi: ICoreApi, azdevClient: IAzDevClient, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.azdevClient = azdevClient;
        this.coreApi = coreApi;

    }

}
