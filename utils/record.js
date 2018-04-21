
var noop = function noop() { };
var recorder = {
  maxDuration: 15,
  duration: 0,
  src: null,
  timer: null,
};

const mp3Recorder = wx.getRecorderManager();;
var mp3RecoderOptions = {
  duration: 15000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 48000,
  format: 'mp3',
  //frameSize: 50
}

/***
 * @class
 * 表示请求过程中发生的异常
 */
var RecordError = (function () {
  function RecordError(message) {
    Error.call(this, message);
    this.message = message;
  }

  RecordError.prototype = new Error();
  RecordError.prototype.constructor = RecordError;

  return RecordError;
})();

mp3Recorder.onStart(() => {
  console.log("开始录音")
  recorder.timer = setInterval(function () {
    recorder.duration += 1;
    (recorder.process && recorder.process());
    if (recorder.duration >= recorder.maxDuration && recorder.timer) {
      clearInterval(recorder.timer);
    }
  }, 1000);
})


mp3Recorder.onStop((res) => {
  if (recorder.timer) {
    clearInterval(recorder.timer);
  }
  (recorder.complete && recorder.complete());
  if (res.tempFilePath) {
    recorder.src = res.tempFilePath;
    (recorder.success && recorder.success(res));
    return;
  } else {
    var error = new RecordError('录音文件保存失败');
    (recorder.fail && recorder.fail(error));
  }
})

mp3Recorder.onError((error) => {
  (recorder.complete && recorder.complete());
  (recorder.fail && recorder.fail(error));
})

function startRecord(options) {

  if (typeof options !== 'object') {
    var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
    throw new RecordError(message);
  }


  recorder.process = options.process;
  recorder.success = options.success || noop;
  recorder.fail = options.fail || noop;
  recorder.complete = options.complete || noop;

  if (typeof recorder.process !== 'function') {
    var message = '刷新Ui函数不存在';
    throw new RecordError(message);
  }

  mp3Recorder.start(mp3RecoderOptions);
};


function stopRecord() {
  mp3Recorder && mp3Recorder.stop();
};

function getRecordDuration() {
  return recorder.duration || 0;
}

function getRecordSrc() {
  return recorder.src || null;
}

module.exports = {
  RecordError: RecordError,
  startRecord: startRecord,
  stopRecord: stopRecord,
  getRecordDuration: getRecordDuration,
  getRecordSrc: getRecordSrc,
};