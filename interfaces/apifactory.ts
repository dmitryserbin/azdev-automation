import * as ba from "azure-devops-node-api/BuildApi";
import * as ca from "azure-devops-node-api/CoreApi";
import * as ga from "azure-devops-node-api/GitApi";
import * as ra from "azure-devops-node-api/ReleaseApi";
import * as sa from "azure-devops-node-api/SecurityRolesApi";
import * as ta from "azure-devops-node-api/TaskAgentApi";
import * as vc from "azure-devops-node-api/VsoClient";

export interface IApiFactory {

    createCoreApi(): Promise<ca.CoreApi>;
    createReleaseApi(): Promise<ra.ReleaseApi>;
    createBuildApi(): Promise<ba.BuildApi>;
    createGitApi(): Promise<ga.GitApi>;
    createTaskAgentApi(): Promise<ta.ITaskAgentApi>;
    createSecurityRolesApi(): Promise<sa.ISecurityRolesApi>;
    createVsoClient(): Promise<vc.VsoClient>;

}
