import type CONST from '@src/CONST';

/** A model representing a console log */
type Log = {
  /** Time when the log was created */
  time: Date;

  /** Log level */
  level: keyof typeof CONST.DEBUG_CONSOLE.LEVELS;

  /** Log message */
  message: string;
};

/** A collection of captured logs */
type CapturedLogs = Record<number, Log>;

export type {Log, CapturedLogs};
