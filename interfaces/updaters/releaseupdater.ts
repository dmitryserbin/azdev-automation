import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IReleasePermission, ITask } from "../readers/configurationreader";
import { IReleaseHelper } from "../helpers/releasehelper";
import { ITaskAgentHelper } from "../helpers/taskagenthelper";

export interface IReleaseUpdater {

    releaseHelper: IReleaseHelper;
    taskAgentHelper: ITaskAgentHelper;

    removeDefinitionArtifact(projectName: string, artifactName: string, artifactType: string, mock?: boolean): Promise<void>;
    removeDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void>;
    updateDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void>;
    updatePermissions(project: TeamProject, policy: IReleasePermission): Promise<void>;

}
