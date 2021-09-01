const uuid = require("uuid");

export const createID = (): string => {
  const newObjectInstaceID = uuid.v4();
  return newObjectInstaceID;
};
