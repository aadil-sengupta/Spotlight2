"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getDisplayMedia;
var _reactNative = require("react-native");
var _MediaStream = _interopRequireDefault(require("./MediaStream"));
var _MediaStreamError = _interopRequireDefault(require("./MediaStreamError"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const {
  WebRTCModule
} = _reactNative.NativeModules;
function getDisplayMedia() {
  return new Promise((resolve, reject) => {
    WebRTCModule.getDisplayMedia().then(data => {
      const {
        streamId,
        track
      } = data;
      const info = {
        streamId: streamId,
        streamReactTag: streamId,
        tracks: [track]
      };
      const stream = new _MediaStream.default(info);
      resolve(stream);
    }, error => {
      reject(new _MediaStreamError.default(error));
    });
  });
}
//# sourceMappingURL=getDisplayMedia.js.map