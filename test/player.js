const assert = require('assert');

const Player  = require('../lib/player');
const Majiang = require('@kobalab/majiang-core');

let _reply;
function reply(msg = {}) { _reply = msg }

function init_player(param = {}) {

    const player = new Player();

    const kaiju = { id: 0, rule: Majiang.rule(), title: 'タイトル',
                    player: ['私','下家','対面','上家'], qijia: 0 };
    const qipai = { zhuangfeng: 0, jushu: 0, changbang: 0, lizhibang: 0,
                    defen: [ 25000, 25000, 25000, 25000 ], baopai: 'm1',
                    shoupai: ['','','',''] };

    if (param.rule) kaiju.rule = param.rule;

    if (param.menfeng) qipai.jushu = (4 - param.menfeng) % 4;
    let menfeng = (kaiju.id + 4 - kaiju.qijia + 4 - qipai.jushu) % 4;
    qipai.shoupai[menfeng] = param.shoupai ?? 'm123p456s789z1123';
    if (param.baopai) qipai.baopai = param.baopai;

    player.action({kaiju:kaiju});
    player.action({qipai:qipai});

    _reply = null;

    return player;
}

suite('Player', ()=>{

    test('モジュールが存在すること', ()=> assert.ok(Player));

    test('インスタンスが生成できること', ()=> assert.ok(new Player()));

    suite('action_kaiju(kaiju)', ()=>{
        let kaiju = { kaiju: { id: 0, rule: Majiang.rule(), title: 'タイトル',
                               player: ['私','下家','対面','上家'], qijia: 0 } };
        test('卓情報を設定すること', ()=>{
            const player = new Player();
            player.action(kaiju);
            assert.equal(player._model.title, 'タイトル');
        });
        test('応答を返すこと', ()=>{
            const player = new Player();
            _reply = null;
            player.action(kaiju, reply);
            assert.ok(_reply);
        });
    });

    suite('action_qipai(qipai)', ()=>{
        let kaiju = { kaiju: { id: 0, rule: Majiang.rule(), title: 'タイトル',
                               player: ['私','下家','対面','上家'], qijia: 0 } };
        let qipai = { qipai: { zhuangfeng: 0, jushu: 0,
                               changbang: 0, lizhibang: 0,
                               defen: [25000,25000,25000,25000], baopai: 'm1',
                               shoupai: ['m123p456s789z1123','','',''] } };
        test('卓情報を設定すること', ()=>{
            const player = new Player();
            player.action(kaiju);
            player.action(qipai);
            assert.equal(player.shoupai, 'm123p456s789z1123');
        });
        test('牌数をカウントすること', ()=>{
            const player = new Player();
            player.action(kaiju);
            player.action(qipai);
            assert.deepEqual(player._suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [1,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,2,3,3,4,4,4,4] });
        });
        test('応答を返すこと', ()=>{
            const player = new Player();
            player.action(kaiju);
            _reply = null;
            player.action(qipai, reply);
            assert.ok(_reply);
        });
    });

    suite('action_zimo(zimo, gangzimo)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({zimo:{l:0,p:'z1'}});
            assert.equal(player.shoupai, 'm123p456s789z1123z1');
        });
        test('牌数をカウントすること', ()=>{
            const player = init_player();
            player.action({zimo:{l:0,p:'z1'}});
            assert.deepEqual(player._suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [1,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,1,3,3,4,4,4,4] });
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({zimo:{l:0,p:'z1'}}, reply);
            assert.ok(_reply);
        });
        test('他者の手番では空応答を返すこと', ()=>{
            const player = init_player();
            player.action({zimo:{l:1,p:''}}, reply);
            assert.deepEqual(_reply, {});
        });
        test('槓自摸の場合',()=>{
            const player = init_player({shoupai:'m123p456s789z2,z1111'});
            player.action({gangzimo:{l:0,p:'z3'}},reply);
            assert.equal(player.shoupai, 'm123p456s789z2z3,z1111');
            assert.equal(player._n_gang, 1);
            assert.ok(_reply);
        });

        test('和了する', ()=>{
            const player = init_player({shoupai:'m123p456s789z1122'});
            player.action({zimo:{l:0,p:'z2'}}, reply);
            assert.deepEqual(_reply, {hule:'-'});
        });
        test('和了する(槓自摸)', ()=>{
            const player = init_player({shoupai:'m123p456s789z1,z222=2'});
            player.action({gangzimo:{l:0,p:'z1'}}, reply);
            assert.deepEqual(_reply, {hule:'-'});
        });
        test('九種九牌を選択する', ()=>{
            const player = init_player({shoupai:'m19p234s56z123456'});
            player.action({zimo:{l:0,p:'z7'}}, reply);
            assert.deepEqual(_reply, {daopai:'-'});
        });
        test('カンする', ()=>{
            const player = init_player({shoupai:'m123p456s789z1222'});
            player.action({zimo:{l:0,p:'z2'}}, reply);
            assert.deepEqual(_reply, {gang:'z2222'});
        })
        test('打牌する', ()=>{
            const player = init_player({shoupai:'m26789p24s2449z57'});
            player.action({zimo:{l:0,p:'m4'}}, reply);
            assert.deepEqual(_reply, {dapai:'z7'});
        })
    });

    suite('action_dapai(dapai)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({zimo:{l:0,p:'z1'}});
            player.action({dapai:{l:0,p:'z1_'}});
            assert.equal(player.shoupai, 'm123p456s789z1123');
        });
        test('牌数をカウントすること', ()=>{
            const player = init_player();
            player.action({zimo:{l:1,p:'z1'}});
            player.action({dapai:{l:1,p:'z1_'}});
            assert.deepEqual(player._suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [1,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,1,3,3,4,4,4,4] });
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({zimo:{l:1,p:'z2'}});
            player.action({dapai:{l:1,p:'z2_'}}, reply);
            assert.ok(_reply);
        });
        test('自身の手番では空応答を返すこと', ()=>{
            const player = init_player();
            player.action({zimo:{l:0,p:'z1'}});
            player.action({dapai:{l:0,p:'z1_'}}, reply);
            assert.deepEqual(_reply, {});
        });

        test('和了する', ()=>{
            const player = init_player({shoupai:'m123p456s789z1122'});
            player.action({dapai:{l:1,p:'z1'}}, reply);
            assert.deepEqual(_reply, {hule:'-'});
        });
        test('副露する', ()=>{
            const player = init_player({shoupai:'m123p456s578z1122'});
            player.action({dapai:{l:1,p:'z1'}}, reply);
            assert.deepEqual(_reply, {fulou:'z111+'});
        });
        test('テンパイ宣言する(自分の手番)', ()=>{
            const player = init_player({shoupai:'m123p456s789z11223'});
            while (player.shan.paishu) player.shan.zimo();
            player.action({dapai:{l:0,p:'z3'}}, reply);
            assert.deepEqual(_reply, {daopai:'-'});
        })
        test('テンパイ宣言する(他者の手番)', ()=>{
            const player = init_player({shoupai:'m123p456s789z1122'});
            while (player.shan.paishu) player.shan.zimo();
            player.action({dapai:{l:1,p:'z3'}}, reply);
            assert.deepEqual(_reply, {daopai:'-'});
        })
    });

    suite('action_fulou(fulou)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({dapai:{l:1,p:'z1_'}});
            player.action({fulou:{l:0,m:'z111+'}});
            assert.equal(player.shoupai, 'm123p456s789z23,z111+,');
        });
        test('牌数をカウントすること', ()=>{
            const player = init_player();
            player.action({dapai:{l:2,p:'z3_'}});
            player.action({fulou:{l:1,m:'z333+'}});
            assert.deepEqual(player._suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [1,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,2,3,0,4,4,4,4] });
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({dapai:{l:1,p:'z1_'}});
            player.action({fulou:{l:0,m:'z111+'}}, reply);
            assert.ok(_reply);
        });
        test('他者の手番では空応答を返すこと', ()=>{
            const player = init_player();
            player.action({dapai:{l:2,p:'z3_'}});
            player.action({fulou:{l:1,m:'z333+'}}, reply);
            assert.deepEqual(_reply, {});
        });

        test('打牌すること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1123'});
            player.action({dapai:{l:1,p:'z1'}});
            player.action({fulou:{l:0,m:'z111+'}}, reply);
            assert.deepEqual(_reply, {dapai:'z3'});
        });
        test('自身の大明槓の後は打牌せず、空応答を返すこと', ()=>{
            const player = init_player({shoupai:'m123p456s789z1112'});
            player.action({dapai:{l:1,p:'z1'}});
            player.action({fulou:{l:0,m:'z1111+'}}, reply);
            assert.deepEqual(_reply, {});
        });
    });

    suite('action_gang(gang)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1112'});
            player.action({zimo:{l:0,p:'z1'}});
            player.action({gang:{l:0,m:'z1111'}});
            assert.equal(player.shoupai, 'm123p456s789z2,z1111');
        });
        test('牌数をカウントすること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1112'});
            player.action({zimo:{l:1,p:'z3'}});
            player.action({gang:{l:1,m:'z3333'}});
            assert.deepEqual(player._suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [1,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,1,3,0,4,4,4,4] });
        });
        test('応答を返すこと', ()=>{
            const player = init_player({shoupai:'m123p456s789z1112'});
            player.action({zimo:{l:1,p:'z3'}});
            player.action({gang:{l:1,m:'z3333'}}, reply);
            assert.ok(_reply);
        });
        test('自身の手番では空応答を返すこと', ()=>{
            const player = init_player({shoupai:'m123p456s789z1112'});
            player.action({zimo:{l:0,p:'z1'}});
            player.action({gang:{l:0,m:'z1111'}}, reply);
            assert.deepEqual(_reply, {});
        });

        test('和了する', ()=>{
            const player = init_player({shoupai:'m13p456s789z11,z222='});
            player._model.shoupai[1].fulou('m222-');
            player.action({gang:{l:1,m:'m222-2'}}, reply);
            assert.deepEqual(_reply, {hule:'-'});
        });
    });

    suite('kaigang(kaigang)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({kaigang:{baopai:'z1'}});
            assert.deepEqual(player._model.shan.baopai, ['m1','z1']);
        });
        test('牌数をカウントすること', ()=>{
            const player = init_player();
            player.action({kaigang:{baopai:'z1'}});
            assert.deepEqual(player._suanpai._paishu,
                { m: [1,2,3,3,4,4,4,4,4,4],
                  p: [1,4,4,4,3,3,3,4,4,4],
                  s: [1,4,4,4,4,4,4,3,3,3],
                  z: [0,1,3,3,4,4,4,4] });
        });
        test('応答を返さないこと', ()=>{
            const player = init_player();
            player.action({kaigang:{baopai:'z1'}}, reply);
            assert.ok(! _reply);
        });
    });

    suite('action_hule(hule)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({hule:{l:1, shoupai:'m123p456s789z1122z1',
                                 fubaopai:['s1']}});
            assert.equal(player._model.shoupai[1], 'm123p456s789z1122z1')
            assert.equal(player.shan.fubaopai[0], 's1');
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({hule:{l:1, shoupai:'m123p456s789z1122z1',
                                 fubaopai:['s1']}}, reply);
            assert.ok(_reply);
        });
    });

    suite('action_pingju(pingju)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({dapai:{l:1,p:'m1*'}});
            player.action({pingju:{name:'',
                                   shoupai:['','m123p456s789z1122','','']}});
            assert.equal(player._model.shoupai[1], 'm123p456s789z1122')
            assert.equal(player._model.lizhibang, 1);
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({pingju:{name:'',shoupai:['','','','']}}, reply);
            assert.ok(_reply);
        });
    });

    suite('action_jieju(jieju)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({jieju:{}});
            assert.ok(player._paipu);
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({jieju:{}}, reply);
            assert.ok(_reply);
        });
    });

    suite('select_hule(data, hupai)', ()=>{
        test('和了できるときは必ず和了する(ツモ)', ()=>{
            const player = init_player({shoupai:'m123p456s789z11222'});
            assert.ok(player.select_hule());
        });
        test('和了できるときは必ず和了する(嶺上開花)', ()=>{
            const player = init_player({shoupai:'m123p456s789z11,z222=2'});
            assert.ok(player.select_hule(null, true));
        });
        test('和了できるときは必ず和了する(ロン)', ()=>{
            const player = init_player({shoupai:'m123p456s789z1122'});
            assert.ok(player.select_hule({l:1,p:'z1'}));
        });
        test('和了できるときは必ず和了する(槍槓)', ()=>{
            const player = init_player({shoupai:'m13p456s789z11,z222='});
            assert.ok(player.select_hule({l:1,m:'m222=2'}, true));
        });
        test('暗槓は槍槓できない)', ()=>{
            const player = init_player({shoupai:'m13p456s789z11,z222='});
            assert.ok(! player.select_hule({l:1,m:'m2222'}, true));
        });
    });

    suite('select_pingju()', ()=>{
        test('九種九牌は流す', ()=>{
            const player = init_player({shoupai:'m19p234s56z1234567'});
            assert.ok(player.select_pingju());
        });
        test('九種十牌は流さない', ()=>{
            const player = init_player({shoupai:'m19p134s56z1234567'});
            assert.ok(! player.select_pingju());
        });
    });

    suite('select_fulou(dapai)', ()=>{
        test('役ありでシャンテン数が進む場合、副露する', ()=>{
            const player = init_player({shoupai:'m123p456s58z11234'});
            player.dapai({l:2,p:'z1'});
            assert.equal(player.select_fulou({l:2,p:'z1'}), 'z111=');
        });
        test('役のない副露はしない', ()=>{
            const player = init_player({shoupai:'m123p456s78z11223'});
            player.dapai({l:2,p:'z2'});
            assert.ok(! player.select_fulou({l:2,p:'z2'}));
        });
        test('3シャンテンに戻る副露はしない', ()=>{
            const player = init_player({shoupai:'m335p244899s2599'});
            player.dapai({l:2,p:'p9'});
            assert.ok(! player.select_fulou({l:2,p:'p9'}));
        });
        test('シャンテン数が変わらなくても期待値が上がる場合は副露を選択する', ()=>{
            const player = init_player({shoupai:'m56778p4s2478z255',
                                        baopai:'z1'});
            player.dapai({l:2,p:'z5'});
            assert.equal(player.select_fulou({l:2,p:'z5'}), 'z555=');
        });
        test('シャンテン数が進んでも期待値が上がらない場合は副露しない', ()=>{
            const player = init_player({shoupai:'m334455p56888s78'});
            player.dapai({l:3,p:'s6'});
            assert.ok(! player.select_fulou({l:3,p:'s6'}));
        });
        test('役ありでも2シャンテンまでは大明槓しない', ()=>{
            const player = init_player({shoupai:'m123p147s78z11123'});
            player.dapai({l:2,p:'z1'});
            assert.ok(! player.select_fulou({l:2,p:'z1'}));
        });
        test('役のない大明槓はしない', ()=>{
            const player = init_player({shoupai:'m123p456s58z12223'});
            player.dapai({l:2,p:'z2'});
            assert.ok(! player.select_fulou({l:2,p:'z2'}));
        });
        test('リーチ者がいる場合、2シャンテン以前で副露しない', ()=>{
            const player = init_player({shoupai:'m123p456s58z11234'});
            player.dapai({l:2,p:'z1*'});
            assert.ok(! player.select_fulou({l:2,p:'z1'}));
        });
        test('リーチ者がいる場合、テンパイとならない副露はしない', ()=>{
            const player = init_player({shoupai:'m56778p4s24789z55'});
            player.dapai({l:2,p:'z5*'});
            assert.ok(! player.select_fulou({l:2,p:'z5*'}));
        });
    });

    suite('select_gang()', ()=>{
        test('シャンテン数が変わらない場合、暗槓する', ()=>{
            const player = init_player({shoupai:'m234p147s1477z111z1'});
            assert.equal(player.select_gang(), 'z1111');
        });
        test('シャンテン数が変わらない場合、加槓する', ()=>{
            const player = init_player({shoupai:'m234p147s1477z1,z111+'});
            assert.equal(player.select_gang(), 'z111+1');
        });
        test('シャンテン数が戻る暗槓はしない', ()=>{
            const player = init_player({shoupai:'m569p269s12222z136'});
            assert.ok(! player.select_gang());
        });
        test('シャンテン数が戻っても期待値が上がる場合は暗槓する', ()=>{
            const player = init_player({shoupai:'m88p0778888s2m5,s067-',
                                        baopai:'p4'});
            assert.equal(player.select_gang(), 'p8888');
        });
        test('期待値が上がらない場合シャンテン数が戻る暗槓はしない', ()=>{
            let player = init_player({shoupai:'m111123p456s789z12'});
            assert.ok(! player.select_gang());
        });
        test('3シャンテンに戻る暗槓はしない', ()=>{
            const player = init_player({shoupai:'m133p405557999z36'});
            assert.ok(! player.select_gang());
        });
        test('リーチ者がいる場合、テンパイする前は槓しない', ()=>{
            const player = init_player({shoupai:'m123p456s579z2,z111='});
            player.dapai({l:3,p:'m1*'});
            player.zimo({l:0,p:'z1'})
            assert.ok(! player.select_gang());
        });
        test('リーチ者がいても、テンパイ後は槓する', ()=>{
            const player = init_player({shoupai:'m123p456s789z2,z111='});
            player.dapai({l:3,p:'m1*'});
            player.zimo({l:0,p:'z1'})
            assert.equal(player.select_gang(), 'z111=1');
        });
    });

    suite('select_dapai()', ()=>{
        test('待ちの枚数が一番多くなる一番右の牌を選択する', ()=>{
            const player = init_player({shoupai:'m26789p24s2449z57m4',
                                        baopai:'z5'});
            assert.equal(player.select_dapai(), 'z5');
        });
        test('同点の打牌候補がある場合は牌価値の低い方を選択する', ()=>{
            const player = init_player({shoupai:'m188p3346789s113m0',
                                        baopai:'z2'});
            assert.equal(player.select_dapai(), 'm1');
        });
        test('副露を考慮した待ち牌の枚数で打牌を選択する', ()=>{
            const player = init_player({shoupai:'m223057p2479s357p5',
                                        baopai:'z1'});
            assert.equal(player.select_dapai(), 'p9');
        });
        test('打点を考慮した評価値により打牌を選択する', ()=>{
            const player = init_player({shoupai:'m12378p123s13488m6',
                                        baopai:'s9'});
            assert.equal(player.select_dapai(), 's4*');
        });
        test('期待値が高くなる場合はシャンテン戻しを選択する', ()=>{
            const player = init_player({shoupai:'m123p1234789s3388',
                                        baopai:'p0'});
            assert.equal(player.select_dapai(), 's3');
        });
        test('フリテンとなる場合はシャンテン戻しを選択しない', ()=>{
            const player = init_player({shoupai:'m12p19s19z1234567m1',
                                        baopai:'s3'});
            assert.equal(player.select_dapai(), 'm2*');
        });
        test('副露を考慮した期待値で打牌を選択する', ()=>{
            const player = init_player({shoupai:'m66678p34s3077z77m9',
                                        baopai:'m1'});
            assert.equal(player.select_dapai(), 's3');
        });
        test('リーチ者がいて自身が2シャンテン以上の場合はオリる', ()=>{
            const player = init_player({shoupai:'m23p456s578z112234'});
            player.dapai({l:3,p:'p5*'});
            assert.equal(player.select_dapai(), 'p5');
        });
        test('リーチ者がいて自身が1シャンテンの場合は無スジ以外は押す', ()=>{
            const player = init_player({shoupai:'m123p456s578z11224'});
            player.dapai({l:3,p:'p5*'});
            assert.equal(player.select_dapai(), 'z4_');
        });
        test('リーチ者がいて自身が1シャンテンの場合でも無スジは押さない', ()=>{
            const player = init_player({shoupai:'m1123p456s578z1122'});
            player.dapai({l:3,p:'p5*'});
            assert.equal(player.select_dapai(), 'p5');
        });
        test('リーチ者がいても自身もテンパイした場合はリーチする', ()=>{
            const player = init_player({shoupai:'m123p456s5789z1122'});
            player.dapai({l:3,p:'p5*'});
            assert.equal(player.select_dapai(), 's5*');
        });
    });

    suite('select_lizhi(p)', ()=>{
        test('リーチできるときは必ずリーチする', ()=>{
            const player = init_player({shoupai:'m123p456s789z12233'});
            assert.ok(player.select_lizhi('z1'));
        });
    });

    suite('select_daopai()', ()=>{
        test('流局時にテンパイなら必ずテンパイ宣言する', ()=>{
            const player = init_player({shoupai:'m123p456s789z1122'});
            while (player.shan.paishu) player.shan.zimo();
            assert.ok(player.select_daopai());
        })
    });

    suite('xiangting(shoupai)', ()=>{
        test('役なし副露のシャンテン数は無限大', ()=>{
            const player = init_player({shoupai:'s789z44333,m123-,p456-'});
            assert.equal(player.xiangting(player.shoupai), Infinity);
        });
        test('役牌副露のシャンテン数', ()=>{
            const player = init_player({shoupai:'m123p456s789z23,z111='});
            assert.equal(player.xiangting(player.shoupai), 0);
        });
        test('役牌暗刻のシャンテン数', ()=>{
            const player = init_player({shoupai:'p456s789z11123,m123-'});
            assert.equal(player.xiangting(player.shoupai), 0);
        });
        test('役牌バックのシャンテン数', ()=>{
            const player = init_player({shoupai:'p456s789z11333,m123-'});
            assert.equal(player.xiangting(player.shoupai), 0);
        });
        test('喰いタンのシャンテン数', ()=>{
            const player = init_player({shoupai:'m123p456m66777,s6-78'});
            assert.equal(player.xiangting(player.shoupai), 0);
        });
        test('喰いタンなし', ()=>{
            const rule = Majiang.rule({'クイタンあり': false});
            const player = init_player({shoupai:'m123p456m66,s6-78,m777=',
                                        rule:rule});
            assert.equal(player.xiangting(player.shoupai), Infinity);
        });
        test('トイトイのシャンテン数', ()=>{
            const player = init_player({shoupai:'p222789s99z333,m111+'});
            assert.equal(player.xiangting(player.shoupai), 1);
        });
        test('6対子形のシャンテン数', ()=>{
            const player = init_player({shoupai:'p2277s5599z333,m111+,'});
            assert.equal(player.xiangting(player.shoupai), 1);
        });
        test('染め手のシャンテン数', ()=>{
            const player = init_player({shoupai:'m2p89s2355z7,z333=,s7-89,'});
            assert.equal(player.xiangting(player.shoupai), 2);
        });
    });

    suite('tingpai(shoupai)', ()=>{
        test('役なし副露に有効牌なし', ()=>{
            const player = init_player({shoupai:'s789z4433,m123-,p456-'});
            assert.deepEqual(player.tingpai(player.shoupai), []);
        });
        test('役牌バックの有効牌', ()=>{
            const player = init_player({shoupai:'p456s789z1133,m123-'});
            assert.deepEqual(player.tingpai(player.shoupai), ['z1']);
        });
        test('喰いタンの有効牌', ()=>{
            const player = init_player({shoupai:'m23p456m66777,s6-78'});
            assert.deepEqual(player.tingpai(player.shoupai), ['m4']);
        });
        test('トイトイの有効牌', ()=>{
            const player = init_player({shoupai:'p22278s99z333,m111+'});
            assert.deepEqual(player.tingpai(player.shoupai), ['p7','p8','s9+']);
        });
        test('染め手の有効牌', ()=>{
            const player = init_player({shoupai:'p9s2355z7,z333=,s7-89'});
            assert.deepEqual(player.tingpai(player.shoupai),
                                                ['s1-','s4-','s5+','z7']);
        });
    });

    suite('get_defen(shoupai, rongpai)', ()=>{
        test('親・リーチ・ロン', ()=>{
            const player = init_player({shoupai:'m123p456s789z1122*',
                                        baopai:'z2'});
            assert.equal(player.get_defen(player.shoupai, 'z1='), 7700);
            assert.equal(player._defen_cache['m123p456s789z1122z1=*'], 7700);
        });
        test('子・副露・ツモ', ()=>{
            const player = init_player({shoupai:'m123s79z11222s8,p4-56',
                                        menfeng:1});
            assert.equal(player.get_defen(player.shoupai), 2700);
            assert.equal(player._defen_cache['m123s79z11222s8,p4-56'], 2700);
        });
        test('キャッシュを使用(ロン和了)', ()=>{
            const player = init_player();
            player._defen_cache['m1112345678999m1='] = 1000;
            assert.equal(player.get_defen(
                            Majiang.Shoupai.fromString('m1112345678999'),
                            'm1='),
                         1000);
        });
        test('キャッシュを使用(ツモ和了)', ()=>{
            const player = init_player();
            player._defen_cache['m1112345678999m1'] = 1000;
            assert.equal(player.get_defen(
                            Majiang.Shoupai.fromString('m1112345678999m1')),
                         1000);
        });
    });

    suite('eval_shoupai(shoupai, paishu)', ()=>{
        test('和了形の場合は打点を評価値とする', ()=>{
            const player = init_player({shoupai:'m123678p123s1388s2*',
                                        menfeng:1, baopai:'s9'});
            let paishu = player._suanpai.paishu_all();
            assert.equal(player.eval_shoupai(player.shoupai, paishu), 8000);
        });
        test('テンパイ形の場合は、和了打点×枚数 の総和を評価値とする', ()=>{
            const player = init_player({shoupai:'m123678p123s1388*',
                                        menfeng:1, baopai:'s9'});
            let paishu = player._suanpai.paishu_all();
            assert.equal(player.eval_shoupai(player.shoupai, paishu), 32000/12);
        });
        test('打牌可能な牌姿の場合は、打牌後の牌姿の評価値の最大値を評価値とする', ()=>{
            const player = init_player({shoupai:'m123678p123s13488',
                                        menfeng:1, baopai:'s9'});
            let paishu = player._suanpai.paishu_all();
            assert.equal(player.eval_shoupai(player.shoupai, paishu), 32000/12);
        });
        test('残り枚数0の牌は評価時に手牌に加えない', ()=>{
            const player = init_player({shoupai:'m34p123456s789z13z3',
                                        menfeng:1, baopai:'m0'});
            let paishu = player._suanpai.paishu_all();
            assert.equal(player.eval_shoupai(player.shoupai, paishu), 18900/12);
        });
        test('3シャンテン以上の場合は鳴きを考慮した待ち牌数を評価値とする', ()=>{
            const player = init_player({shoupai:'m569p4s5778z11335',
                                        menfeng:1, baopai:'s9'});
            let paishu = player._suanpai.paishu_all();
            assert.equal(player.eval_shoupai(player.shoupai, paishu), 61);
        });
    });
});
