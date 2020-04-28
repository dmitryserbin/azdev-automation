export interface IConfigurationReader {

    read(): Promise<IProject[]>;

}

export interface IProject {

    name: string;
    description: string;
    permissions: {
        project: IProjectPermission;
        build: IBuildPermission;
        release: IReleasePermission;
        repository: IRepositoryPermission;
        work: IWorkPermission;
    };

}

export interface IProjectPermission {

    name: string;
    definition: IGroupMembership[];

}

export interface IBuildPermission {

    name: string;
    definition: IGroupPermission[];

}

export interface IReleasePermission {

    name: string;
    definition: IGroupPermission[];

}

export interface IRepositoryPermission {

    name: string;
    definition: IGroupPermission[];

}

export interface IWorkPermission {

    name: string;
    definition: IGroupPermission[];

}

export interface IGroupMembership {

    name: string;
    members: string[];
    permissions: IPermission[];

}

export interface IGroupPermission {

    name: string;
    permissions: IPermission[];

}

export interface IPermission {

    name: string;
    type: PermissionType;

}

export interface IArtifact {

    name: string;
    type: string;

}

export interface ITask {

    name: string;
    parameters?: { [name: string]: any };
    filter?: { [name: string]: any };

}

export enum PermissionType {

    NotSet,
    Allow,
    Deny,

}
