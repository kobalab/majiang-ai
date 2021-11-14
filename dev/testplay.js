/*
 *  AI自動対戦スクリプト
 */
"use strict";

const fs   = require('fs');
const zlib = require('zlib');

const Majiang = require('@kobalab/majiang-core');
const Player  = require('../lib/player');
const Game    = require('./game');

function get_shan(filename) {
    if (! filename) return;
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0')
    .option('times',    { alias: 't', description: '試行回数' } )
    .option('input',    { alias: 'i', description: '入力ファイル(牌山)' } )
    .option('output',   { alias: 'o', description: '出力ファイル(牌譜)' } )
    .argv;

const players = [];
for (let i = 0; i < 4; i++) {
    players[i] = new Player();
}

const script = get_shan(argv.input) || [];
let times = argv.times || script && script.length || 1;

const paipu = [];
console.log(`[${times}]`,new Date().toLocaleTimeString());

while (times) {
    let s = script.shift();
    const game = s ? new Game(players)
                   : new Majiang.Game(players);
    game.do_sync(s);
    console.log(`[${--times}]`, new Date().toLocaleTimeString(),
                game._paipu.rank[0], game._paipu.point[0]);
    paipu.push(game._paipu);
    if (argv.output) {
        fs.writeFileSync(argv.output, JSON.stringify(paipu), 'utf-8');
    }
}
