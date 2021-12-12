const assert = require('assert');

const Player  = require('../lib/player');
const Majiang = require('@kobalab/majiang-core');

let _reply;
function reply(msg = {}) { _reply = msg }

function init_player(param = {}) {

    const player = new Player();

    const msg = [
        { kaiju: { id: 0, rule: Majiang.rule(), title: 'タイトル',
                   player: ['私','下家','対面','上家'], qijia: 0 } },
        { qipai: { zhuangfeng: 0, jushu: 0, changbang: 0, lizhibang: 0,
                   defen: [ 25000, 25000, 25000, 25000 ], baopai: 'm1',
                   shoupai: ['','','',''] } },
    ];

    let kaiju = msg.find(d=> d.kaiju).kaiju;
    let qipai = msg.find(d=> d.qipai).qipai;

    let menfeng = (kaiju.id + 4 - kaiju.qijia + 4 - qipai.jushu) % 4;
    qipai.shoupai[menfeng] = param.shoupai || 'm123p456s789z1123';
    if (param.baopai) qipai.baopai = param.baopai;

    for (let d of msg) {
        player.action(d);
    }
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
            player.action({zimo:{l:1,p:'z1'}});
            player.action({dapai:{l:1,p:'z1_'}}, reply);
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
        test('副露する');
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

        test('打牌する', ()=>{
            const player = init_player({shoupai:'m123p456s789z1123'});
            player.action({dapai:{l:1,p:'z1'}});
            player.action({fulou:{l:0,m:'z111+'}}, reply);
            assert.deepEqual(_reply, {dapai:'z3'});
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
        test('副露しない', ()=>{
            const player = init_player({shoupai:'m11233z55566677'});
            assert.ok(! player.select_fulou({l:1,p:'z7'}));
        });
    });

    suite('select_gang()', ()=>{
        test('シャンテン数が変わらなければカンする', ()=>{
            const player = init_player({shoupai:'m123p456s789z12222'});
            assert.equal(player.select_gang(), 'z2222');
        });
        test('シャンテン戻しとなるカンはしない', ()=>{
            const player = init_player({shoupai:'m122223p456s789z12'});
            assert.ok(! player.select_gang());
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
        test('リーチ者がいる場合はテンパイでもオリる', ()=>{
            const player = init_player({shoupai:'m123p456s578z11222'});
            player.dapai({l:3,p:'p5*'});
            assert.equal(player.select_dapai(), 'p5');
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
});
