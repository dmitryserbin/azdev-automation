export interface IEndpointHelper {

    getServiceEndpoints(projectName: string): Promise<any[]>;
    createGenericServiceEndpoint(name: string, url: string, description: string, projectName: string, projectId: string): Promise<any>;
    fakeServiceEndpoint(projectName: string, projectId: string): Promise<void>;

}
