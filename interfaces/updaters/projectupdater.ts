import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IProject, IProjectPermission } from "../readers/configurationreader";
import { IGraphHelper } from "../helpers/graphhelper";
import { IProjectHelper } from "../helpers/projecthelper";

export interface IProjectUpdater {

    projectHelper: IProjectHelper;
    graphHelper: IGraphHelper;

    getProject(name: string): Promise<TeamProject>;
    createProject(project: IProject): Promise<TeamProject>;
    updateProject(project: IProject): Promise<TeamProject>;
    updatePermissions(project: TeamProject, policy: IProjectPermission): Promise<void>;

}
