import { useEffect, useReducer, useRef } from "react";
import isEqual from "lodash/isEqual";

export function useSetState(initialState) {
  const [state, newState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );
  return [state, newState];
}

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useDeepCompareEffect(callback, inputs) {
  const cleanupRef = useRef();
  useEffect(() => {
    if (!isEqual(previousInputs, inputs)) {
      cleanupRef.current = callback();
    }
    return cleanupRef.current;
  });

  const previousInputs = usePrevious(inputs);
}
