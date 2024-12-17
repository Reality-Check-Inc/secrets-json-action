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
  const timestamp = Math.floor(Date.now() / 1000);
  const time = (new Date()).toTimeString();
  console.log(`Time is ${time}, the unix time stamp is ${timestamp}`);

  //const payload = JSON.stringify(github.context.payload, undefined, 2)
  //console.log(`The event payload: ${payload}`);
  //const context = JSON.stringify(github.context, undefined, 2)
  //console.log(`The context payload: ${context}`);
  //console.log(`github event is ${github.context.eventName}`);
  //"ref": "refs/tags/v1.12",
  console.log(`github ref is ${github.context.ref}`);

  const appsettings = core.getInput('appsettings');
  console.log(`appsettings file is ${appsettings}`);

  const fs = require('fs');
  fs.access(appsettings, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist');
    } else {
      console.log('File exists');
      const src = require(appsettings);
      console.log(src);
    }
  });

} catch (error) {
  core.setFailed(error.message);
}
