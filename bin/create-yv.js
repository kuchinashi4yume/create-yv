#!/usr/bin/env node

// ========================================================================================================================================
// 1. Import
// ========================================================================================================================================
const fs = require('node:fs');
const path = require('node:path');

const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');



// ========================================================================================================================================
// 2. Field
// ========================================================================================================================================
const args = process.argv.slice(2);
let projectName = args[0];

const rl = readline.createInterface({ input, output });



// ========================================================================================================================================
// 3. Check the project name
// ========================================================================================================================================
async function checkProjectName() {
    // Case 1: projectName was not entered.
    if (!projectName) {
        try {
            projectName = await rl.question('Please enter the project name: ');
        } catch (e) {
            console.error(e);
            process.exit(1);
        } finally {
            rl.close();
        }
    } else {
        rl.close();
    }

    // Case 2: projectName starts with special characters
    if (!projectName || projectName.startsWith('-')) {
        console.error('Invalid project name');
        process.exit(1);
    }
}



// ========================================================================================================================================
// 4. Check the directories
// ========================================================================================================================================
async function checkDirectories() {
    const templateDir = path.resolve(__dirname, '../templates/basic');
    const targetDir = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
        const entires = fs.readdirSync(targetDir);
        if (entires.length > 0) {
            console.error(`Directory is not empty: ${targetDir}`);
            process.exit(1);
        }
    } else {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.cpSync(templateDir, targetDir, { recursive: true });

    return targetDir;
}



// ========================================================================================================================================
// 5. Replace __YV_APP_NAME__ to projectName
// ========================================================================================================================================
/**
 * List of include: __YV_APP_NAME__
 * 
 * 1. src/yv.c
 * 2. src/yv/yv_macos_menu.m
 * 3. CMakeLists.txt
 * 4. Makefile
 */
async function applyProjectName(targetDir) {
    const fileList = [
        'src/yv.c',
        'src/yv/yv_macos_menu.m',
        'CMakeLists.txt',
        'Makefile'
    ];

    try {
        for (const file of fileList) {
            const filePath = path.resolve(targetDir, file);
            const originalFile = fs.readFileSync(filePath, 'utf8');
            const searchWord = '__YV_APP_NAME__';
            const updatedFile = originalFile.replaceAll(searchWord, projectName);

            fs.writeFileSync(filePath, updatedFile, 'utf8');
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}



// ========================================================================================================================================
// 6. Run!
// ========================================================================================================================================
(async () => {
    await checkProjectName();
    const targetDir = await checkDirectories();
    await applyProjectName(targetDir);

    console.log(`\nCreated yv project: ${projectName}`);
    console.log(`   cd ${projectName}`);
    console.log(`   make`)
    console.log(`   make build`)
})();