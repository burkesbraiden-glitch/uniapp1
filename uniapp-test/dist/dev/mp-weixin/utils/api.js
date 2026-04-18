"use strict";
const BASE_URL = "http://localhost:5000";
const API_BASE_URL = BASE_URL;
const getImageUrl = (url) => {
  if (!url)
    return "https://via.placeholder.com/150";
  if (url.startsWith("http"))
    return url;
  return `${BASE_URL}${url}`;
};
const isH5 = () => {
  var _a;
  if (typeof window === "undefined")
    return false;
  const ua = ((_a = window.navigator) == null ? void 0 : _a.userAgent) || "";
  return !/miniProgram/i.test(ua) && !/(?:App|Android|iPhone)/i.test(ua);
};
exports.API_BASE_URL = API_BASE_URL;
exports.getImageUrl = getImageUrl;
exports.isH5 = isH5;
