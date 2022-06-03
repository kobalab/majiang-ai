/*
 *  思考ルーチン 0101
 *    - select_dapai()
 *      - リーチ者にはベタオリする
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');
const SuanPai = require('./suanpai-0101');

module.exports = class Player extends Majiang.Player {

    qipai(qipai) {
        this._suanpai = new SuanPai(this._rule['赤牌']);
        this._suanpai.qipai(
            qipai, (this._id + 4 - this._model.qijia + 4 - qipai.jushu) % 4);
        super.qipai(qipai);
    }
    zimo(zimo, gangzimo) { this._suanpai.zimo(zimo);
                           super.zimo(zimo, gangzimo) }
    dapai(dapai) { this._suanpai.dapai(dapai); super.dapai(dapai) }
    fulou(fulou) { this._suanpai.fulou(fulou); super.fulou(fulou) }
    gang(gang)   { this._suanpai.gang(gang);   super.gang(gang)   }
    kaigang(kaigang) { this._suanpai.kaigang(kaigang);
                       super.kaigang(kaigang) }


    action_kaiju(kaiju) { this._callback() }
    action_qipai(qipai) { this._callback() }

    action_zimo(zimo, gangzimo) {
        if (zimo.l != this._menfeng) return this._callback();
        let m;
        if      (this.select_hule(null, gangzimo))
                                         this._callback({hule: '-'});
        else if (this.select_pingju())   this._callback({daopai: '-'});
        else if (m = this.select_gang()) this._callback({gang: m});
        else this._callback({dapai: this.select_dapai()});
    }

    action_dapai(dapai) {
        if (dapai.l == this._menfeng)  {
            if (this.select_daopai()) this._callback({daopai: '-'});
            else                      this._callback();
            return;
        }
        let m;
        if      (this.select_hule(dapai))      this._callback({hule: '-'});
        else if (m = this.select_fulou(dapai)) this._callback({fulou: m});
        else if (this.select_daopai())         this._callback({daopai: '-'});
        else                                   this._callback();
    }

    action_fulou(fulou) {
        if (fulou.l != this._menfeng)      return this._callback();
        if (fulou.m.match(/^[mpsz]\d{4}/)) return this._callback();
        this._callback({dapai: this.select_dapai()});
    }

    action_gang(gang) {
        if (gang.l == this._menfeng) return this._callback();
        if (this.select_hule(gang, true)) this._callback({hule: '-'});
        else                              this._callback();
    }

    action_hule(hule)     { this._callback() }
    action_pingju(pingju) { this._callback() }
    action_jieju(jieju)   { this._callback() }


    select_hule(data, hupai) {

        if (! data) return this.allow_hule(this.shoupai, null, hupai);

        if (data.m && data.m.match(/^[mpsz]\d{4}$/)) return false;
        let d = ['','+','=','-'][(4 + this._model.lunban - this._menfeng) % 4];
        let p = data.m ? data.m[0] + data.m.substr(-1) + d
                       : data.p.substr(0,2) + d;
        return this.allow_hule(this.shoupai, p, hupai);
    }

    select_pingju() {
        if (Majiang.Util.xiangting(this.shoupai) < 4) return false;
        return this.allow_pingju(this.shoupai);
    }

    select_fulou(dapai) {}

    select_gang() {
        let n_xiangting = Majiang.Util.xiangting(this.shoupai);
        for (let m of this.get_gang_mianzi(this.shoupai)) {
            let shoupai = this.shoupai.clone().gang(m);
            if (Majiang.Util.xiangting(shoupai) == n_xiangting) return m;
        }
    }

    select_dapai() {

        const suan_weixian = (p)=>{
            let weixian = 0;
            for (let l = 0; l < 4; l++) {
                if (! this._model.shoupai[l].lizhi) continue;
                let w = this._suanpai.suan_weixian(p, l);
                if (w > weixian) weixian = w;
            }
            return weixian;
        };
        let anquan, min = Infinity;
        if (this._model.shoupai.find(s=>s.lizhi)) {
            for (let p of this.get_dapai(this.shoupai)) {
                let weixian = suan_weixian(p);
                if (weixian < min) {
                    min = weixian;
                    anquan = p;
                }
            }
        }

        let dapai, max = -1;
        let n_xiangting = Majiang.Util.xiangting(this.shoupai);
        const paijia = this._suanpai.make_paijia();
        const cmp = (a, b)=> paijia(a) - paijia(b);
        for (let p of this.get_dapai(this.shoupai).reverse().sort(cmp)) {
            if (! dapai) dapai = p;
            let shoupai = this.shoupai.clone().dapai(p);
            if (Majiang.Util.xiangting(shoupai) > n_xiangting) continue;

            let ev = Majiang.Util.tingpai(shoupai)
                        .map(p => this._suanpai._paishu[p[0]][p[1]])
                        .reduce((x, y)=> x + y, 0);

            if (ev > max) { max = ev; dapai = p }
        }

        if (anquan) dapai = anquan;

        if (this.select_lizhi(dapai)) dapai += '*';
        return dapai;
    }

    select_lizhi(p) {
        return this.allow_lizhi(this.shoupai, p);
    }

    select_daopai() {
        return this._model.shan.paishu == 0
            && Majiang.Util.xiangting(this.shoupai) == 0
    }
}
