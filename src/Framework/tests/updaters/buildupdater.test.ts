import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildHelper } from "../../helpers/ibuildhelper";
import { IBuildUpdater } from "../../updaters/ibuildupdater";
import { IBuildPermission, IGroupPermission, PermissionType } from "../../readers/iconfigurationreader";

import { ICommonHelper } from "../../helpers/icommonhelper";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../../helpers/isecurityhelper";
import { BuildUpdater } from "../../updaters/buildupdater";
import { ILogger } from "../../loggers/ilogger";
import { IDebug } from "../../loggers/idebug";

const buildHelperMock = TypeMoq.Mock.ofType<IBuildHelper>();
const securityHelperMock = TypeMoq.Mock.ofType<ISecurityHelper>();

const commonHelperMock = TypeMoq.Mock.ofType<ICommonHelper>();
commonHelperMock.setup((x) => x.wait(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve());

const loggerMock = TypeMoq.Mock.ofType<ILogger>();
const debugMock = TypeMoq.Mock.ofType<IDebug>();

loggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.object);
debugMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debugMock.object);

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

    const buildUpdater: IBuildUpdater = new BuildUpdater(buildHelperMock.target, securityHelperMock.target, commonHelperMock.target, loggerMock.target);

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
