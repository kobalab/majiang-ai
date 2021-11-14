/*
 *  AI自動対戦スクリプト
 */
"use strict";

const fs = require('fs');

const Majiang = require('@kobalab/majiang-core');
const Player  = require('../lib/player');

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0')
    .option('times',    { alias: 't', description: '試行回数' })
    .option('output',   { alias: 'o', description: '出力ファイル(牌譜)' } )
    .argv;

const players = [];
for (let i = 0; i < 4; i++) {
    players[i] = new Player();
}

const paipu = [];
let times = 0;
while (times < (argv.times || 1)) {
    const game = new Majiang.Game(players);
    game.do_sync();
    console.log(`[${++times}]`, new Date().toLocaleTimeString(),
                game._paipu.rank[0], game._paipu.point[0]);
    paipu.push(game._paipu);
    if (argv.output) {
        fs.writeFileSync(argv.output, JSON.stringify(paipu), 'utf-8');
    }
}
