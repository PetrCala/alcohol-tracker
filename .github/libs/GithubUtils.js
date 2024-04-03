const _ = require('underscore');
const lodashGet = require('lodash/get');
const core = require('@actions/core');
const {GitHub, getOctokitOptions} = require('@actions/github/lib/utils');
const {throttling} = require('@octokit/plugin-throttling');
const {paginateRest} = require('@octokit/plugin-paginate-rest');
const CONST = require('./CONST');

const GITHUB_BASE_URL_REGEX = new RegExp(
  'https?://(?:github\\.com|api\\.github\\.com)',
);
const PULL_REQUEST_REGEX = new RegExp(
  `${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`,
);
const ISSUE_REGEX = new RegExp(
  `${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`,
);
const ISSUE_OR_PULL_REQUEST_REGEX = new RegExp(
  `${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`,
);

/**
 * The standard rate in ms at which we'll poll the GitHub API to check for status changes.
 * It's 10 seconds :)
 * @type {number}
 */
const POLL_RATE = 10000;

class GithubUtils {
  /**
   * Initialize internal octokit
   *
   * @private
   */
  static initOctokit() {
    const Octokit = GitHub.plugin(throttling, paginateRest);
    const token = core.getInput('GITHUB_TOKEN', {required: true});

    // Save a copy of octokit used in this class
    this.internalOctokit = new Octokit(
      getOctokitOptions(token, {
        throttle: {
          retryAfterBaseValue: 2000,
          onRateLimit: (retryAfter, options) => {
            console.warn(
              `Request quota exhausted for request ${options.method} ${options.url}`,
            );

            // Retry five times when hitting a rate limit error, then give up
            if (options.request.retryCount <= 5) {
              console.log(`Retrying after ${retryAfter} seconds!`);
              return true;
            }
          },
          onAbuseLimit: (retryAfter, options) => {
            // does not retry, only logs a warning
            console.warn(
              `Abuse detected for request ${options.method} ${options.url}`,
            );
          },
        },
      }),
    );
  }

  /**
   * Either give an existing instance of Octokit rest or create a new one
   *
   * @readonly
   * @static
   * @memberof GithubUtils
   */
  static get octokit() {
    if (this.internalOctokit) {
      return this.internalOctokit.rest;
    }
    this.initOctokit();
    return this.internalOctokit.rest;
  }

  /**
   * Get the graphql instance from internal octokit.
   * @readonly
   * @static
   * @memberof GithubUtils
   */
  static get graphql() {
    if (this.internalOctokit) {
      return this.internalOctokit.graphql;
    }
    this.initOctokit();
    return this.internalOctokit.graphql;
  }

  /**
   * Either give an existing instance of Octokit paginate or create a new one
   *
   * @readonly
   * @static
   * @memberof GithubUtils
   */
  static get paginate() {
    if (this.internalOctokit) {
      return this.internalOctokit.paginate;
    }
    this.initOctokit();
    return this.internalOctokit.paginate;
  }

  /**
   * Fetch all pull requests given a list of PR numbers.
   *
   * @param {Array<Number>} pullRequestNumbers
   * @returns {Promise}
   */
  static fetchAllPullRequests(pullRequestNumbers) {
    const oldestPR = _.first(_.sortBy(pullRequestNumbers));
    return this.paginate(
      this.octokit.pulls.list,
      {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        state: 'all',
        sort: 'created',
        direction: 'desc',
        per_page: 100,
      },
      ({data}, done) => {
        if (_.find(data, pr => pr.number === oldestPR)) {
          done();
        }
        return data;
      },
    )
      .then(prList =>
        _.filter(prList, pr => _.contains(pullRequestNumbers, pr.number)),
      )
      .catch(err => console.error('Failed to get PR list', err));
  }

  /**
   * @param {Number} pullRequestNumber
   * @returns {Promise}
   */
  static getPullRequestBody(pullRequestNumber) {
    return this.octokit.pulls
      .get({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        pull_number: pullRequestNumber,
      })
      .then(({data: pullRequestComment}) => pullRequestComment.body);
  }

  /**
   * @param {Number} pullRequestNumber
   * @returns {Promise}
   */
  static getAllReviewComments(pullRequestNumber) {
    return this.paginate(
      this.octokit.pulls.listReviews,
      {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        pull_number: pullRequestNumber,
        per_page: 100,
      },
      response => _.map(response.data, review => review.body),
    );
  }

  /**
   * @param {Number} issueNumber
   * @returns {Promise}
   */
  static getAllComments(issueNumber) {
    return this.paginate(
      this.octokit.issues.listComments,
      {
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        issue_number: issueNumber,
        per_page: 100,
      },
      response => _.map(response.data, comment => comment.body),
    );
  }

  /**
   * Create comment on pull request
   *
   * @param {String} repo - The repo to search for a matching pull request or issue number
   * @param {Number} number - The pull request or issue number
   * @param {String} messageBody - The comment message
   * @returns {Promise}
   */
  static createComment(repo, number, messageBody) {
    console.log(`Writing comment on #${number}`);
    return this.octokit.issues.createComment({
      owner: CONST.GITHUB_OWNER,
      repo,
      issue_number: number,
      body: messageBody,
    });
  }

  /**
   * Get the most recent workflow run for the given Kiroku workflow.
   *
   * @param {String} workflow
   * @returns {Promise}
   */
  static getLatestWorkflowRunID(workflow) {
    console.log(`Fetching Kiroku workflow runs for ${workflow}...`);
    return this.octokit.actions
      .listWorkflowRuns({
        owner: CONST.GITHUB_OWNER,
        repo: CONST.APP_REPO,
        workflow_id: workflow,
      })
      .then(response => lodashGet(response, 'data.workflow_runs[0].id'));
  }

  /**
   * Generate the well-formatted body of a production release.
   *
   * @param {Array<Number>} pullRequests
   * @returns {String}
   */
  static getReleaseBody(pullRequests) {
    return _.map(
      pullRequests,
      number => `- ${this.getPullRequestURLFromNumber(number)}`,
    ).join('\r\n');
  }

  /**
   * Generate the URL of an Kiroku pull request given the PR number.
   *
   * @param {Number} number
   * @returns {String}
   */
  static getPullRequestURLFromNumber(number) {
    return `${CONST.APP_REPO_URL}/pull/${number}`;
  }

  /**
   * Parse the pull request number from a URL.
   *
   * @param {String} URL
   * @returns {Number}
   * @throws {Error} If the URL is not a valid Github Pull Request.
   */
  static getPullRequestNumberFromURL(URL) {
    const matches = URL.match(PULL_REQUEST_REGEX);
    if (!_.isArray(matches) || matches.length !== 2) {
      throw new Error(`Provided URL ${URL} is not a Github Pull Request!`);
    }
    return Number.parseInt(matches[1], 10);
  }

  /**
   * Parse the issue number from a URL.
   *
   * @param {String} URL
   * @returns {Number}
   * @throws {Error} If the URL is not a valid Github Issue.
   */
  static getIssueNumberFromURL(URL) {
    const matches = URL.match(ISSUE_REGEX);
    if (!_.isArray(matches) || matches.length !== 2) {
      throw new Error(`Provided URL ${URL} is not a Github Issue!`);
    }
    return Number.parseInt(matches[1], 10);
  }

  /**
   * Parse the issue or pull request number from a URL.
   *
   * @param {String} URL
   * @returns {Number}
   * @throws {Error} If the URL is not a valid Github Issue or Pull Request.
   */
  static getIssueOrPullRequestNumberFromURL(URL) {
    const matches = URL.match(ISSUE_OR_PULL_REQUEST_REGEX);
    if (!_.isArray(matches) || matches.length !== 2) {
      throw new Error(
        `Provided URL ${URL} is not a valid Github Issue or Pull Request!`,
      );
    }
    return Number.parseInt(matches[1], 10);
  }

  /**
   * Return the login of the actor who closed an issue or PR. If the issue is not closed, return an empty string.
   *
   * @param {Number} issueNumber
   * @returns {Promise<String>}
   */
  static getActorWhoClosedIssue(issueNumber) {
    return this.paginate(this.octokit.issues.listEvents, {
      owner: CONST.GITHUB_OWNER,
      repo: CONST.APP_REPO,
      issue_number: issueNumber,
      per_page: 100,
    })
      .then(events => _.filter(events, event => event.event === 'closed'))
      .then(closedEvents => lodashGet(_.last(closedEvents), 'actor.login', ''));
  }

  static getArtifactByName(artefactName) {
    return this.paginate(this.octokit.actions.listArtifactsForRepo, {
      owner: CONST.GITHUB_OWNER,
      repo: CONST.APP_REPO,
      per_page: 100,
    }).then(artifacts => _.findWhere(artifacts, {name: artefactName}));
  }
}

module.exports = GithubUtils;
module.exports.ISSUE_OR_PULL_REQUEST_REGEX = ISSUE_OR_PULL_REQUEST_REGEX;
module.exports.POLL_RATE = POLL_RATE;
