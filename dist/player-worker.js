/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const dvu = __webpack_require__(1);
class Event {
    constructor(dataView, tick, status) {
        this.dataView = dataView;
        this.tick = tick;
        this.status = status;
    }
    toWebMidiLinkString() {
        let data = [this.status];
        for (var i = 0; i < this.dataView.byteLength; ++i) {
            data.push(this.dataView.getUint8(i));
        }
        return "midi," + data.map((x) => x.toString(16)).join(",");
    }
    static create(dataView, tick, status) {
        if (!this.statusEventMap) {
            this.statusEventMap = {
                0x80: NoteOffEvent,
                0x90: NoteOnEvent,
                0xA0: PolyphonicKeyPressureEvent,
                0xB0: ControlChangeEvent,
                0xC0: ProgramChangeEvent,
                0xD0: ChannelPressureEvent,
                0xE0: PitchBendEvent,
                0xF0: SystemExclusiveEvent,
                0xFF: MetaEvent,
            };
        }
        let statusType = status & 0xF0;
        if (status === 0xFF) {
            return MetaEvent.create(dataView, tick, status);
        }
        else if (status === 0x90 && dataView.getUint8(1) === 0) {
            return new NoteOffEvent(dataView, tick, 0x80);
        }
        else {
            let EventClass = this.statusEventMap[statusType];
            return new EventClass(dataView, tick, status);
        }
    }
    get statusType() { return this.status & 0xF0; }
}
exports.Event = Event;
class ChannelEvent extends Event {
    get channel() { return this.status & 0x0F; }
}
exports.ChannelEvent = ChannelEvent;
class NoteOffEvent extends ChannelEvent {
    get noteNumber() { return this.dataView.getUint8(0); }
    get velocity() { return this.dataView.getUint8(1); }
}
exports.NoteOffEvent = NoteOffEvent;
class NoteOnEvent extends ChannelEvent {
    get noteNumber() { return this.dataView.getUint8(0); }
    get velocity() { return this.dataView.getUint8(1); }
}
exports.NoteOnEvent = NoteOnEvent;
class PolyphonicKeyPressureEvent extends ChannelEvent {
}
exports.PolyphonicKeyPressureEvent = PolyphonicKeyPressureEvent;
class ControlChangeEvent extends ChannelEvent {
    get controller() { return this.dataView.getUint8(0); }
    get value() { return this.dataView.getUint8(1); }
}
exports.ControlChangeEvent = ControlChangeEvent;
class ProgramChangeEvent extends ChannelEvent {
    get program() { return this.dataView.getUint8(0); }
}
exports.ProgramChangeEvent = ProgramChangeEvent;
class ChannelPressureEvent extends ChannelEvent {
}
exports.ChannelPressureEvent = ChannelPressureEvent;
class PitchBendEvent extends ChannelEvent {
    get value() {
        return this.dataView.getUint8(0) + (this.dataView.getUint8(1) << 7) - 8192;
    }
}
exports.PitchBendEvent = PitchBendEvent;
class FxEvent extends Event {
    get statusType() { return this.status; }
}
exports.FxEvent = FxEvent;
class SystemExclusiveEvent extends FxEvent {
}
exports.SystemExclusiveEvent = SystemExclusiveEvent;
class MetaEvent extends FxEvent {
    static create(dataView, tick, status) {
        if (!this.typeIndexEventMap) {
            this.typeIndexEventMap = {
                0x51: TempoMetaEvent
            };
        }
        let typeIndex = dataView.getUint8(0);
        if (typeIndex in this.typeIndexEventMap) {
            let EventClass = this.typeIndexEventMap[typeIndex];
            return new EventClass(dataView, tick, status);
        }
        else {
            return new MetaEvent(dataView, tick, status);
        }
    }
    get typeIndex() { return this.dataView.getUint8(0); }
    get data() {
        let { value, byteLength } = dvu.dataViewGetUintVariable(this.dataView, 1);
        return dvu.dataViewGetSubDataView(this.dataView, 1 + byteLength, value);
    }
}
exports.MetaEvent = MetaEvent;
class TempoMetaEvent extends MetaEvent {
    get rawTempo() {
        return dvu.dataViewGetUint(this.data, 0, false);
    }
    get secondsPerBeat() {
        return this.rawTempo * 10e-7; // ?
    }
    get beatsPerMinute() {
        return 60 / this.secondsPerBeat;
    }
}
exports.TempoMetaEvent = TempoMetaEvent;
//# sourceMappingURL=event.js.map

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function dataViewGetSubDataView(dataView, byteOffset, byteLength) {
    if (typeof byteLength === "undefined") {
        byteLength = dataView.byteLength - byteOffset;
    }
    return new DataView(dataView.buffer, dataView.byteOffset + byteOffset, byteLength);
}
exports.dataViewGetSubDataView = dataViewGetSubDataView;
function dataViewGetUint(dataView, byteOffset, isLittleEndian, byteLength) {
    var value = 0;
    if (typeof byteLength === "undefined") {
        byteLength = dataView.byteLength - byteOffset;
    }
    if (isLittleEndian) {
        for (var i = byteLength - 1; i >= 0; --i) {
            value = (value << 8) + dataView.getUint8(byteOffset + i);
        }
    }
    else {
        for (var i = 0; i < byteLength; ++i) {
            value = (value << 8) + dataView.getUint8(byteOffset + i);
        }
    }
    return value;
}
exports.dataViewGetUint = dataViewGetUint;
function dataViewGetUintVariable(dataView, byteOffset) {
    var value = 0;
    var pos = 0;
    for (;;) {
        let byte = dataView.getUint8(byteOffset + pos);
        ++pos;
        let msb = byte & 0b10000000;
        let val = byte & 0b01111111;
        value = (value << 7) + val;
        if (!msb) {
            break;
        }
    }
    return { value, byteLength: pos };
}
exports.dataViewGetUintVariable = dataViewGetUintVariable;
function dataViewGetString(dataView, byteOffset, length) {
    let bytes = new Uint8Array(dataView.buffer, dataView.byteOffset + byteOffset, length);
    return String.fromCharCode.apply(null, bytes);
}
exports.dataViewGetString = dataViewGetString;
;
//# sourceMappingURL=data-view-util.js.map

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const player = __webpack_require__(12);
class PlayerWorker {
    messageListener(event) {
        switch (event.data.type) {
            case "init":
                this.player = new player.Player(event.data.buffer);
                break;
            case "read":
                let timeStamp = event.data.timeStamp;
                let newEventsStore = this.player.read(timeStamp.tick);
                self.postMessage({ type: "read", newEventsStore: newEventsStore, timeStamp }, []);
                break;
            case "resolution":
                self.postMessage({ type: "resolution", resolution: this.player.resolution }, []);
                break;
        }
    }
}
let playerWorker = new PlayerWorker();
self.addEventListener("message", playerWorker.messageListener.bind(playerWorker));
//# sourceMappingURL=player-worker.js.map

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const midi = __webpack_require__(0);
const smf = __webpack_require__(13);
class Player {
    constructor(buffer) {
        this.song = new smf.Song(buffer);
        this.song.load();
        this.cursors = new Array(this.numberOfTracks);
        for (var i = 0; i < this.cursors.length; ++i)
            this.cursors[i] = 0;
    }
    get resolution() { return this.song.header.resolution; }
    get numberOfTracks() { return this.song.header.numberOfTracks; }
    read(tick) {
        let newEventsStore = [];
        for (let i = 0; i < 16; ++i) {
            newEventsStore[i] = [];
        }
        this.song.tracks.forEach((track, trackNumber) => {
            for (var i = this.cursors[trackNumber]; i < track.events.length; ++i) {
                let event = track.events[i];
                if (event.tick > tick)
                    break;
                if (event instanceof midi.ChannelEvent) {
                    newEventsStore[event.channel].push(event);
                }
                else {
                    for (let events of newEventsStore) {
                        events.push(event);
                    }
                }
                this.cursors[trackNumber] = i + 1;
            }
        });
        return newEventsStore;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const xiff = __webpack_require__(14);
const dvu = __webpack_require__(1);
const midi = __webpack_require__(0);
class Header {
    constructor(dataView) {
        this.dataView = dataView;
    }
    load() {
        var pos = 0;
        this.format = this.dataView.getUint16(pos, false);
        pos += 2;
        this.numberOfTracks = this.dataView.getUint16(pos, false);
        pos += 2;
        this.resolution = this.dataView.getUint16(pos, false);
    }
}
exports.Header = Header;
class EventBuilder {
    constructor(dataView) {
        this.dataView = dataView;
    }
    build(tick, status, byteOffset) {
        var length = 0;
        switch (status & 0b11110000) {
            case 0x80:
            case 0x90:
            case 0xA0:
            case 0xE0:
                length = 2;
                break;
            case 0xB0:
                length = 2; // FIXME: OMNI OFF / MONO
                break;
            case 0xC0:
            case 0xD0:
                length = 1;
                break;
            case 0xF0:
                if (status == 0xFF) {
                    let { byteLength, value } = dvu.dataViewGetUintVariable(this.dataView, byteOffset + 1);
                    length = 1 + byteLength + value;
                }
                else {
                    let { byteLength, value } = dvu.dataViewGetUintVariable(this.dataView, byteOffset);
                    length = byteLength + value;
                }
                break;
        }
        let dataView = new DataView(this.dataView.buffer, this.dataView.byteOffset + byteOffset, length);
        return midi.Event.create(dataView, tick, status);
    }
}
exports.EventBuilder = EventBuilder;
class Track {
    constructor(dataView) {
        this.dataView = dataView;
    }
    load() {
        var pos = 0;
        var tick = 0;
        var status = 0x00;
        var eventBuilder = new EventBuilder(this.dataView);
        this.events = [];
        while (pos < this.dataView.byteLength) {
            {
                let { byteLength, value } = dvu.dataViewGetUintVariable(this.dataView, pos);
                pos += byteLength;
                tick += value;
            }
            {
                let byte = this.dataView.getUint8(pos);
                let msb = byte & 0b10000000;
                if (msb) {
                    status = byte;
                    ++pos;
                }
                let event = eventBuilder.build(tick, status, pos);
                pos += event.dataView.byteLength;
                this.events.push(event);
            }
        }
    }
}
exports.Track = Track;
class Song {
    constructor(buffer) {
        this.buffer = buffer;
    }
    load() {
        let smf = xiff.load(this.buffer, xiff.configs.smf);
        this.tracks = [];
        smf.children.forEach((chunk) => {
            switch (chunk.name) {
                case "MThd":
                    this.header = new Header(chunk.dataView);
                    this.header.load();
                    break;
                case "MTrk":
                    let track = new Track(chunk.dataView);
                    track.load();
                    this.tracks.push(track);
                    break;
                default:
                    break;
            }
        });
    }
}
exports.Song = Song;
//# sourceMappingURL=smf.js.map

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const data_view_util_1 = __webpack_require__(1);
class Chunk {
    constructor(dataView, name, formType, config) {
        this.dataView = dataView;
        this.name = name;
        this.formType = formType;
        this.config = config;
    }
    load() {
        this.children = [];
        var pos = 0;
        while (pos < this.dataView.byteLength) {
            let name = data_view_util_1.dataViewGetString(this.dataView, pos, 4);
            pos += 4;
            let length = this.dataView.getUint32(pos, !this.config.bigEndian);
            pos += 4;
            let childDataView = new DataView(this.dataView.buffer, this.dataView.byteOffset + pos, length);
            let child;
            if (this.config.recursive && this.config.recursive.indexOf(name) != -1) {
                let formType = data_view_util_1.dataViewGetString(childDataView, 0, 4);
                let newDataView = new DataView(this.dataView.buffer, this.dataView.byteOffset + pos + 4, length - 4);
                child = new Chunk(newDataView, name, formType, this.config);
                child.load();
            }
            else {
                child = new Chunk(childDataView, name, null, this.config);
            }
            this.children.push(child);
            pos += length;
            if (!this.config.allowOddOffset && pos % 2 == 1) {
                ++pos;
            }
        }
    }
}
exports.Chunk = Chunk;
exports.configs = {
    riff: { recursive: ["RIFF", "LIST"] },
    iff: { bigEndian: true, recursive: ["FORM", "LIST", "CAT "] },
    smf: { bigEndian: true, allowOddOffset: true },
};
exports.load = (buffer, config) => {
    let dataView = new DataView(buffer);
    let rootChunk = new Chunk(dataView, null, null, config);
    rootChunk.load();
    return rootChunk;
};
//# sourceMappingURL=xiff.js.map

/***/ })
/******/ ]);
//# sourceMappingURL=player-worker.js.map