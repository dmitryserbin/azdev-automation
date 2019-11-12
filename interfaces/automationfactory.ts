import { IBuildUpdater } from "./buildupdater";
import { IProjectUpdater } from "./projectupdater";
import { IReleaseUpdater } from "./releaseupdater";
import { IRepositoryUpdater } from "./repositoryupdater";

export interface IAutomationFactory {

    createProjectUpdater(): Promise<IProjectUpdater>;
    createReleaseUpdater(): Promise<IReleaseUpdater>;
    createBuildUpdater(): Promise<IBuildUpdater>;
    createRepositoryUpdater(): Promise<IRepositoryUpdater>;

}
