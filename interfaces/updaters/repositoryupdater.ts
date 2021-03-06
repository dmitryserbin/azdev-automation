import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IBuildPermission } from "../readers/configurationreader";

export interface IRepositoryUpdater {

    updatePermissions(project: TeamProject, policy: IBuildPermission): Promise<void>;

}
