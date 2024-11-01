[![Downloads](https://img.shields.io/visual-studio-marketplace/d/qvotaxon.i18nweave?logo=github&branch=main)](https://marketplace.visualstudio.com/items?itemName=qvotaxon.i18nweave)
![Latest version](https://img.shields.io/github/package-json/v/qvotaxon/i18nweave-vscode)

[![Build](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/build.yml)
[![CodeQL](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/github-code-scanning/codeql)
[![codecov](https://codecov.io/github/qvotaxon/i18nWeave-vscode/graph/badge.svg?token=GJVSSQ0WRS)](https://codecov.io/github/qvotaxon/i18nWeave-vscode)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=qvotaxon_i18nWeave-vscode&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=qvotaxon_i18nWeave-vscode)

[![Contributors](https://img.shields.io/github/contributors/qvotaxon/i18nweave-vscode?logo=github&branch=main)](https://github.com/qvotaxon/i18nweave-vscode/graphs/contributors)
[![Open Issues](https://img.shields.io/github/issues/qvotaxon/i18nweave-vscode?logo=github&branch=main)](https://github.com/qvotaxon/i18nweave-vscode/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed/qvotaxon/i18nweave-vscode?logo=github&branch=main)](https://github.com/qvotaxon/i18nweave-vscode/issues?q=is%3Aissue+is%3Aclosed)

[![License](https://img.shields.io/github/license/qvotaxon/i18nweave-vscode?logo=github)](https://github.com/qvotaxon/i18nweave-vscode/blob/main/LICENSE.txt)

<!-- [![Languages](https://img.shields.io/github/languages/top/qvotaxon/i18nweave-vscode?logo=github&branch=main)](https://github.com/qvotaxon/i18nweave-vscode/releases) -->

# i18nWeave - Developer's i18n Companion

<div align="center">
    <img src="static/logo.png" alt="alt text" height="300">
</div>

<font color="orange">**Note**: Please be aware that this extension is currently under development. Use it with the understanding that features and functionality may change.</font>

i18nWeave is a Visual Studio Code extension designed to streamline the management of translation files within development projects. Its goal is to reduce the amount of time software developers waste on translation-related tasks, allowing them to focus more on coding and improving productivity.

See the website [i18nWeave.com](https://i18nweave.com) for more info.

<!-- ## Screenshots -->

<!-- ![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here) -->

## ⭐ Features

- **Installation Wizard**

  Get up and running in no time using the build-in configuration wizard. Pick any of the build-in framework configurations and get started in just a few clicks. Or with just a few more clicks setup a custom project using i18next translations.

- **Translation Key Extraction**

  This feature allows for the easy extraction of translation keys from code files, which ensures the accurate localization of your application.

- **Automatic Translations**

  When you add a translation for one locale, translations for all other locales are automatically generated. The following translators have been (or will be) implemented:

  - [DeepL](https://www.deepl.com/translator) - Is now in beta - (requires an Api key)
  - [Google Translate](https://translate.google.com) (not implemented yet)

## Beta Features

- [DeepL](https://www.deepl.com/translator) - (requires an Api key)

  Please be aware that since this is still a beta feature, you should take extra care when enabling this feature.
  If the feature missbehaves it could possibly cause token to be spend is massive amounts.

  > **If you have a paid account, you probably shouldn't enable this feature yet.**

<!-- ## Installation

Navigate to [Tagged Releases](https://github.com/qvotaxon/i18nweave-vscode/tags) and download the latest stable VSIX file.

TODO:

- add more instructions
- explain the need for i18n-next-scanner.config.json file.
- explain need for file path configurations -->

<!-- ## Configuration

TODO:

- explain configuration options

## Usage/Examples

TODO

- show code samples and required configuration -->

## 🚧 Roadmap

### Somewhere in the nearer future

- Support More Automatic Configurations For Other Frameworks. Such as React and Angular.

### Somewhere in the farther future

- Implement ai features

## 👍 Acknowledgements

This extension leans on at least the following libraries / packages.

- [i18next-scanner](https://github.com/i18next/i18next-scanner)

## 🤓 Authors

- [@qvotaxon](https://www.github.com/qvotaxon)

## 🧾 Motivation

After having worked with translation files in a large React web application for a client for some time, I discovered that manually managing the JSON translation files that come with translating an application isn't easily manageable within a larger team. When multiple people have to modify the same files by hand, merge conflicts tend to occur frequently. This not only costs valuable developer time but also affects developer satisfaction, as developers generally despise the tedious task of manually merging multiple JSON files line by line. It's as exciting as watching paint dry!

I needed a way to have the translation files be consistent for every developer, regardless of who added them. There shouldn't be a need for manually editing JSON files to manage your translations.

I couldn't really find a good solution to my problem, so, I decided to take matters into my own hands and create i18nWeave, a versatile Visual Studio Code extension designed to streamline the management of translation files within your development projects. With its intuitive features, i18nWeave simplifies the process of handling translation keys, providing flexibility and efficiency in your workflow.

I have designed the extension to be modular, allowing for the easy addition of functionalities. These functionalities, referred to as modules, can be easily enabled or disabled through the configuration settings. Have a look at the features for more info: [Features](#-features).

Now, you can say goodbye to those mind-numbing merge conflicts and hello to a more enjoyable and productive development experience. Let i18nWeave do the heavy lifting for you, so you can focus on what you do best - writing amazing code!

<!--
## 🚀 About Me

TODO

- Tell a bit more About Me...

-->

<!-- ## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fqvotaxon%2Fi18nweave-vscode.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fqvotaxon%2Fi18nweave-vscode?ref=badge_large) -->
