import { GraphGroup, GraphMember, GraphMembership } from "azure-devops-node-api/interfaces/GraphInterfaces";

export interface IGraphHelper {

    findIdentity(name: string): Promise<IGraphIdentity>;
    getIdentityMembership(group: GraphGroup, identity: IGraphIdentity): Promise<GraphMembership>;
    addIdentityMembership(group: GraphGroup, identity: IGraphIdentity): Promise<GraphMembership>;
    getGroupMemberships(group: GraphGroup): Promise<GraphMembership[]>;
    removeGroupMembership(group: GraphGroup, member: GraphMembership): Promise<void>;
    addGroupMemberships(group: GraphGroup, members: string[]): Promise<GraphMembership[]>;
    removeGroupMemberships(group: GraphGroup, memberships: GraphMembership[]): Promise<void>;
    getObsoleteGroupMemberships(group: GraphGroup, validMemberships: GraphMembership[]): Promise<GraphMembership[]>;

}

export interface IGraphIdentity {

    entityId?: string;
    entityType?: string;
    originDirectory?: string;
    originId?: string;
    localDirectory?: string;
    localId?: string;
    displayName?: string;
    scopeName?: string;
    samAccountName?: string;
    active?: boolean;
    subjectDescriptor?: string;
    mail?: string;
    mailNickname?: string;
    guest?: boolean;
    isMru?: boolean;

}
