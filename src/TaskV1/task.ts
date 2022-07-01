import { TaskResult, setResult } from "azure-pipelines-task-lib";

import { Automation } from "azdev-automation";
import { IAutomation, IEndpoint, IParameters } from "azdev-automation/interfaces/automation";
import { getEndpoint, getParameters } from "./helper";

async function run() {

    try {

        const endpoint: IEndpoint = await getEndpoint();
        const parameters: IParameters = await getParameters();
        const automation: IAutomation = new Automation(endpoint, parameters);

        await automation.run();

    } catch (e: any) {

        setResult(TaskResult.Failed, e.message);

        console.log(e);

    }

}

run();
