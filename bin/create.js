#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import { downloadTemplate } from 'giget';
import { input } from '@inquirer/prompts';

try {
    // 1. GitHub Releases 정보 가져오기
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

    // 2. 인자 파싱 및 디렉토리 검증 설정
    const args = process.argv.slice(2);
    let projectName = args[0];
    let targetDir;

    // 💡 디렉토리가 안전하게 비어있거나 생성 가능한 상태인지 체크하는 함수
    function isDirSafe(dir) {
        if (!fs.existsSync(dir)) return true; // 존재하지 않으면 안전함 (생성 가능)
        
        const entries = fs.readdirSync(dir);
        return entries.length === 0; // 비어있으면 true, 파일이 있으면 false
    }

    // 3. 프로젝트 이름 결정 및 검증
    if (!projectName) {
        projectName = await input({ 
            message: 'Please enter the project name:',
            default: 'myapp',
            validate: newProjectName => {
                if (newProjectName.trim() === '') return 'Project name cannot be empty.';

                const checkDir = path.resolve(process.cwd(), newProjectName);

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

    // 4. 템플릿 다운로드 및 마감
    await downloadTemplate(`github:kuchinashi4yume/yv#${version}`, { dir: targetDir });

    console.log('\nHappy Developing!');

} catch (error) {
    // 💡 인콰이어러 도중 Ctrl + C로 사용자가 강제 종료한 경우 처리
    if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log('\n👋 Cancelled by user.');
        process.exit(0);
    } else {
        console.error('\n⚠️ An error occurred:', error.message || error);
        process.exit(1);
    }
}
