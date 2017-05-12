#!/bin/env node
var express = require('express');
var fs = require('fs');
var io = require('socket.io')();
var Speed = require('./SpeedService.js');

var App = function() {

	var self = this;
	var speed = new Speed(io);

	/**
	 *  IPアドレス、ポートの設定
	 */
	self.setupVariables = function() {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

		if (typeof self.ipaddress === "undefined") {
			// IPアドレスが環境変数に未設定の場合、127.0.0.1とする
			console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
			self.ipaddress = "127.0.0.1";
		}
	};

	/**
	 *  nodejs起動時の事前読み込み（キャッシュ）
	 */
	self.populateCache = function() {
		if (typeof self.zcache === "undefined") {
			self.zcache = { 'index.html' : '' };
		}

		self.zcache['index.html'] = fs.readFileSync('./index.html');
	};

	/**
	 *  キャッシュからファイルを取得
	 */
	self.cache_get = function(key) { return self.zcache[key]; };

	/**
	 *  終了処理
	 */
	self.terminator = function(sig){
		if (typeof sig === "string") {
			console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
			process.exit(1);
		}
		console.log('%s: Node server stopped.', Date(Date.now()) );
	};

	/**
	 *  終了ハンドラ
	 */
	self.setupTerminationHandlers = function(){
		// exitイベントを受信した場合（processはnodejsのグローバル変数）
		process.on('exit', function() { self.terminator(); });

		// 以下のイベントを受信した場合
		['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
		 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
		].forEach(function(element, index, array) {
			process.on(element, function() { self.terminator(element); });
		});
	};

	/**
	 *  ルーティング設定
	 */
	self.createRoutes = function() {
		self.routes = { };

		self.routes['/'] = function(req, res) {
			res.setHeader('Content-Type', 'text/html');
			res.send(self.cache_get('index.html'));
		};

		// テスト用
		self.routes['/test'] = function(req, res) {
			speed.test(req, res);
		};
	};

	/**
	 *  expressアプリケーション初期化
	 */
	self.initializeServer = function() {
		// ルーティング設定
		self.createRoutes();
		// expressアプリケーション生成
		self.app = express();

		// 静的ファイルディレクトリ指定
		self.app.use(express.static('public'));
		self.app.use(express.static('views'));

		//  ルーティング設定
		for (var r in self.routes) {
			self.app.get(r, self.routes[r]);
		}
	};

	/**
	 *  nodejs初期化処理
	 */
	self.initialize = function() {
		// IPアドレス、ポート設定
		self.setupVariables();
		// キャッシュ設定
		self.populateCache();
		// 終了ハンドラ設定
		self.setupTerminationHandlers();

		// expressアプリケーション初期化
		self.initializeServer();
	};

	/**
	 *  サーバ開始処理
	 */
	self.start = function() {
		//  IPアドレス、ポートを設定
		var server =
		self.app.listen(self.port, self.ipaddress, function() {
			console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), self.ipaddress, self.port);
		});

		// socket.ioを設定
		io.attach(server);
	};
};

/**
 *  メイン処理
 */
var app = new App();
app.initialize();
app.start();
