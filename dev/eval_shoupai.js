/*
 *  手牌の評価値を算出する
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

function add_hongpai(tingpai) {
    let pai = [];
    for (let p of tingpai) {
        if (p[0] != 'z' && p[1] == '5') pai.push(p.replace(/5/,'0'));
        pai.push(p);
    }
    return pai;
}

function select_dapai(player, shoupai, paishu) {
    let rv, max = 0;
    let n_xiangting = Majiang.Util.xiangting(shoupai);
    for (let p of player.get_dapai(shoupai)) {
        let new_shoupai = shoupai.clone().dapai(p);
        if (Majiang.Util.xiangting(new_shoupai) > n_xiangting) continue;
        let ev = player.eval_shoupai(new_shoupai, paishu);
        if (ev >= max) {
            max = ev;
            let tingpai = Majiang.Util.tingpai(new_shoupai);
            rv = {
                ev:      ev.toFixed(2),
                p:       p,
                shoupai: new_shoupai.toString(),
                tingpai: tingpai.join(','),
                n:       add_hongpai(tingpai).map(_=>paishu[_])
                                             .reduce((x,y)=> x + y, 0)
            };
        }
    }
    return rv;
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 牌姿/場風/自風/ドラ/赤牌有無')
    .option('silent', { alias: 's', boolean: true })
    .option('legacy', { alias: 'l' })
    .demandCommand(1)
    .argv;

let [ paistr,
      zhuangfeng, menfeng, baopai, hongpai ] = (''+argv._[0]).split(/\//);

baopai = (baopai||'').split(/,/);

let legacy = argv.legacy ?? '';
const Player = legacy.match(/^\d{4}$/)
                        ? require(`../legacy/player-${legacy}`)
                        : require('../');
const player = new Player();

const rule = hongpai == 0 ? Majiang.rule({'赤牌':{m:0,p:0,s:0}})
                          : Majiang.rule({'赤牌':{m:1,p:1,s:1}});
player.kaiju({ id:0, rule:rule, title:'', player:[], qijia:0 });

let qipai = {
    zhuangfeng: zhuangfeng || 0,
    jushu:      [0,3,2,1][menfeng || 0],
    changbang:  0,
    lizhibang:  0,
    defen:      [25000,25000,25000,25000],
    baopai:     baopai.shift() || 'z2',
    shoupai:    ['','','','']
};
qipai.shoupai[menfeng || 0] = paistr;
player.qipai(qipai);

for (let p of baopai) player.kaigang({ baopai: p });

let paishu = player._suanpai.paishu_all();
let n_xiangting = Majiang.Util.xiangting(player.shoupai);

console.log(n_xiangting,
            player.eval_shoupai(player.shoupai, paishu).toFixed(2));

if (argv.silent) process.exit(0);

let dapai = player.get_dapai(player.shoupai);
if (dapai) {
    let max = 0;
    for (let p of dapai) {
        if (p.substr(-1) == '_' && dapai.find(_=>_ == p.substr(0,2))) continue;
        let shoupai = player.shoupai.clone().dapai(p);
        let x = Majiang.Util.xiangting(shoupai);
        if (x > n_xiangting) continue;
        let ev = player.eval_shoupai(shoupai, paishu);
        let tingpai = Majiang.Util.tingpai(shoupai);
        console.log(p.substr(0,2), x, ev.toFixed(2),
                    tingpai.join(','),
                    tingpai.map(_=>player._suanpai._paishu[_[0]][_[1]])
                           .reduce((x,y)=> x + y, 0));
        if (ev > max) max = ev;
    }
    for (let p of dapai) {
        if (p.substr(-1) == '_' && dapai.find(_=>_ == p.substr(0,2))) continue;
        let shoupai = player.shoupai.clone().dapai(p);
        let x = Majiang.Util.xiangting(shoupai);
        if (x == n_xiangting) continue;
        let tingpai = Majiang.Util.tingpai(shoupai);
        console.log(p.substr(0,2), x,
                    player.eval_backtrack(
                                shoupai, paishu, p, max * 2 + 1).toFixed(2),
                    tingpai.join(','),
                    tingpai.map(_=>player._suanpai._paishu[_[0]][_[1]])
                           .reduce((x,y)=> x + y, 0));
    }
}
else {
    for (let p of add_hongpai(Majiang.Util.tingpai(player.shoupai))) {
        if (paishu[p] == 0) continue;
        paishu[p]--;
        let shoupai = player.shoupai.clone().zimo(p);
        let rv = select_dapai(player, shoupai, paishu);
        console.log(p, paishu[p]+1, rv.ev, rv.p, rv.shoupai, rv.tingpai, rv.n);
        paishu[p]++;
    }
}
