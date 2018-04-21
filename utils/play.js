var noop = function noop() { };
var player = {
  src: null,
};
const innerAudioContext = wx.createInnerAudioContext();
/***
 * @class
 * 表示请求过程中发生的异常
 */
var PlayError = (function () {
  function PlayError(message) {
    Error.call(this, message);
    this.message = message;
  }

  PlayError.prototype = new Error();
  PlayError.prototype.constructor = PlayError;

  return PlayError;
})();


innerAudioContext.onPlay((res) => {
  console.log("开始播放", res)
  player.success(res);
  player.src = '';
})

innerAudioContext.onPause((res) => {
  console.log("音频暂停事件", res)
  player.complete(res);
})

innerAudioContext.onStop((res) => {
  console.log("音频停止事件", res)
  player.complete(res);
})

innerAudioContext.onEnded((res) => {
  console.log("音频自然播放结束事件", res)
  player.end(res);
})

innerAudioContext.onTimeUpdate((res) => {
  console.log("音频播放进度更新事件", res)
  player.process(res);
})

innerAudioContext.onError((res) => {
  console.log(res)
  player.fail(res);
})

function play(options) {
  if (typeof options !== 'object') {
    var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
    throw new PlayError(message);
  }

  if (!options.src) {
    var message = '无资源';
    var error = new PlayError(message);
    options.fail(error);
    return;
  }

  player.process = options.process || noop;
  player.success = options.success || noop;
  player.end = options.end || noop;
  player.fail = options.fail || noop;
  player.complete = options.complete || noop;


  if (!player.src || player.src != options.src) {
    if (player.src) {
      doStop(false);
    }
    doPlay();
  } else {
    doStop(true);
  }

  // 实际进行请求的方法
  function doPlay() {
    player.src = options.src;
    console.log("开始播放" + player.src);
    innerAudioContext.src = player.src;
    innerAudioContext.obeyMuteSwitch = false;
    innerAudioContext.play();
  };

  // 实际进行请求的方法
  function doStop(isCallbackOn) {
    innerAudioContext.stop();
  };
};

module.exports = {
  PlayError: PlayError,
  playRecord: play,
};