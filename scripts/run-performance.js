import { spawn } from 'child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runCommand(command, args, inherit = true) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: inherit ? 'inherit' : 'pipe',
      shell: false
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  let previewProcess;
  try {
    await runCommand(npmCmd, ['run', 'build']);

    previewProcess = spawn(
      npmCmd,
      ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
      { stdio: 'inherit', shell: false }
    );

    await new Promise((resolve) => setTimeout(resolve, 6000));
    await runCommand(npmCmd, ['run', 'lighthouse']);
  } finally {
    if (previewProcess && !previewProcess.killed) {
      previewProcess.kill('SIGTERM');
    }
  }
}

main().catch((error) => {
  console.error('test:performance failed:', error);
  process.exit(1);
});
