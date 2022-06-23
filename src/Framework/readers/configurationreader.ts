import Ajv, { ValidateFunction } from "ajv";
import Debug from "debug";
import { readFileSync } from "fs";

import { IArtifactFactory, IConfigArtifact } from "../interfaces/factories/artifactfactory";
import { IBuildPermission, IConfigurationReader, IProject, IProjectPermission, IReleasePermission, IRepositoryPermission, IWorkPermission } from "../interfaces/readers/configurationreader";
import { IDebugLogger } from "../interfaces/common/debuglogger";

export class ConfigurationReader implements IConfigurationReader {

    private artifactFactory: IArtifactFactory;
    private debugLogger: Debug.Debugger;

    constructor(artifactFactory: IArtifactFactory, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.artifactFactory = artifactFactory;

    }

    public async read(): Promise<IProject[]> {

        const debug = this.debugLogger.extend(this.read.name);

        // Read artifacts
        const projects: IProject[] = await this.parse<IProject[]>(this.artifactFactory.configuration);
        const projectPermissions: IProjectPermission[] = await this.parse<IProjectPermission[]>(this.artifactFactory.projectPermissions);
        const buildPermissions: IBuildPermission[] = await this.parse<IBuildPermission[]>(this.artifactFactory.buildPermissions);
        const releasePermissions: IReleasePermission[] = await this.parse<IReleasePermission[]>(this.artifactFactory.releasePermissions);
        const repositoryPermissions: IRepositoryPermission[] = await this.parse<IRepositoryPermission[]>(this.artifactFactory.repositoryPermissions);
        const workPermissions: IWorkPermission[] = await this.parse<IWorkPermission[]>(this.artifactFactory.workPermissions);

        for (const project of projects) {

            debug(`Reading <${project.name}> project configuration`);

            if (project.permissions.project) {

                const policyName: string = project.permissions.project.toString();
                project.permissions.project = this.getProjectPermission(policyName, projectPermissions);

            }

            if (project.permissions.build) {

                const policyName: string = project.permissions.build.toString();
                project.permissions.build = this.getBuildPermission(policyName, buildPermissions);

            }

            if (project.permissions.release) {

                const policyName: string = project.permissions.release.toString();
                project.permissions.release = this.getReleasePermission(policyName, releasePermissions);

            }

            if (project.permissions.repository) {

                const policyName: string = project.permissions.repository.toString();
                project.permissions.repository = this.getRepositoryPermission(policyName, repositoryPermissions);

            }

            if (project.permissions.work) {

                const policyName: string = project.permissions.work.toString();
                project.permissions.work = this.getWorkPermission(policyName, workPermissions);

            }

        }

        debug(projects);

        return projects;

    }

    private async parse<T>(config: IConfigArtifact): Promise<T> {

        const debug = this.debugLogger.extend(this.parse.name);

        const validator: ValidateFunction = await this.readSchema(config.schema);
        const result: T = await this.readJson<T>(config.path);
        const valid: boolean = await validator(result);

        if (!valid) {

            throw new Error(`Invalid JSON schema: ${validator.errors}`);

        }

        return result;

    }

    private async readSchema(path: string): Promise<ValidateFunction> {

        const debug = this.debugLogger.extend(this.readSchema.name);

        debug(`Reading <${path}> schema`);

        const validator = new Ajv({ allErrors: true });
        const json: string = readFileSync(path, "utf8");
        const schema: object = JSON.parse(json);

        return validator.compile(schema);

    }

    private async readJson<T>(path: string) {

        const debug = this.debugLogger.extend(this.readJson.name);

        debug(`Reading <${path}> file`);

        const json: string = readFileSync(path, "utf8");
        const result: T = JSON.parse(json);

        return result;

    }

    private getProjectPermission(name: string, policies: IProjectPermission[]): IProjectPermission {

        const result = policies.filter((p) => p.name === name);

        if (!result.length) {

            throw new Error(`Project permissions policy <${name}> not found`);

        }

        return result[0];

    }

    private getBuildPermission(name: string, policies: IBuildPermission[]): IBuildPermission {

        const result = policies.filter((p) => p.name === name);

        if (!result.length) {

            throw new Error(`Build permissions policy <${name}> not found`);

        }

        return result[0];

    }

    private getReleasePermission(name: string, policies: IReleasePermission[]): IReleasePermission {

        const result = policies.filter((p) => p.name === name);

        if (!result.length) {

            throw new Error(`Release permissions policy <${name}> not found`);

        }

        return result[0];

    }

    private getRepositoryPermission(name: string, policies: IRepositoryPermission[]): IRepositoryPermission {

        const result = policies.filter((p) => p.name === name);

        if (!result.length) {

            throw new Error(`Repository permissions policy <${name}> not found`);

        }

        return result[0];

    }

    private getWorkPermission(name: string, policies: IWorkPermission[]): IWorkPermission {

        const result = policies.filter((p) => p.name === name);

        if (!result.length) {

            throw new Error(`Work permissions policy <${name}> not found`);

        }

        return result[0];

    }

}
