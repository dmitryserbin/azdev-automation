import { ICommonHelper } from "../helpers/icommonhelper";
import { IEndpointHelper } from "../helpers/iendpointhelper";
import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { IEndpointUpdater } from "./iendpointupdater";

export class EndpointUpdater implements IEndpointUpdater {

    private logger: ILogger;
    private debugLogger: IDebug;

    private endpointHelper: IEndpointHelper;
    private commonHelper: ICommonHelper;

    constructor(endpointHelper: IEndpointHelper, commonHelper: ICommonHelper, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.endpointHelper = endpointHelper;
        this.commonHelper = commonHelper;

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
