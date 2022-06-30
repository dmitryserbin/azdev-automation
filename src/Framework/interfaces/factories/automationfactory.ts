import { IBuildUpdater } from "../updaters/buildupdater";
import { IEndpointUpdater } from "../updaters/endpointupdater";
import { IProjectUpdater } from "../updaters/projectupdater";
import { IReleaseUpdater } from "../updaters/releaseupdater";
import { IRepositoryUpdater } from "../updaters/repositoryupdater";

export interface IAutomationFactory {

    createProjectUpdater(): Promise<IProjectUpdater>;
    createBuildUpdater(): Promise<IBuildUpdater>;
    createReleaseUpdater(): Promise<IReleaseUpdater>;
    createRepositoryUpdater(): Promise<IRepositoryUpdater>;
    createWorkUpdater(): Promise<IRepositoryUpdater>;
    createEndpointUpdater(): Promise<IEndpointUpdater>;

}
