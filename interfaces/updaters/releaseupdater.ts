import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IReleasePermission, ITask } from "../readers/configurationreader";

export interface IReleaseUpdater {

    removeDefinitionArtifact(projectName: string, artifactName: string, artifactType: string, mock?: boolean): Promise<void>;
    removeDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void>;
    updateDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void>;
    updatePermissions(project: TeamProject, policy: IReleasePermission): Promise<void>;

}
