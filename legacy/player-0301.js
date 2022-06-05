/*
 *  思考ルーチン 0301
 *    - select_dapai()
 *      - 和了打点を元にした評価値で打牌を選択する
 *    - eval_shoupai()
 *      - 和了打点から評価値を算出する
 *    - get_defen()
 *      - 評価値算出用の和了打点を計算する
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');
const SuanPai = require('./suanpai-0301');

function add_hongpai(tingpai) {
    let pai = [];
    for (let p of tingpai) {
        if (p[0] != 'z' && p[1] == '5') pai.push(p.replace(/5/,'0'));
        pai.push(p);
    }
    return pai;
}

module.exports = class Player extends Majiang.Player {

    qipai(qipai) {
        this._defen_cache = {};
        this._eval_cache  = {};
        this._suanpai = new SuanPai(this._rule['赤牌']);
        this._suanpai.qipai(
            qipai, (this._id + 4 - this._model.qijia + 4 - qipai.jushu) % 4);
        super.qipai(qipai);
    }
    zimo(zimo, gangzimo) {
        this._eval_cache = {};
        this._suanpai.zimo(zimo);
        super.zimo(zimo, gangzimo);
    }
    dapai(dapai) {
        this._eval_cache = {};
        this._suanpai.dapai(dapai);
        super.dapai(dapai);
    }
    fulou(fulou) {
        this._suanpai.fulou(fulou);
        super.fulou(fulou);
    }
    gang(gang)   {
        this._suanpai.gang(gang);
        super.gang(gang);
    }
    kaigang(kaigang) {
        this._defen_cache = {};
        this._eval_cache  = {};
        this._suanpai.kaigang(kaigang);
        super.kaigang(kaigang);
    }


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

    select_fulou(dapai) {

        let n_xiangting = this.xiangting(this.shoupai);
        if (this._model.shoupai.find(s=>s.lizhi) && n_xiangting > 1) return;

        let d = ['','+','=','-'][(4 + this._model.lunban - this._menfeng) % 4];
        let p = dapai.p.substr(0,2) + d;

        for (let m of this.get_gang_mianzi(this.shoupai, p)) {
            let shoupai = this.shoupai.clone().fulou(m);
            if (this.xiangting(shoupai) == n_xiangting) return m;
        }

        if (n_xiangting == 0) return;
        for (let m of this.get_peng_mianzi(this.shoupai, p)
                        .concat(this.get_chi_mianzi(this.shoupai, p)))
        {
            let shoupai = this.shoupai.clone().fulou(m);
            if (this.xiangting(shoupai) < n_xiangting) return m;
        }
    }

    select_gang() {

        let n_xiangting = this.xiangting(this.shoupai);
        if (this._model.shoupai.find(s=>s.lizhi) && n_xiangting > 0) return;

        for (let m of this.get_gang_mianzi(this.shoupai)) {
            let shoupai = this.shoupai.clone().gang(m);
            if (this.xiangting(shoupai) == n_xiangting) return m;
        }
    }

    select_dapai() {

        const suan_weixian = (p)=>{
            let weixian = 0;
            for (let l = 0; l < 4; l++) {
                if (l == this._menfeng) continue;
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
        let paishu = this._suanpai.paishu_all();
        const paijia = this._suanpai.make_paijia();
        const cmp = (a, b)=> paijia(a) - paijia(b);
        for (let p of this.get_dapai(this.shoupai).reverse().sort(cmp)) {
            if (! dapai) dapai = p;
            let shoupai = this.shoupai.clone().dapai(p);
            if (n_xiangting > 2 && this.xiangting(shoupai) > n_xiangting ||
                Majiang.Util.xiangting(shoupai) > n_xiangting) continue;

            let ev = this.eval_shoupai(shoupai, paishu);

            if (ev > max) { max = ev; dapai = p }
        }

        if (anquan) {
            if (n_xiangting > 1 ||
                n_xiangting == 1 && suan_weixian(dapai) > 5)  dapai = anquan;
        }

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

    xiangting(shoupai) {
        function xiangting_menqian(shoupai) {
            return shoupai.menqian ? Majiang.Util.xiangting(shoupai) : Infinity;
        }
        function xiangting_fanpai(shoupai, zhuangfeng, menfeng, suanpai) {
            let n_fanpai = 0, back;
            for (let n of [ zhuangfeng + 1, menfeng + 1, 5, 6, 7 ]) {
                if      (shoupai._bingpai.z[n] >= 3) n_fanpai++;
                else if (shoupai._bingpai.z[n] == 2
                         && suanpai._paishu.z[n])    back = 'z'+n+n+n+'+';
                for (let m of shoupai._fulou) {
                    if (m[0] == 'z' && m[1] == n) n_fanpai++;
                }
            }
            if (n_fanpai) return Majiang.Util.xiangting(shoupai);
            if (back) {
                let new_shoupai = shoupai.clone();
                new_shoupai.fulou(back, false);
                new_shoupai._zimo = null;
                return Majiang.Util.xiangting(new_shoupai) + 1;
            }
            return Infinity;
        }
        function xiangting_duanyao(shoupai, rule) {
            if (! rule['クイタンあり'] && ! shoupai.menqian) return Infinity;
            if (shoupai._fulou.find(m=>m.match(/^z|[19]/))) return Infinity;
            let new_shoupai = shoupai.clone();
            for (let s of ['m','p','s']) {
                new_shoupai._bingpai[s][1] = 0;
                new_shoupai._bingpai[s][9] = 0;
            }
            new_shoupai._bingpai.z = [0,0,0,0,0,0,0,0];
            return Majiang.Util.xiangting(new_shoupai);
        }
        function xiangting_duidui(shoupai) {
            if (shoupai._fulou.map(m=>m.replace(/0/,'5'))
                              .find(m=>! m.match(/^[mpsz](\d)\1\1/)))
                                                            return Infinity;
            let n_kezi = shoupai._fulou.length, n_duizi = 0;
            for (let s of ['m','p','s','z']) {
                let bingpai = shoupai._bingpai[s];
                for (let n = 1; n < bingpai.length; n++) {
                    if      (bingpai[n] >= 3) n_kezi++;
                    else if (bingpai[n] == 2) n_duizi++;
                }
            }
            if (n_kezi + n_duizi > 5) n_duizi = 5 - n_kezi;
            return 8 - n_kezi * 2 - n_duizi;
        }
        function xiangting_yise(shoupai,suit) {
            const regexp = new RegExp(`^[z${suit}]`);
            if (shoupai._fulou.find(m=>! m.match(regexp))) return Infinity;
            let new_shoupai = shoupai.clone();
            for (let s of ['m','p','s']) {
                if (s != suit) new_shoupai._bingpai[s] = [0,0,0,0,0,0,0,0,0,0];
            }
            return Majiang.Util.xiangting(new_shoupai);
        }

        return Math.min(
            xiangting_menqian(shoupai),
            xiangting_fanpai(shoupai,
                    this._model.zhuangfeng, this._menfeng, this._suanpai),
            xiangting_duanyao(shoupai, this._rule),
            xiangting_duidui(shoupai),
            xiangting_yise(shoupai, 'm'),
            xiangting_yise(shoupai, 'p'),
            xiangting_yise(shoupai, 's')
        );
    }

    tingpai(shoupai) {

        const get_peng_mianzi = (shoupai, p) =>
                    Majiang.Game.get_peng_mianzi(this._rule, shoupai, p);
        const get_chi_mianzi  = (shoupai, p) =>
                    Majiang.Game.get_chi_mianzi(this._rule, shoupai, p);

        let n_xiangting = this.xiangting(shoupai);

        let pai = [];
        for (let p of Majiang.Util.tingpai(shoupai, (s)=>this.xiangting(s))) {

            if (n_xiangting > 0) {

                for (let m of get_peng_mianzi(shoupai, p+'+')) {
                    let new_shoupai = shoupai.clone().fulou(m);
                    if (this.xiangting(new_shoupai) < n_xiangting) {
                        pai.push(p+'+');
                        break;
                    }
                }
                if (pai[pai.length - 1] == p+'+') continue;

                for (let m of get_chi_mianzi(shoupai, p+'-')) {
                    let new_shoupai = shoupai.clone().fulou(m);
                    if (this.xiangting(new_shoupai) < n_xiangting) {
                        pai.push(p+'-');
                        break;
                    }
                }
                if (pai[pai.length - 1] == p+'-') continue;
            }
            pai.push(p);
        }
        return pai;
    }

    get_defen(shoupai, rongpai) {

        let paistr = shoupai.toString();
        if (rongpai)
                paistr = paistr.replace(/^(.*?)(,.*|\*?)$/, `$1${rongpai}$2`);
        if (this._defen_cache[paistr] != null) return this._defen_cache[paistr];

        let param = {
            rule:       this._rule,
            zhuangfeng: this._model.zhuangfeng,
            menfeng:    this._menfeng,
            hupai:      { lizhi: shoupai.menqian },
            baopai:     this.shan.baopai,
            jicun:      { changbang: 0, lizhibang: 0 }
        };
        let hule = Majiang.Util.hule(shoupai, rongpai, param);

        this._defen_cache[paistr] = hule.defen;
        return hule.defen;
    }

    eval_shoupai(shoupai, paishu) {

        let paistr = shoupai.toString();
        if (this._eval_cache[paistr] != null) return this._eval_cache[paistr];

        let rv = 0;
        let n_xiangting = Majiang.Util.xiangting(shoupai);

        if (n_xiangting == -1) {
            rv = this.get_defen(shoupai);
        }
        else if (shoupai._zimo) {
            for (let p of this.get_dapai(shoupai)) {
                let new_shoupai = shoupai.clone().dapai(p);
                if (Majiang.Util.xiangting(new_shoupai) > n_xiangting) continue;

                let ev = this.eval_shoupai(new_shoupai, paishu);

                if (ev > rv) rv = ev;
            }
        }
        else if (n_xiangting < 3) {
            for (let p of add_hongpai(Majiang.Util.tingpai(shoupai))) {
                if (paishu[p] == 0) continue;
                let new_shoupai = shoupai.clone().zimo(p);
                paishu[p]--;

                let ev = this.eval_shoupai(new_shoupai, paishu);

                paishu[p]++;
                rv += ev * paishu[p];
            }
        }
        else {
            for (let p of add_hongpai(this.tingpai(shoupai))) {
                if (paishu[p.substr(0,2)] == 0) continue;

                rv += paishu[p.substr(0,2)] * (   p[2] == '+' ? 4
                                                : p[2] == '-' ? 2
                                                :               1  );
            }
        }

        this._eval_cache[paistr] = rv;
        return rv;
    }
}
