const uuid = require("uuid");

export const createID = (): string => {
  return uuid.v4();
};
