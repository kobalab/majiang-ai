/*
 *  AI自動対戦スクリプト
 */
"use strict";

const fs   = require('fs');
const zlib = require('zlib');

const Majiang = require('@kobalab/majiang-core');
const Game    = require('./game');

function select_player(n = '') {
    return new (n.match(/^\d{4}$/) ? require(`../legacy/player-${n}`)
                                   : require('../'))();
}

function get_shan(filename) {
    if (! filename) return;
    return JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString());
}

function get_rule(filename = '{}') {
    if (filename.match(/\{.*\}/)) {
        return Majiang.rule(JSON.parse(filename));
    }
    return Majiang.rule(JSON.parse(fs.readFileSync(filename)));
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 [legacy [legacy]]')
    .option('times',    { alias: 't', description: '試行回数' } )
    .option('input',    { alias: 'i', description: '入力ファイル(牌山)' } )
    .option('output',   { alias: 'o', description: '出力ファイル(牌譜)' } )
    .option('skip',     { alias: 's', description: '指定した数の牌山をスキップ' } )
    .option('rule',     { alias: 'r', description: 'ルール' })
    .argv;

const players = [];
players[0] = select_player(argv._[1]);
for (let i = 1; i < 4; i++) {
    players[i] = select_player(argv._[0]);
}

const script = get_shan(argv.input) || [];
for (let i = 0; i < (argv.skip || 0); i++) script.shift()

const rule = get_rule(argv.rule);

let times = argv.times || script && script.length || 1;

const paipu = [];
const callback = (log)=>{
    paipu.push(log);
    if (argv.output) {
        fs.writeFileSync(argv.output, JSON.stringify(paipu), 'utf-8');
    }
};
console.log(`[${times}]`,new Date().toLocaleTimeString());

while (times) {
    let s = script.shift();
    const game = s ? new Game(players, callback, rule)
                   : new Majiang.Game(players, callback, rule);
    game._model.title += ` #${paipu.length}`;
    for (let i = 0; i < 4; i++) {
        let legacy = argv._[i == 0 ? 1 : 0];
        if (legacy) game._model.player[i] += ` [${legacy}]`;
    }
    game.do_sync(s);
    console.log(`[${--times}]`, new Date().toLocaleTimeString(),
                game._paipu.rank[0], game._paipu.point[0]);
}
