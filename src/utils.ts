import { ensureDir, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { styler, LogTable } from '@sorg/log';
import { gray, red, green } from './colors';
import { Exec, getYNAnswer, readConsole } from 'suf-node';
import { LogStyle, LogTable as LogTableStyle } from '@sorg/log/dist/interfaces';

export function finishedMessage(name: string, suf: boolean) {
  const style: LogStyle = { background: '#141414', color: gray };
  const text = (text: string) => ({ message: text, style });
  const redText = (text: string) => ({ message: text, style: { ...style, color: red } });
  const emptyRow = [text(''), text(''), text('')];
  const row = (cmd: string, msg: string) => [text('run'), redText(cmd), text(msg)];
  const table: LogTableStyle = [
    emptyRow,
    row(`cd ${name}`, 'to enter the project directory.'),
    row('yarn start', 'to start the project.'),
    emptyRow,
  ];
  if (suf) {
    table.splice(1, 0, row('yarn suf', 'to init suf.'));
  }
  console.log('\n');
  LogTable(table, { padding: 5 });
  console.log('\n');
}
export async function getProjectName() {
  await writeToStdout(styler('please enter the project name: ', red));
  const name = await readConsole();
  if (name) {
    return name;
  }
  return await getProjectName();
}
/**create file or directory. */
export async function write(dir: string, content: string) {
  await ensureDir(resolve(dir, '../'));
  await writeFile(dir, content);

  console.log(styler('Created file:', gray), styler(dir, { 'font-weight': 'bold', color: green }));
}
export function allArgs() {
  const args: string[] = [];
  process.argv.forEach((arg, i) => {
    args[i] = arg === undefined ? '' : arg.toLowerCase();
  });
  return args;
}
export async function gitInfo() {
  try {
    const a = (await Exec('git config --global user.name')) as { stdout: string };
    const b = (await Exec('git config --global user.email')) as { stdout: string };

    return `${a.stdout.replace(/\n/g, '')} <${b.stdout.replace(/\n/g, '')}>`;
  } catch (e) {}
  return undefined;
}
export async function askQuestion(question: string, defaultAnswer = true): Promise<boolean> {
  await writeToStdout(styler(question, red), styler(`[${defaultAnswer ? 'Y/n' : 'y/N'}]: `));
  return getYNAnswer(defaultAnswer);
}

async function writeToStdout(...msg: string[]) {
  return new Promise((res, rej) => {
    process.stdout.write(msg.join(' '), (e) => {
      if (e) rej(e);
      res();
    });
  });
}
