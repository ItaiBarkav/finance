const FUEL = { key: 'FUEL', value: ['פז', 'תפוז', 'אלון', 'דלק', 'סונול'] };
const HVR = { key: 'HVR', value: ['חבר'] };
const FOOD = {
  key: 'FOOD',
  value: [
    'חומוס',
    'פיצה',
    'CARREFOUR',
    'השפכטל של רחל',
    'קונדיטוריה',
    'ניו דלי',
    "ג'לטו",
    'שפע הברון',
    'BAR',
    'שישו ושימחו',
    'שווארמה',
    'הנדלר',
    'מלביר',
    'קונדטוריה',
    'סביח',
    'קפה',
    'גלידות',
    'רמי לוי',
    'מקדונלדס',
    'קשת טעמים',
  ],
};
const INSURANCE = {
  key: 'INSURANCE',
  value: ['הפול', 'הראל', 'ביטוח', 'בטוח'],
};
const CULTURE = { key: 'CULTURE', value: ['התרבות'] };
const ONLINE = {
  key: 'ONELINE',
  value: ['ALIBABA COM', 'ALIEXPRESS', 'AMZN'],
};

export const CATEGORIES = [FUEL, HVR, FOOD, INSURANCE, CULTURE, ONLINE];

export enum Color {
  FUEL = '#fcaa1f',
  HVR = '#8fd7f3',
  FOOD = '#79c870',
  INSURANCE = '#d40f8c',
  CULTURE = '#00a0a0',
  ONELINE = '#003b68',
  OTHER = '#dfdfdf',
}
