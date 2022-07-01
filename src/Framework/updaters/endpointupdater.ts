import Debug from "debug";

import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IHelper } from "../interfaces/common/helper";
import { IEndpointHelper } from "../interfaces/helpers/endpointhelper";
import { IEndpointUpdater } from "../interfaces/updaters/endpointupdater";

export class EndpointUpdater implements IEndpointUpdater {

    private endpointHelper: IEndpointHelper;
    private helper: IHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;

    constructor(endpointHelper: IEndpointHelper, helper: IHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;

        this.endpointHelper = endpointHelper;
        this.helper = helper;

    }

    public async initialize(projectName: string, projectId: string): Promise<void> {

        const results = await this.endpointHelper.getServiceEndpoints(projectName);

        if (results.length === 0) {

            // Simply trying and failing to create new endpoint
            // Initializes required service endpoints capabilities
            const fakeEndpoint = await this.endpointHelper.fakeServiceEndpoint(projectName, projectId);

        }

    }

}
