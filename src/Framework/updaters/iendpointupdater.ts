export interface IEndpointUpdater {

    initialize(projectName: string, projectId: string): Promise<void>;

}
