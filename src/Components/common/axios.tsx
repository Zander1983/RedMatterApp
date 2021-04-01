import axios from "axios";
import requestsUrl from "./RequestUrls";

const instance = axios.create({
  baseURL: requestsUrl.baseUrl,
});
export default instance;
