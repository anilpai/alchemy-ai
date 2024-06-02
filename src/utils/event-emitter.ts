// This file defines a singleton EventEmitter class.
// The EventEmitter class has a private constructor to prevent creating new instances
// of the class. It provides a static method `getInstance` to get the single instance of
// the class. The `getEventEmitter` function is exported as the default export, which
// returns the single instance of the EventEmitter class when called.

class EventEmitter {
  private static instance: EventEmitter;

  private constructor() {}

  public static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }
}

const getEventEmitter = () => {
  return EventEmitter.getInstance();
};

export default getEventEmitter;
