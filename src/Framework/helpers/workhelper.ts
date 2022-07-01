import Debug from "debug";

import { IDebugLogger } from "../loggers/idebuglogger";
import { IWorkHelper } from "./iworkhelper";
import { AzDevApiType, IAzDevClient } from "../common/iazdevclient";

export class WorkHelper implements IWorkHelper {

    private azdevClient: IAzDevClient;
    private debugLogger: Debug.Debugger;

    constructor(azdevClient: IAzDevClient, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

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
