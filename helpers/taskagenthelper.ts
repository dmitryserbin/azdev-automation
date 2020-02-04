import Debug from "debug";

import * as ta from "azure-devops-node-api/TaskAgentApi";

import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { ITaskAgentHelper } from "../interfaces/helpers/taskagenthelper";

export class TaskAgentHelper implements ITaskAgentHelper {

    private taskAgentApi: ta.ITaskAgentApi;
    private debugLogger: Debug.Debugger;

    constructor(taskAgentApi: ta.ITaskAgentApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.taskAgentApi = taskAgentApi;

    }

    public async findTasks(name: string): Promise<TaskDefinition[]> {

        const debug = this.debugLogger.extend("findTasks");

        const allTasks: TaskDefinition[] = await this.taskAgentApi.getTaskDefinitions();

        debug(`Found total ${allTasks.length} tasks`);

        const filteredTasks: TaskDefinition[] = allTasks.filter((t) => t.name!.match(name));

        debug(`Filtered ${filteredTasks.length} tasks by ${name} name`);

        return filteredTasks;

    }

}
