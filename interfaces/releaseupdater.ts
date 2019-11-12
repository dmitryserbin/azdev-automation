import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IReleasePermission, ITask } from "./configurationreader";
import { IReleaseHelper } from "./releasehelper";
import { ITaskAgentHelper } from "./taskagenthelper";

export interface IReleaseUpdater {

    releaseHelper: IReleaseHelper;
    taskAgentHelper: ITaskAgentHelper;

    removeDefinitionArtifact(projectName: string, artifactName: string, artifactType: string, mock?: boolean): Promise<void>;
    removeDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void>;
    updateDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void>;
    updatePermissions(project: TeamProject, policy: IReleasePermission): Promise<void>;

}
