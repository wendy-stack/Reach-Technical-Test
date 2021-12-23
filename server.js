// Calling the packages we need
const devDependencyJSON = require("./deps.json"); //calling deps.json file
const https = require("https");
const express = require("express"); // define our app using express
const app = express();

// This just tests the endpoint to check that the application is up and running
app.get("/", function (req, res) {
  res.send("Hello World");
});

// This function gets the given dependency type and version
app.get("/dependency/info/:dependency_name", function (req, res) {
  const dependency_name = req.params.dependency_name.toLowerCase();
  //   To access the provided 'type' and 'version' parameters
  let type;
  let version;

  // To get the variable version and type(checking if they are in dependencies or devDependencies)
  if (devDependencyJSON.dependencies[dependency_name]) {
    version = devDependencyJSON.dependencies[dependency_name];
    type = "dependency";
  } else if (devDependencyJSON.devDependencies[dependency_name]) {
    version = devDependencyJSON.devDependencies[dependency_name];
    type = "devDependency";
  } else {
    return res
      .status(404)
      .json({ message: "dependency supplied does not exist" });
  }

  return res.json({ type, version });
});

// To check the version of the given dependency against the current available version
app.get("/dependency/version-check/:dependency_name", function (req, res) {
  const dependency_name = req.params.dependency_name.toLowerCase();

  // To extract the current version of the dependency in query parameter
  let currentVersion = devDependencyJSON.dependencies[dependency_name];

  // If the passed dependency name is not in key: dependency check key:devDependency
  if(!currentVersion){
    currentVersion = devDependencyJSON.devDependencies[dependency_name];
  }
// If the passed dependency name is not in key: dependency or key: devDependency then...
  if (!currentVersion) {
    return res
      .status(404)
      .json({ message: "dependency supplied does not exist" });
  }

  https
    .get(`https://registry.npmjs.org/${dependency_name}`, (resp) => {
      let data = "";
      // Data has been received.
      resp.on("data", (chunk) => {
        data += chunk;
      });

      // The full response has been received.
      resp.on("end", () => {
        //  Declare default response object
        let response = {
          major: false,
          minor: false,
          patch: false,
        };
        // To extract latest version from response
        let latestVersion = JSON.parse(data)["dist-tags"].latest;

        // To split the latest version into an array of Major, Minor and Patch versions
        latestVersionSplit = latestVersion.split(".");

        // To split the current version into an array of Major, Minor and Patch versions
        currentVersionSplit = currentVersion.split(".");

        //  To extract major, minor and patch version from their respective index in the split array
        // Alternative would have been to do const latestMajorVersion = latestVersionSplit[0] etc
        const [latestMajorVersion, latestMinorVersion, latestPatchVersion] =
          latestVersionSplit;
        const [currentMajorVersion, currentMinorVersion, currentPatchVersion] =
          currentVersionSplit;

        // Compares latest version and current version and modifies corresponding response values
        if (latestMajorVersion > currentMajorVersion) {
          response.major = true;
        }
        if (latestMinorVersion > currentMinorVersion) {
          response.minor = true;
        }
        if (latestPatchVersion > currentPatchVersion) {
          response.patch = true;
        }
        return res.json(response);
      });
    })
    // Returns error if package does not exist on npm
    .on("error", (err) => {
      return res.status(404).json({ message: err.message });
    });
});

// To start the server and listen on port 8081
const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Example app listening at http://", host, port);
});
