import { BuildApi } from "azure-devops-node-api/BuildApi";
import { CoreApi } from "azure-devops-node-api/CoreApi";
import { GitApi } from "azure-devops-node-api/GitApi";
import { ReleaseApi } from "azure-devops-node-api/ReleaseApi";
import { ISecurityRolesApi } from "azure-devops-node-api/SecurityRolesApi";
import { ITaskAgentApi } from "azure-devops-node-api/TaskAgentApi";
import { VsoClient } from "azure-devops-node-api/VsoClient";

export interface IApiFactory {

    createCoreApi(): Promise<CoreApi>;
    createReleaseApi(): Promise<ReleaseApi>;
    createBuildApi(): Promise<BuildApi>;
    createGitApi(): Promise<GitApi>;
    createTaskAgentApi(): Promise<ITaskAgentApi>;
    createSecurityRolesApi(): Promise<ISecurityRolesApi>;
    createVsoClient(): Promise<VsoClient>;

}
