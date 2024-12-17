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
  const buildDate = new Date().toISOString().
  replace(/T/, ' ').      // replace T with a space
  replace(/\..+/, '')     // delete the dot and everything after
  console.log(`Time is ${time}, the unix time stamp is ${timestamp}`);
  console.log(`BuildDate is ${buildDate}`);

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
  console.log(`version is ${buildVersion}`);

  const secrets = core.getInput('secrets');
  console.log(`secrets json is ${secrets}`);

  const appsettings = core.getInput('appsettings');
  console.log(`appsettings file is ${appsettings}`);

  const currentDirectory = __dirname;
  console.log(`current directory is ${currentDirectory}`);

  const currentWork = path.basename(process.cwd());
  console.log(`current working directory is ${currentWork}`);

  const fs = require('fs');
  fs.access(appsettings, fs.constants.F_OK, (err) => {
    if (err) {
      // ./test_data/appsettings.json file access
      // Error: ENOENT: no such file or directory,
      // access 'D:\a\secrets-json-action\secrets-json-action\test_data\appsettings.json'
      console.log(`${appsettings} file access ${err}`);
    } else {
      console.log(`${appsettings} exists`);

      async function run() {
        try {
          const data = await fs.readFile(appsettings, 'utf8');
          console.log(data);
        } catch (err) {
          console.error(err);
        }
      }
      run();

    }
  });

} catch (error) {
  console.log(error.message);
  //core.setFailed(error.message);
}
