import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildHelper } from "../../interfaces/buildhelper";
import { IBuildUpdater } from "../../interfaces/buildupdater";
import { IBuildPermission, IGroupPermission, PermissionType } from "../../interfaces/configurationreader";
import { IConsoleLogger } from "../../interfaces/consolelogger";
import { IDebugLogger } from "../../interfaces/debuglogger";
import { IGraphHelper } from "../../interfaces/graphhelper";
import { IHelper } from "../../interfaces/helper";
import { IIdentityPermission, INamespace, ISecurityHelper, ISecurityIdentity, ISecurityPermission } from "../../interfaces/securityhelper";
import { BuildUpdater } from "../../updaters/buildupdater";

const buildHelperMock = TypeMoq.Mock.ofType<IBuildHelper>();
const graphHelperMock = TypeMoq.Mock.ofType<IGraphHelper>();
const securityHelperMock = TypeMoq.Mock.ofType<ISecurityHelper>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

const helperMock = TypeMoq.Mock.ofType<IHelper>();
helperMock.setup((x) => x.wait(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve());

const projectOne: TeamProject = {

    name: "MyProject",
    id: "1",

};

const buildPermission: IBuildPermission = {

    name: "Default",
    definition: [
        {
            name: "Group One",
            permissions: [
                {
                    name: "Permission One",
                    type: PermissionType.Allow,
                },
            ],
        },
    ],

};

const groupPermission: IGroupPermission = {

    name: "Group One",
    permissions: [
        {
            name: "Permission One",
            type: PermissionType.Allow,
        },
    ],

};

describe("BuildUpdater", () => {

    const buildUpdater: IBuildUpdater = new BuildUpdater(buildHelperMock.target, graphHelperMock.target, securityHelperMock.target, debugLoggerMock.target, consoleLoggerMock.target, helperMock.target);

    it("Should update permissions", async () => {

        const buildNamespace: INamespace = {

            namespaceId: "1",
            name: "Build",
            displayName: "Build",
            separatorValue: "/",
            writePermission: 1,
            readPermission: 0,
            dataspaceCategory: "My Category",
            actions: [],

        };

        const targetIdentityOne: ISecurityIdentity = {

            identityType: "group",
            friendlyDisplayName: groupPermission.name,
            displayName: `[${projectOne.name}]\\${groupPermission.name}`,
            subHeader: "Header",
            teamFoundationId: "1",
            entityId: "1",

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

        // Arrange
        securityHelperMock.setup((x) => x.getNamespace(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(buildNamespace));
        securityHelperMock.setup((x) => x.getExplicitIdentities(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve([ targetIdentityOne ]));
        securityHelperMock.setup((x) => x.getIdentityPermission(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve(identityPermissionOne));
        securityHelperMock.setup((x) => x.setIdentityAccessControl(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve());

        // Act & Assert
        chai.expect(async () => await buildUpdater.updatePermissions(projectOne, buildPermission)).to.not.throw();

    });

});
