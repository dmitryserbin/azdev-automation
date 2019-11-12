import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { SecurityHelper } from "../../helpers/securityhelper";
import { IAzDevClient } from "../../interfaces/azdevclient";
import { PermissionType } from "../../interfaces/configurationreader";
import { IDebugLogger } from "../../interfaces/debuglogger";
import { IGraphIdentity } from "../../interfaces/graphhelper";
import { IIdentityPermission, INamespace, ISecurityHelper, ISecurityIdentity, ISecurityPermission } from "../../interfaces/securityhelper";
import { ISecurityMapper } from "../../interfaces/securitymapper";
import { SecurityMapper } from "../../mappers/securitymapper";

const projectOne: TeamProject = {

    name: "MyProjectOne",
    id: "1",

};

const groupOne: GraphGroup = {

    principalName: "MyGroup",

};

const groupOneContributions: any = {

    identityDescriptor: "1-1",
    subjectPermissions: [
        {
            bit: 1,
            displayName: "View project-level information",
            token: `$PROJECT:vstfs:///Classification/TeamProject/${projectOne.id}:`,
            namespaceId: 1,
        },
    ],

};

const allContributions: any = {

    dataProviders: {
        "ms.vss-admin-web.org-admin-permissions-pivot-data-provider": groupOneContributions,
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

const permissionSetId: string = "1";
const permissionSetToken: string = "1";

const azdevClientMock = TypeMoq.Mock.ofType<IAzDevClient>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

describe("SecurityHelper", () => {

    const securityMapper: ISecurityMapper = new SecurityMapper(debugLoggerMock.target);
    const securityHelper: ISecurityHelper = new SecurityHelper(azdevClientMock.target, debugLoggerMock.target, securityMapper);

    it("Should set group access control", async () => {

        // TBU
        // const result = await securityHelper.setGroupAccessControl(projectOne, groupOne, viewPermission);

    });

    it("Should get group identity", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(allContributions));

        // Act
        const result: string = await securityHelper.getGroupIdentity(projectOne.id!, groupOne);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result).eq(groupOneContributions.identityDescriptor);

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
