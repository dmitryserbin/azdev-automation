import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IProject, IProjectPermission } from "../readers/configurationreader";

export interface IProjectUpdater {

    getProject(name: string): Promise<TeamProject>;
    getProjects(name: string): Promise<TeamProject[]>;
    createProject(project: IProject): Promise<TeamProject>;
    updateProject(project: IProject): Promise<TeamProject>;
    updatePermissions(project: TeamProject, policy: IProjectPermission): Promise<void>;

}
