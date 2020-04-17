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

        const debug = this.debugLogger.extend(this.findTasks.name);

        const allTasks: TaskDefinition[] = await this.taskAgentApi.getTaskDefinitions();

        debug(`Found <${allTasks.length}> available tasks`);

        const filteredTasks: TaskDefinition[] = allTasks.filter((t) => t.name!.match(name));

        debug(`Filtered <${filteredTasks.length}> tasks matching <${name}> name`);

        for (const task of filteredTasks) {

            debug(`Task <${task.name}@${task.version?.major}> (${task.id}) found`);

        }

        return filteredTasks;

    }

}
