import { spawn } from 'child_process';

const args = process.argv.slice(2);
const proc = spawn('node', ['--enable-source-maps', 'build/index.js', ...args], {
  stdio: 'inherit',
});
proc.on('exit', (code) => process.exit(code ?? 0));
