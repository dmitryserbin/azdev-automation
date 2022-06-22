import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IGroupPermission, IRepositoryPermission, PermissionType } from "../../interfaces/readers/configurationreader";
import { IConsoleLogger } from "../../interfaces/common/consolelogger";
import { IDebugLogger } from "../../interfaces/common/debuglogger";
import { IHelper } from "../../interfaces/common/helper";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../../interfaces/helpers/securityhelper";
import { IRepositoryHelper } from "../../interfaces/helpers/repositoryhelper";
import { IRepositoryUpdater } from "../../interfaces/updaters/repositoryupdater";
import { RepositoryUpdater } from "../../updaters/repositoryupdater";

const repositoryHelperMock = TypeMoq.Mock.ofType<IRepositoryHelper>();
const securityHelperMock = TypeMoq.Mock.ofType<ISecurityHelper>();

const helperMock = TypeMoq.Mock.ofType<IHelper>();
helperMock.setup((x) => x.wait(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve());

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

const projectOne: TeamProject = {

    name: "MyProject",
    id: "1",

};

const repositoryPermission: IRepositoryPermission = {

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

const namespaceName = "Git Repositories";

describe("RepositoryUpdater", () => {

    const repositoryUpdater: IRepositoryUpdater = new RepositoryUpdater(repositoryHelperMock.target, securityHelperMock.target, helperMock.target, debugLoggerMock.target, consoleLoggerMock.target);

    it("Should update permissions", async () => {

        const repositoryNamespace: INamespace = {

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
        securityHelperMock.setup((x) => x.getNamespace(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(repositoryNamespace));
        securityHelperMock.setup((x) => x.getExplicitIdentities(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve([ targetIdentityOne ]));
        securityHelperMock.setup((x) => x.getExistingIdentity(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(targetIdentityOne));
        securityHelperMock.setup((x) => x.updateIdentityPermissions(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve());

        // Act & Assert
        chai.expect(async () => await repositoryUpdater.updatePermissions(projectOne, repositoryPermission)).to.not.throw();

    });

});
