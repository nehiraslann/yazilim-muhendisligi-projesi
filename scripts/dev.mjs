import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const services = [
  {
    name: 'backend',
    cwd: path.join(rootDir, 'backend'),
    args: ['run', 'dev'],
  },
  {
    name: 'frontend',
    cwd: path.join(rootDir, 'frontend'),
    args: ['run', 'dev'],
  },
];

const children = [];
let shuttingDown = false;

const killChildTree = (child) => {
  if (!child?.pid) {
    return;
  }

  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
    });

    killer.on('error', () => {});
    return;
  }

  child.kill('SIGTERM');
};

const stopAllChildren = () => {
  children.forEach(killChildTree);
};

const shutdown = (exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  stopAllChildren();
  process.exitCode = exitCode;
};

services.forEach((service) => {
  const child = spawn(isWindows ? 'cmd.exe' : npmCommand, isWindows
    ? ['/d', '/s', '/c', `${npmCommand} ${service.args.join(' ')}`]
    : service.args, {
    cwd: service.cwd,
    stdio: 'inherit',
    shell: false,
    windowsHide: false,
  });

  children.push(child);

  child.on('exit', (code) => {
    const normalizedCode = code ?? 0;

    if (!shuttingDown) {
      console.log(`[${service.name}] process exited with code ${normalizedCode}. Stopping the other service...`);
      shutdown(normalizedCode);
    }
  });

  child.on('error', (error) => {
    console.error(`[${service.name}] failed to start:`, error);
    shutdown(1);
  });
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
