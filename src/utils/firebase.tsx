class Firebase {
  db: any = null;

  constructor() {
    //@ts-ignore
    this.db = db;
  }

  saveToCloud(collection: string, item: any) {
    this.db.collection(collection).add(item);
  }

  retrieveFromCloud(
    collection: string,
    keyName: string,
    key: string,
    callback: (collection: any) => void
  ) {
    this.db
      .collection(collection)
      .where(keyName, "==", key)
      .get()
      .then((snapshot: any) => {
        const docs = snapshot.docs;
        if (docs.length === 0) callback(null);
        else callback(docs[0].data());
      });
  }

  retrieveAllFromCloud(
    collection: string,
    callback: (collection: any) => void
  ) {
    this.db
      .collection(collection)
      .get()
      .then((snapshot: any) => {
        const docs = snapshot.docs;
        if (docs.length === 0)
          throw Error(
            "Document for workspace " + collection + " was not found"
          );
        callback(docs.map((e: any) => e.data()));
      });
  }
}

export default new Firebase();
