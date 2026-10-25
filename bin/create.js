#!/usr/bin/env node

//------------------------------------------------------------------------------------------------------------------------------------------------
// 1. import node:*
//------------------------------------------------------------------------------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';





//------------------------------------------------------------------------------------------------------------------------------------------------
// 2. import dependencies
//------------------------------------------------------------------------------------------------------------------------------------------------
import { downloadTemplate } from 'giget';
import { input, select, Separator } from '@inquirer/prompts';





//--------------------------------------------------------------------------------------------------------------------------------------------
// 3. Variables
//--------------------------------------------------------------------------------------------------------------------------------------------
const defaultProjectName = 'myapp';

let projectName = process.argv.slice(2)[0];
let targetDir;

let identifier;

let frontendType;





//--------------------------------------------------------------------------------------------------------------------------------------------
// 4. Functions
//--------------------------------------------------------------------------------------------------------------------------------------------
function isDirSafe(dir) {
    if (!fs.existsSync(dir)) return true;
    
    const entries = fs.readdirSync(dir);
    return entries.length === 0;
}





//------------------------------------------------------------------------------------------------------------------------------------------------
// 5. main
//------------------------------------------------------------------------------------------------------------------------------------------------
try {
    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-1. Get latest release version
    //--------------------------------------------------------------------------------------------------------------------------------------------
    const releases = await (async () => {
        const res = await fetch(
            'https://api.github.com/repos/kuchinashi4yume/yv/releases?per_page=100',
            { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) throw new Error(`Failed to fetch releases: ${res.status} ${res.statusText}`);

        return await res.json();
    })();

    const latestRelease = releases[0];
    if (!latestRelease) throw new Error('No release found');

    const version = latestRelease.tag_name;
    console.log(`(yv_version=${version})\n`);





    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-2. Set Project Info...
    //--------------------------------------------------------------------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-2-1. projectName
    //--------------------------------------------------------------------------------------------------------------------------------------------
    if (!projectName) {
        projectName = await input({ 
            message: 'Please enter the project name:',
            default: defaultProjectName,
            validate: newProjectName => {
                if (newProjectName.trim() === '') return 'Project name cannot be empty.';

                projectName = newProjectName;

                const checkDir = path.resolve(process.cwd(), projectName);

                if (!isDirSafe(checkDir)) {
                    return `Directory is not empty: ${checkDir}`;
                }

                return true;
            }
        });
        targetDir = path.resolve(process.cwd(), projectName);
    } else {
        targetDir = path.resolve(process.cwd(), projectName);
        
        if (!isDirSafe(targetDir)) {
            console.error('\x1b[31m%s\x1b[0m', `> Directory is not empty: ${targetDir}`);
            process.exit(1);
        }
    }

    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-2-2. identifier
    //--------------------------------------------------------------------------------------------------------------------------------------------
    identifier = await input({
        message: 'Please enter the identifier:',
        default: `com.${projectName}.app`,
        validate: newIdentifier => {
            if (newIdentifier.trim() === '') return 'Identifier cannot be empty.';
            return true;
        }
    });





    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-3. giget: download repo
    //--------------------------------------------------------------------------------------------------------------------------------------------
    const { dir } = await downloadTemplate(`github:kuchinashi4yume/yv#${version}`, { dir: targetDir });





    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-4. Set new project
    //--------------------------------------------------------------------------------------------------------------------------------------------

    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-4-1. Remove docs folder
    //--------------------------------------------------------------------------------------------------------------------------------------------
    fs.rmSync(path.resolve(dir, '_docs'), { recursive: true });

    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-4-2. Update yv_config.json
    //--------------------------------------------------------------------------------------------------------------------------------------------
    const pathConf = path.join(dir, 'yv_config.json');
    const conf = JSON.parse(fs.readFileSync(pathConf, { encoding: 'utf8' }));

    conf.name = projectName;
    conf.version = '0.0.1';
    conf.identifier = identifier;
    conf.window.title = projectName;

    fs.writeFileSync(pathConf, JSON.stringify(conf, null, 4));

    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-4-3. Update CMakeLists.txt
    //--------------------------------------------------------------------------------------------------------------------------------------------
    const pathCMakeListsTxt = path.join(dir, 'CMakeLists.txt');
    const cmakeliststxt = fs.readFileSync(pathCMakeListsTxt, { encoding: 'utf8' });

    cmakeliststxt.replace('__PLACEHOLDER__YV__PROJECT_NAME__YV__', projectName);

    fs.writeFileSync(pathCMakeListsTxt, cmakeliststxt);

    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-4-4. Update Makefile
    //--------------------------------------------------------------------------------------------------------------------------------------------
    const pathMakefile = path.join(dir, 'Makefile');
    const makefile = fs.readFileSync(pathMakefile, { encoding: 'utf8' }).replaceAll('yv', projectName);
    fs.writeFileSync(pathMakefile, makefile);

    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-4-5. Remove LICENSE
    //--------------------------------------------------------------------------------------------------------------------------------------------
    fs.rmSync(path.resolve(dir, 'LICENSE'), { recursive: true });
    
    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 5-4-6. Update Readme
    //--------------------------------------------------------------------------------------------------------------------------------------------
    const pathReadme = path.join(dir, 'README.md');
    const readme = `# ${projectName}`;
    fs.rmSync(pathReadme, { recursive: true });
    fs.writeFileSync(pathReadme, readme);


    


    //--------------------------------------------------------------------------------------------------------------------------------------------
    // 99. Done
    //--------------------------------------------------------------------------------------------------------------------------------------------
    console.log('\nHappy Developing!');
} catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log('\n👋 Cancelled by user.');
        process.exit(0);
    } else {
        console.error('\n⚠️ An error occurred:', error.message || error);
        process.exit(1);
    }
}
