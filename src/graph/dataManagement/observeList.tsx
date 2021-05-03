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
    for (const target in listTargets) {
      listHolder.addObserver(target, () => this.batchUpdate(listGetter()));
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
    let currentitems = this.itemObserverIds.map((e) => e.id);
    let toAdd = currentitems.filter((g) => !obsIds.includes(g));
    let toRemove = obsIds.filter((g) => !gateIds.includes(g));
    toAdd.forEach((e) => {
      const obsID = dataManager.getGate(e).addObserver("update", () => {
        this.plotUpdated();
      });
      this.gateObservers.push({ observerID: obsID, targetGateID: e });
    });
    toRemove.forEach((e) => {
      dataManager
        .getGate(e)
        .removeObserver(
          "update",
          this.gateObservers.filter((g) => g.targetGateID === e)[0].observerID
        );
      this.gateObservers = this.gateObservers.filter(
        (g) => g.targetGateID === e
      );
    });
  }

  private addItem() {}

  private removeItem() {}
}
