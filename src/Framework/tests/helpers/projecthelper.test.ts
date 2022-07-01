import Debug from "debug";
import "mocha";

import * as chai from "chai";
import * as TypeMoq from "typemoq";

import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { Process, ProjectVisibility, TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { GraphGroup } from "azure-devops-node-api/interfaces/GraphInterfaces";

import { ProjectHelper } from "../../helpers/projecthelper";
import { IAzDevClient } from "../../common/iazdevclient";
import { IDebugLogger } from "../../common/idebuglogger";
import { IProjectHelper } from "../../helpers/iprojecthelper";

const projectOne = "MyProjectOne";
const projectOneDescription = "This is Project One";
const projectOneId = "1";

const projectTwo = "MyProjectTwo";
const projectTwoDescription = "This is Project Two";
const projectTwoId = "2";

const groupOne = "MyGroupOne";
const groupOneDescription = "This is Group One";

const coreApiMock = TypeMoq.Mock.ofType<ICoreApi>();
const azdevClientMock = TypeMoq.Mock.ofType<IAzDevClient>();

const debuggerMock = TypeMoq.Mock.ofType<Debug.Debugger>();
const debugLoggerMock = TypeMoq.Mock.ofType<IDebugLogger>();
debugLoggerMock.setup((x) => x.create(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);
debuggerMock.setup((x) => x.extend(TypeMoq.It.isAnyString())).returns(() => debuggerMock.target);

const mockProjectOne: TypeMoq.IMock<TeamProject> = TypeMoq.Mock.ofType<TeamProject>();
mockProjectOne.setup((x) => x.name).returns(() => projectOne);
mockProjectOne.setup((x) => x.id).returns(() => projectOneId);
mockProjectOne.setup((x) => x.description).returns(() => projectOneDescription);

const mockProjectTwo: TypeMoq.IMock<TeamProject> = TypeMoq.Mock.ofType<TeamProject>();
mockProjectTwo.setup((x) => x.name).returns(() => projectTwo);

const mockGraphGroup: TypeMoq.IMock<GraphGroup> = TypeMoq.Mock.ofType<GraphGroup>();
mockGraphGroup.setup((x) => x.principalName).returns(() => groupOne);
mockGraphGroup.setup((x) => x.description).returns(() => groupOneDescription);
mockGraphGroup.setup((x) => x.origin).returns(() => "vsts");

describe("ProjectHelper", () => {

    const projectHelper: IProjectHelper = new ProjectHelper(coreApiMock.target, azdevClientMock.target, debugLoggerMock.target);

    it("Should create project", async () => {

        // Arrange
        const operationReferenceMock: TypeMoq.IMock<OperationReference> = TypeMoq.Mock.ofType<OperationReference>();
        const processMock: TypeMoq.IMock<Process> = TypeMoq.Mock.ofType<Process>();
        coreApiMock.setup((x) => x.queueCreateProject(TypeMoq.It.isAny())).returns(() => Promise.resolve(operationReferenceMock.target));

        // Act
        const result = await projectHelper.createProject(projectOne, projectOneDescription, processMock.target, TypeMoq.It.isAnyString(), ProjectVisibility.Private);

        // Assert
        chai.expect(result).not.eq(null);

    });

    it("Should update project", async () => {

        // Arrange
        const operationReferenceMock: TypeMoq.IMock<OperationReference> = TypeMoq.Mock.ofType<OperationReference>();
        coreApiMock.setup((x) => x.updateProject(TypeMoq.It.isAny(), TypeMoq.It.isAnyString())).returns(() => Promise.resolve(operationReferenceMock.target));

        // Act & Assert
        chai.expect(async () => await projectHelper.updateProject(mockProjectOne.target)).to.not.throw();

    });

    it("Should find project by name", async () => {

        // Arrange
        coreApiMock.setup((x) => x.getProject(TypeMoq.It.isAnyString())).returns(() => Promise.resolve(mockProjectOne.target));

        // Act
        const result = await projectHelper.findProject(projectOne);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.name).eq(projectOne);

    });

    it("Should find projects by filter", async () => {

        // Arrange
        coreApiMock.setup((x) => x.getProjects()).returns(() => Promise.resolve([ mockProjectOne.target, mockProjectTwo.target ]));

        // Act
        const result = await projectHelper.findProjects("MyProject.");

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.length).eq(2);
        chai.expect(result[0].name).eq(projectOne);
        chai.expect(result[1].name).eq(projectTwo);

    });

    it("Should get project group", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: "1" } as any));
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: [ mockGraphGroup.target ] as GraphGroup[] } as any));

        // Act
        const result = await projectHelper.getProjectGroup(groupOne, projectOneId);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.principalName).eq(groupOne);

    });

    it("Should get project groups", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: "1" } as any));
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: [ mockGraphGroup.target, mockGraphGroup.target ] as GraphGroup[] } as any));

        // Act
        const result = await projectHelper.getProjectGroups(projectOneId);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.length).eq(2);

    });

    it("Should create project group", async () => {

        // Arrange
        azdevClientMock.setup((x) => x.get(TypeMoq.It.isAnyString(), TypeMoq.It.isAny())).returns(() => Promise.resolve({ value: "1" } as any));
        azdevClientMock.setup((x) => x.post(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(mockGraphGroup.target));

        // Act
        const result = await projectHelper.createProjectGroup(groupOne, groupOneDescription, projectOneId);

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.principalName).eq(groupOne);
        chai.expect(result.description).eq(groupOneDescription);

    });

    it("Should get default template", async () => {

        // Arrange
        const processMock: TypeMoq.IMock<Process> = TypeMoq.Mock.ofType<Process>();
        processMock.setup((x) => x.isDefault).returns(() => true);
        coreApiMock.setup((x) => x.getProcesses()).returns(() => Promise.resolve([ processMock.target ]));

        // Act
        const result = await projectHelper.getDefaultTemplate();

        // Assert
        chai.expect(result).not.eq(null);
        chai.expect(result.isDefault).eq(true);

    });

});
