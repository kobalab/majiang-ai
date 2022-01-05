/*
 *  SuanPai 0301
 *    - paishu_all()
 *      - 赤牌を区別して残り牌数を返す
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

module.exports = class SuanPai {

    constructor(hongpai) {

        this._paishu = {
            m: [hongpai.m, 4,4,4,4,4,4,4,4,4],
            p: [hongpai.p, 4,4,4,4,4,4,4,4,4],
            s: [hongpai.s, 4,4,4,4,4,4,4,4,4],
            z: [        0, 4,4,4,4,4,4,4]
        };
        this._zhuangfeng = 0;
        this._menfeng    = 0;
        this._baopai     = [];

        this._dapai = [{},{},{},{}];
        this._lizhi = [];
    }

    decrease(p) {
        this._paishu[p[0]][p[1]]--;
        if (p[1] == 0) this._paishu[p[0]][5]--;
    }

    qipai(qipai, menfeng) {

        this._zhuangfeng = qipai.zhuangfeng
        this._menfeng    = menfeng;

        this._baopai = [ qipai.baopai ];
        this.decrease(qipai.baopai);

        let paistr = qipai.shoupai[menfeng];
        for (let suitstr of paistr.match(/[mpsz]\d[\d\+\=\-]*/g) || []) {
            let s = suitstr[0];
            for (let n of suitstr.match(/\d/g)) {
                this.decrease(s+n);
            }
        }
    }

    zimo(zimo) {
        if (zimo.l == this._menfeng) this.decrease(zimo.p);
    }

    dapai(dapai) {
        if (dapai.l != this._menfeng) {
            this.decrease(dapai.p);
            if (dapai.p.substr(-1) == '*') this._lizhi[dapai.l] = true;
        }
        let p = dapai.p[0] + (+dapai.p[1]||5);
        this._dapai[dapai.l][p] = true;
        for (let l = 0; l < 4; l++) {
            if (this._lizhi[l]) this._dapai[l][p] = true;
        }
    }

    fulou(fulou) {
        if (fulou.l != this._menfeng) {
            let s = fulou.m[0];
            for (let n of fulou.m.match(/\d(?![\+\=\-])/g)) {
                this.decrease(s+n);
            }
        }
    }

    gang(gang) {
        if (gang.l != this._menfeng) {
            if (gang.m.match(/^[mpsz]\d{4}$/)) {
                let s = gang.m[0];
                for (let n of gang.m.match(/\d/g)) {
                    this.decrease(s+n);
                }
            }
            else {
                let s = gang.m[0], n = gang.m.substr(-1);
                this.decrease(s+n);
            }
        }
    }

    kaigang(kaigang) {
        this._baopai.push(kaigang.baopai);
        this.decrease(kaigang.baopai);
    }

    paishu_all() {
        let paishu = {};
        for (let s of ['m','p','s','z']) {
            for (let n of s == 'z' ? [1,2,3,4,5,6,7] : [0,1,2,3,4,5,6,7,8,9]) {
                paishu[s+n] = n == 5 ? this._paishu[s][5] - this._paishu[s][0]
                                     : this._paishu[s][n];
            }
        }
        return paishu;
    }

    paijia(p) {

        const weight = (s, n)=>{
            if (n < 1 || 9 < n) return 0;
            let rv = 1;
            for (let p of this._baopai) {
                if (s+n == Majiang.Shan.zhenbaopai(p)) rv *= 2;
            }
            return rv;
        }

        let rv = 0;
        let s = p[0], n = +p[1]||5;
        const min = Math.min, max = Math.max, num = this._paishu[s];

        if (s == 'z') {
            rv = p[1] != '0' ? num[n] * weight(s,n) : 0;
            if (n == this._zhuangfeng + 1) rv *= 2;
            if (n == this._menfeng + 1)    rv *= 2;
            if (5 <= n && n <= 7)          rv *= 2;
        }
        else {
            let left   = (1 <= n-2)             ? min(num[n-2], num[n-1]) : 0;
            let center = (1 <= n-1 && n+1 <= 9) ? min(num[n-1], num[n+1]) : 0;
            let right  =             (n+2 <= 9) ? min(num[n+1], num[n+2]) : 0;
            let n_pai = [
                left,
                max(left, center),
                num[n],
                max(center, right),
                right
            ];
            rv = n_pai[0] * weight(s, n-2)
               + n_pai[1] * weight(s, n-1)
               + n_pai[2] * weight(s, n)
               + n_pai[3] * weight(s, n+1)
               + n_pai[4] * weight(s, n+2);
            rv += ! num[0] ? 0
                  : n == 7 ? min(num[0], n_pai[0]) * weight(s, n-2)
                  : n == 6 ? min(num[0], n_pai[1]) * weight(s, n-1)
                  : n == 5 ? min(num[0], n_pai[2]) * weight(s, n)
                  : n == 4 ? min(num[0], n_pai[3]) * weight(s, n+1)
                  : n == 3 ? min(num[0], n_pai[4]) * weight(s, n+2)
                  :          0;
            if (p[1] == '0') rv *= 2;
        }
        rv *= weight(s, n);

        return rv;
    }

    suan_weixian(p, l) {

        let s = p[0], n = +p[1]||5;

        if (this._dapai[l][s+n]) return 0;

        if (s == 'z') return Math.min(this._paishu[s][n], 3);
        if (n == 1)   return this._dapai[l][s+'4'] ? 3: 6;
        if (n == 2)   return this._dapai[l][s+'5'] ? 4: 8;
        if (n == 3)   return this._dapai[l][s+'6'] ? 5: 8;
        if (n == 7)   return this._dapai[l][s+'4'] ? 5: 8;
        if (n == 8)   return this._dapai[l][s+'5'] ? 4: 8;
        if (n == 9)   return this._dapai[l][s+'6'] ? 3: 6;

        return this._dapai[l][s+(n-3)] && this._dapai[l][s+(n+3)] ?  4
             : this._dapai[l][s+(n-3)] || this._dapai[l][s+(n+3)] ?  8
             :                                                      12;
    }
}
