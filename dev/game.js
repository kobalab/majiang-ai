/*
 *  デュプリケート対戦
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');
const Shan    = require('./shan');

module.exports = class Game extends Majiang.Game {

    do_sync(script) {
        this._model.qijia = script.qijia;
        this._shan = [];
        for (let i = 0; i < script.shan.length; i++) {
            let j = i % 4;
            if (! this._shan[j]) this._shan[j] = [];
            this._shan[j].push(script.shan[i]);
        }
        super.do_sync();
    }
    qipai() {
        let pai;
        if (this._model.zhuangfeng % 2 == 0)
                pai = this._shan[this._model.jushu].shift();
        else    pai = this._shan[this._model.jushu].pop();
        if (! pai) console.log('***',
                               this._model.zhuangfeng, this._model.jushu);
        super.qipai(pai && new Shan(pai));
    }
    zimo() {
        this._model.shan.lunban(this._model.lunban);
        super.zimo();
    }
}
