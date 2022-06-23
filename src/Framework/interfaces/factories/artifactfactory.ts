export interface IConfigArtifact {

    path: string;
    schema: string;

}

export interface IArtifactFactory {

    configuration: IConfigArtifact;
    projectPermissions: IConfigArtifact;
    repositoryPermissions: IConfigArtifact;
    buildPermissions: IConfigArtifact;
    releasePermissions: IConfigArtifact;
    workPermissions: IConfigArtifact;

}
