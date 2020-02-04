import Debug from "debug";

import { GraphGroup, GraphMember, GraphMembership } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { AzDevApiType, IAzDevClient } from "../interfaces/common/azdevclient";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IGraphHelper, IGraphIdentity } from "../interfaces/helpers/graphhelper";
import { IHelper } from "../interfaces/common/helper";

export class GraphHelper implements IGraphHelper {

    private azdevClient: IAzDevClient;
    private debugLogger: Debug.Debugger;
    private helper: IHelper;

    constructor(azdevClient: IAzDevClient, debugLogger: IDebugLogger, helper: IHelper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.helper = helper;

        this.azdevClient = azdevClient;

    }

    public async findIdentity(name: string): Promise<IGraphIdentity> {

        const debug = this.debugLogger.extend("findIdentity");

        debug(`Attempting to find <${name}> identity`);

        let targetIdentity: IGraphIdentity;

        const searchRequest: any = {
            query: name,
            identityTypes: [
                "user",
                "group",
            ],
            operationScopes: [
                "ims",
                "source",
            ],
            properties: [
                "DisplayName",
                "IsMru",
                "ScopeName",
                "SamAccountName",
                "Active",
                "SubjectDescriptor",
                "SignInAddress",
                "Surname",
                "Description",
            ],
            options: {
                MinResults: 10,
                MaxResults: 10,
            },
        };

        // Narrow filter for user identities
        if (/[\w-]+@([\w-]+\.)+[\w-]+/.test(name)) {

            searchRequest.identityTypes = [ "user" ];

        }

        const result = await this.azdevClient.post<any>(`_apis/IdentityPicker/Identities`, "5.2-preview.1", searchRequest);

        if (result.results.length > 0) {

            if (result.results[0].identities.length > 1) {

                debug(`Found <${result.results[0].identities.length}> identities matching <${name}> name filter`);

            }

            // Get target identity matching name filter
            // Use displayName for users OR samAccountName for groups
            targetIdentity = result.results[0].identities.filter((i: IGraphIdentity) =>
                new RegExp([ i.displayName!, i.samAccountName].join("|"), "i").test(name))[0];

            debug(targetIdentity!);

        }

        return targetIdentity!;

    }

    public async getIdentityMembership(group: GraphGroup, identity: IGraphIdentity): Promise<GraphMembership> {

        const debug = this.debugLogger.extend("getIdentityMembership");

        debug(`Retrieving <${identity.displayName}> identity group <${group.principalName}> membership`);

        let membership: GraphMembership;

        if (identity.subjectDescriptor) {

            membership = await this.azdevClient.get<GraphMembership>(`_apis/Graph/Memberships/${identity.subjectDescriptor}/${group.descriptor}`, AzDevApiType.Graph);

            if (membership) {

                debug(membership);

            }

        }

        return membership!;
    }

    public async addIdentityMembership(group: GraphGroup, identity: IGraphIdentity): Promise<GraphMembership> {

        const debug = this.debugLogger.extend("addIdentityMembership");

        debug(`Adding <${identity.displayName}> identity to <${group.principalName}> group membership`);

        const body: any = {

            origin: "",
            originId: identity.originId,
            storageKey: "",

        };

        let member: GraphMember;
        let membership: GraphMembership;

        switch (identity.entityType) {

            case "User": {

                body.origin = identity.originDirectory;
                body.storageKey = identity.localId;

                member = await this.azdevClient.post<GraphMember>(`_apis/Graph/Users?groupDescriptors=${group.descriptor}`, "5.2-preview.1", body, AzDevApiType.Graph);

                break;

            } case "Group": {

                member = await this.azdevClient.post<GraphMember>(`_apis/Graph/Groups?groupDescriptors=${group.descriptor}`, "5.2-preview.1", body, AzDevApiType.Graph);

                break;

            }

        }

        if (member!) {

            const result = await this.azdevClient.get<any>(`_apis/Graph/Memberships/${member!.descriptor}`, AzDevApiType.Graph);

            membership = result.value[0];

        }

        debug(membership!);

        return membership!;

    }

    public async getGroupMemberships(group: GraphGroup): Promise<GraphMembership[]> {

        const debug = this.debugLogger.extend("getGroupMemberships");

        const result = await this.azdevClient.get<any>(`_apis/Graph/Memberships/${group.descriptor}?direction=1`, AzDevApiType.Graph);

        const memberships: GraphMembership[] = result.value as GraphMembership[];

        debug(`Found <${memberships.length}> group <${group.principalName}> memberships`);

        return memberships;

    }

    public async removeGroupMembership(group: GraphGroup, member: GraphMembership): Promise<void> {

        const debug = this.debugLogger.extend("removeGroupMembership");

        debug(`Removing <${member.memberDescriptor}> principal from <${group.principalName}> group membership`);

        const result = await this.azdevClient.delete(`_apis/Graph/Memberships/${member.memberDescriptor}/${group.descriptor}`, "5.2-preview.1", AzDevApiType.Graph);

    }

    public async addGroupMemberships(group: GraphGroup, members: string[]): Promise<GraphMembership[]> {

        const debug = this.debugLogger.extend("addGroupMemberships");

        debug(`Adding <${members.length}> group <${group.principalName}> memberships`);

        const validMemberships: GraphMembership[] = [];

        await Promise.all(members.map(async (name) => {

            // Slow down parallel calls to address
            // Intermittent API connectivity issues
            await this.helper.wait(500, 3000);

            const targetIdentity: IGraphIdentity = await this.findIdentity(name);

            if (!targetIdentity) {

                throw new Error(`Identity <${name}> not found`);

            }

            const existingMembership: GraphMembership = await this.getIdentityMembership(group, targetIdentity);

            if (existingMembership) {

                debug(`Identity <${name}> already <${group.principalName}> group member`);

                validMemberships.push(existingMembership);

                return;

            }

            const updatedMembership: GraphMembership = await this.addIdentityMembership(group, targetIdentity);

            debug(`Principal <${name}> group <${group.principalName}> member added`);

            validMemberships.push(updatedMembership);

        }));

        return validMemberships;

    }

    public async removeGroupMemberships(group: GraphGroup, memberships: GraphMembership[]): Promise<void> {

        const debug = this.debugLogger.extend("removeGroupMemberships");

        debug(`Removing <${memberships.length}> group <${group.principalName}> memberships`);

        // Slow down parallel calls to address
        // Intermittent API connectivity issues
        await this.helper.wait(500, 3000);

        await Promise.all(memberships.map(async (membership) => {

            await this.removeGroupMembership(group, membership);

        }));

    }

    public async getObsoleteGroupMemberships(group: GraphGroup, validMemberships: GraphMembership[]): Promise<GraphMembership[]> {

        const debug = this.debugLogger.extend("getObsoleteGroupMemberships");

        debug(`Retrieving obsolete group <${group.principalName}> memberships`);

        const validDescriptors: string[] = validMemberships.map((v) => v.memberDescriptor!);

        debug(`Group <${group.principalName}> should have <${validDescriptors.length}> valid memberships`);

        const currentMemberships: GraphMembership[] = await this.getGroupMemberships(group);
        const obsoleteMemberships: GraphMembership[] = currentMemberships.filter((m) => !validDescriptors.includes(m.memberDescriptor!));

        debug(`Found <${obsoleteMemberships.length}> obsolete <${group.principalName}> group memberships`);

        if (obsoleteMemberships.length > 0) {

            debug(obsoleteMemberships.map((m) => m.memberDescriptor!));

        }

        return obsoleteMemberships;

    }

    public async updateGroupMembers(members: string[], group: GraphGroup): Promise<void> {

        const debug = this.debugLogger.extend("updateGroupMembers");

        let validMemberships: GraphMembership[] = [];

        // Adding new memberships
        if (members.length > 0) {

            validMemberships = await this.addGroupMemberships(group, members);

        }

        const obsoleteMemberships: GraphMembership[] = await this.getObsoleteGroupMemberships(group, validMemberships);

        // Removing obsolete memberships
        if (obsoleteMemberships.length > 0) {

            await this.removeGroupMemberships(group, obsoleteMemberships);

        }

    }

}
