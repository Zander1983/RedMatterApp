import axios from "axios";

const oldBackFileUploader = (
  token: string,
  experimentId?: string,
  organisationId?: string,
  file0?: Blob,
  options?: any
) => {
  debugger;
  if (token === null || token === undefined) {
    throw new Error("No token no request... what did you expect???");
  }
  const url = "/api/upload/" + experimentId;
  const localVarRequestOptions = Object.assign({ method: "POST" }, options);
  const localVarHeaderParameter = {} as any;
  const localVarFormParams = new FormData();

  if (token !== undefined && token !== null) {
    localVarHeaderParameter["token"] = String(token);
    localVarFormParams.set("token", token as any);
  }

  if (experimentId !== undefined) {
    localVarFormParams.set("experimentId", experimentId as any);
  }

  if (organisationId !== undefined) {
    localVarFormParams.set("organisationId", organisationId as any);
  }
  if (file0 !== undefined) {
    localVarFormParams.set("file[0]", file0 as any);
  }

  localVarHeaderParameter["Content-Type"] = "multipart/form-data";

  localVarRequestOptions.headers = Object.assign({}, localVarHeaderParameter);
  localVarRequestOptions.body = localVarFormParams;

  return axios.put(url, localVarRequestOptions.body, {
    headers: localVarRequestOptions.headers,
  });
};

export default oldBackFileUploader;
