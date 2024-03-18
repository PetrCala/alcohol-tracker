type BooleanWaiterProps = {
  value: boolean;
  timeout?: number;
  onTimeout: () => void; // Callback for when the timeout is exceeded
  onResolved: () => void; // Callback for when the boolean becomes true
};

export type {BooleanWaiterProps};
