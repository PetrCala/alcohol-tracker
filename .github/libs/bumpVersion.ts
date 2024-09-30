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
  // Update Android
  const androidVersionCode = generateAndroidVersionCode(version);
  updateAndroidVersion(version, androidVersionCode).catch((err: any) => {
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
    } else {
      core.setFailed(
        `Failed to set NEW_IOS_VERSION. CFBundleVersion: ${cfBundleVersion}`,
      );
    }
  } catch (err: any) {
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
  semanticVersionLevel = SEMANTIC_VERSION_LEVELS.BUILD;
}

interface PackageJson {
  version: string;
  [key: string]: any;
}

const packageJsonContent = fs.readFileSync('./package.json', 'utf8');
const packageJson: PackageJson = JSON.parse(packageJsonContent);
const previousVersion: string = packageJson.version;

const newVersion = incrementVersion(previousVersion, semanticVersionLevel);

updateNativeVersions(newVersion);

exec(
  `npm --no-git-tag-version version ${newVersion} -m "Update version to ${newVersion}"`,
)
  .then(() => {
    // Output only the new version
    console.log(newVersion);
    core.setOutput('NEW_VERSION', newVersion);
  })
  .catch((error: any) => {
    core.setFailed('An error occurred in the `npm version` command');
  });
