import { IWorkHelper } from "./iworkhelper";
import { AzDevApiType, IAzDevClient } from "../common/iazdevclient";
import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";

export class WorkHelper implements IWorkHelper {

    private debugLogger: IDebug;

    private azdevClient: IAzDevClient;

    constructor(azdevClient: IAzDevClient, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.azdevClient = azdevClient;

    }

    public async getNodeIdentifier(projectId: string, type: string): Promise<string> {

        const debug = this.debugLogger.extend(this.getNodeIdentifier.name);

        const response: any = await this.azdevClient.get<any>(`${projectId}/_apis/wit/classificationnodes`, AzDevApiType.Core);
        const allNodes: any[] = response.value;

        if (!allNodes) {

            throw new Error("No nodes found");

        }

        const node: any = allNodes.filter((i) => i.structureType === type)[0];

        if (!node) {

            throw new Error(`Node <${type}> not found`);

        }

        const identifier: string = node.identifier;

        if (!identifier) {

            throw new Error(`Node <${type}> identifier not found`);

        }

        debug(`Node <${node.structureType}> identifier <${identifier}> found`);

        return identifier;

    }

}
