// index.js

// https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action
// npm install @actions/core
// npm install @actions/github
// npm install @actions/exec
// npm install xml2js
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
const xml2js = require('xml2js');

function isNullOrEmpty(str) {
  return str === null || str.trim() === '';
}

try {
  //const payload = JSON.stringify(github.context.payload, undefined, 2)
  //console.log(`payload: ${payload}`);
  //const context = JSON.stringify(github.context, undefined, 2)
  //console.log(`context: ${context}`);

  // github ref is:
  // refs/heads/main
  // refs/tags/v0.35
  //const token = process.env['GH_TOKEN'];
  //console.log(process.env);
  const printFile = core.getInput('printFile');
  console.log(`printFile is ${printFile}`);
  const printDirectory = core.getInput('printDirectory');
  console.log(`printDirectory is ${printDirectory}`);
  const buildFlavor = core.getInput('buildflavor');

  console.log(`github ref is ${github.context.ref}`);
  var buildVersion = core.getInput('buildversion');
  const ref = github.context.ref;
  if (ref.indexOf("tags") !== -1)
  {
    const parts = ref.split("/");
    buildVersion = parts.pop();
    if (buildVersion.startsWith("v"))
      buildVersion = buildVersion.substring(1);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const time = (new Date()).toTimeString();
  const buildDate = new Date().toISOString().
  replace(/T/, ' ').      // replace T with a space
  replace(/\..+/, '')     // delete the dot and everything after
  console.log(`Time is ${time}, the unix time stamp is ${timestamp}`);

  console.log(`BuildVersion is ${buildVersion}`);
  console.log(`BuildFlavor is ${buildFlavor}`);
  console.log(`BuildTimeStamp is ${timestamp}`);
  console.log(`BuildDate is ${buildDate}`);
  core.setOutput("version", buildVersion);
  core.setOutput("timestamp", timestamp);
  core.setOutput("date", buildDate);

  const secrets = core.getInput('secrets');
  const secret = JSON.parse(secrets);

  const processDirectory = process.cwd();
  console.log("process directory: ", processDirectory);

  if (printDirectory === true)
  {
    fs.readdir(processDirectory, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
      } else {
        console.log('Files in cwd:', files);
      }
    });
  }

  var filename = core.getInput('appsettings');
  if (isNullOrEmpty(filename)) {
    console.log(" *** no appsettings specified, skipping appsettings update");
  }
  else
  {
    console.log(`appsettings file is ${filename}`);
    var appsettings = path.join(processDirectory, filename);
    console.log(`appsettings path is ${appsettings}`);
    fs.access(appsettings, fs.constants.F_OK, (err) => {
      if (err) {
        core.setFailed(`${appsettings} file access ${err}`);
      } else {
        const fileContents = fs.readFileSync(appsettings).toString();
        //console.log(`${appsettings} exists with ${fileContents}`);
        var contents = fileContents
          .replace("{BuildVersion}", buildVersion)
          .replace("{BuildFlavor}", buildFlavor)
          .replace("{BuildTimeStamp}", timestamp)
          .replace("{BuildDate}", buildDate);
        for (const key in secret)
          contents = contents.replace(key, secret[key]);
        fs.writeFile(appsettings, contents, err => {
          if (err) {
            core.setFailed(`${appsettings} update error ${err}`);
          } else {
            if (printFile === true)
              console.log(`${appsettings} updated to ${contents}`);
            console.log(`${appsettings} updated`);
            // now update the repository variables
            if (ref.indexOf("tags") !== -1)
            {
              if (process.env.GH_TOKEN)
              {
                const giVersion = core.getInput('version');
                const giDate = core.getInput('date');
                const giTimeStamp = core.getInput('timestamp');
                async function run() {
                  process.on('uncaughtException', function (err) {
                    console.log(`uncaughtException ${err} when setting variables.`);
                    console.log(`repository variables *not* updated`);
                  });
                  try {
                    //let describeOutput = '';
                    const options = {};
                    //options.listeners = {
                    //  stdout: (data) => {
                    //    describeOutput += data.toString();
                    //  }
                    //};
                    // gh variable set <variable> --body <value>
                    // uncaughtException TypeError: arg.includes is not a function when setting variables.
                    await exec.exec('gh', ['variable', 'set', giVersion, '--body', buildVersion], options);
                    await exec.exec('gh', ['variable', 'set', giTimeStamp, '--body', timestamp], options);
                    await exec.exec('gh', ['variable', 'set', giDate, '--body', buildDate], options);
                    //await exec.exec('gh', ['variable', 'list'], options);
                    //const trimmed = describeOutput.trim();
                    //console.log(`variable set: ${trimmed}`);
                    console.log(`repository variables updated`);

                  } catch (error) {
                    console.log(error.message);
                  }
                }
                run();
              } else {
                console.log(` *** must set GH_TOKEN to PAT (personal access token classic) to set repository variables.`);
              }
            }
          }
        });
      }
    });
  }
  // end of update appsetings.json

  // Update project file with version
  filename = core.getInput('csproj');
  if (isNullOrEmpty(filename)) {
    console.log(" *** no csproj specified, skipping csproj update");
  }
  else
  {
    console.log(`csproj file is ${filename}`);
    var csproj = path.join(processDirectory, filename);
    console.log(`csproj path is ${csproj}`);
    fs.access(csproj, fs.constants.F_OK, (err) => {
      if (err) {
        core.setFailed(`${csproj} file access ${err}`);
      } else {
        const applicationDisplayVersionPattern = /<ApplicationDisplayVersion>[^<]*<\/ApplicationDisplayVersion>/g;
        const applicationVersionPattern = /<ApplicationVersion>[^<]*<\/ApplicationVersion>/g;
        const fileContents = fs.readFileSync(csproj).toString();
        console.log(`${csproj} exists with ${fileContents}`);

        // match <ApplicationVersion> followed by any sequence of characters that are not a '<', followed by </ApplicationVersion>
        var contents = fileContents
        .replace(applicationDisplayVersionPattern, `<ApplicationDisplayVersion>${buildVersion}</ApplicationDisplayVersion>`)
        .replace(applicationVersionPattern, `<ApplicationVersion>${timestamp}</ApplicationVersion>`);

        fs.writeFile(csproj, contents, err => {
          if (err) {
            core.setFailed(`${csproj} update error ${err}`);
          } else {
            if (printFile === true)
              console.log(`${csproj} updated to ${contents}`);
            console.log(`${csproj} updated`);
          }
        });
      }
    });
  }
  // end of update csproj

  // Update Package.appxmanifest file with version
  filename = core.getInput('manifest');
  if (isNullOrEmpty(filename)) {
    console.log(" *** no manifest specified, skipping manifest update");
  }
  else
  {
    console.log(`manifest file is ${filename}`);
    var manifest = path.join(processDirectory, filename);
    console.log(`manifest path is ${manifest}`);
    fs.access(manifest, fs.constants.F_OK, (err) => {
      if (err) {
        core.setFailed(`${manifest} file access ${err}`);
      } else {
        const fileContents = fs.readFileSync(manifest).toString();
        console.log(`${manifest} string ${fileContents}`);
        const parser = new xml2js.Parser();
        const builder = new xml2js.Builder();
        parser.parseString(fileContents, (err, result) => {
          if (err) throw err;
          console.log(`${manifest} xml ${result}`);
          console.log(`Identity ${result.Package.Identity}`);
          console.log(`Identity.Version ${result.Package.Identity.Version}`);
          console.log(`Identity.Version.value ${result.Package.Identity.Version.value}`);
          result.Package.Identity.Version.value = buildVersion;
          const contents = builder.buildObject(result);
          fs.writeFile(manifest, contents, err => {
            if (err) {
              core.setFailed(`${manifest} update error ${err}`);
            } else {
              if (printFile === true)
                console.log(`${manifest} updated to ${contents}`);
              console.log(`${manifest} updated`);
            }
          });
        });

        /*
        const applicationVersionPattern = /<ApplicationVersion>[^<]*<\/ApplicationVersion>/g;
        console.log(`${manifest} exists with ${fileContents}`);
        var contents = fileContents
        .replace(applicationVersionPattern, `<ApplicationVersion>${timestamp}</ApplicationVersion>`);

        fs.writeFile(manifest, contents, err => {
          if (err) {
            core.setFailed(`${manifest} update error ${err}`);
          } else {
            if (printFile === true)
              console.log(`${manifest} updated to ${contents}`);
            console.log(`${manifest} updated`);
          }
        });
         */
      }
    });
  }
  // end of update Package.appxmanifest

} catch (error) {
  console.log(error.message);
  core.setFailed(error.message);
}
