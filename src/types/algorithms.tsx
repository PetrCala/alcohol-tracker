export type UserPriority = number;

export type UsersPriority = {
  [userId: string]: UserPriority;
};
