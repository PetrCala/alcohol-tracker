<!-- If necessary, assign reviewers that know the area or changes well. Feel free to tag any additional reviewers you see fit. -->

### Details

<!-- Explanation of the change or anything fishy that is going on -->

<!--
Do NOT add the special GH keywords like `fixed` etc, we have our own process of managing the flow.
It MUST be an entire link to the github issue and your comment proposal ; otherwise, the linking and its automation will not work as expected.
--->

### Tests

<!---
Add a numbered list of manual tests you performed that validates your changes work on all platforms, and that there are no regressions present.
Add any additional test steps if test steps are unique to a particular platform.
Manual test steps should be written so that your reviewer can repeat and verify one or more expected outcomes in the development environment.

For example:
1. Click on the text input to bring it into focus
2. Upload an image via copy paste
3. Verify a modal appears displaying a preview of that image
--->

- [ ] Verify that no errors appear in the JS console

### Offline tests

<!---
Add any relevant steps that validate your changes work as expected in a variety of network states e.g. "offline", "spotty connection", "slow internet", etc. Manual test steps should be written so that your reviewer and QA testers can repeat and verify one or more expected outcomes.
--->

### QA Steps

<!---
Add a numbered list of manual tests that can be performed by our QA engineers on the staging environment to validate that your changes work on all platforms, and that there are no regressions present.
Add any additional QA steps if test steps are unique to a particular platform.
Manual test steps should be written so that the QA engineer can repeat and verify one or more expected outcomes in the staging environment.

For example:
1. Click on the text input to bring it into focus
2. Upload an image via copy paste
3. Verify a modal appears displaying a preview of that image
--->

- [ ] Verify that no errors appear in the JS console

### PR Author Checklist

<!--
This is a checklist for PR authors. Please make sure to complete all tasks and check them off once you do, or else your PR will not be merged!
-->

- [ ] I wrote clear testing steps that cover the changes made in this PR
  - [ ] I added steps for local testing in the `Tests` section
  - [ ] I added steps for the expected offline behavior in the `Offline steps` section
  - [ ] I added steps for Staging and/or Production testing in the `QA steps` section
  - [ ] I added steps to cover failure scenarios (i.e. verify an input displays the correct error message if the entered data is not correct)
- [ ] I ran the tests on **all platforms** & verified they passed on:
  - [ ] Android
  - [ ] iOS
- [ ] I verified there are no console errors (if there's a console error not related to the PR, report it or open an issue for it to be fixed)
- [ ] I followed proper code patterns (see [Reviewing the code](https://github.com/PetrCala/Kiroku/blob/master/contributingGuides/PR_REVIEW_GUIDELINES.md#reviewing-the-code))
  - [ ] I verified that any callback methods that were added or modified are named for what the method does and never what callback they handle (i.e. `toggleReport` and not `onIconClick`)
  - [ ] I verified that the left part of a conditional rendering a React component is a boolean and NOT a string, e.g. `myBool && <MyComponent />`.
  - [ ] I verified that comments were added to code that is not self explanatory
  - [ ] I verified that any new or modified comments were clear, correct English, and explained "why" the code was doing something instead of only explaining "what" the code was doing
  - [ ] I verified any copy / text shown in the product is localized by adding it to `src/languages/*` files and using the translation method of the `LocaleContextProvider`
    - [ ] If any non-english text was added/modified, I verified the translation was requested/reviewed in the Discord and approved by a Kiroku head developer team
  - [ ] I verified all numbers, amounts, dates and phone numbers shown in the product are using the localization methods from the `LocaleContextProvider`
  - [ ] I verified any copy / text that was added to the app is grammatically correct in English. It adheres to proper capitalization guidelines (note: only the first word of header/labels should be capitalized).
  - [ ] I verified proper file naming conventions were followed for any new files or renamed files. All non-platform specific files are named after what they export and are not named "index.js". All platform-specific files are named for the platform the code supports as outlined in the README.
  - [ ] I verified the JSDocs style guidelines (in [`STYLE.md`](https://github.com/PetrCala/Kiroku/blob/master/contributingGuides/STYLE.md#jsdocs)) were followed
- [ ] If a new code pattern is added I verified it was agreed to be used by multiple Kiroku head development team members
- [ ] I followed the guidelines as stated in the [Review Guidelines](https://github.com/PetrCala/Kiroku/blob/master/contributingGuides/PR_REVIEW_GUIDELINES.md)
- [ ] I tested other components that can be impacted by my changes (i.e. if the PR modifies a shared library or component like `ProfileImage`, I verified the components using `ProfileImage` are working as expected)
- [ ] I verified all code is DRY (the PR doesn't include any logic written more than once, with the exception of tests)
- [ ] I verified that all code follows the ETC (easy-to-change) principle
- [ ] I verified any variables that can be defined as constants (i.e., in CONST.js or at the top of the file that uses the constant) are defined as such
- [ ] I verified that if a function's arguments changed that all usages and relevant docstrings have also been updated correctly
- [ ] If any new file was added I verified that:
  - [ ] The file has a description of what it does and/or why is needed at the top of the file if the code is not self explanatory
- [ ] If a new CSS style is added I verified that:
  - [ ] A similar style doesn't already exist
  - [ ] The style can't be created with an existing `StyleUtils` function (i.e. `StyleUtils.getBackgroundAndBorderStyle(theme.componentBG)`)
- [ ] If the PR modifies a generic component, I tested and verified that those changes do not break usages of that component in the rest of the App (i.e. if a shared library or component like `ProfileImage` is modified, I verified that `ProfileImage` is working as expected in all cases)
- [ ] If the PR modifies a component or screen that can be accessed by a direct deeplink, I verified that the code functions as expected when the deeplink is used - from a logged in and logged out account.
- [ ] If the PR modifies the UI (e.g. new buttons, new UI components, changing the padding/spacing/sizing, moving components, etc) or modifies the form input styles:
  - [ ] I verified that all the inputs inside a form are aligned with each other.
  - [ ] I added `design` label and/or tagged `@Kiroku/design` so the design team can review the changes.
- [ ] If a new screen is added, I verified it's using the `ScrollView` component to make it scrollable when more elements are added to the screen.
- [ ] If the `master` branch was merged into this PR after a review, I tested again and verified the outcome was still expected according to the `Test` steps.

### Screenshots/Videos

<details>
<summary>Android</summary>

<!-- add screenshots or videos here -->

</details>

<details>
<summary>iOS</summary>

<!-- add screenshots or videos here -->

</details>
