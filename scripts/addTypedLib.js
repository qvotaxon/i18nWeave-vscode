const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default;

const libsDir = path.join(__dirname, '/../src', 'libs');
const tsConfigPath = path.join(__dirname, '/../tsconfig.json');
const libTypes = ['feature', 'file-io', 'http', 'module', 'store', 'util'];
const tsconfigPrefix = '@i18n-weave';

/**
 * Returns a basic or singleton class template based on the singleton parameter.
 *
 * @param {string} className - The name of the class.
 * @param {boolean} singleton - Whether to generate a singleton class.
 * @returns {string} The class template.
 */
function generateClassTemplate(className, singleton) {
    if (singleton) {
        return `import * as vscode from 'vscode';

export class ${className} {
    private static _instance: ${className};

    private constructor() {
        // Private constructor to prevent instantiation
    }

    /**
     * Returns the singleton instance of ${className}. 
     */
    public static getInstance(): ${className} {
        if (!${className}._instance) {
            ${className}._instance = new ${className}();
        }
        return ${className}._instance;
    }
}`;
    } else {
        return `import vscode from 'vscode';

export class ${className} {
    
}`;
    }
}

/**
 * Adds a new library with a specified type, name, and singleton configuration.
 * - Creates a folder structure for the library.
 * - Adds either a basic or singleton class template.
 * - Updates tsconfig paths with the new library alias.
 *
 * @param {string} libType - The type of the library.
 * @param {string} libName - The name of the library.
 * @param {boolean} singleton - Whether to generate the library as a singleton.
 */
function addTypedLibrary(libType, libName, singleton) {
    const libPath = path.join(libsDir, libType, `${libType}-${libName}`, 'src', 'lib');
    const libFilePath = path.join(libPath, `${libName}.ts`);
    const testFilePath = path.join(libPath, `${libName}.test.ts`);
    const indexFilePath = path.join(libsDir, libType, `${libType}-${libName}`, 'src', 'index.ts');
    const className = libName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

    // Create directories and default files
    if (!fs.existsSync(libPath)) {
        fs.mkdirSync(libPath, { recursive: true });
        fs.writeFileSync(libFilePath, generateClassTemplate(className, singleton));
        fs.writeFileSync(testFilePath, `// Tests for ${className}`);
        fs.writeFileSync(indexFilePath, `export * from './lib/${libName}';`);

        console.log(`Created new library structure at: ${path.join(libsDir, libType, libName)}`);
    } else {
        console.log(`Library '${libName}' already exists under '${libType}'.`);
    }

    // Update tsconfig.json with the new alias
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    const libAlias = `${tsconfigPrefix}/${libType}/${libType}-${libName}`;

    if (!tsConfig.compilerOptions.paths) {
        tsConfig.compilerOptions.paths = {};
    }
    if (!tsConfig.compilerOptions.paths[libAlias]) {
        tsConfig.compilerOptions.paths[libAlias] = [`src/libs/${libType}/${libType}-${libName}/src`];
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
        console.log(`Added alias '${libAlias}' to tsconfig paths.`);
    } else {
        console.log(`Alias '${libAlias}' already exists in tsconfig paths.`);
    }

    console.log(`Find your main library file at:: ${path.join(libsDir, libType, `${libType}-${libName}`, 'src', 'lib', `${libName}.ts`)}`);
}

// Prompt the user for library type, name, and singleton option
inquirer
    .prompt([
        {
            type: 'list',
            name: 'libType',
            message: 'Select the library type:',
            choices: libTypes,
        },
        {
            type: 'input',
            name: 'libName',
            message: 'Enter the library name:',
            validate: (input) => input ? true : 'Library name cannot be empty.',
        },
        {
            type: 'confirm',
            name: 'singleton',
            message: 'Do you want this class to be a Singleton?',
            default: false,
        },
    ])
    .then((answers) => {
        addTypedLibrary(answers.libType, answers.libName, answers.singleton);
    })
    .catch((error) => {
        console.error('An error occurred:', error);
    });
