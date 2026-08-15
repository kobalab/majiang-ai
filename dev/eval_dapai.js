/*
 *  立体何切る
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');
const minipaipu = require('../lib/minipaipu');

function weixian_all(player) {
    function suan_weixian_all() {
        if (! player._model.shoupai.find(shoupai =>
                        shoupai != player.shoupai && shoupai.lizhi)) return;
        return function(p) {
            let max = 0;
            for (let l = 0; l < 4; l++) {
                if (l == player._menfeng) continue;
                if (! player._model.shoupai[l].lizhi) continue;
                let w = player._suanpai.suan_weixian(p, l);
                if (w > max) max = w;
            }
            return max;
        }
    }
    const weixian = player._suanpai.suan_weixian_all
                        ? player._suanpai.suan_weixian_all(
                                            player.shoupai._bingpai)
                        : suan_weixian_all();
    if (! weixian) return '-';
    let rv = {};
    for (let s of ['m','p','s','z']) {
        rv[s] = [];
        for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
            rv[s][n] = + weixian(s+n).toFixed(2);
        }
    }
    return rv;
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 牌姿/場風/自風/ドラ/赤牌有無[/+巡目] [ 河情報... ]')
    .option('verbose', { alias: 'v', boolean: true })
    .option('legacy', { alias: 'l' })
    .demandCommand(1)
    .argv;

let legacy = argv.legacy ?? '';
const Player = legacy.match(/^\d{4}$/)
                        ? require('../legacy/')(legacy)
                        : require('../');
const player = new Player();

let xun, param = argv._[0].split(/\//);
if (param[param.length - 1][0] == '+' ) xun = param.pop();
let [ paistr, zhuangfeng, menfeng, baopai, hongpai ] = param;

zhuangfeng = +zhuangfeng||0;
menfeng    = +menfeng||0;
baopai     = (baopai||'z1').split(/,/);
hongpai    = ! hongpai;
xun        = +xun||0;

let baseinfo = { paistr: paistr, zhuangfeng: zhuangfeng, menfeng: menfeng,
                 baopai: baopai, hongpai: hongpai, xun: xun };

if (argv._[1]) minipaipu(player, baseinfo, argv._[1].split(/\//));
else           minipaipu(player, baseinfo);

let info = [];
const cmp = (a, b)=> a.selected ? -1
                   : b.selected ?  1
                   : b.ev - a.ev;

if (player.shoupai.get_dapai()) {

    let m;
    if (player.shoupai.get_gang_mianzi()) m = player.select_gang(info);
    if (m) info.forEach(i=>{ if (i.m == m) i.selected = true });
    let p = player.select_dapai(info);
    info.forEach(i=>{ if (i.p == p.slice(0,2)) i.selected = true });

    for (let r of info.sort(cmp)) {
        console.log(
            r.p,
            r.n_xiangting,
            r.ev != null      ? r.ev.toFixed(2)             : 'オリ',
            r.weixian != null ? `(${r.weixian.toFixed(2)})` : '',
            r.ev              ? r.tingpai.join(',')         : '',
            r.ev              ? r.n_tingpai                 : '',
        );
    }
}
else {

    let l = player.model.lunban;
    if (l != -1) {
        let p = player.model.he[l]._pai.slice(-1)[0];
        player.select_fulou({ l: l, p: p }, info);
    }

    for (let r of info.sort(cmp)) {
        console.log(
            r.n_xiangting,
            r.ev.toFixed(2),
            r.shoupai,
        );
    }
}

if (argv.verbose) console.table(weixian_all(player));
