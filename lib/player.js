/*!
 *  @kobalab/majiang-ai v0.0.1
 *
 *  Copyright(C) 2021 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/majiang-ai/blob/master/LICENSE
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

module.exports = class Player extends Majiang.Player {

    kaiju(kaiju) {
        super.kaiju(kaiju);
        if (this._callback) this._callback();
    }
    qipai(qipai) {
        super.qipai(qipai);
        if (this._callback) this._callback();
    }
    zimo(zimo, gangzimo) {
        super.zimo(zimo, gangzimo);
        if (this._callback) this._callback();
    }
    dapai(dapai) {
        super.dapai(dapai);
        if (this._callback) this._callback();
    }
    fulou(fulou) {
        super.fulou(fulou);
        if (this._callback) this._callback();
    }
    gang(gang) {
        super.gang(gang);
        if (this._callback) this._callback();
    }
    kaigang(kaigang) {
        super.kaigang(kaigang);
    }
    hule(hule) {
        super.hule(hule);
        if (this._callback) this._callback();
    }
    pingju(pingju) {
        super.pingju(pingju);
        if (this._callback) this._callback();
    }
    jieju(paipu) {
        super.jieju(paipu);
        if (this._callback) this._callback();
    }
}
