import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup, GraphMembership } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { IBuildPermission, IGroupMembership, IProject, IProjectPermission, IReleasePermission, IRepositoryPermission, IPermission, PermissionType } from "../../interfaces/configurationreader";
import { IConsoleLogger } from "../../interfaces/consolelogger";
import { IDebugLogger } from "../../interfaces/debuglogger";
import { IGraphHelper } from "../../interfaces/graphhelper";
import { IHelper } from "../../interfaces/helper";
import { IProjectHelper } from "../../interfaces/projecthelper";
import { IProjectUpdater } from "../../interfaces/projectupdater";
import { INamespace, ISecurityHelper } from "../../interfaces/securityhelper";
import { ProjectUpdater } from "../../updaters/projectupdater";

const memberOne: string = "GroupOne";
const memberTwo: string = "GroupTwo";

const groupPermission: IPermission = {

    name: "PermissionOne",
    type: PermissionType.Allow,

};

const group: IGroupMembership = {

    name: "MyGroup",
    members: [
        memberOne,
        memberTwo,
    ],
    permissions: [
        groupPermission
    ]

};

const projectPermissions: IProjectPermission = {

    name: "Default",
    definition: [

        group,

    ],

};

const repositoryPermissions: IRepositoryPermission = {

    name: "Default",
    definition: [],

};

const buildPermissions: IBuildPermission = {

    name: "Default",
    definition: [],

};

const releasePermissions: IReleasePermission = {

    name: "Default",
    definition: [],

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

const project: IProject = {

    name: "MyProject",
    description: "This is My Project",
    permissions: {
        project: projectPermissions,
        build: buildPermissions,
        release: releasePermissions,
        repository: repositoryPermissions,
    },

};

const projectHelperMock = TypeMoq.Mock.ofType<IProjectHelper>();
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

const mockProject: TypeMoq.IMock<TeamProject> = TypeMoq.Mock.ofType<TeamProject>();
mockProject.setup((x) => x.name).returns(() => project.name);
mockProject.setup((x) => x.id).returns(() => "1");

describe("ProjectUpdater", () => {

    const projectUpdater: IProjectUpdater = new ProjectUpdater(projectHelperMock.target, graphHelperMock.target, securityHelperMock.target, debugLoggerMock.target, consoleLoggerMock.target, helperMock.target);

    it("Should create new project", async () => {

        // Arrange
        const processMock: TypeMoq.IMock<Process> = TypeMoq.Mock.ofType<Process>();
        const operationReferenceMock: TypeMoq.IMock<OperationReference> = TypeMoq.Mock.ofType<OperationReference>();
        projectHelperMock.setup((x) => x.getDefaultTemplate()).returns(() => Promise.resolve(processMock.target));
        projectHelperMock.setup((x) => x.createProject(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(operationReferenceMock.target));
        projectHelperMock.setup((x) => x.findProject(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(mockProject.target));

        // Act & Assert
        chai.expect(async () => await projectUpdater.createProject(project)).to.not.throw();

    });

    it("Should update existing project", async () => {

        // Arrange
        projectHelperMock.setup((x) => x.findProject(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(mockProject.target));
        projectHelperMock.setup((x) => x.updateProject(TypeMoq.It.isAny())).returns(() => Promise.resolve());

        // Act & Assert
        chai.expect(async () => await projectUpdater.updateProject(project)).to.not.throw();

    });

    it("Should update project permissions", async () => {

        const mockGraphGroup: TypeMoq.IMock<GraphGroup> = TypeMoq.Mock.ofType<GraphGroup>();
        const mockGraphMembership: TypeMoq.IMock<GraphMembership> = TypeMoq.Mock.ofType<GraphMembership>();

        // Arrange
        securityHelperMock.setup((x) => x.getNamespace(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(namespace));
        projectHelperMock.setup((x) => x.getProjectGroup(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve(mockGraphGroup.target));
        graphHelperMock.setup((x) => x.addGroupMemberships(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve([ mockGraphMembership.target ]));
        graphHelperMock.setup((x) => x.getObsoleteGroupMemberships(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve([ mockGraphMembership.target ]));
        graphHelperMock.setup((x) => x.removeGroupMemberships(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve());

        // Act & Assert
        chai.expect(async () => await projectUpdater.updatePermissions(mockProject.target, project.permissions.project)).to.not.throw();

    });

});
