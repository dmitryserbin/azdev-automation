import { IBuildUpdater } from "../updaters/ibuildupdater";
import { IEndpointUpdater } from "../updaters/iendpointupdater";
import { IProjectUpdater } from "../updaters/iprojectupdater";
import { IReleaseUpdater } from "../updaters/ireleaseupdater";
import { IRepositoryUpdater } from "../updaters/irepositoryupdater";

export interface IAutomationFactory {

    createProjectUpdater(): Promise<IProjectUpdater>;
    createBuildUpdater(): Promise<IBuildUpdater>;
    createReleaseUpdater(): Promise<IReleaseUpdater>;
    createRepositoryUpdater(): Promise<IRepositoryUpdater>;
    createWorkUpdater(): Promise<IRepositoryUpdater>;
    createEndpointUpdater(): Promise<IEndpointUpdater>;

}
