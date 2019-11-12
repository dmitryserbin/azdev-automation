import tl = require("azure-pipelines-task-lib");

import { Automation } from "azdev-automation";
import { IAutomation, IEndpoint, IParameters } from "azdev-automation/interfaces/automation";
import { getEndpoint, getParameters } from "./helper";

async function run() {

    try {

        // Get endpoint
        const endpoint: IEndpoint = await getEndpoint();

        // Get parameters
        const parameters: IParameters = await getParameters();

        // Initialize automation
        const automation: IAutomation = new Automation(endpoint, parameters);

        // Execute automation
        await automation.run();

    } catch (err) {

        tl.setResult(tl.TaskResult.Failed, err.message);

        console.log(err);

    }

}

run();
