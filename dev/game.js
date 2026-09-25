/*
 *  デュプリケート対戦
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');
const Shan    = require('./shan');

module.exports = class Game extends Majiang.Game {

    preset(preset) {
        if (! preset) return this;
        this._qijia = preset.qijia;
        this._shan = [];
        for (let i = 0; i < preset.shan.length; i++) {
            let j = i % 4;
            if (! this._shan[j]) this._shan[j] = [];
            this._shan[j].push(preset.shan[i]);
        }
        return this;
    }
    kaiju() {
        super.kaiju(this._qijia);
    }
    qipai() {
        if (this._shan) {
            let shan;
            if (this.model.zhuangfeng % 2 == 0)
                    shan = this._shan[this.model.jushu].shift();
            else    shan = this._shan[this.model.jushu].pop();
            if (! shan) console.log('***',
                               this.model.zhuangfeng, this.model.jushu);
            super.qipai(shan && new Shan(shan, this._rule));
        }
        else {
            super.qipai();
        }
    }
    zimo() {
        if (this.model.shan.lunban)
                        this.model.shan.lunban(this.model.lunban);
        super.zimo();
    }
}
