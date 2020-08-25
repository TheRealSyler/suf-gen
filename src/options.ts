import { LogStyle, LogTable as LogTableStyle } from '@sorg/log/dist/interfaces';
import { red, gray, blue } from './colors';
import { LogTable } from '@sorg/log';

// don't change the order and always add a pair of options, one verbose and one short version.
export const defaultOptions = {
  help: false,
  h: false,
};

export const optionDescriptions = {
  help: 'displays the help message.',
};

export function argOptions(args: string[]) {
  const options = { ...defaultOptions };
  for (let i = 2; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      const key = args[i].replace(/^--?/, '').toLowerCase();
      if (key in options) {
        options[key] = !options[key];
      }
    }
  }
  return options;
}

export function printHelp() {
  const style: LogStyle = { background: '#141414', color: blue };

  const main = (text: string) => ({ style, message: text });
  const redText = (text: string) => ({ style: { ...style, color: red }, message: text });
  const text = (text: string) => ({ style: { ...style, color: '#fa8' }, message: text });
  const textFaint = (text: string) => ({ style: { ...style, color: gray }, message: text });

  const emptyRow = [main(''), main(''), main('')];
  const table: LogTableStyle = [
    emptyRow,
    emptyRow,
    [textFaint('Usage:'), main(''), main('')],
    [text('suf-gen'), redText('NAME'), main('...ARGS')],
    emptyRow,
    [textFaint('Arguments'), textFaint(''), main('')],
    emptyRow,
  ];

  const options = Object.keys(defaultOptions);
  for (let i = 0; i < options.length; i += 2) {
    const option = options[i];
    const shortOption = options[i + 1];
    table.push([
      main(`--${option}`),
      main(`-${shortOption}`),
      textFaint(optionDescriptions[option]),
    ]);
  }

  table.push(emptyRow);
  table.push(emptyRow);
  console.log('\n');
  LogTable(table, { padding: 5, spacing: 2 });
  console.log('\n');
}
