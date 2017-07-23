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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Signal {
    constructor() {
        this.listeners = [];
    }
    on(listener) {
        this.listeners.push(listener);
    }
    off(listener) {
        let pos = this.listeners.indexOf(listener);
        if (pos !== -1) {
            this.listeners.splice(pos, 1);
        }
    }
    offAll() {
        this.listeners = [];
    }
    emit(data) {
        for (let listener of this.listeners) {
            listener(data);
        }
    }
}
exports.default = Signal;
//# sourceMappingURL=signal.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wasy_1 = __webpack_require__(4);
class KeyboardView {
    constructor(canvasContext) {
        this.canvasContext = canvasContext;
        this.keyboardMap = [];
        for (let i = 0; i < 16; ++i) {
            this.keyboardMap[i] = [];
            for (let j = 0; j < 128; ++j) {
                this.keyboardMap[i][j] = false;
            }
        }
        this.draw();
    }
    timedEventListener(e) {
        let me = e.midiEvent;
        if (me instanceof wasy_1.midi.ChannelEvent) {
            if (me instanceof wasy_1.midi.NoteOnEvent) {
                this.keyboardMap[me.channel][me.noteNumber] = true;
            }
            else if (me instanceof wasy_1.midi.NoteOffEvent) {
                this.keyboardMap[me.channel][me.noteNumber] = false;
            }
        }
    }
    draw() {
        this.canvasContext.fillStyle = "#002b36";
        this.canvasContext.fillRect(0, 0, 640, 240);
        const w = KeyboardView.W;
        const h = KeyboardView.H;
        for (let i = 0; i < 16; ++i) {
            for (let j = 0; j < 128; ++j) {
                if (this.keyboardMap[i][j]) {
                    this.canvasContext.fillStyle = "#dc322f";
                    this.canvasContext.fillRect(j * w, i * h + 1, w, h - 2);
                }
                else {
                    if (KeyboardView.blackKey[j % 12] === "1") {
                    }
                    else {
                        this.canvasContext.fillStyle = "#073642";
                        this.canvasContext.fillRect(j * w, i * h + 1, w, h - 2);
                    }
                }
            }
        }
    }
}
KeyboardView.blackKey = "010100101010";
KeyboardView.W = 640 / 128;
KeyboardView.H = 480 / 16 / 2;
class AnalyserView {
    constructor(canvasContext) {
        this.canvasContext = canvasContext;
        this.array = null;
        this.draw();
    }
    set analyser(analyser) {
        this.array = new Uint8Array(analyser.frequencyBinCount | 0);
        this._analyser = analyser;
    }
    get analyser() { return this._analyser; }
    draw() {
        this.canvasContext.fillStyle = "#002b36";
        this.canvasContext.fillRect(0, 240, 640, 240);
        if (this.analyser == null)
            return;
        // freq
        this.analyser.getByteFrequencyData(this.array);
        this.canvasContext.beginPath();
        for (let i = 0; i < 640; ++i) {
            let value = this.array[i / 640 * this.array.length | 0] / 255;
            if (i == 0) {
                this.canvasContext.moveTo(0, 480 - 240 * value);
            }
            else {
                this.canvasContext.lineTo(i, 480 - 240 * value);
            }
        }
        this.canvasContext.lineTo(640, 480);
        this.canvasContext.lineTo(0, 480);
        this.canvasContext.closePath();
        this.canvasContext.fillStyle = "#073642";
        this.canvasContext.fill();
        // wave
        this.analyser.getByteTimeDomainData(this.array);
        this.canvasContext.beginPath();
        for (let i = 0; i < 640; ++i) {
            let value = this.array[i / 640 * this.array.length | 0] / 255;
            if (i == 0) {
                this.canvasContext.moveTo(0, 480 - 240 * value);
            }
            else {
                this.canvasContext.lineTo(i, 480 - 240 * value);
            }
        }
        this.canvasContext.strokeStyle = "#dc322f";
        this.canvasContext.stroke();
    }
}
class Application {
    start() {
        document.addEventListener("DOMContentLoaded", this.run.bind(this));
    }
    run() {
        this.audioContext = this.getAudioContext();
        let canvas = document.querySelector("canvas#keyboardCanvas");
        canvas.ondragover = e => e.preventDefault();
        canvas.addEventListener("drop", this.canvasDropListener.bind(this));
        this.canvasContext = canvas.getContext("2d");
        this.keyboardView = new KeyboardView(this.canvasContext);
        this.analyserView = new AnalyserView(this.canvasContext);
        this.midiIns = [];
        this.midiIns.push(new wasy_1.midiIn.WebMIDIIn());
        this.midiIns.push(new wasy_1.midiIn.WebMidiLinkIn());
        for (const midiIn of this.midiIns) {
            midiIn.on((e) => this.midiEventListener(e));
        }
        let fileButton = document.querySelector("input#fileButton");
        fileButton.addEventListener("change", this.fileChangeListener.bind(this));
        let playButton = document.querySelector("input#playButton");
        playButton.addEventListener("click", this.playListener.bind(this));
        let pauseButton = document.querySelector("input#pauseButton");
        pauseButton.addEventListener("click", this.pauseListener.bind(this));
        let fileSelector = document.querySelector("select#fileSelector");
        fileSelector.addEventListener("change", this.fileSelectListener.bind(this));
        let lastComponent = location.href.split("/").pop();
        if (lastComponent[0] === "?") {
            this.songDirectory = `./midi/${encodeURIComponent(lastComponent.slice(1))}/`;
        }
        else {
            this.songDirectory = "./midi/";
        }
        let jsonPath = this.songDirectory + "songs.json";
        try {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", jsonPath, true);
            xhr.onload = (e) => {
                let json = xhr.responseText;
                this.songs = JSON.parse(json);
                for (let song of this.songs) {
                    let option = document.createElement("option");
                    let value = `${song.name} （${song.artist}）`;
                    if (song.artist == null)
                        value = song.name;
                    option.innerHTML = value;
                    fileSelector.appendChild(option);
                }
            };
            xhr.send();
            this.playWithBuffer();
        }
        catch (e) {
            console.error("XHR Error");
        }
    }
    fileChangeListener(e) {
        let files = e.target.files;
        let file = files[0];
        this.setUserFile(file);
    }
    canvasDropListener(e) {
        let files = e.dataTransfer.files;
        let fileButton = document.querySelector("input#fileButton");
        fileButton.files = files;
        let file = files[0];
        this.setUserFile(file);
        return e.preventDefault();
    }
    setUserFile(file) {
        if (file == null)
            return;
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.userFile = e.target.result;
            let userFileRadio = document.querySelector("input#userFileRadio");
            userFileRadio.checked = true;
        };
        fileReader.readAsArrayBuffer(file);
    }
    fileSelectListener(e) {
        let serverFileRadio = document.querySelector("input#serverFileRadio");
        serverFileRadio.checked = true;
    }
    playListener(e) {
        this.keyboardView = new KeyboardView(this.canvasContext);
        this.analyserView = new AnalyserView(this.canvasContext);
        let midiSource = document.querySelector("input[name=midiSource]:checked");
        if (midiSource.value == "userFile") {
            if (this.userFile != null) {
                this.playWithBuffer(this.userFile);
            }
        }
        else {
            let fileSelector = document.querySelector("select#fileSelector");
            let song = this.songs[fileSelector.selectedIndex];
            let xhr = new XMLHttpRequest();
            xhr.open("GET", this.songDirectory + song.file, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = (e) => {
                if (xhr.response != null) {
                    this.playWithBuffer(xhr.response);
                }
            };
            xhr.send();
        }
    }
    pauseListener(e) {
        let button = e.target;
        if (this.wasy.paused) {
            this.wasy.resume();
            button.value = "pause";
        }
        else {
            this.wasy.pause();
            button.value = "resume";
        }
    }
    midiEventListener(e) {
        this.wasy.receiveExternalMidiEvent(e);
    }
    playWithBuffer(buffer) {
        if (this.wasy != null) {
            this.wasy.destroy();
            this.wasy = null;
        }
        if (this.timerId != null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        if (this.analyser)
            this.analyser.disconnect();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.connect(this.audioContext.destination);
        this.analyserView.analyser = this.analyser;
        this.analyser.smoothingTimeConstant = 0;
        this.wasy = new wasy_1.wasy.Wasy(this.audioContext, this.analyser, buffer);
        this.wasy.play();
        this.wasy.onTimedEvent(this.keyboardView.timedEventListener.bind(this.keyboardView));
        this.timerId = setInterval(() => {
            this.analyserView.draw();
            this.keyboardView.draw();
        }, 1000 / 60);
    }
    getAudioContext() {
        let audioContext;
        let webkitAudioContext = window.webkitAudioContext;
        if (typeof AudioContext !== "undefined") {
            audioContext = new AudioContext();
        }
        else if (typeof webkitAudioContext !== "undefined") {
            audioContext = new webkitAudioContext();
        }
        return audioContext;
    }
}
let app = new Application();
app.start();


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wasy = __webpack_require__(5);
exports.wasy = wasy;
const midiIn = __webpack_require__(11);
exports.midiIn = midiIn;
const midi = __webpack_require__(0);
exports.midi = midi;
//# sourceMappingURL=index.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const midi = __webpack_require__(0);
const timer = __webpack_require__(6);
const signal_1 = __webpack_require__(2);
const inst = __webpack_require__(7);
const synth_1 = __webpack_require__(8);
class Wasy {
    constructor(audioContext, destination, buffer) {
        this.audioContext = audioContext;
        if (buffer != null) {
            this.playerWorker = new Worker("./player-worker.js");
            let initMessage = { type: "init", buffer };
            this.playerWorker.postMessage(initMessage, [initMessage.buffer]);
            this.playerWorker.postMessage({ type: "resolution" });
            this.playerWorker.addEventListener("message", this.playerWorkerMessageListener.bind(this));
        }
        this.timer = new timer.Timer(this.audioContext);
        this.timer.onTiming(this.timingListener.bind(this));
        this.patchGenerator = new synth_1.PatchGenerator();
        this.instruments = [];
        this.gain = this.audioContext.createGain();
        this.gain.gain.value = 0.1;
        this.dynamicsCompressor = this.audioContext.createDynamicsCompressor();
        this.gain.connect(this.dynamicsCompressor);
        this.dynamicsCompressor.connect(destination);
        for (let i = 0; i < 16; ++i) {
            let instrument = new inst.Instrument(this.audioContext, this.gain);
            instrument.patch = this.patchGenerator.generate(instrument, 0, i === 9);
            this.instruments[i] = instrument;
            instrument.onExpired((data) => {
                data.data.parentPatch.onExpired(data.data, data.time);
            });
            instrument.onProgramChange((event) => {
                instrument.patch = this.patchGenerator.generate(instrument, event.program, i === 9);
            });
        }
        this.paused = false;
        this._emitter = new signal_1.default();
    }
    play() {
        this.timer.start();
    }
    pause() {
        if (this.paused)
            return;
        this.timer.invalidate();
        for (let instrument of this.instruments) {
            instrument.pause();
        }
        this.paused = true;
    }
    resume() {
        if (!this.paused)
            return;
        this.timer.resume();
        this.paused = false;
    }
    destroy() {
        this.timer.invalidate();
        this.playerWorker = null;
        this._emitter.offAll();
        for (let instrument of this.instruments) {
            instrument.destroy();
        }
    }
    playerWorkerMessageListener(event) {
        switch (event.data.type) {
            case "resolution":
                this.timer.resolution = event.data.resolution;
                break;
            case "read":
                if (this.paused)
                    break;
                let newEventsStore = event.data.newEventsStore;
                let timeStamp = event.data.timeStamp;
                timeStamp.__proto__ = timer.TimeStamp.prototype;
                newEventsStore.forEach((newEvents, channelNumber) => {
                    for (let newEvent of newEvents) {
                        let event = midi.Event.create(newEvent.dataView, newEvent.tick, newEvent.status);
                        this._emitter.emit({ timeStamp, midiEvent: event });
                        let time = timeStamp.accurateTime(event.tick);
                        this.instruments[channelNumber].receiveEvent(event, time);
                        if (channelNumber === 0) {
                            if (event instanceof midi.TempoMetaEvent) {
                                this.timer.secondsPerBeat = event.secondsPerBeat;
                            }
                        }
                    }
                });
                break;
            default:
                break;
        }
    }
    receiveExternalMidiEvent(event) {
        const time = this.audioContext.currentTime;
        if (event instanceof midi.ChannelEvent) {
            this.instruments[event.channel].receiveEvent(event, time);
        }
        else {
            for (const instrument of this.instruments) {
                instrument.receiveEvent(event, time);
            }
        }
        const timeStamp = this.timer.createTimeStamp();
        timeStamp.currentTime = time;
        this._emitter.emit({ timeStamp, midiEvent: event });
    }
    onTimedEvent(listener) {
        this._emitter.on(listener);
    }
    offTimedEvent(listener) {
        this._emitter.off(listener);
    }
    timingListener(timeStamp) {
        if (this.playerWorker != null) {
            this.playerWorker.postMessage({ type: "read", timeStamp });
        }
    }
}
exports.Wasy = Wasy;
//# sourceMappingURL=wasy.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const signal_1 = __webpack_require__(2);
class TimeStamp {
    accurateTime(tick) {
        let diff = (tick - this.oldTick) / this.ticksPerSecond;
        return this.currentTime + this.delayInSeconds + diff;
    }
}
exports.TimeStamp = TimeStamp;
class Timer {
    constructor(audioContext, resolution = 480, durationInSeconds = 0.2) {
        this.audioContext = audioContext;
        this.resolution = resolution;
        this.durationInSeconds = durationInSeconds;
        this.beatsPerMinute = 120;
        this.delayInSeconds = 0.2;
        this._emitter = new signal_1.default();
    }
    get ticksPerSecond() { return this.resolution / this.secondsPerBeat; }
    set ticksPerSecond(tps) { this.secondsPerBeat = this.resolution / tps; }
    get beatsPerMinute() { return 60 / this.secondsPerBeat; }
    set beatsPerMinute(bpm) { this.secondsPerBeat = 60 / bpm; }
    start() {
        this.currentTime = this.audioContext.currentTime;
        this.oldTick = 0;
        this.tick = 0;
        this.invalidate();
        this.timerId = setInterval(this.timing.bind(this), this.durationInSeconds * 1000);
    }
    onTiming(listener) {
        this._emitter.on(listener);
    }
    offTiming(listener) {
        this._emitter.off(listener);
    }
    timing() {
        this.oldTick = this.tick;
        this.tick += this.ticksPerSecond * this.durationInSeconds;
        this.currentTime = this.audioContext.currentTime;
        this._emitter.emit(this.createTimeStamp());
    }
    createTimeStamp() {
        let timeStamp = new TimeStamp();
        timeStamp.tick = this.tick;
        timeStamp.oldTick = this.oldTick;
        timeStamp.currentTime = this.currentTime;
        timeStamp.delayInSeconds = this.delayInSeconds;
        timeStamp.ticksPerSecond = this.ticksPerSecond;
        return timeStamp;
    }
    invalidate() {
        if (this.timerId != null) {
            clearInterval(this.timerId);
        }
        this.timerId = null;
    }
    resume() {
        this.invalidate();
        this.timerId = setInterval(this.timing.bind(this), this.durationInSeconds * 1000);
    }
}
exports.Timer = Timer;
//# sourceMappingURL=timer.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const midi = __webpack_require__(0);
const signal_1 = __webpack_require__(2);
class NotePool {
    constructor(polyphony = 16) {
        this.polyphony = polyphony;
        this._noteStore = {};
        this._noteNumberQueue = [];
        this._expiredEmitter = new signal_1.default();
    }
    onExpired(listener) {
        this._expiredEmitter.on(listener);
    }
    offExpired(listener) {
        this._expiredEmitter.off(listener);
    }
    register(noteNumber, data, time) {
        // check store
        {
            let oldData = this._noteStore[noteNumber];
            if (oldData != null) {
                this._expiredEmitter.emit({ data: oldData, time });
                let oldIndex = this._noteNumberQueue.indexOf(noteNumber);
                if (oldIndex !== -1) {
                    this._noteNumberQueue.splice(oldIndex, 1);
                }
            }
            this._noteStore[noteNumber] = data;
        }
        // check queue
        {
            this._noteNumberQueue.push(noteNumber);
            while (this._noteNumberQueue.length > this.polyphony) {
                let oldNoteNumber = this._noteNumberQueue.shift();
                this._expiredEmitter.emit({ data: this._noteStore[oldNoteNumber], time });
                this._noteStore[oldNoteNumber] = null;
            }
        }
    }
    unregister(noteNumber, time) {
        let oldData = this._noteStore[noteNumber];
        if (oldData != null) {
            this._expiredEmitter.emit({ data: oldData, time });
            let oldIndex = this._noteNumberQueue.indexOf(noteNumber);
            if (oldIndex !== -1) {
                this._noteNumberQueue.splice(oldIndex, 1);
            }
        }
    }
    unregisterAll(time = 0) {
        for (let noteNumber of this._noteNumberQueue) {
            this._expiredEmitter.emit({ data: this._noteStore[noteNumber], time });
        }
        this._noteStore = {};
        this._noteNumberQueue = [];
    }
    find(noteNumber) {
        return this._noteStore[noteNumber];
    }
    get noteStore() {
        return this._noteStore;
    }
    get noteNumberQueue() {
        return this._noteNumberQueue;
    }
}
exports.NotePool = NotePool;
class Instrument {
    constructor(audioContext, destination) {
        this.audioContext = audioContext;
        this.destination = destination;
        this.notePool = new NotePool();
        this.notePool.onExpired(this._expiredListener.bind(this));
        this._expiredEmitter = new signal_1.default();
        this._programChangeEmitter = new signal_1.default();
        this._panner = this.audioContext.createPanner();
        this._gain = this.audioContext.createGain();
        this.source = this._panner;
        this._panner.connect(this._gain);
        this._gain.connect(destination);
        this.resetAllControl();
    }
    resetAllControl() {
        this.volume = 100;
        this.panpot = 64;
        this.expression = 127;
        this.pitchBend = 0;
        this.pitchBendRange = 2;
        this.dataEntry = 0;
        this.rpn = 0;
    }
    destroy() {
        this.notePool.unregisterAll();
        this._expiredEmitter.offAll();
        this._programChangeEmitter.offAll();
    }
    pause() {
        this.notePool.unregisterAll();
    }
    setPanpot(panpot) {
        this.panpot = panpot;
        var value = (panpot - 64) * Math.PI / (64 * 2);
        this._panner.setPosition(Math.sin(value), 0, -Math.cos(value));
    }
    setVolume(volume, time) {
        this.volume = volume;
        this._gain.gain.cancelScheduledValues(time);
        this._gain.gain.setValueAtTime(volume / 127 * this.expression / 127, time);
    }
    setExpression(expression, time) {
        this.expression = expression;
        this._gain.gain.cancelScheduledValues(time);
        this._gain.gain.setValueAtTime(this.volume / 127 * expression / 127, time);
    }
    set detune(detune) { this.pitchBend = detune / 100 / this.pitchBendRange * 8192; }
    get detune() { return this.pitchBend / 8192 * this.pitchBendRange * 100; }
    registerNote(noteNumber, data, time) {
        this.notePool.register(noteNumber, data, time);
    }
    findNote(noteNumber) {
        return this.notePool.find(noteNumber);
    }
    expireNote(noteNumber, time) {
        this.notePool.unregister(noteNumber, time);
    }
    get noteStore() {
        return this.notePool.noteStore;
    }
    onExpired(listener) {
        this._expiredEmitter.on(listener);
    }
    offExpired(listener) {
        this._expiredEmitter.off(listener);
    }
    _expiredListener(message) {
        this._expiredEmitter.emit(message);
    }
    onProgramChange(listener) {
        this._programChangeEmitter.on(listener);
    }
    offProgramChange(listener) {
        this._programChangeEmitter.off(listener);
    }
    receiveEvent(event, time) {
        if (event instanceof midi.ControlChangeEvent) {
            switch (event.controller) {
                case 7:// Volume
                    this.setVolume(event.value, time);
                    break;
                case 10:// Panpot
                    this.setPanpot(event.value);
                    break;
                case 11:// Expression
                    this.setExpression(event.value, time);
                    break;
                case 6:// DataEntryMSB
                    this.dataEntry &= 0b11111110000000;
                    this.dataEntry |= event.value;
                    this.receiveRPN(this.rpn, this.dataEntry, time);
                    break;
                case 38:// DataEntryLSB
                    this.dataEntry &= 0b00000001111111;
                    this.dataEntry |= event.value << 7;
                    break;
                case 100:// RPN LSB
                    this.rpn &= 0b11111110000000;
                    this.rpn |= event.value;
                    break;
                case 101:// RPN MSB
                    this.rpn &= 0b00000001111111;
                    this.rpn |= event.value << 7;
                    break;
                case 120:// AllSoundOff
                    this.notePool.unregisterAll();
                    break;
                case 121:// ResetAllControl
                    this.resetAllControl();
                    break;
                default:
                    if (this.patch) {
                        this.patch.receiveEvent(event, time);
                    }
                    break;
            }
        }
        else if (event instanceof midi.ProgramChangeEvent) {
            this._programChangeEmitter.emit(event);
        }
        else {
            if (this.patch) {
                this.patch.receiveEvent(event, time);
            }
        }
    }
    receiveRPN(rpn, data, time) {
        switch (rpn) {
            case 0:// pitch bend range
                this.pitchBendRange = data;
                break;
            default:
                break;
        }
    }
}
exports.Instrument = Instrument;
//# sourceMappingURL=instrument.js.map

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const patch_1 = __webpack_require__(9);
class SimpleOscillatorMonophony extends patch_1.Monophony {
}
exports.SimpleOscillatorMonophony = SimpleOscillatorMonophony;
class SimpleOscillatorPatch extends patch_1.Patch {
    constructor(instrument, oscillatorType = "square", destination) {
        super(instrument, destination);
        this.oscillatorType = oscillatorType;
    }
    onNoteOn(event, time) {
        // initialize
        let monophony = new SimpleOscillatorMonophony();
        let oscillator = this.audioContext.createOscillator();
        let gain = this.audioContext.createGain();
        monophony.oscillator = oscillator;
        monophony.gain = gain;
        monophony.managedNodes = [oscillator, gain];
        monophony.detunableNodes = [oscillator];
        // settings
        oscillator.type = this.oscillatorType;
        oscillator.frequency.value = this.tuning.frequency(event.noteNumber);
        oscillator.detune.value = this.detune;
        gain.gain.value = event.velocity / 127;
        // connect
        oscillator.connect(gain);
        gain.connect(this.destination);
        // start
        oscillator.start(time);
        return monophony;
    }
    onNoteOff(monophony, time) {
        monophony.oscillator.stop(time);
        monophony.gain.gain.cancelScheduledValues(time);
        monophony.gain.gain.setValueAtTime(0, time);
    }
    onExpired(monophony, time) {
        this.onNoteOff(monophony, time);
    }
}
exports.SimpleOscillatorPatch = SimpleOscillatorPatch;
class NoiseMonophony extends patch_1.Monophony {
}
exports.NoiseMonophony = NoiseMonophony;
class NoisePatch extends patch_1.Patch {
    constructor(instrument, destination) {
        super(instrument, destination);
        if (NoisePatch.noiseBuffer == null) {
            var frame = 44100 * 2;
            let buf = this.audioContext.createBuffer(2, frame, this.audioContext.sampleRate);
            let data0 = buf.getChannelData(0);
            let data1 = buf.getChannelData(1);
            for (var i = 0; i < data0.length; ++i) {
                data0[i] = (Math.random() * 2 - 1);
                data1[i] = (Math.random() * 2 - 1);
            }
            NoisePatch.noiseBuffer = buf;
        }
    }
    onNoteOn(event, time) {
        // initialize
        let monophony = new NoiseMonophony();
        let source = this.audioContext.createBufferSource();
        let filter = this.audioContext.createBiquadFilter();
        let gain = this.audioContext.createGain();
        monophony.source = source;
        monophony.filter = filter;
        monophony.gain = gain;
        monophony.managedNodes = [source, filter, gain];
        monophony.detunableNodes = [filter];
        // settings
        source.buffer = NoisePatch.noiseBuffer;
        source.loop = true;
        filter.type = "bandpass";
        filter.frequency.value = this.tuning.frequency(event.noteNumber + 24);
        filter.detune.value = this.detune;
        filter.Q.value = 1;
        gain.gain.value = event.velocity / 127;
        // connect
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.destination);
        // start
        source.start(time);
        return monophony;
    }
    onNoteOff(monophony, time) {
        monophony.source.stop(time);
        monophony.gain.gain.cancelScheduledValues(time);
        monophony.gain.gain.setValueAtTime(0, time);
    }
    onExpired(monophony, time) {
        this.onNoteOff(monophony, time);
    }
}
exports.NoisePatch = NoisePatch;
class GainedNoisePatch extends NoisePatch {
    constructor(instrument, valueAtBegin, valueAtEnd, duration, fixedFrequency, destination) {
        super(instrument, destination);
        this.valueAtBegin = valueAtBegin;
        this.valueAtEnd = valueAtEnd;
        this.duration = duration;
        this.fixedFrequency = fixedFrequency;
    }
    onNoteOn(event, time) {
        let monophony = super.onNoteOn(event, time);
        let filter = monophony.filter;
        let gain = monophony.gain;
        if (this.fixedFrequency != null) {
            filter.frequency.value = this.fixedFrequency;
        }
        else {
            filter.frequency.value = this.tuning.frequency(event.noteNumber + 24);
        }
        let baseGain = gain.gain.value;
        gain.gain.setValueAtTime(this.valueAtBegin * baseGain, time);
        gain.gain.linearRampToValueAtTime(this.valueAtEnd * baseGain, time + this.duration);
        return monophony;
    }
}
exports.GainedNoisePatch = GainedNoisePatch;
class OneShotNoisePatch extends GainedNoisePatch {
    onNoteOff(monophony, time) {
    }
    onExpired(monophony, time) {
        super.onExpired(monophony, time);
        monophony.source.stop(time);
        monophony.gain.gain.cancelScheduledValues(time);
        monophony.gain.gain.setValueAtTime(0, time);
    }
}
exports.OneShotNoisePatch = OneShotNoisePatch;
class GainedOscillatorPatch extends SimpleOscillatorPatch {
    constructor(instrument, valueAtBegin, valueAtEnd, duration, oscillatorType, destination) {
        super(instrument, oscillatorType, destination);
        this.valueAtBegin = valueAtBegin;
        this.valueAtEnd = valueAtEnd;
        this.duration = duration;
    }
    onNoteOn(event, time) {
        let monophony = super.onNoteOn(event, time);
        let gain = monophony.gain;
        let baseGain = gain.gain.value;
        gain.gain.setValueAtTime(this.valueAtBegin * baseGain, time);
        gain.gain.linearRampToValueAtTime(this.valueAtEnd * baseGain, time + this.duration);
        return monophony;
    }
}
exports.GainedOscillatorPatch = GainedOscillatorPatch;
class OneShotOscillatorPatch extends GainedOscillatorPatch {
    constructor(instrument, duration, fixedFrequency, oscillatorType, destination) {
        super(instrument, 1, 0, duration, oscillatorType, destination);
        this.fixedFrequency = fixedFrequency;
    }
    onNoteOn(event, time) {
        let monophony = super.onNoteOn(event, time);
        let oscillator = monophony.oscillator;
        let frequency;
        if (this.fixedFrequency != null) {
            frequency = this.fixedFrequency;
        }
        else {
            frequency = this.tuning.frequency(event.noteNumber + 24);
        }
        oscillator.frequency.setValueAtTime(frequency, time);
        oscillator.frequency.linearRampToValueAtTime(0, time + this.duration);
        return monophony;
    }
    onNoteOff(monophony, time) {
    }
    onExpired(monophony, time) {
        super.onExpired(monophony, time);
        monophony.oscillator.stop(time);
        monophony.gain.gain.cancelScheduledValues(time);
        monophony.gain.gain.setValueAtTime(0, time);
    }
}
exports.OneShotOscillatorPatch = OneShotOscillatorPatch;
class DrumKitPatch extends patch_1.Patch {
    constructor(instrument, destination) {
        let is = instrument;
        let ds = destination;
        super(is, ds);
        ds = this.destination;
        // gain
        let ga = this.audioContext.createGain();
        this.gain = ga;
        this.gain.gain.value = 2;
        ga.connect(ds);
        // panner
        let lp = this.audioContext.createPanner();
        this.leftPanpot = lp;
        let lpValue = (32 - 64) * Math.PI / (64 * 2);
        lp.setPosition(Math.sin(lpValue), 0, -Math.cos(lpValue));
        lp.connect(ga);
        let rp = this.audioContext.createPanner();
        this.rightPanpot = rp;
        let rpValue = (96 - 64) * Math.PI / (64 * 2);
        rp.setPosition(Math.sin(rpValue), 0, -Math.cos(rpValue));
        rp.connect(ga);
        // assign
        this.patchMap = {
            0: new OneShotNoisePatch(is, 1, 0, 0.05, null, ga),
            35: new OneShotOscillatorPatch(is, 0.2, 140, "sine", ga),
            36: new OneShotOscillatorPatch(is, 0.2, 150, "square", ga),
            37: new OneShotNoisePatch(is, 1, 0, 0.1, 2000, ga),
            38: new OneShotNoisePatch(is, 1, 0, 0.3, 1000, ga),
            39: new OneShotNoisePatch(is, 1, 0, 0.4, 3000, ga),
            40: new OneShotNoisePatch(is, 1, 0, 0.5, 1500, ga),
            41: new OneShotOscillatorPatch(is, 0.3, 200, "sine", rp),
            42: new OneShotNoisePatch(is, 1, 0, 0.1, 6000, lp),
            43: new OneShotOscillatorPatch(is, 0.3, 250, "sine", rp),
            44: new OneShotNoisePatch(is, 1, 0, 0.1, 5000, lp),
            45: new OneShotOscillatorPatch(is, 0.3, 350, "sine", rp),
            46: new OneShotNoisePatch(is, 1, 0, 0.3, 6000, lp),
            47: new OneShotOscillatorPatch(is, 0.3, 400, "sine", rp),
            48: new OneShotOscillatorPatch(is, 0.3, 500, "sine", rp),
            49: new OneShotNoisePatch(is, 1, 0, 1.5, 8000, ga),
            50: new OneShotOscillatorPatch(is, 0.3, 550, "sine", rp),
            51: new OneShotNoisePatch(is, 1, 0, 0.5, 16000, ga),
        };
    }
    onNoteOn(event, time) {
        let index = event.noteNumber;
        if (!(index in this.patchMap)) {
            index = 0;
        }
        const patch = this.patchMap[index];
        const hiHats = [42, 44, 46];
        if (hiHats.indexOf(index) != -1) {
            for (const hiHat of hiHats) {
                if (hiHat === index)
                    continue;
                this.instrument.expireNote(hiHat, time);
            }
        }
        const monophony = patch.onNoteOn(event, time);
        monophony.parentPatch = patch;
        return monophony;
    }
    onNoteOff(monophony, time) {
        monophony.parentPatch.onNoteOff(monophony, time);
    }
    onExpired(monophony, time) {
        monophony.parentPatch.onExpired(monophony, time);
    }
}
exports.DrumKitPatch = DrumKitPatch;
class PatchGenerator {
    generate(instrument, program, isDrum = false) {
        const simpleMap = {
            0x00: "sine",
            0x01: "triangle",
            0x02: "triangle",
            0x03: "triangle",
            0x04: "triangle",
            0x05: "triangle",
            0x10: "sine",
            0x11: "sine",
            0x12: "sine",
            0x13: "sine",
            0x14: "triangle",
            0x1D: "sawtooth",
            0x1E: "sawtooth",
            0x30: "triangle",
            0x31: "triangle",
            0x32: "triangle",
            0x33: "triangle",
            0x51: "sawtooth",
        };
        if (isDrum) {
            return new DrumKitPatch(instrument);
        }
        else {
            if (program === 0x77) {
                return new GainedNoisePatch(instrument, 0, 1, 1);
            }
            else if (program === 0x7E) {
                return new NoisePatch(instrument);
            }
            else if (program in simpleMap) {
                let oscillatorType = simpleMap[program];
                if (program <= 0x05) {
                    return new GainedOscillatorPatch(instrument, 1.2, 0.1, 0.7, oscillatorType);
                }
                else {
                    return new SimpleOscillatorPatch(instrument, oscillatorType);
                }
            }
            else {
                return new SimpleOscillatorPatch(instrument, "square");
            }
        }
    }
}
exports.PatchGenerator = PatchGenerator;
//# sourceMappingURL=synth.js.map

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const midi = __webpack_require__(0);
const tuning = __webpack_require__(10);
class Monophony {
}
exports.Monophony = Monophony;
class Patch {
    constructor(instrument, destination = instrument.source) {
        this.instrument = instrument;
        this.destination = destination;
        this.tuning = new tuning.EqualTemperamentTuning();
    }
    get detune() { return this.instrument.detune; }
    set detune(detune) { this.instrument.detune = detune; }
    get audioContext() { return this.instrument.audioContext; }
    receiveEvent(event, time) {
        if (event instanceof midi.NoteOnEvent) {
            let monophony = this.onNoteOn(event, time);
            if (monophony != null) {
                if (monophony.parentPatch == null) {
                    monophony.parentPatch = this;
                }
                this.instrument.registerNote(event.noteNumber, monophony, time);
            }
        }
        else if (event instanceof midi.NoteOffEvent) {
            let monophony = this.instrument.findNote(event.noteNumber);
            if (monophony != null) {
                this.onNoteOff(monophony, time);
            }
        }
        else if (event instanceof midi.PitchBendEvent) {
            for (let key in this.instrument.noteStore) {
                let monophony = this.instrument.noteStore[key];
                if (monophony != null && monophony.parentPatch === this) {
                    this.onPitchBend(event, monophony, time);
                }
            }
        }
    }
    onNoteOn(event, time) {
        return null;
    }
    onNoteOff(data, time) {
    }
    onExpired(monophony, time) {
        setTimeout(() => {
            for (let node of monophony.managedNodes) {
                node.disconnect();
            }
        }, 1000);
    }
    onPitchBend(event, monophony, time) {
        if (monophony.detunableNodes != null) {
            for (let node of monophony.detunableNodes) {
                let oscillator = node;
                this.instrument.pitchBend = event.value;
                oscillator.detune.setValueAtTime(this.detune, time);
            }
        }
    }
}
exports.Patch = Patch;
//# sourceMappingURL=patch.js.map

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class EqualTemperamentTuning {
    constructor(_frequencyOf69 = 440) {
        this._frequencyOf69 = _frequencyOf69;
        this._cache = {};
    }
    frequency(noteNumber) {
        if (noteNumber in this._cache) {
            return this._cache[noteNumber];
        }
        else {
            let frequency = this._frequencyOf69 * Math.pow(2, (noteNumber - 69) / 12);
            this._cache[noteNumber] = frequency;
            return frequency;
        }
    }
}
exports.EqualTemperamentTuning = EqualTemperamentTuning;
//# sourceMappingURL=tuning.js.map

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const midi = __webpack_require__(0);
const dvu = __webpack_require__(1);
const signal_1 = __webpack_require__(2);
class MIDIIn {
    constructor() {
        this._emitter = new signal_1.default();
    }
    on(listener) {
        this._emitter.on(listener);
    }
    off(listener) {
        this._emitter.off(listener);
    }
    offAll() {
        this._emitter.offAll();
    }
    emit(event) {
        this._emitter.emit(event);
    }
}
exports.MIDIIn = MIDIIn;
class WebMIDIIn extends MIDIIn {
    constructor() {
        super();
        if (!navigator.requestMIDIAccess) {
            return;
        }
        navigator.requestMIDIAccess().then((midiAccess) => {
            const it = midiAccess.inputs.values();
            for (let input = it.next(); !input.done; input = it.next()) {
                console.log(input.value);
                input.value.onmidimessage = (event) => {
                    const dataView = new DataView(event.data.buffer);
                    const status = dataView.getUint8(0);
                    const subDataView = dvu.dataViewGetSubDataView(dataView, 1);
                    const midiEvent = midi.Event.create(subDataView, 0, status);
                    this.emit(midiEvent);
                };
            }
        }, (reason) => {
            console.log(reason);
        });
    }
}
exports.WebMIDIIn = WebMIDIIn;
class WebMidiLinkIn extends MIDIIn {
    constructor() {
        super();
        window.addEventListener("message", (event) => {
            const elems = event.data.split(",");
            if (elems[0] === "midi") {
                const ints = elems.slice(1).map(x => parseInt(x, 16));
                const bytes = new Uint8Array(ints);
                const dataView = new DataView(bytes.buffer);
                const status = dataView.getUint8(0);
                const subDataView = dvu.dataViewGetSubDataView(dataView, 1);
                const midiEvent = midi.Event.create(subDataView, 0, status);
                this.emit(midiEvent);
            }
        }, false);
    }
}
exports.WebMidiLinkIn = WebMidiLinkIn;
//# sourceMappingURL=midi-in.js.map

/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map