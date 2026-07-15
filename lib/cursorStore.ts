// Lightweight pub/sub store for cursor mode.
// Avoids prop drilling and works across the component tree.

type CursorMode = 'full' | 'minimal';
type Listener = (mode: CursorMode) => void;

class CursorStore {
  mode: CursorMode = 'full';
  private listeners = new Set<Listener>();

  setMode(mode: CursorMode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.listeners.forEach(l => l(mode));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}

export const cursorStore = new CursorStore();
