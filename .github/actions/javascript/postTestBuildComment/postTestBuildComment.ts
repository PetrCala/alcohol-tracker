import * as core from '@actions/core';
import {context} from '@actions/github';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

function getTestBuildMessage(): string {
  console.log('Input for android', core.getInput('ANDROID', {required: true}));
  const androidSuccess =
    core.getInput('ANDROID', {required: true}) === 'success';
  const iOSSuccess = core.getInput('IOS', {required: true}) === 'success';

  const androidLink = androidSuccess
    ? core.getInput('ANDROID_LINK')
    : '❌ FAILED ❌';
  const iOSLink = iOSSuccess ? core.getInput('IOS_LINK') : '❌ FAILED ❌';

  const androidQRCode = androidSuccess
    ? `![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${androidLink})`
    : "The QR code can't be generated, because the android build failed";
  const iOSQRCode = iOSSuccess
    ? `![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${iOSLink})`
    : "The QR code can't be generated, because the iOS build failed";

  const message = `:test_tube::test_tube: Use the links below to test this adhoc build on Android and iOS. Happy testing! :test_tube::test_tube:
| Android :robot:  | iOS :apple: |
| ------------- | ------------- |
| ${androidLink}  | ${iOSLink}  |
| ${androidQRCode}  | ${iOSQRCode}  |

---

:eyes: [View the workflow run that generated this build](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) :eyes:
`;

  return message;
}

/** Comment on a single PR */
async function commentPR(PR: number, message: string) {
  console.log(`Posting test build comment on #${PR}`);
  try {
    await GithubUtils.createComment(context.repo.repo, PR, message);
    console.log(`Comment created on #${PR} successfully 🎉`);
  } catch (err) {
    console.log(`Unable to write comment on #${PR} 😞`);

    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }
}

async function run() {
  const PR_NUMBER = Number(core.getInput('PR_NUMBER', {required: true}));
  const comments = await GithubUtils.paginate(
    GithubUtils.octokit.issues.listComments,
    {
      owner: CONST.GITHUB_OWNER,
      repo: CONST.APP_REPO,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      issue_number: PR_NUMBER,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      per_page: 100,
    },
    response => response.data,
  );
  const testBuildComment = comments.find(comment =>
    comment.body?.startsWith(
      ':test_tube::test_tube: Use the links below to test this adhoc build',
    ),
  );
  if (testBuildComment) {
    console.log('Found previous build comment, hiding it', testBuildComment);
    await GithubUtils.graphql(`
            mutation {
              minimizeComment(input: {classifier: OUTDATED, subjectId: "${testBuildComment.node_id}"}) {
                minimizedComment {
                  minimizedReason
                }
              }
            }
        `);
  }
  await commentPR(PR_NUMBER, getTestBuildMessage());
}

if (require.main === module) {
  run();
}

export default run;
