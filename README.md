# Azure DevOps Automation

- [Overview](#Overview)
- [Features](#Features)
- [How To Use](#How-To-Use)
- [Configuration](#Configuration)
- [Console Guide](#Console-Guide)
- [Support](#Support)

## Overview

[Azure DevOps automation framework](https://www.npmjs.com/package/azdev-automation) enables access control automation of projects, pipelines and repositories configuration in [Azure DevOps Services](https://azure.microsoft.com/en-us/services/devops).

Package  | Build   | Code
:--------|:--------|:--------
[![npm version](https://badge.fury.io/js/azdev-automation.svg)](https://www.npmjs.com/package/azdev-automation) | [![Build Status](https://dev.azure.com/dmitryserbin/Automation/_apis/build/status/Automation-master?branchName=master)](https://dev.azure.com/dmitryserbin/Automation/_build/latest?definitionId=13&branchName=master) | [![CodeFactor](https://www.codefactor.io/repository/github/dmitryserbin/azdev-automation/badge)](https://www.codefactor.io/repository/github/dmitryserbin/azdev-automation)

## Features

- Create projects and update configuration
- Manage project security permissions
- Manage build pipelines permissions
- Manage release pipelines permissions
- Manage repositories permissions
- Manage service connections _(to be implemented)_
- Manage branch policies _(to be implemented)_
- Execute console commands

## How To Use

```typescript
const endpoint: IEndpoint = {

    account: "MyAccount",
    token: "MyToken",
    url: `https://dev.azure.com/MyAccount`,

};

const parameters: IParameters = {

    config: "projects.json",
    policies: "path/to/policies",
    schemas: "path/to/schemas",
    projectSetup: true,
    accessPermissions: true,
    branchPolicies: true,
    serviceConnections: true,

};

// Initialize automation
const automation: IAutomation = new Automation(endpoint, parameters);

// Execute automation
await automation.run();
```

## Configuration

Azure DevOps projects configuration contains target projects details and policy mappings.

```json
{
  "name": "My Project",
  "description": "This is My Project",
  "permissions": {
    "project": "My Project Policy",
    "build": "My Build Policy",
    "release": "My Release Policy",
    "repository": "My Repository Policy",
  }
}
```

> When a new project is added it will be automatically created in the Azure DevOps account.

## Policies

- **Project Permissions** - permissions policies defining security access to project
- **Build Permissions** - permissions policies defining level of access to build pipelines
- **Release Permissions** - permissions policies defining level of access to release pipelines
- **Repository Permissions** - permissions policies defining level of access to project repositories
- **Branch Policies** - repositories branch policies configuration _(to be implemented)_
- **Service Connections** - service connections definitions _(to be implemented)_

> See [policy schemas](https://github.com/dmitryserbin/azdev-automation/tree/master/schemas) for reference.

## Console Guide

> `node console.js --a=MyAccount --t=MyPAT --p=policies --c=projects.json`

```typescript
--config, -c [string], path to configuration file
--policies, -p [string], path to policies directory
--schemas, -s [string], path to schemas directory
--account, -a [string], Azure DevOps account name
--token, -t [string], Azure DevOps account PAT token
--projectSetup [boolean], control project setup feature
--accessPermissions [boolean], control access permissions feature
--serviceConnections [boolean], control service connections feature
--branchPolicies [boolean], control branch policies feature
```

## Support

For aditional information and support please refer to [project repository](https://github.com/dmitryserbin/azdev-automation). To enable debug mode to help troubleshooting issues, please configure `DEBUG=azdev-automation:*` custom release [variable](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables).

For help with Azure DevOps please refer to [official documentation](https://docs.microsoft.com/en-us/azure/devops).
