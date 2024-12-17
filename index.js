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
  //console.log(`The event payload: ${payload}`);
  //const context = JSON.stringify(github.context, undefined, 2)
  //console.log(`The context payload: ${context}`);
  //console.log(`github event is ${github.context.eventName}`);
  //"ref": "refs/tags/v1.12",
  console.log(`github ref is ${github.context.ref}`);
  var buildVersion = "0.0.0"
  const str = github.context.ref;
  if (str.indexOf("tags") !== -1)
  {
    const parts = str.split("/");
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

  const secrets = core.getInput('secrets');
  console.log(`secrets json is ${secrets}`);
  const secret = JSON.parse(secrets);

  const processDirectory = process.cwd();
  console.log("process directory: ", processDirectory);

  const filename = core.getInput('appsettings');
  console.log(`appsettings file is ${filename}`);

  var appsettings = path.join(processDirectory, filename);
  console.log(`appsettings path is ${appsettings}`);

  fs.readdir(processDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
    } else {
      console.log('Files in cwd:', files);
    }
  });

  fs.access(appsettings, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`${appsettings} file access ${err}`);
    } else {
      const fileContents = fs.readFileSync(appsettings).toString();
      console.log(`${appsettings} exists with ${fileContents}`);

      var contents = fileContents
        .replace("{BuildVersion}", buildVersion)
        .replace("{BuildDate}", buildDate);
      for (const key in secret) {
        contents = contents.replace(key, secrete[key]);
        //console.log(key + ": " + secret[key]);
      }
      console.log(`updated to ${contents}`);
    }
  });

} catch (error) {
  console.log(error.message);
  //core.setFailed(error.message);
}
