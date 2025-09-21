"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getUserMedia;
var _reactNative = require("react-native");
var _MediaStream = _interopRequireDefault(require("./MediaStream"));
var _MediaStreamError = _interopRequireDefault(require("./MediaStreamError"));
var _Permissions = _interopRequireDefault(require("./Permissions"));
var RTCUtil = _interopRequireWildcard(require("./RTCUtil"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const {
  WebRTCModule
} = _reactNative.NativeModules;
function getUserMedia(constraints = {}) {
  // According to
  // https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices-getusermedia,
  // the constraints argument is a dictionary of type MediaStreamConstraints.
  if (typeof constraints !== 'object') {
    return Promise.reject(new TypeError('constraints is not a dictionary'));
  }
  if ((typeof constraints.audio === 'undefined' || !constraints.audio) && (typeof constraints.video === 'undefined' || !constraints.video)) {
    return Promise.reject(new TypeError('audio and/or video is required'));
  }

  // Normalize constraints.
  constraints = RTCUtil.normalizeConstraints(constraints);

  // Request required permissions
  const reqPermissions = [];
  if (constraints.audio) {
    reqPermissions.push(_Permissions.default.request({
      name: 'microphone'
    }));
  } else {
    reqPermissions.push(Promise.resolve(false));
  }
  if (constraints.video) {
    reqPermissions.push(_Permissions.default.request({
      name: 'camera'
    }));
  } else {
    reqPermissions.push(Promise.resolve(false));
  }
  return new Promise((resolve, reject) => {
    Promise.all(reqPermissions).then(results => {
      const [audioPerm, videoPerm] = results;

      // Check permission results and remove unneeded permissions.

      if (!audioPerm && !videoPerm) {
        // https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices-getusermedia
        // step 4
        const error = {
          message: 'Permission denied.',
          name: 'SecurityError'
        };
        reject(new _MediaStreamError.default(error));
        return;
      }
      audioPerm || delete constraints.audio;
      videoPerm || delete constraints.video;
      const success = (id, tracks) => {
        // Store initial constraints.
        for (const trackInfo of tracks) {
          const c = constraints[trackInfo.kind];
          if (typeof c === 'object') {
            trackInfo.constraints = RTCUtil.deepClone(c);
          }
        }
        const info = {
          streamId: id,
          streamReactTag: id,
          tracks
        };
        resolve(new _MediaStream.default(info));
      };
      const failure = (type, message) => {
        let error;
        switch (type) {
          case 'TypeError':
            error = new TypeError(message);
            break;
        }
        if (!error) {
          error = new _MediaStreamError.default({
            message,
            name: type
          });
        }
        reject(error);
      };
      WebRTCModule.getUserMedia(constraints, success, failure);
    });
  });
}
//# sourceMappingURL=getUserMedia.js.map