const GITHUB_BASE_URL_REGEX = new RegExp(
  'https?://(?:github\\.com|api\\.github\\.com)',
);

const GIT_CONST = {
  GITHUB_OWNER: 'PetrCala',
  APP_REPO: 'Kiroku',
} as const;

const CONST = {
  ...GIT_CONST,
  OS_BOTIFY: 'OSBotify',
  DATE_FORMAT_STRING: 'yyyy-MM-dd',

  APP_REPO_URL: `https://github.com/${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}`,
  APP_REPO_GIT_URL: `git@github.com:${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}.git`,
};

module.exports = CONST;
