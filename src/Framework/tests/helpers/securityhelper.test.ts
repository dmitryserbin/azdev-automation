import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup, GraphMember, GraphMembership } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { SecurityHelper } from "../../helpers/securityhelper";
import { IAzDevClient } from "../../common/iazdevclient";
import { PermissionType } from "../../readers/iconfigurationreader";
import { IDebugLogger } from "../../common/idebuglogger";
import { IGraphIdentity, IGroupProvider, IIdentityPermission, INamespace, ISecurityHelper, ISecurityIdentity, ISecurityPermission } from "../../helpers/isecurityhelper";
import { ISecurityMapper } from "../../mappers/isecuritymapper";
import { SecurityMapper } from "../../mappers/securitymapper";
import { IHelper } from "../../common/ihelper";

const projectOne: TeamProject = {

    name: "MyProjectOne",
    id: "1",

};

const groupOne: GraphGroup = {

    principalName: "MyGroup",

};

const userIdentityOne: IGraphIdentity = {

    displayName: "MyAdUser@domain.com",
    entityType: "User",
    subjectDescriptor: "1",

};

const groupIdentityOne: IGraphIdentity = {

    displayName: "MyAdGroup",
    entityType: "Group",
    subjectDescriptor: "2",

};

const viewProjectPermission: any = {

    bit: 1,
    displayName: "View project-level information",
    token: `$PROJECT:vstfs:///Classification/TeamProject/${projectOne.id}:`,
    namespaceId: 1,

};

const groupOneContributions: any = {

    identityDescriptor: "1-1",
    subjectPermissions: [
        viewProjectPermission,
    ],

};

const allContributions: any = {

    dataProviders: {
        "ms.vss-admin-web.org-admin-groups-permissions-pivot-data-provider": groupOneContributions,
    },

};

const identityOne: any = {

    IdentityType: "group",
    FriendlyDisplayName: "Identity One",
    DisplayName: "Identity One",
    SubHeader: "Header",
    TeamFoundationId: "1",
    EntityId: "1",

};

const identityTwo: any = {

    IdentityType: "group",
    FriendlyDisplayName: "Identity Two",
    DisplayName: "Identity Two",
    SubHeader: "Header",
    TeamFoundationId: "1",
    EntityId: "1",

};

const targetIdentityOne: ISecurityIdentity = {

    identityType: identityOne.IdentityType,
    friendlyDisplayName: identityOne.FriendlyDisplayName,
    displayName: identityOne.DisplayName,
    subHeader: identityOne.SubHeader,
    teamFoundationId: identityOne.TeamFoundationId,
    entityId: identityOne.EntityId,

};

const permissionOne: ISecurityPermission = {

    permissionId: 0,
    explicitPermissionId: 1,
    originalPermissionId: 1,
    permissionBit: 1,
    namespaceId: "1",
    displayName: "Permission One",

};

const identityPermissionOne: IIdentityPermission = {

    currentTeamFoundationId: "1",
    descriptorIdentityType: "Identity Type",
    descriptorIdentifier: "1",
    permissions: [
        permissionOne,
    ],

};

const namespace: INamespace = {

    namespaceId: "1",
    name: "My Namespace",
    displayName: "My Namespace",
    separatorValue: "/",
    writePermission: 1,
    readPermission: 0,
    dataspaceCategory: "My Category",
    actions: [
        {
            bit: 1,
            name: "View project-level information",
            displayName: "View project-level information",
            namespaceId: "1",
        },
    ],

};

const graphMemberMock: TypeMoq.IMock<GraphMember> = TypeMoq.Mock.ofType<GraphMember>();
const graphMembershipMock: TypeMoq.IMock<GraphMembership> = TypeMoq.Mock.ofType<GraphMembership>();

const permissionSetId = "1";
const permissionSetToken = "1";

const azdevClientMock = TypeMoq.Mock.ofType<IAzDevClient>();
const helperMock = TypeMoq.Mock.ofType<IHelper>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

describe("SecurityHelper", () => {

    const securityMapper: ISecurityMapper = new SecurityMapper(debugLoggerMock.target);
    const securityHelper: ISecurityHelper = new SecurityHelper(azdevClientMock.target, helperMock.target, securityMapper, debugLoggerMock.target);

    it("Should find user identity", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ results: [ { identities: [ userIdentityOne ] } ] }));

        // Act
        const result: IGraphIdentity = await securityHelper.findIdentity(userIdentityOne.displayName!);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.entityType).eq(userIdentityOne.entityType);
        chai.expect(result.displayName).eq(userIdentityOne.displayName);

    });

    it("Should find group identity", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ results: [ { identities: [ groupIdentityOne ] } ] }));

        // Act
        const result: IGraphIdentity = await securityHelper.findIdentity(groupIdentityOne.displayName!);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.entityType).eq(groupIdentityOne.entityType);
        chai.expect(result.displayName).eq(groupIdentityOne.displayName);

    });

    it("Should get identity membership", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(graphMembershipMock.target));

        // Act
        const result: GraphMembership = await securityHelper.getIdentityMembership(groupOne, userIdentityOne);

        // Assert
        chai.expect(result).not.eq(null);

    });

    it("Should add identity membership", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(graphMemberMock.target));
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: [ graphMembershipMock.target ] }));

        // Act
        const result: GraphMembership = await securityHelper.addIdentityMembership(groupOne, userIdentityOne);

        // Assert
        chai.expect(result).not.eq(null);

    });

    it("Should get group provider", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(allContributions));

        // Act
        const result: IGroupProvider = await securityHelper.getGroupProvider("ms.vss-admin-web.org-admin-groups-permissions-pivot-data-provider", projectOne.id!, groupOne);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.identityDescriptor).eq(groupOneContributions.identityDescriptor);
        chai.expect(result.subjectPermissions[0].displayName).eq(viewProjectPermission.displayName);

    });

    it("Should get explicit identities", async () => {

        const response: any = {

            identities: [
                identityOne,
                identityTwo,
            ],

        };

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(response));

        // Act
        const result: ISecurityIdentity[] = await securityHelper.getExplicitIdentities(projectOne.id!, permissionSetId, permissionSetToken);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.length).eq(response.identities.length);
        chai.expect(result[0].displayName).eq(identityOne.DisplayName);
        chai.expect(result[1].displayName).eq(identityTwo.DisplayName);

    });

    it("Should add identity to permission", async () => {

        const graphIdentity: IGraphIdentity = {

            localId: "1",

        };

        const response: any = {

            AddedIdentity: identityOne,

        };

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(response));

        // Act
        const result: ISecurityIdentity = await securityHelper.addIdentityToPermission(projectOne.id!, graphIdentity);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.displayName).eq(identityOne.DisplayName);

    });

    it("Should get identity permission", async () => {

        const response: any = {

            currentTeamFoundationId: identityPermissionOne.currentTeamFoundationId,
            descriptorIdentityType: identityPermissionOne.descriptorIdentityType,
            descriptorIdentifier: identityPermissionOne.descriptorIdentifier,
            permissions: [
                {
                    displayName: permissionOne.displayName,
                    permissionBit: permissionOne.permissionBit,
                    namespaceId: permissionOne.namespaceId,
                },
            ],

        };

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(response));

        // Act
        const result: IIdentityPermission = await securityHelper.getIdentityPermission(projectOne.id!, targetIdentityOne, permissionSetId, permissionSetToken);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.permissions.length).eq(identityPermissionOne.permissions.length);
        chai.expect(result.currentTeamFoundationId).eq(identityPermissionOne.currentTeamFoundationId);

    });

    it("Should set identity access control", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(true));

        // Act
        const result: any = await securityHelper.setIdentityAccessControl(projectOne.id!, identityPermissionOne, permissionOne, PermissionType.Allow);

        // Assert
        chai.expect(result).eq(true);

    });

    it("Should get namespace", async () => {

        const response: any[] = [
            {
                name: namespace.name,
                actions: [
                    {
                        bit: 1,
                    },
                ],
            },
        ];

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: response }));

        // Act
        const result: INamespace = await securityHelper.getNamespace(namespace.name);

        // Assert
        chai.expect(result.name).eq(namespace.name);
        chai.expect(result.actions.length).eq(namespace.actions.length);

    });

});
