import type en from './en';

type CharacterLimitParams = {
  limit: number;
};

type LocalTimeParams = {
  user: string;
  time: string;
};

type UntilTimeParams = {time: string};

/* Translation Object types */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationBaseValue = string | string[] | ((...args: any[]) => string);

type TranslationBase = {[key: string]: TranslationBaseValue | TranslationBase};

/* Flat Translation Object types */
// Flattens an object and returns concatenations of all the keys of nested objects
type FlattenObject<TObject, TPrefix extends string = ''> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [TKey in keyof TObject]: TObject[TKey] extends (...args: any[]) => any
    ? `${TPrefix}${TKey & string}`
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      TObject[TKey] extends any[]
      ? `${TPrefix}${TKey & string}`
      : // eslint-disable-next-line @typescript-eslint/ban-types
        TObject[TKey] extends object
        ? FlattenObject<TObject[TKey], `${TPrefix}${TKey & string}.`>
        : `${TPrefix}${TKey & string}`;
}[keyof TObject];

// Retrieves a type for a given key path (calculated from the type above)
type TranslateType<TObject, TPath extends string> = TPath extends keyof TObject
  ? TObject[TPath]
  : TPath extends `${infer TKey}.${infer TRest}`
    ? TKey extends keyof TObject
      ? TranslateType<TObject[TKey], TRest>
      : never
    : never;

type EnglishTranslation = typeof en;

type TranslationPaths = FlattenObject<EnglishTranslation>;

type TranslationFlatObject = {
  [TKey in TranslationPaths]: TranslateType<EnglishTranslation, TKey>;
};

export type {
  CharacterLimitParams,
  EnglishTranslation,
  LocalTimeParams,
  FlattenObject,
  TranslationBase,
  TranslationPaths,
  TranslateType,
  TranslationFlatObject,
  UntilTimeParams,
};
