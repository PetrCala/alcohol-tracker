import {getRandomChoice, getRandomInt} from '../../../src/utils/choice';

describe('getRandomChoice', () => {
  let stringChoices = ['test-choice1', 'test-choice2', 'test-choice3'];
  let numericChoices = [1, 2, 3];

  it('chooses a value that belongs to the array', () => {
    let stringChoice = getRandomChoice(stringChoices);
    let numericChoice = getRandomChoice(numericChoices);

    expect(stringChoices).toContain(stringChoice);
    expect(numericChoices).toContain(numericChoice);

    expect(typeof stringChoice).toEqual('string');
    expect(typeof numericChoice).toEqual('number');
  });
});

describe('getRandomInt', () => {
  let rangeMin = 0;
  let rangeMax = 10;

  it('always returns a number within the range', () => {
    for (let i = 0; i < rangeMax; i++) {
      let randomInt = getRandomInt(rangeMin, i);

      expect(randomInt).toBeGreaterThanOrEqual(rangeMin);
      expect(randomInt).toBeLessThanOrEqual(rangeMax);
      expect(typeof randomInt).toEqual('number');
    }
  });
});
