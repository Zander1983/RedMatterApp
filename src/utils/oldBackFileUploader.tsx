import axios from "axios";

const oldBackFileUploader = (
  token: string,
  workspaceId?: string,
  organisationId?: string,
  file0?: Blob,
  options?: any
) => {
  if (token === null || token === undefined) {
    throw new Error("No token no request... what did you expect???");
  }
  const url = "/api/upload/" + workspaceId;
  const localVarRequestOptions = Object.assign({ method: "POST" }, options);
  const localVarHeaderParameter = {} as any;
  const localVarFormParams = new FormData();

  if (token !== undefined && token !== null) {
    localVarHeaderParameter["token"] = String(token);
    localVarFormParams.set("token", token as any);
  }

  if (workspaceId !== undefined) {
    localVarFormParams.set("workspaceId", workspaceId as any);
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

  return axios.post(url, localVarRequestOptions.body, {
    headers: localVarRequestOptions.headers,
  });
};

export default oldBackFileUploader;
