import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { DeployPhase, ReleaseDefinition, ReleaseDefinitionEnvironment, WorkflowTask } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

import { IGroupPermission, IReleasePermission, ITask, PermissionType } from "../../interfaces/readers/configurationreader";
import { IConsoleLogger } from "../../interfaces/common/consolelogger";
import { IDebugLogger } from "../../interfaces/common/debuglogger";
import { IHelper } from "../../interfaces/common/helper";
import { IReleaseHelper } from "../../interfaces/helpers/releasehelper";
import { IReleaseUpdater } from "../../interfaces/updaters/releaseupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../../interfaces/helpers/securityhelper";
import { ITaskAgentHelper } from "../../interfaces/helpers/taskagenthelper";
import { ReleaseUpdater } from "../../updaters/releaseupdater";

const projectOne: TeamProject = {

    name: "MyProject",
    id: "1",

};

const removeTask: ITask = {

    name: "My-Task-One.*",

};

const updateTask: ITask = {

    name: "My-Task-One.*",
    parameters: {

        MyParameterOne: "ValueOne",
        MyParameterTwo: "ValueTwo",

    },

};

const taskOne: WorkflowTask = {

    name: "My-Task-One",
    taskId: "My-Task-One-Id",
    version: "1",

};

const taskTwo: WorkflowTask = {

    name: "My-Task-Two",
    taskId: "My-Task-Two-Id",
    version: "2",

};

const phaseOne: DeployPhase = {

    name: "My-Phase-One",
    workflowTasks: [

        taskOne,
        taskTwo,

    ],

};

const phaseTwo: DeployPhase = {

    name: "My-Phase-Two",
    workflowTasks: [

        taskTwo,

    ],

};

const environmentDev: ReleaseDefinitionEnvironment = {

    id: 1,
    name: "DEV",
    deployPhases: [

        phaseOne,

    ],

};

const environmentTest: ReleaseDefinitionEnvironment = {

    id: 2,
    name: "TEST",
    deployPhases: [

        phaseTwo,

    ],

};

const tasks: TaskDefinition[] = [

    {
        name: "TestTaskOne",
        id: "1234567890",

    },
    {
        name: "TestTaskTwo",
        id: "1234567891",

    },

];

const groupPermission: IGroupPermission = {

    name: "Group One",
    permissions: [
        {
            name: "Permission One",
            type: PermissionType.Allow,
        },
    ],

};

const releasePermissions: IReleasePermission = {

    name: "Policy One",
    definition: [ groupPermission ],

};

const releaseHelperMock = TypeMoq.Mock.ofType<IReleaseHelper>();
const taskAgentHelperMock = TypeMoq.Mock.ofType<ITaskAgentHelper>();
const securityHelperMock = TypeMoq.Mock.ofType<ISecurityHelper>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

const consoleLoggerMock = TypeMoq.Mock.ofType<IConsoleLogger>();
consoleLoggerMock.setup((x) => x.log(TypeMoq.It.isAny())).returns(() => null);

const helperMock = TypeMoq.Mock.ofType<IHelper>();
helperMock.setup((x) => x.wait(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAnyNumber())).returns(() => Promise.resolve());

describe("ReleaseUpdater", () => {

    const releaseUpdater: IReleaseUpdater = new ReleaseUpdater(releaseHelperMock.target, taskAgentHelperMock.target, securityHelperMock.target, helperMock.target, debugLoggerMock.target, consoleLoggerMock.target);

    it("Should remove definition tasks", async () => {

        const definitionOne: ReleaseDefinition = {

            id: 1,
            name: "My-Definition-One",
            description: "My-Definition-Description",
            environments: [

                environmentDev,
                environmentTest,

            ],

        };

        const definitionsWithTask: ReleaseDefinition[] = [

            definitionOne,

        ];

        // Arrange
        releaseHelperMock.setup((x) => x.findDefinitionsWithTasks(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(definitionsWithTask));
        releaseHelperMock.setup((x) => x.removeDefinitionTasks(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(definitionOne));
        releaseHelperMock.setup((x) => x.updateDefinition(TypeMoq.It.isAny(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve());
        taskAgentHelperMock.setup((x) => x.findTasks(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(tasks));

        // Act & Assert
        chai.expect(async () => await releaseUpdater.removeDefinitionTasks(projectOne.name!, removeTask)).to.not.throw();

    });

    it("Should skip removing definition task", async () => {

        const definitionsWithTask: ReleaseDefinition[] = [];

        // Arrange
        releaseHelperMock.setup((x) => x.findDefinitionsWithTasks(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(definitionsWithTask));

        // Act & Assert
        chai.expect(async () => await releaseUpdater.removeDefinitionTasks(projectOne.name!, updateTask)).to.not.throw();

    });

    it("Should update permissions", async () => {

        const releaseNamespace: INamespace = {

            namespaceId: "1",
            name: "ReleaseManagement",
            displayName: "ReleaseManagement",
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
        securityHelperMock.setup((x) => x.getNamespace(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(releaseNamespace));
        securityHelperMock.setup((x) => x.getExplicitIdentities(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve([ targetIdentityOne ]));
        securityHelperMock.setup((x) => x.getExistingIdentity(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve(targetIdentityOne));
        securityHelperMock.setup((x) => x.updateIdentityPermissions(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve());

        // Act & Assert
        chai.expect(async () => await releaseUpdater.updatePermissions(projectOne, releasePermissions)).to.not.throw();

    });

});
