![Downloads](https://img.shields.io/visual-studio-marketplace/d/qvotaxon.i18nweave-vscode?logo=github&branch=main)

[![Build](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/build.yml)
[![CodeQL](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/qvotaxon/i18nWeave-vscode/actions/workflows/github-code-scanning/codeql)
[![codecov](https://codecov.io/github/qvotaxon/i18nWeave-vscode/graph/badge.svg?token=GJVSSQ0WRS)](https://codecov.io/github/qvotaxon/i18nWeave-vscode)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=qvotaxon_i18nWeave-vscode&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=qvotaxon_i18nWeave-vscode)
![Open Issues](https://img.shields.io/github/issues/qvotaxon/i18nweave-vscode?logo=github&branch=main)
![Closed Issues](https://img.shields.io/github/issues-closed/qvotaxon/i18nweave-vscode?logo=github&branch=main)

[![Languages](https://img.shields.io/github/languages/top/qvotaxon/i18nweave-vscode?logo=github&branch=main)](https://github.com/qvotaxon/i18nweave-vscode/releases)
![Contributors](https://img.shields.io/github/contributors/qvotaxon/i18nweave-vscode?logo=github&branch=main)

[![License](https://img.shields.io/github/license/qvotaxon/i18nweave-vscode?logo=github)](https://github.com/qvotaxon/i18nweave-vscode/releases)
![Latest version](https://img.shields.io/github/package-json/v/qvotaxon/i18nweave-vscode)

# i18nWeave - Developer's i18n Companion

<div align="center">
    <img src="static/img-AnBmJQ10bAe8mXdWwP4hG6Ha.png" alt="alt text" height="300">
</div>

<font color="orange">**Note**: Please be aware that this extension is currently under development. Use it with the understanding that features and functionality may change.</font>

i18nWeave is a Visual Studio Code extension designed to streamline the management of translation files within development projects. Its goal is to reduce the amount of time software developers waste on translation-related tasks, allowing them to focus more on coding and improving productivity.

<!-- ## Screenshots -->

<!-- ![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here) -->

## ⭐ Features

- **Translation Key Extraction**: This feature allows for the easy extraction of translation keys from code files, which ensures the accurate localization of your application.
- **PO File Support**: You have the option to use PO files for managing translations. This feature enables seamless integration with your existing localization workflows.
- **PO to i18n-next JSON Conversion**: Effortlessly convert PO files into the i18n-next JSON format and vice versa. This conversion facilitates compatibility with a variety of localization tools and libraries.
- **Automatic Translations**: When you add a translation for one locale, translations for all other locales are automatically generated. The following translators have been (or will be) implemented:
  - [DeepL](https://www.deepl.com/translator) (requires an Api key)
  - [Google Translate](https://translate.google.com) (not implemented yet)

<!-- ### Modes

- **Manual Mode**: Take control of translation key extraction by manually clicking on status bar icons, allowing for precise management of translation files.
- **Automatic Mode**: Enable automatic translation key extraction upon file save, ensuring real-time updates and effortless synchronization of translation files with your codebase. -->

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

- reduce required configuration / setup

### Somewhere in the far future

- Implement ai features

## 👍 Acknowledgements

This extension leans on at least the following libraries / packages.

- [gettext-converter](https://github.com/locize/gettext-converter)
- [i18next-scanner](https://github.com/i18next/i18next-scanner)

## 🤓 Authors

- [@qvotaxon](https://www.github.com/qvotaxon)

## 🧾 Motivation

After having worked with translation files in a large React web application for a client for some time, I discovered that manually managing the JSON translation files that come with translating an application isn't easily manageable within a larger team. When multiple people have to modify the same files by hand, merge conflicts tend to occur frequently. This not only costs valuable developer time but also affects developer satisfaction, as developers generally despise the tedious task of manually merging multiple JSON files line by line. It's as exciting as watching paint dry!

I needed a way to have the translation files be consistent for every developer, regardless of who added them. There shouldn't be a need for manually editing JSON files to manage your translations.

I couldn't really find a good solution to my problem, so, I decided to take matters into my own hands and create i18nWeave, a versatile Visual Studio Code extension designed to streamline the management of translation files within your development projects. With its intuitive features, i18nWeave simplifies the process of handling translation keys, providing flexibility and efficiency in your workflow.

I have designed the extension to be modular, allowing for the easy addition of functionalities. These functionalities, referred to as modules, can be easily enabled or disabled through the configuration settings. Currently, the extension includes a translation key extraction module, a PO to JSON file converter module, and a JSON to PO file converter module, see [Features](#features).

Now, you can say goodbye to those mind-numbing merge conflicts and hello to a more enjoyable and productive development experience. Let i18nWeave do the heavy lifting for you, so you can focus on what you do best - writing amazing code!

<!--
## 🚀 About Me

TODO

- Tell a bit more About Me...

-->

<!-- ## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fqvotaxon%2Fi18nweave-vscode.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fqvotaxon%2Fi18nweave-vscode?ref=badge_large) -->
