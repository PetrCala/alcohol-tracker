import { useRef, useEffect } from "react";

/**
 * usePrevious - A custom hook to retain the previous value of a state or prop in a functional component.
 *
 * This hook uses a ref to remember the previous value, which remains persisted across renders.
 * The returned value is updated only after the component render is committed, ensuring that 
 * during the current render cycle, the value returned is always the "previous" one.
 *
 * @param {T} value - The current value (state or prop) for which you want to retain the previous value.
 * @returns {T | undefined} - The previous value. Returns undefined during the initial render.
 *
 * @example
 * 
 * const Component = () => {
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 *
 *   return (
 *     <div>
 *       <p>Current Count: {count}</p>
 *       <p>Previous Count: {prevCount}</p>
 *       <button onClick={() => setCount(count + 1)}>Increment</button>
 *     </div>
 *   );
 * };
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}