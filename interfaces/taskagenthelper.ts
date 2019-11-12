import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

export interface ITaskAgentHelper {

    findTasks(name: string): Promise<TaskDefinition[]>;

}
