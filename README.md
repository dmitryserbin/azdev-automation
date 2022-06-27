# Azure DevOps Automation

- [Overview](#overview)
- [Features](#features)
- [How To Use](#how-to-use)
- [Configuration](#configuration)
- [Console Guide](#console-guide)
- [Support](#support)

## Overview

This extension adds [Azure DevOps Automation](https://marketplace.visualstudio.com/items?itemName=dmitryserbin.azdev-automation) task to Azure DevOps pipelines that enables access control automation of projects, pipelines and repositories configuration in [Azure DevOps Services](https://azure.microsoft.com/en-us/services/devops).

Extension | Package | Build   | Code
:---------|:--------|:--------|:--------
[![Extension](https://vsmarketplacebadge.apphb.com/version/dmitryserbin.azdev-automation.svg)](https://marketplace.visualstudio.com/items?itemName=dmitryserbin.azdev-automation) | [![npm version](https://badge.fury.io/js/azdev-automation.svg)](https://www.npmjs.com/package/azdev-automation) | [![Build Status](https://dev.azure.com/dmitryserbin/Automation/_apis/build/status/Automation-master?branchName=master)](https://dev.azure.com/dmitryserbin/Automation/_build/latest?definitionId=13&branchName=master) | [![CodeFactor](https://www.codefactor.io/repository/github/dmitryserbin/azdev-automation/badge)](https://www.codefactor.io/repository/github/dmitryserbin/azdev-automation)

## Features

- Create projects and update configuration
- Manage project security permissions
- Manage build pipelines permissions
- Manage release pipelines permissions
- Manage repositories permissions
- Manage work items permissions

## How To Use

1. Add `Azure DevOps Automation` task to your pipeline
1. Select `Azure DevOps endpoint` (create if does not exist)
1. Specify path to project configuration file
1. Specify path to permission policies directory
1. Enable or disable required feature toggles

```yaml
- task: azdevautomation@1
  displayName: Run Azure DevOps Automation
  inputs:
    ConnectedService: My-Endpoint # Required
    Config: path/to/projects.json # Required
    Policies: path/to/policies    # Required
    ProjectSetup: true
    AccessPermissions: true
    BranchPolicies: true
    ServiceConnections: true
```

## Configuration

Projects configuration contains target projects definition and policy mappings.

```json
{
  "name": "My Project",
  "description": "This is My Project",
  "permissions": {
    "project": "My Project Policy",
    "build": "My Build Policy",
    "release": "My Release Policy",
    "repository": "My Repository Policy",
    "work": "My Work Items Policy"
  }
}
```

## Policies

Permission policies contain set of rule for different project fetures. 

- `Project Permissions` - permissions policies defining security access to project
- `Build Permissions` - permissions policies defining level of access to build pipelines
- `Release Permissions` - permissions policies defining level of access to release pipelines
- `Repository Permissions` - permissions policies defining level of access to project repositories
- `Work Items Permissions` - permissions policies defining level of access to work items
- `Service Connections` - service connections definitions _(to be implemented)_

> See [policy schemas](https://github.com/dmitryserbin/azdev-automation/tree/master/src/Framework/schemas) for reference.

## Support

For aditional information and support please refer to [project repository](https://github.com/dmitryserbin/azdev-automation). To enable debug mode to help troubleshooting issues, please configure `DEBUG=azdev-automation:*` custom release [variable](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables).

For help with Azure DevOps please refer to [official documentation](https://docs.microsoft.com/en-us/azure/devops).
