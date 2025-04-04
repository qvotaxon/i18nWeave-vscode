[![Downloads](https://img.shields.io/visual-studio-marketplace/d/qvotaxon.i18nweave?logo=github&branch=main)](https://marketplace.visualstudio.com/items?itemName=qvotaxon.i18nweave)
[![Latest version](https://img.shields.io/github/package-json/v/qvotaxon/i18nweave-vscode)](https://marketplace.visualstudio.com/items?itemName=qvotaxon.i18nweave)

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

<font color="orange">**Note**: Please be aware that this extension is currently under development. Use it with the understanding that features and functionality may change.</font>

See the website [i18nWeave.com](https://i18nweave.com/) for more info. Of course available in multiple languages thanks to i18nWeave.

<!-- ## Screenshots -->

<!-- ![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here) -->

## ⭐ Features

### Main Features

- **Installation Wizard**

  Get up and running in no time using the build-in configuration wizard. Pick any of the build-in framework configurations and get started in just a few clicks. Or with just a few more clicks setup a custom project using i18next translations.

- **Translation Key Extraction**

  This feature allows for the easy extraction of translation keys from code files, which ensures the accurate localization of your application.

- **Automatic Translations**

  When you add a translation for one locale, translations for all other locales are automatically generated. The following translators have been (or will be) implemented:

  - [DeepL](https://www.deepl.com/translator) (requires an Api key)
  - [Google Translate](https://translate.google.com) (not implemented yet)

- **Intellisense Autocomplete for Translation Keys**

  Provides in-editor suggestions for existing translation keys as you type. This feature helps maintain consistency by ensuring you use the correct keys defined in your translation files.

- **Contextual Translation Statistics**

  Hover over translation keys to see your translation progress for that key, in total and per language. Get instant insight in the value your translation key represents in the default language. And get warned when big differences in text sizes between languages exist (taking into consideration different characters sets), which could indicate translation mistakes. 

- **Translation Key Navigation**

  Click on a translation key to quickly edit the key's value. The editor will open the related i18next resource file of your default language in the correct namespace, enabling easy navigation to your keys and facilitating quick translations after adding new keys.

<!--
### Misc Features

- **Smart code change detection**

  Only execute when needed.
-->

### Beta Features

- **Table View**

  Have i18nWeave represent your json files in a table format. 

  > **This feature is still very buggy and very likely to be replaced.**

## Configuring Your i18nWeave Extension

To configure the i18nWeave extension, follow these instructions:

1. **Open Command Palette:**
   - Open the command palette by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac).

2. **Run Configure Command:**
   - In the command palette, type `i18nWeave: Configure extension` and select it.

```plaintext
Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac)
```

3. **Single Project Configuration:**
   - If you are not using a monorepo, select **Single Project** when prompted. Note that monorepos are not supported yet.

4. **Choose Framework:**
   - You will be prompted to choose among several frameworks. Since none are implemented yet, select **Custom**.
   
5. **Select Translation Files Location:**
   - Choose the location of your translation files. A folder browser will appear for you to select the appropriate folder.

   ```plaintext
   📁 Select your translation files location
   ```

6. **Select Code Files Location:**
   - Next, choose the location of your code files. A folder browser will appear, and you will be allowed to select multiple folders.

   ```plaintext
   📁 Select your code files location (multiple select allowed)
   ```

7. **Enter Default Language:**
   - You will need to enter your default language. This can be in formats like `nl`, `en`, `nl-NL`, or `en-GB`.

   ```plaintext
   Enter your default language (e.g., en-GB)
   ```

8. **Enter Supported Languages:**
   - Enter all the supported languages you want to include, separated by commas.

   ```plaintext
   Enter supported languages (e.g., en, nl, fr, de)
   ```

9. **Enter Translation Namespaces:**
   - Finally, enter the namespaces of your translations, such as `common` and `navigation`.

   ```plaintext
   Enter translation namespaces (e.g., common, navigation)
   ```

---

By following these steps, you will have successfully configured the i18nWeave extension.

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

- Support more automatic configurations for other frameworks. Such as React and Angular.

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

