// tslint:disable-next-line:no-empty-interface
export interface IWorkHelper {

    getNodeIdentifier(projectId: string, type: string): Promise<string>;

}
