/*
  Purpose of this class is to encapsulate observer functionalities so that
  it can be accessed anywhere and extended by anyone. 
  
  This is abstract because an observer serves no purpose without associated
  state and actions.
*/
const uuid = require("uuid");

/* TypeScript does not deal well with decorators. Your linter might
   indicate a problem with this function but it does not exist 
   
   This is resposible for publishing any data manager call, basically
   a custom listener for state changes, a lot simpler to use than redux*/
export const publishDecorator = () => {
  return function (
    target: ObserversFunctionality,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const ret = original.apply(this, args);
      //@ts-ignore
      this.publish(key, args);
      return ret;
    };
  };
};

export default abstract class ObserversFunctionality {
  private observers: Map<
    string,
    { id: string; func: Function; receiveArguments: boolean }[]
  > = new Map();

  private createOberserverID(): string {
    const newObjectInstaceID = uuid.v4();
    return newObjectInstaceID;
  }

  addObserver(
    type: string,
    callback: Function,
    receiveArguments: boolean = false
  ): string {
    const observerID = this.createOberserverID();
    const observer = { id: observerID, func: callback, receiveArguments };
    if (this.observers.has(type)) {
      this.observers.set(type, [...this.observers.get(type), observer]);
    } else {
      this.observers.set(type, [observer]);
    }
    return observerID;
  }

  removeObserver(type: string, id: string) {
    if (this.observers.has(type)) {
      const list = this.observers.get(type);
      let newlist = list.filter((observer) => observer.id !== id);
      if (list.length === 0) {
        throw Error("Observer not found for removal");
      }
      this.observers.set(type, newlist);
    } else {
      throw Error("Removing observer from non-existent observing type");
    }
  }

  private publish(type: string, args?: any) {
    if (!this.observers.has(type)) return;
    this.observers.get(type).forEach((observer) => {
      if (observer.receiveArguments) {
        observer.func(args);
      } else {
        observer.func();
      }
    });
  }
}
