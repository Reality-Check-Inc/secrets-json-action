// index.js

// https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action
// npm install @actions/core
// npm install @actions/github
// npm install @actions/exec
// npm i -g @vercel/ncc
// ncc build index.js --license licenses.txt
// git commit -m "action update"
// git tag -a -m "action update" v1.2
// git push --follow-tags

const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const path = require('path');
const fs = require('fs');

try {
  //const payload = JSON.stringify(github.context.payload, undefined, 2)
  //console.log(`payload: ${payload}`);
  //const context = JSON.stringify(github.context, undefined, 2)
  //console.log(`context: ${context}`);

  // github ref is:
  // refs/heads/main
  // refs/tags/v0.35
  console.log(`github ref is ${github.context.ref}`);
  var buildVersion = "0.0.0"
  const ref = github.context.ref;
  if (ref.indexOf("tags") !== -1)
  {
    const parts = ref.split("/");
    buildVersion = parts.pop();
    if (buildVersion.startsWith("v"))
      buildVersion = buildVersion.substring(1);
  }
  console.log(`BuildVersion is ${buildVersion}`);

  const timestamp = Math.floor(Date.now() / 1000);
  const time = (new Date()).toTimeString();
  const buildDate = new Date().toISOString().
  replace(/T/, ' ').      // replace T with a space
  replace(/\..+/, '')     // delete the dot and everything after
  console.log(`Time is ${time}, the unix time stamp is ${timestamp}`);
  console.log(`BuildDate is ${buildDate}`);

  const flavor = core.getInput('flavor');
  console.log(`BuildFlavor is ${flavor}`);

  const secrets = core.getInput('secrets');
  const secret = JSON.parse(secrets);

  const processDirectory = process.cwd();
  console.log("process directory: ", processDirectory);

  const filename = core.getInput('appsettings');
  console.log(`appsettings file is ${filename}`);

  var appsettings = path.join(processDirectory, filename);
  console.log(`appsettings path is ${appsettings}`);
/*
  fs.readdir(processDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
    } else {
      console.log('Files in cwd:', files);
    }
  });
  */

  fs.access(appsettings, fs.constants.F_OK, (err) => {
    if (err) {
      core.setFailed(`${appsettings} file access ${err}`);
    } else {
      const fileContents = fs.readFileSync(appsettings).toString();
      //console.log(`${appsettings} exists with ${fileContents}`);
      var contents = fileContents
      .replace("{BuildVersion}", buildVersion)
      .replace("{BuildTimeStamp}", timestamp)
      .replace("{BuildFlavor}", flavor)
      .replace("{BuildDate}", buildDate);
      for (const key in secret)
        contents = contents.replace(key, secret[key]);
      fs.writeFile(appsettings, contents, err => {
        if (err) {
          core.setFailed(`${appsettings} update error ${err}`);
        } else {
          console.log(`${appsettings} updated to ${contents}`);
          //console.log(`${appsettings} updated`);
        }
      });
    }
  });

  async function run() {
    try {
      let describeOutput = '';
      const options = {};
      options.listeners = {
        stdout: (data) => {
          describeOutput += data.toString();
        }
      };
      // Execute 'git variable list'
      await exec.exec('gh', ['variable', 'list'], options);
        // Set the output variable
      const trimmed = describeOutput.trim();
      console.log(`The variable list is: ${trimmed}`);
      if (ref.indexOf("tags") !== -1)
      {
        // gh variable set LOGMINDS_NUGET_VERSION --body "${{ env.nug_version }}"
        await exec.exec('gh', ['variable', 'set', 'BUILDVERSION', '--body', buildVersion], options);
      }

    } catch (error) {
      console.log(error.message);
    }
  }
  run();

} catch (error) {
  console.log(error.message);
  core.setFailed(error.message);
}
