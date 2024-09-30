import {promisify} from 'util';
import * as fs from 'fs';
import {exec as execCallback} from 'child_process';
import * as core from '@actions/core';
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';
import {SEMANTIC_VERSION_LEVELS, incrementVersion} from './versionUpdater';
import {
  updateAndroidVersion,
  updateiOSVersion,
  generateAndroidVersionCode,
} from './nativeVersionUpdater';

const exec = promisify(execCallback) as (
  command: string,
) => Promise<{stdout: string; stderr: string}>;

interface Arguments {
  SEMVER_LEVEL: string;
}

const argv = yargs(hideBin(process.argv))
  .option('SEMVER_LEVEL', {
    alias: 'semver',
    describe: 'The semantic version level to increment',
    type: 'string',
    demandOption: true,
  })
  .parseSync();

/**
 * Update the native app versions.
 *
 * @param version - The new version string.
 */
function updateNativeVersions(version: string): void {
  console.log(`Updating native versions to ${version}`);

  // Update Android
  const androidVersionCode = generateAndroidVersionCode(version);
  updateAndroidVersion(version, androidVersionCode)
    .then(() => {
      console.log('Successfully updated Android!');
    })
    .catch((err: any) => {
      console.error('Error updating Android');
      core.setFailed(err);
    });

  // Update iOS
  try {
    const cfBundleVersion = updateiOSVersion(version);
    if (
      typeof cfBundleVersion === 'string' &&
      cfBundleVersion.split('.').length === 4
    ) {
      core.setOutput('NEW_IOS_VERSION', cfBundleVersion);
      console.log('Successfully updated iOS!');
    } else {
      core.setFailed(
        `Failed to set NEW_IOS_VERSION. CFBundleVersion: ${cfBundleVersion}`,
      );
    }
  } catch (err: any) {
    console.error('Error updating iOS');
    core.setFailed(err);
  }
}

// Define a type representing the values of the enum
type SemanticVersionLevel =
  (typeof SEMANTIC_VERSION_LEVELS)[keyof typeof SEMANTIC_VERSION_LEVELS];

// let semanticVersionLevel = core.getInput('SEMVER_LEVEL', {require: true}); // Use when running as GH action
let semanticVersionLevel = argv.SEMVER_LEVEL as SemanticVersionLevel; // Running the script using node.js

if (
  !semanticVersionLevel ||
  !Object.values(SEMANTIC_VERSION_LEVELS).includes(semanticVersionLevel)
) {
  console.log(`Invalid input for 'SEMVER_LEVEL': ${semanticVersionLevel}`);
  semanticVersionLevel = SEMANTIC_VERSION_LEVELS.BUILD;
  console.log(`Defaulting to: ${semanticVersionLevel}`);
}

interface PackageJson {
  version: string;
  [key: string]: any;
}

const packageJsonContent = fs.readFileSync('./package.json', 'utf8');
const packageJson: PackageJson = JSON.parse(packageJsonContent);
const previousVersion: string = packageJson.version;

const newVersion = incrementVersion(previousVersion, semanticVersionLevel);
console.log(
  `Previous version: ${previousVersion}`,
  `New version: ${newVersion}`,
);

updateNativeVersions(newVersion);

console.log(`Setting npm version to ${newVersion}`);
exec(
  `npm --no-git-tag-version version ${newVersion} -m "Update version to ${newVersion}"`,
)
  .then(({stdout}) => {
    // NPM and native versions successfully updated, output new version
    console.log(stdout);
    core.setOutput('NEW_VERSION', newVersion);
  })
  .catch((error: any) => {
    // Log errors and retry
    console.log(error.stdout);
    console.error(error.stderr);
    core.setFailed('An error occurred in the `npm version` command');
  });
