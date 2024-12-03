type ReducerAction<
  Type extends string,
  Payload = undefined,
> = Payload extends undefined ? {type: Type} : {type: Type; payload: Payload};

export default ReducerAction;
