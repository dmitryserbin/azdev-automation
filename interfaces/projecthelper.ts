import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, ProjectVisibility, TeamProject, TeamProjectReference } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

export interface IProjectHelper {

    createProject(name: string, description: string, processTemplate: Process, sourceControlType: string, visibility: ProjectVisibility): Promise<OperationReference>;
    updateProject(project: TeamProject): Promise<void>;
    findProject(name: string): Promise<TeamProject>;
    findProjects(nameFilter?: string): Promise<TeamProjectReference[]>;
    getProjectGroup(name: string, projectId: string): Promise<GraphGroup>;
    getProjectGroups(projectId: string): Promise<GraphGroup[]>;
    createProjectGroup(name: string, description: string, projectId: string): Promise<GraphGroup>;
    getDefaultTemplate(): Promise<Process>;

}
