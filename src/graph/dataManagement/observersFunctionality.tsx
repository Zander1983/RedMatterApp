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
      this.publish(key);
      return ret;
    };
  };
};

/*
  How does an observer work?

  You inherit into the class you want. Now, any one can add themselves as
  observer to any public call in this class. For example:

  class Observed extends ObserversFunctionality {
    private num: number = 3;

    public getNum() {
      const num = this.num++
      return num
    }
  }

  const obs = Observed()
  obs.addObserver('getNum', () => { console.log("someone just called getNum() on Observed...") })

  obj.getNum()
  >>> "someone just called getNum() on Observed..."
*/

export default abstract class ObserversFunctionality {
  private observers: Map<string, { id: string; func: Function }[]> = new Map();

  private createOberserverID(): string {
    const newObjectInstaceID = uuid.v4();
    return newObjectInstaceID;
  }

  addObserver(type: string, callback: Function): string {
    const observerID = this.createOberserverID();
    const observer = { id: observerID, func: callback };
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
      const beforeSize = list.length;
      list.filter((observer) => observer.id != id);
      if (beforeSize === list.length) {
        throw Error("Observer not found");
      }
      this.observers.set(type, list);
    } else {
      throw Error("Removing observer from non-existent observing type");
    }
  }

  publish(type: string) {
    if (!this.observers.has(type)) return;
    this.observers.get(type).forEach((e) => e.func());
  }
}
