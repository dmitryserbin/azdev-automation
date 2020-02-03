import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IProject, IProjectPermission, IPermission } from "./configurationreader";
import { IGraphHelper } from "./graphhelper";
import { IProjectHelper } from "./projecthelper";
import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

export interface IProjectUpdater {

    projectHelper: IProjectHelper;
    graphHelper: IGraphHelper;

    getProject(name: string): Promise<TeamProject>;
    createProject(project: IProject): Promise<TeamProject>;
    updateProject(project: IProject): Promise<TeamProject>;
    updateGroupPermissions(projectName: string, group: GraphGroup, permissions: IPermission[]): Promise<void>;
    updateGroupMembers(members: string[], group: GraphGroup): Promise<void>;
    updatePermissions(project: TeamProject, policy: IProjectPermission): Promise<void>;

}
