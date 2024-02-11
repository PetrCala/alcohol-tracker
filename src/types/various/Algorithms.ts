type UserPriority = number;

type UsersPriority = {
  [userId: string]: UserPriority;
};

export type {UserPriority, UsersPriority};
