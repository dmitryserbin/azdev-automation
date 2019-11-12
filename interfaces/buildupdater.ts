import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { IBuildPermission } from "./configurationreader";

export interface IBuildUpdater {

    updatePermissions(project: TeamProject, policy: IBuildPermission): Promise<void>;

}
