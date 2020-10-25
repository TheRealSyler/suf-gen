import { template } from '../../templates';

test('[Template]: noInput', () => {
  //@ts-ignore
  expect(template('')).toBe('');
});
