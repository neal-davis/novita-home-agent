type Listener<T = any> = (args: T) => void;

class EventEmitter<T extends Record<string, any>> {
  private static instance: EventEmitter<any>;
  private events: { [K in keyof T]?: Listener<T[K]>[] } = {};

  private constructor() {}

  public static getInstance<T extends Record<string, any>>(): EventEmitter<T> {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  on<K extends keyof T>(event: K, listener: Listener<T[K]>): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, args: T[K]): void {
    if (this.events[event]) {
      this.events[event]!.forEach((listener) => listener(args));
    }
  }

  off<K extends keyof T>(event: K, listenerToRemove: Listener<T[K]>): void {
    if (!this.events[event]) return;

    this.events[event] = this.events[event]!.filter(
      (listener) => listener !== listenerToRemove,
    );
  }
}

export default EventEmitter.getInstance();
