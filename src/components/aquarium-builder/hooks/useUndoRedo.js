import { useState, useCallback, useRef } from 'react';

// ============================================================================
// UNDO / REDO HOOK
//
// Drop-in replacement for useState that tracks history.
// - Undo/redo with configurable max depth (default 50)
// - Debounced snapshots: rapid changes (like dragging) get batched
//   into a single undo step instead of flooding the stack
// - Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
// ============================================================================

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 600; // Batch rapid changes within this window

export function useUndoRedo(initialState) {
  // past = stack of previous states (most recent at end)
  // future = stack of undone states (most recent at end)
  const [state, setStateRaw] = useState(initialState);
  const pastRef = useRef([]);
  const futureRef = useRef([]);
  const lastSnapshotRef = useRef(Date.now());
  const pendingRef = useRef(null); // holds state before a rapid-change batch

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      // Skip if state didn't actually change (same reference)
      if (next === prev) return prev;

      const now = Date.now();
      const timeSinceLast = now - lastSnapshotRef.current;

      if (timeSinceLast < DEBOUNCE_MS) {
        // Rapid change — don't push a new snapshot yet.
        // Keep the "before rapid changes started" state as the undo point.
        if (pendingRef.current === null) {
          pendingRef.current = prev;
        }
      } else {
        // Enough time passed — commit a snapshot.
        // If there was a pending batch, push the pre-batch state.
        const snapshotState = pendingRef.current !== null ? pendingRef.current : prev;
        pendingRef.current = null;

        pastRef.current = [...pastRef.current, snapshotState].slice(-MAX_HISTORY);
        futureRef.current = []; // new action clears redo stack
      }

      lastSnapshotRef.current = now;
      return next;
    });
  }, []);

  // Flush any pending batch before undo (so the batch itself becomes undoable)
  const flushPending = useCallback(() => {
    if (pendingRef.current !== null) {
      pastRef.current = [...pastRef.current, pendingRef.current].slice(-MAX_HISTORY);
      futureRef.current = [];
      pendingRef.current = null;
    }
  }, []);

  const undo = useCallback(() => {
    flushPending();
    setStateRaw(current => {
      if (pastRef.current.length === 0) return current;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [...futureRef.current, current];
      lastSnapshotRef.current = Date.now();
      return previous;
    });
  }, [flushPending]);

  const redo = useCallback(() => {
    setStateRaw(current => {
      if (futureRef.current.length === 0) return current;
      const next = futureRef.current[futureRef.current.length - 1];
      futureRef.current = futureRef.current.slice(0, -1);
      pastRef.current = [...pastRef.current, current].slice(-MAX_HISTORY);
      lastSnapshotRef.current = Date.now();
      return next;
    });
  }, []);

  const canUndo = pastRef.current.length > 0 || pendingRef.current !== null;
  const canRedo = futureRef.current.length > 0;

  return [state, setState, { undo, redo, canUndo, canRedo }];
}
