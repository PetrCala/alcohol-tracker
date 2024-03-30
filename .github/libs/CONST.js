const CONST = {
  GITHUB_OWNER: 'PetrCala',
  APP_REPO: 'Kiroku',
  // OS_BOTIFY: 'OSBotify',
  //   LABELS: {
  //     STAGING_DEPLOY: 'StagingDeployCash',
  //     DEPLOY_BLOCKER: 'DeployBlockerCash',
  //     INTERNAL_QA: 'InternalQA',
  //   },
  DATE_FORMAT_STRING: 'yyyy-MM-dd',
};

CONST.APP_REPO_URL = `https://github.com/${CONST.GITHUB_OWNER}/${CONST.APP_REPO}`;
CONST.APP_REPO_GIT_URL = `git@github.com:${CONST.GITHUB_OWNER}/${CONST.APP_REPO}.git`;

module.exports = CONST;
