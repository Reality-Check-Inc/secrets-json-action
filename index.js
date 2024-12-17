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

try {
  const now = Date.now();
  const timestamp = Math.floor(now / 1000);
  const time = now.toTimeString();
  console.log(`Time is ${time}, the unix time stamp is ${timestamp}`);

  //const payload = JSON.stringify(github.context.payload, undefined, 2)
  //console.log(`The event payload: ${payload}`);
  //const context = JSON.stringify(github.context, undefined, 2)
  //console.log(`The context payload: ${context}`);
  //console.log(`github event is ${github.context.eventName}`);
  //"ref": "refs/tags/v1.12",
  console.log(`github ref is ${github.context.ref}`);
  const str = github.context.ref;
  var lastPart = "0.0.0"
  if (str.indexOf("tags") !== -1)
  {
    const parts = str.split("/");
    lastPart = parts.pop();
    if (lastPart.startsWith("v"))
      lastPart = lastPart.substring(1);
  }
  console.log(`version is ${lastPart}`);

  const secrets = core.getInput('secrets');
  console.log(`secrets json is ${secrets}`);

  const appsettings = core.getInput('appsettings');
  console.log(`appsettings file is ${appsettings}`);

  const fs = require('fs');
  fs.access(appsettings, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`${appsettings} file access ${err}`);
    } else {
      console.log('File exists');
      const src = fs.readFileSync(appsettings).toString();
      console.log(`${appsettings} file contains ${src}`);
    }
  });

} catch (error) {
  console.log(error.message);
  //core.setFailed(error.message);
}
