type MaybePhraseKey =
  | string
  | null
  | [string, Record<string, unknown> & {isTranslated?: boolean}]
  | [];

export type {MaybePhraseKey};
