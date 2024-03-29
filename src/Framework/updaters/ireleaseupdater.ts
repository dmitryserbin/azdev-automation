import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IReleasePermission, ITask } from "../readers/iconfigurationreader";

export interface IReleaseUpdater {

    initialize(projectName: string): Promise<void>;
    removeDefinitionsArtifact(projectName: string, artifactName: string, artifactType: string, mock?: boolean): Promise<void>;
    removeDefinitionsTasks(name: string, projectName: string, task: ITask, mock?: boolean): Promise<void>;
    updateDefinitionsTasks(name: string, projectName: string, task: ITask, releases?: boolean, mock?: boolean): Promise<void>;
    updatePermissions(project: TeamProject, policy: IReleasePermission): Promise<void>;

}
