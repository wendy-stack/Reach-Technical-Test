# Reach-Technical-Test
This is a NodeJS application that exposes two end-points

1) Dependency info endpoint

`{base_url}/dependency/info/{dependency-name}`

When a user sends a request to `{base_url}/dependency/info/{dependency-name}`, it returns
information about the dependency:

a. The dependency version

b. The dependency type (dependency/dev dependency)




2) Dependency version check endpoint

`{base_url}/dependency/version-check/{dependency-name}`

This will check the version of a dependency in our deps.json file against the latest available version.

The API https://registry.npmjs.org/{dependency-name} was used (e.g. https://registry.npmjs.org/react) to retrieve
information about the dependency and compare the latest version against the current version in the deps.json file.

It validates against major, minor and patch versions separately - e.g. for moment - the current version in
npm has a patch version update only. For React, the current version in npm has a major version
update. True indicates an update is required (below is for moment):

```
{
    "major": false,
    "minor": false,
    "patch": false
}
```

