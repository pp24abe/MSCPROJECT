import { useState, useCallback } from 'react';

/**
 * Tracks history of a value for undo/redo.
 */
export function useUndoRedo(initial) {
  const [history, setHistory] = useState([initial]);
  const [pointer, setPointer] = useState(0);

  const state = history[pointer];

  const setState = useCallback(
    (newState) => {
      const resolved = typeof newState === 'function' ? newState(state) : newState;
      const nextHistory = history.slice(0, pointer + 1).concat([resolved]);
      setHistory(nextHistory);
      setPointer(nextHistory.length - 1);
    },
    [history, pointer, state]
  );

  const undo = useCallback(() => {
    if (pointer > 0) setPointer(p => p - 1);
  }, [pointer]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) setPointer(p => p + 1);
  }, [pointer, history]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: pointer > 0,
    canRedo: pointer < history.length - 1
  };
}
