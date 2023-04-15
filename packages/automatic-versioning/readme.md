# @sliit-foss/automatic-versioning

### A script which will automatically increment your app package version in accordance with conventional commits

<br/>

---

## Why automatic-versioning

- Most version bumping scripts only focus on just the version bumping. **automatic-versioning** takes into account your git changes and automatically increments the version number based on your last commit message only if there are changes in your directory, a feature which is highly useful in monorepos.

---

## Prerequisites

- [Git](https://git-scm.com/) installed and configured

## Installation

```bash
# using npm
npm install @sliit-foss/automatic-versioning

# using yarn
yarn add @sliit-foss/automatic-versioning
```

## Usage

- Add the following script to your package.json<br/>

```json
  "scripts": {
      "bump-version": "npx automatic-versioning --name=<package_name>"
  }
```

- then:

```bash
# using npm
npm run bump-version

# using yarn
yarn bump-version
```

## Usage with commitlint and husky<br/>

- ### Install the following dependencies

```json
  "dependencies": {
    "@commitlint/cli": "^17.0.1",
    "@commitlint/config-conventional": "^17.0.0",
    "husky": "^4.3.8"
  }
```

- ### Add the following to your package.json<br/>

```json
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  },
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "post-commit": "HUSKY_SKIP_HOOKS=1 yarn bump-version",
    }
  },
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ]
  }
```

## Commit message prefixes and associated version bumping

```bash
    - Feat! - bump major version
```

```bash
    - Feat  - bump minor version
```

```bash
    - Fix   - bump patch version
```

## Disable version bumping for specific commit<br/><br/>

- Add the following to your commit message: "--no-bump"<br/>

```bash
  git commit -m "Feat: some feature --no-bump"
```

## Disable --no-bump commit message edit <br/><br/>

- By default automatic-versioning will edit the commit message in no-bump commits and remove the no-bump part from the commit message. Sometimes such as in the case of monorepos, this can prove to be a problem. To disable this behavior, add the following to your script: "--no-commit-edit"<br/>

```bash
  npx automatic-versioning --name=<package_name> --no-commit-edit
```

## Custom app directory to run incrementing script<br/><br/>

- Add the following option to your bump script: "--rootDir=<custom_dir>"<br/>

```bash
  npx automatic-versioning --name=<package_name> --rootDir=<custom_dir>
```

## Recursively search commit history to find version bump trigger<br/><br/>

- Add the following option to your bump script: "--recursive"<br/>

```bash
  npx automatic-versioning --name=<package_name> --recursive
```
