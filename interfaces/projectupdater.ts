import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IProject, IProjectPermission } from "./configurationreader";
import { IGraphHelper } from "./graphhelper";
import { IProjectHelper } from "./projecthelper";

export interface IProjectUpdater {

    projectHelper: IProjectHelper;
    graphHelper: IGraphHelper;

    getProject(name: string): Promise<TeamProject>;
    createProject(project: IProject): Promise<TeamProject>;
    updateProject(project: IProject): Promise<TeamProject>;
    updatePermissions(project: TeamProject, policy: IProjectPermission): Promise<void>;

}
