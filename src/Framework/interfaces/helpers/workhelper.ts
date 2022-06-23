export interface IWorkHelper {

    getNodeIdentifier(projectId: string, type: string): Promise<string>;

}
