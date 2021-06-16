/*
  This is a helper that allows any resource to observer a list of multiple
  items that, each, has an observer
*/

import ObserversFunctionality from "./observersFunctionality";

export default class ObserverList {
  setup(
    notifier: (newList: ObserversFunctionality[]) => void,
    listGetter: () => ObserversFunctionality[],
    itemGetter: (id: string) => ObserversFunctionality,
    listHolder: ObserversFunctionality,
    listTargets: string[],
    itemTargets: string[]
  ) {
    this.notify = notifier;
    this.listGetter = listGetter;
    this.itemGetter = itemGetter;
    for (const target of listTargets) {
      listHolder.addObserver(target, () => {
        this.batchUpdate(listGetter());
      });
    }
    this.listHolder = listHolder;
    this.listTargets = listTargets;
    this.itemTargets = itemTargets;

    this.batchUpdate(listGetter());
  }

  kill() {
    for (const obs of this.itemObserverIds) {
      obs.item.removeObserver(obs.target, obs.id);
    }
    for (const obs of this.listObserverIds) {
      obs.item.removeObserver(obs.target, obs.id);
    }
  }

  update() {
    this.notify(this.itemObserverIds.map((e) => e.item));
  }

  /* PRIVATE =================================*/

  listObserverIds: {
    item: ObserversFunctionality;
    id: string;
    target: string;
  }[] = [];

  itemObserverIds: {
    item: ObserversFunctionality;
    id: string;
    target: string;
  }[] = [];

  notify: (newList: ObserversFunctionality[]) => void;
  listGetter: () => any[];
  itemGetter: (id: string) => any;

  listHolder: ObserversFunctionality;
  itemTargets: string[];
  listTargets: string[];

  private batchUpdate(newItems: any[]) {
    const newItemsIds = newItems.map((e) => e.id);
    let currentitems = this.itemObserverIds.map((e: any) => e.item.id);
    let toAdd = newItemsIds.filter((g) => !currentitems.includes(g));
    let toRemove = currentitems.filter((g) => !newItemsIds.includes(g));

    toRemove.forEach((e) => {
      // const item = this.itemGetter(e);
      for (const target of this.itemTargets) {
        // const obs = this.findObserver(e, target);
        // item.removeObserver(obs.target, obs.id);
        this.itemObserverIds = this.itemObserverIds.filter(
          (g: any) => g.item.id !== e
        );
      }
    });

    toAdd.forEach((itemID) => {
      const item = this.itemGetter(itemID);
      for (const target of this.itemTargets) {
        const obsID = item.addObserver(target, () => {
          this.notify(this.itemObserverIds.map((e) => e.item));
        });
        this.itemObserverIds.push({
          id: obsID,
          item: item,
          target: target,
        });
      }
    });

    if (toAdd.length > 0 || toRemove.length > 0) {
      this.update();
    }
  }

  private findObserver(itemID: string, target: string) {
    let listObsMatches = this.listObserverIds.filter(
      (e: any) => e.item.id === itemID
    );
    if (listObsMatches.length > 0) {
      listObsMatches = listObsMatches.filter((e: any) => e.target === target);
      if (listObsMatches.length > 0) return listObsMatches[0];
    }
    let itemsObsMatches = this.itemObserverIds.filter(
      (e: any) => e.item.id === itemID
    );
    if (itemsObsMatches.length > 0) {
      itemsObsMatches = itemsObsMatches.filter((e: any) => e.target === target);
      if (itemsObsMatches.length > 0) return itemsObsMatches[0];
    }
    throw Error("Not found observer");
  }

  private addItem() {}

  private removeItem() {}
}
