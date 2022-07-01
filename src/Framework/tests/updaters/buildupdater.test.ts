import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildHelper } from "../../helpers/ibuildhelper";
import { IBuildUpdater } from "../../updaters/ibuildupdater";
import { IBuildPermission, IGroupPermission, PermissionType } from "../../readers/iconfigurationreader";

import { IHelper } from "../../common/ihelper";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../../helpers/isecurityhelper";
import { BuildUpdater } from "../../updaters/buildupdater";
import { ILogger } from "../../loggers/ilogger";

const buildHelperMock = TypeMoq.Mock.ofType<IBuildHelper>();
const securityHelperMock = TypeMoq.Mock.ofType<ISecurityHelper>();

const helperMock = TypeMoq.Mock.ofType<IHelper>();
helperMock.setup((x) => x.wait(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve());

const loggerMock = TypeMoq.Mock.ofType<ILogger>();

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

const namespaceName = "Build";

describe("BuildUpdater", () => {

    const buildUpdater: IBuildUpdater = new BuildUpdater(buildHelperMock.target, securityHelperMock.target, helperMock.target, loggerMock.target);

    it("Should update permissions", async () => {

        const buildNamespace: INamespace = {

            namespaceId: "1",
            name: namespaceName,
            displayName: namespaceName,
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

        // Arrange
        securityHelperMock.setup((x) => x.getNamespace(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(buildNamespace));
        securityHelperMock.setup((x) => x.getExplicitIdentities(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve([ targetIdentityOne ]));
        securityHelperMock.setup((x) => x.getExistingIdentity(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(targetIdentityOne));
        securityHelperMock.setup((x) => x.updateIdentityPermissions(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve());

        // Act & Assert
        chai.expect(async () => await buildUpdater.updatePermissions(projectOne, buildPermission)).to.not.throw();

    });

});
