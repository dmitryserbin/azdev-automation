import { join } from "path";

import { IArtifactFactory, IConfigArtifact } from "../interfaces/factories/artifactfactory";

export class ArtifactFactory implements IArtifactFactory {

    public configuration: IConfigArtifact;
    public projectPermissions: IConfigArtifact;
    public buildPermissions: IConfigArtifact;
    public releasePermissions: IConfigArtifact;
    public repositoryPermissions: IConfigArtifact;
    public workPermissions: IConfigArtifact;

    constructor(config: string, policies: string, schemas: string) {

        this.configuration = { path: config, schema: join(schemas, "configuration.json") };
        this.projectPermissions = { path: join(policies, "projectPermissions.json"), schema: join(schemas, "projectPermissions.json") };
        this.buildPermissions = { path: join(policies, "buildPermissions.json"), schema: join(schemas, "buildPermissions.json") };
        this.releasePermissions = { path: join(policies, "releasePermissions.json"), schema: join(schemas, "releasePermissions.json") };
        this.repositoryPermissions = { path: join(policies, "repositoryPermissions.json"), schema: join(schemas, "repositoryPermissions.json") };
        this.workPermissions = { path: join(policies, "workPermissions.json"), schema: join(schemas, "workPermissions.json") };

    }

}
