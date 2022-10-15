/*
 *  立体何切る
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

function weixian_all(player) {
    const weixian = player._suanpai.suan_weixian_all(
                                            player.shoupai._bingpai);
    if (! weixian) return '-';
    let rv = {};
    for (let s of ['m','p','s','z']) {
        rv[s] = [];
        for (let n = 1; n <= 9; n++) {
            rv[s][n] = (weixian(s+n) * 10)|0;
        }
    }
    return rv;
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 牌姿/場風/自風/ドラ/赤牌有無 河情報...')
    .option('verbose', { alias: 'v', boolean: true })
    .option('legacy', { alias: 'l' })
    .demandCommand(1)
    .argv;

let [ paistr,
      zhuangfeng, menfeng, baopai, hongpai ] = (''+argv._[0]).split(/\//);

zhuangfeng = +(zhuangfeng || 0);
menfeng    = +(menfeng || 0);

baopai  = (baopai||'').split(/,/);

let legacy = argv.legacy ?? '';
const Player = legacy.match(/^\d{4}$/)
                        ? require(`../legacy/player-${legacy}`)
                        : require('../');
const player = new Player();

const rule = hongpai == 0 ? Majiang.rule({'赤牌':{m:0,p:0,s:0}})
                          : Majiang.rule({'赤牌':{m:1,p:1,s:1}});
player.kaiju({ id:0, rule:rule, title:'', player:[], qijia:0 });

let qipai = {
    zhuangfeng: zhuangfeng,
    jushu:      [0,3,2,1][menfeng],
    changbang:  0,
    lizhibang:  0,
    defen:      [25000,25000,25000,25000],
    baopai:     baopai.shift() || 'z2',
    shoupai:    ['','','','']
};
qipai.shoupai[menfeng] = paistr;
player.qipai(qipai);

for (let p of baopai) player.kaigang({ baopai: p });

let dapai;
if (argv._[1]) {

    let pai = argv._[1].split(/\//);
    let he = [], fulou = [];
    for (let i = 0; i < 4; i++) {
        let l = (menfeng + i) % 4;
        fulou[l] = (pai[i]||'').split(/,/);
        he[l] = fulou[l].shift().match(/[mpsz]\d[_\*\+\=\-\^]*/g) || [];
    }
    fulou[menfeng] = player.shoupai._fulou;
    for (let l = 0; l < 4; l++) {
        for (let m of fulou[l]) {
            let d = {'+': 1, '=': 2, '-':3 }[(m.match(/[\+\=\-]/)||[])[0]];
            if (d) {
                let p = m[0] + m.match(/\d[\+\=\-]/);
                let i = he[(l+d)%4].map(p=>p.replace(/[_\*]/,'')).indexOf(p);
                if (i < 0) {
                    he[(l+d)%4].unshift(`${p},${m}`);
                }
                else {
                    he[(l+d)%4][i] += `,${m.substr(0,5)}`;
                    if (m.length == 6) {
                        let p = m[0] + m.substr(-1) + '^';
                        let j = he[l].indexOf(p);
                        if (j < 0) he[(l+d)%4][i] += m.substr(-1);
                        else       he[l][j] = `^,${m}`;
                    }
                }
            }
            else {
                let p = m.substr(0,2) + '^';
                let i = he[l].indexOf(p);
                if (i < 0) he[l].unshift(`^,${m}`);
                else       he[l][i] = `^,${m}`;
            }
        }
    }
    if (argv.verbose) console.log(he);

    let l = 0;
    while (he.map(h=>h.length).find(l=>l)) {
        if (! he[l].length) { l = (l + 1) % 4; continue }
        let [ p, m ] = he[l].shift().split(/,/);
        p = p.replace(/[\+\=\-]$/,'');
        if (argv.verbose) console.log(l, p, m||'');

        player._model.lunban = l;

        if (p == '^') {
            player._suanpai.gang({ l: l, m: m });
            continue;
        }
        else {
            player._suanpai.zimo({ l: l, p: p });
            player._suanpai.dapai({ l: l, p: p });
            dapai = { l: l, p: p };
        }
        if (m) {
            let d = {'+': 1, '=': 2, '-': 3}[(m.match(/[\+\=\-]/)||[])[0]] || 0;
            l = (l + 4 - d) % 4;
            if (l == menfeng) player._suanpai._paishu[p[0]][p[1]]++;
            player._suanpai.fulou({ l: l, m: m.substr(0,5) });
            if (m.length == 6) {
                player._suanpai.gang({ l: l, m: m });
            }
            player._model.lunban = l;
        }
        else {
            l = (l + 1) % 4;
        }
    }
}

let info = [];
if (player.shoupai.get_dapai()) {

    if (player.get_gang_mianzi(player.shoupai)) player.select_gang(info);
    player.select_dapai(info);

    for (let r of info) {
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
else if (dapai) {

    player.select_fulou(dapai, info);

    for (let r of info) {
        console.log(
            r.n_xiangting,
            r.ev.toFixed(2),
            r.shoupai,
        );
    }
}

if (argv.verbose) console.table(weixian_all(player));
