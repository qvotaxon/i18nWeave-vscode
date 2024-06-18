# Change Log

All notable changes to the "i18nweave" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.7.0](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.6.0...v1.7.0) (2024-06-18)


### Features

* add async file change handling in tests ([#19](https://github.com/qvotaxon/i18nWeave-vscode/issues/19))  ([e4c066a](https://github.com/qvotaxon/i18nWeave-vscode/commit/e4c066a03439a649284f5de799311e4f828d5e67))
* add configuration management for extension ([#15](https://github.com/qvotaxon/i18nWeave-vscode/issues/15)) ([2823a65](https://github.com/qvotaxon/i18nWeave-vscode/commit/2823a65552f5bb8492d33f2be11c6e674378d9ce))
* add file manipulation & testing utilities ([#8](https://github.com/qvotaxon/i18nWeave-vscode/issues/8)) ([63ca786](https://github.com/qvotaxon/i18nWeave-vscode/commit/63ca78673d824fff4905f71a750dbfa1521e77cf))
* add i18nextScanner module and TypeScriptFileChangeHandler ([#30](https://github.com/qvotaxon/i18nWeave-vscode/issues/30)) ([5eb75e4](https://github.com/qvotaxon/i18nWeave-vscode/commit/5eb75e43aa37681a5ce2d66fdef3f76f86d755f2))
* add schema to Release Please config files ([#71](https://github.com/qvotaxon/i18nWeave-vscode/issues/71)) ([1741b86](https://github.com/qvotaxon/i18nWeave-vscode/commit/1741b86e34a7b86670fc895f373d7b6d62f923cd))
* enhance TypeScript handler with translation key check ([#75](https://github.com/qvotaxon/i18nWeave-vscode/issues/75)) ([943c368](https://github.com/qvotaxon/i18nWeave-vscode/commit/943c36820584e09d534ecaf706378dc5f806d0a9))
* fix build ([4d35410](https://github.com/qvotaxon/i18nWeave-vscode/commit/4d35410ba2cac04f415b6bd60edec61943541485))
* fix release ([#55](https://github.com/qvotaxon/i18nWeave-vscode/issues/55)) ([ba09251](https://github.com/qvotaxon/i18nWeave-vscode/commit/ba09251db05ca8c1356eed45c6da3dc7f47cd507))
* fix release.yml ([#57](https://github.com/qvotaxon/i18nWeave-vscode/issues/57)) ([fe6c20e](https://github.com/qvotaxon/i18nWeave-vscode/commit/fe6c20ee4f2e09aece098f6dfacc0a0ba0a2fc2b))
* implement chain of responsibility ([#2](https://github.com/qvotaxon/i18nWeave-vscode/issues/2)) ([5e9f3b6](https://github.com/qvotaxon/i18nWeave-vscode/commit/5e9f3b6bc63628078b19a1f0ed5875381303459b))
* implement i18next json to po conversion ([#5](https://github.com/qvotaxon/i18nWeave-vscode/issues/5)) ([6448abf](https://github.com/qvotaxon/i18nWeave-vscode/commit/6448abf7f9cf2974e2be0d6e079f7310ac9117d9))
* implement json file handling modules ([#4](https://github.com/qvotaxon/i18nWeave-vscode/issues/4)) ([9bef83c](https://github.com/qvotaxon/i18nWeave-vscode/commit/9bef83c8088de6b936ebde51a99d191364e9e793))
* Implement JsonFileChangeHandler and tests ([7f3e008](https://github.com/qvotaxon/i18nWeave-vscode/commit/7f3e008f01d256f6733bba747efdbeb26ff5a270))
* implement ModuleChainManager with tests ([#25](https://github.com/qvotaxon/i18nWeave-vscode/issues/25)) ([dc8ef78](https://github.com/qvotaxon/i18nWeave-vscode/commit/dc8ef78bf940fa44239a96f8f1dcc9bc52a91373))
* Improve file handling and watcher creation ([#14](https://github.com/qvotaxon/i18nWeave-vscode/issues/14)) ([2fb8011](https://github.com/qvotaxon/i18nWeave-vscode/commit/2fb8011c41027726f25d68fe5d054e70fbd200e6))
* integrate config store & add testing libs ([#16](https://github.com/qvotaxon/i18nWeave-vscode/issues/16)) ([68062d9](https://github.com/qvotaxon/i18nWeave-vscode/commit/68062d9265658d03105ff957cf40f6543e848d77))
* simplify indentation in codecov.yml ([#66](https://github.com/qvotaxon/i18nWeave-vscode/issues/66)) ([03dfc81](https://github.com/qvotaxon/i18nWeave-vscode/commit/03dfc8177669c7ce3660fc63debdd0ae35a768a0))
* streamline CI workflows for better efficiency ([#61](https://github.com/qvotaxon/i18nWeave-vscode/issues/61)) ([c77f998](https://github.com/qvotaxon/i18nWeave-vscode/commit/c77f9984f2e9626a5b1141fe8cf6f73531f72984))
* streamline extension activation process ([#6](https://github.com/qvotaxon/i18nWeave-vscode/issues/6)) ([0b9af12](https://github.com/qvotaxon/i18nWeave-vscode/commit/0b9af125bb0ed19167dc1806cabec9bacedcd078))
* update download artifact step in release workflow ([#58](https://github.com/qvotaxon/i18nWeave-vscode/issues/58)) ([c74af76](https://github.com/qvotaxon/i18nWeave-vscode/commit/c74af7619c7d68cac9e8c95a6f7203be826f8d2b))


### Bug Fixes

* add permissions configuration to release workflow ([#63](https://github.com/qvotaxon/i18nWeave-vscode/issues/63)) ([524d9e5](https://github.com/qvotaxon/i18nWeave-vscode/commit/524d9e5cf66418226879e33f6e645ab482442cf8))
* **build:** add release_created check for main branch steps ([#52](https://github.com/qvotaxon/i18nWeave-vscode/issues/52)) ([1e6129f](https://github.com/qvotaxon/i18nWeave-vscode/commit/1e6129fa1b758db400372d3f1fa12c563bbe6ce1))
* **ci:** update release-please-action and add manifest ([#68](https://github.com/qvotaxon/i18nWeave-vscode/issues/68)) ([f885934](https://github.com/qvotaxon/i18nWeave-vscode/commit/f8859347160a870421e1ad59a69e0d3e3818accf))
* **README:** correct broken link to Features section ([#48](https://github.com/qvotaxon/i18nWeave-vscode/issues/48)) ([ce4a1eb](https://github.com/qvotaxon/i18nWeave-vscode/commit/ce4a1ebd10f1ad83810485657eb3741e5ba238ef))
* remove default value from modulechainmanager ([#3](https://github.com/qvotaxon/i18nWeave-vscode/issues/3)) ([cc0225c](https://github.com/qvotaxon/i18nWeave-vscode/commit/cc0225c377671a80df532a0a70ad8b45e10adf2a))
* **workflow:** correct artifact download in release job ([#60](https://github.com/qvotaxon/i18nWeave-vscode/issues/60)) ([c80b6fd](https://github.com/qvotaxon/i18nWeave-vscode/commit/c80b6fd3788fe6d54722c9709abfd56a45c160a9))
* **workflows:** correct VSIX artifact download path ([#53](https://github.com/qvotaxon/i18nWeave-vscode/issues/53)) ([e5387d7](https://github.com/qvotaxon/i18nWeave-vscode/commit/e5387d75e8fe0b06c85b151a92454290b9d3218c))

## [1.6.0](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.5.0...v1.6.0) (2024-06-17)


### Features

* enhance TypeScript handler with translation key check ([#75](https://github.com/qvotaxon/i18nWeave-vscode/issues/75)) ([943c368](https://github.com/qvotaxon/i18nWeave-vscode/commit/943c36820584e09d534ecaf706378dc5f806d0a9))

## [1.5.0](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.4.1...v1.5.0) (2024-06-16)


### Features

* add schema to Release Please config files ([#71](https://github.com/qvotaxon/i18nWeave-vscode/issues/71)) ([1741b86](https://github.com/qvotaxon/i18nWeave-vscode/commit/1741b86e34a7b86670fc895f373d7b6d62f923cd))

## [1.4.1](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.4.0...v1.4.1) (2024-06-16)


### Bug Fixes

* **ci:** update release-please-action and add manifest ([#68](https://github.com/qvotaxon/i18nWeave-vscode/issues/68)) ([f885934](https://github.com/qvotaxon/i18nWeave-vscode/commit/f8859347160a870421e1ad59a69e0d3e3818accf))

## [1.4.0](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.3.1...v1.4.0) (2024-06-16)


### Features

* simplify indentation in codecov.yml ([#66](https://github.com/qvotaxon/i18nWeave-vscode/issues/66)) ([03dfc81](https://github.com/qvotaxon/i18nWeave-vscode/commit/03dfc8177669c7ce3660fc63debdd0ae35a768a0))

## [1.3.1](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.3.0...v1.3.1) (2024-06-16)


### Bug Fixes

* add permissions configuration to release workflow ([#63](https://github.com/qvotaxon/i18nWeave-vscode/issues/63)) ([524d9e5](https://github.com/qvotaxon/i18nWeave-vscode/commit/524d9e5cf66418226879e33f6e645ab482442cf8))

## [1.3.0](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.2.0...v1.3.0) (2024-06-16)


### Features

* streamline CI workflows for better efficiency ([#61](https://github.com/qvotaxon/i18nWeave-vscode/issues/61)) ([c77f998](https://github.com/qvotaxon/i18nWeave-vscode/commit/c77f9984f2e9626a5b1141fe8cf6f73531f72984))

## [1.2.0](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.1.0...v1.2.0) (2024-06-16)


### Features

* fix release.yml ([#57](https://github.com/qvotaxon/i18nWeave-vscode/issues/57)) ([fe6c20e](https://github.com/qvotaxon/i18nWeave-vscode/commit/fe6c20ee4f2e09aece098f6dfacc0a0ba0a2fc2b))
* update download artifact step in release workflow ([#58](https://github.com/qvotaxon/i18nWeave-vscode/issues/58)) ([c74af76](https://github.com/qvotaxon/i18nWeave-vscode/commit/c74af7619c7d68cac9e8c95a6f7203be826f8d2b))


### Bug Fixes

* **workflow:** correct artifact download in release job ([#60](https://github.com/qvotaxon/i18nWeave-vscode/issues/60)) ([c80b6fd](https://github.com/qvotaxon/i18nWeave-vscode/commit/c80b6fd3788fe6d54722c9709abfd56a45c160a9))

## [1.1.0](https://github.com/qvotaxon/i18nWeave-vscode/compare/v1.0.0...v1.1.0) (2024-06-16)


### Features

* fix build ([4d35410](https://github.com/qvotaxon/i18nWeave-vscode/commit/4d35410ba2cac04f415b6bd60edec61943541485))
* fix release ([#55](https://github.com/qvotaxon/i18nWeave-vscode/issues/55)) ([ba09251](https://github.com/qvotaxon/i18nWeave-vscode/commit/ba09251db05ca8c1356eed45c6da3dc7f47cd507))

## 1.0.0 (2024-06-16)


### Features

* add async file change handling in tests ([#19](https://github.com/qvotaxon/i18nWeave-vscode/issues/19))  ([e4c066a](https://github.com/qvotaxon/i18nWeave-vscode/commit/e4c066a03439a649284f5de799311e4f828d5e67))
* add configuration management for extension ([#15](https://github.com/qvotaxon/i18nWeave-vscode/issues/15)) ([2823a65](https://github.com/qvotaxon/i18nWeave-vscode/commit/2823a65552f5bb8492d33f2be11c6e674378d9ce))
* add file manipulation & testing utilities ([#8](https://github.com/qvotaxon/i18nWeave-vscode/issues/8)) ([63ca786](https://github.com/qvotaxon/i18nWeave-vscode/commit/63ca78673d824fff4905f71a750dbfa1521e77cf))
* add i18nextScanner module and TypeScriptFileChangeHandler ([#30](https://github.com/qvotaxon/i18nWeave-vscode/issues/30)) ([5eb75e4](https://github.com/qvotaxon/i18nWeave-vscode/commit/5eb75e43aa37681a5ce2d66fdef3f76f86d755f2))
* implement chain of responsibility ([#2](https://github.com/qvotaxon/i18nWeave-vscode/issues/2)) ([5e9f3b6](https://github.com/qvotaxon/i18nWeave-vscode/commit/5e9f3b6bc63628078b19a1f0ed5875381303459b))
* implement i18next json to po conversion ([#5](https://github.com/qvotaxon/i18nWeave-vscode/issues/5)) ([6448abf](https://github.com/qvotaxon/i18nWeave-vscode/commit/6448abf7f9cf2974e2be0d6e079f7310ac9117d9))
* implement json file handling modules ([#4](https://github.com/qvotaxon/i18nWeave-vscode/issues/4)) ([9bef83c](https://github.com/qvotaxon/i18nWeave-vscode/commit/9bef83c8088de6b936ebde51a99d191364e9e793))
* Implement JsonFileChangeHandler and tests ([7f3e008](https://github.com/qvotaxon/i18nWeave-vscode/commit/7f3e008f01d256f6733bba747efdbeb26ff5a270))
* implement ModuleChainManager with tests ([#25](https://github.com/qvotaxon/i18nWeave-vscode/issues/25)) ([dc8ef78](https://github.com/qvotaxon/i18nWeave-vscode/commit/dc8ef78bf940fa44239a96f8f1dcc9bc52a91373))
* Improve file handling and watcher creation ([#14](https://github.com/qvotaxon/i18nWeave-vscode/issues/14)) ([2fb8011](https://github.com/qvotaxon/i18nWeave-vscode/commit/2fb8011c41027726f25d68fe5d054e70fbd200e6))
* integrate config store & add testing libs ([#16](https://github.com/qvotaxon/i18nWeave-vscode/issues/16)) ([68062d9](https://github.com/qvotaxon/i18nWeave-vscode/commit/68062d9265658d03105ff957cf40f6543e848d77))
* streamline extension activation process ([#6](https://github.com/qvotaxon/i18nWeave-vscode/issues/6)) ([0b9af12](https://github.com/qvotaxon/i18nWeave-vscode/commit/0b9af125bb0ed19167dc1806cabec9bacedcd078))


### Bug Fixes

* **build:** add release_created check for main branch steps ([#52](https://github.com/qvotaxon/i18nWeave-vscode/issues/52)) ([1e6129f](https://github.com/qvotaxon/i18nWeave-vscode/commit/1e6129fa1b758db400372d3f1fa12c563bbe6ce1))
* **README:** correct broken link to Features section ([#48](https://github.com/qvotaxon/i18nWeave-vscode/issues/48)) ([ce4a1eb](https://github.com/qvotaxon/i18nWeave-vscode/commit/ce4a1ebd10f1ad83810485657eb3741e5ba238ef))
* remove default value from modulechainmanager ([#3](https://github.com/qvotaxon/i18nWeave-vscode/issues/3)) ([cc0225c](https://github.com/qvotaxon/i18nWeave-vscode/commit/cc0225c377671a80df532a0a70ad8b45e10adf2a))
* **workflows:** correct VSIX artifact download path ([#53](https://github.com/qvotaxon/i18nWeave-vscode/issues/53)) ([e5387d7](https://github.com/qvotaxon/i18nWeave-vscode/commit/e5387d75e8fe0b06c85b151a92454290b9d3218c))

## [Unreleased]

- Initial release
