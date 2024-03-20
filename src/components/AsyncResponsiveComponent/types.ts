type AsyncResponsiveComponentProps = {
  trigger: any; // This could be more specifically typed depending on the use case
  asyncOperation: (
    triggerRef: React.MutableRefObject<any>,
    checkIsActive: () => boolean,
  ) => Promise<void>;
};

export type {AsyncResponsiveComponentProps};
