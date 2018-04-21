const app = getApp()
import grace from "../../grace/index.js"
var UTIL = require('../../utils/util.js');
var config = require('../../comm/script/config');
var recordMg = require('../../utils/record.js');
var playMg = require('../../utils/play.js');

grace.page({
  data: {
    isRecording: false,
    recordUi: {
      record: config.image.record,
      recording: config.image.recording,
    },
    recAnimation: {},
    contentAnimation: {},
    isPlaying: false,
    playUi: {
      play: config.image.play,
      playing: config.image.playing,
    },
    recSrc: null,
    duration: 0,
    maxDuration: 15,
    Response:{
      Question:'老虎的英文是什么',
      World:'老虎',
      Language:'英语',
      Answer:'Tiger',
      WavBase64:''
    },
    TigerVoiceSrc:''
  },
  onLoad: function () {
    // var that = this
    // wx.showNavigationBarLoading()
    // app.getCity(function () {
    //   wx.hideNavigationBarLoading()
    //   UTIL.log('当前定位城市：' + config.city);
    // })
    
  },
  startRecord: function () {
    var $this = this;
    $this.startRecordTimer = setTimeout(function(){
      $this.setData({
        isRecording: true,
        isSpeaking: true
      });
      $this.speaking();
      recordMg.startRecord({
        success(result) {
          console.log('录音成功:', result);
          $this.upload();
        },
        fail(error) {
          console.log('录音失败:', error);
        },
        process() {
          var rec = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          }).opacity(1).step().opacity(0).step();
          var content = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
          }).opacity(0.4).step().opacity(1).step();

          $this.setData({
            duration: recordMg.getRecordDuration(),
            recAnimation: rec.export(),
            contentAnimation: content.export(),
          });
        },
        complete() {
          $this.setData({
            isRecording: false,
            isSpeaking: false,
            recordUi: {
              record: config.image.record,
              recording: config.image.recording,
            },
            recAnimation: {},
            contentAnimation: {},
            recSrc: null,
            duration: 0,
            maxDuration: 15,
          });
          ($this.timer && clearInterval($this.timer));
        },
      });
    },200);
  },
  stopRecord: function () {
    (this.startRecordTimer && clearTimeout(this.startRecordTimer));
    recordMg.stopRecord();
  },
  playAnswer: function (){
    var that = this;
    var src = this.$data.Response.WavBase64;
    if (!src) return;
    that.setData({
      isPlaying: true
    });
    playMg.playRecord({
      src: src,
      success(result) {

      },
      fail(error) {
      },
      end(res) {
        
      },
      complete: function () {
        that.setData({
          isPlaying: false
        });
      }
    })
  },
  play: function(){
    var that = this;
    var src = recordMg.getRecordSrc();
    if (!src) src = this.$data.TigerVoiceSrc;
    that.setData({
      isPlaying: true
    });
    playMg.playRecord({
      src: src,
      success(result) {
        
      },
      fail(error) {
      },
      end(res) {
        that.playAnswer();
      },
      complete: function () {
        that.setData({
          isPlaying: false
        });
      }
    })
  },
  upload: function () {
    //上传
    var $this = this;
    var src = recordMg.getRecordSrc();
    if (!src) {
      wx.showToast({
        title: '录音失败',
        icon: 'loading',
        duration: 1000
      });
      return;
    }
    wx.showToast({
      title: '识别中',
      icon: 'loading',
      duration: 60000,
      mask:true
    });
    wx.uploadFile({
      url: config.apiList.uploadUrl,
      filePath: src,
      name: 'voice',
      header:{
        "Content-Type":"application/json"
      },
      success: function (res) {
        wx.hideToast();
        var data = JSON.parse(res.data);
        if (!data.IsSuccessful){
          wx.showToast({
            title: '抱歉,识别失败',
            icon: 'none',
            duration: 1500
          });
          if (data.ErrorMessage){
            $this.$data.Response.Question = data.ErrorMessage;
          }
          return;
        }
        console.log(data);
        $this.setData({
          Response: {
            Question: data.Question,
            World: data.Word,
            Language: data.Language,
            Answer: data.Answer,
            WavBase64: data.WavBase64
          }
        });
        $this.playAnswer();
      },
      fail: function (res) {
        wx.hideToast();
        console.log(res)
        wx.showToast({
          title: '识别失败，请换个重试',
          icon: 'loading',
          duration: 1500
        });
      },
      complete: function(){
        $this.setData({
          duration: 15,
          recAnimation: {},
          contentAnimation: {}
        });
      }
    });
  },
  onShareAppMessage:function(){
    return {
      title: '提问单词',
      desc: '爸爸,老虎的英文是什么?',
      path: '/pages/index/index'
    }
  },
  //麦克风帧动画 
  speaking:function(){
    var _this = this;
    //话筒帧动画 
    var i = 1;
    this.timer = setInterval(function () {
      i++;
      i = i % 5;
      _this.setData({
        speakingPicIndex: i
      })
    }, 200);
  }
})
