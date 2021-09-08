import axios from "axios";

export const AxiosService = {
  post: async (url, headers, data) => {
    return await axios
      .post(url, data, {
        headers: {
          Token: headers,
        },
      })
      .then((response) => {
        return response.data;
      });
  },
  get: async (url, headers) => {
    return await axios
      .get(url, {
        headers: {
          Token: headers,
        },
      })
      .then((response) => {
        return response.data;
      });
  },
};
