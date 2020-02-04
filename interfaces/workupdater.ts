import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IWorkPermission } from "./configurationreader";

export interface IWorkUpdater {

    updatePermissions(project: TeamProject, policy: IWorkPermission): Promise<void>;

}
