import { ITaskAgentApi } from "azure-devops-node-api/TaskAgentApi";
import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

import { ITaskAgentHelper } from "./itaskagenthelper";
import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";

export class TaskAgentHelper implements ITaskAgentHelper {

    private debugLogger: IDebug;

    private taskAgentApi: ITaskAgentApi;

    constructor(taskAgentApi: ITaskAgentApi, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

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
