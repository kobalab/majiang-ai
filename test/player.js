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

    for (let d of msg) {
        player.action(d);
    }
    _reply = null;

    return player;
}

suite('Player', ()=>{

    test('モジュールが存在すること', ()=> assert.ok(Player));

    test('インスタンスが生成できること', ()=> assert.ok(new Player()));

    suite('kaiju(kaiju)', ()=>{
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
    suite('qipai(qipai)', ()=>{
        let kaiju = { kaiju: { id: 0, rule: Majiang.rule(), title: 'タイトル',
                               player: ['私','下家','対面','上家'], qijia: 0 } };
        let qipai = { qipai: { zhuangfeng: 0, jushu: 0,
                               changbang: 0, lizhibang: 0,
                               defen: [25000,25000,25000,25000], baopai: '',
                               shoupai: ['m123p456s789z1123','','',''] } };
        test('卓情報を設定すること', ()=>{
            const player = new Player();
            player.action(kaiju);
            player.action(qipai);
            assert.equal(player.shoupai, 'm123p456s789z1123');
        });
        test('応答を返すこと', ()=>{
            const player = new Player();
            player.action(kaiju);
            _reply = null;
            player.action(qipai, reply);
            assert.ok(_reply);
        });
    });
    suite('zimo(zimo, gangzimo)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({zimo:{l:0,p:'z1'}});
            assert.equal(player.shoupai, 'm123p456s789z1123z1');
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
    });
    suite('dapai(dapai)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({zimo:{l:0,p:'z1'}});
            player.action({dapai:{l:0,p:'z1_'}});
            assert.equal(player.shoupai, 'm123p456s789z1123');
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
    });
    suite('fulou(fulou)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({dapai:{l:1,p:'z1_'}});
            player.action({fulou:{l:0,m:'z111+'}});
            assert.equal(player.shoupai, 'm123p456s789z23,z111+,');
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({dapai:{l:1,p:'z1_'}});
            player.action({fulou:{l:0,m:'z111+'}}, reply);
            assert.ok(_reply);
        });
        test('他者の手番では空応答を返すこと', ()=>{
            const player = init_player();
            player.action({dapai:{l:2,p:'z1_'}});
            player.action({fulou:{l:1,m:'z111+'}}, reply);
            assert.deepEqual(_reply, {});
        });
    });
    suite('gang(gang)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player({shoupai:'m123p456s789z1112'});
            player.action({zimo:{l:0,p:'z1'}});
            player.action({gang:{l:0,m:'z1111'}});
            assert.equal(player.shoupai, 'm123p456s789z2,z1111');
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
    });
    suite('kaigang(kaigang)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({kaigang:{baopai:'s1'}});
            assert.equal(player.shan.baopai.pop(), 's1');
        });
        test('応答を返さないこと', ()=>{
            const player = init_player();
            player.action({kaigang:{baopai:'s1'}});
            assert.ok(! _reply);
        });
    });
    suite('hule(hule)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({hule:{fubaopai:['s1']}});
            assert.equal(player.shan.fubaopai[0], 's1');
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({hule:{fubaopai:['s1']}}, reply);
            assert.ok(_reply);
        });
    });
    suite('pingju(pingju)', ()=>{
        test('卓情報を設定すること', ()=>{
            const player = init_player();
            player.action({dapai:{l:1,p:'m1*'}});
            player.action({pingju:{name:''}});
            assert.equal(player._model.lizhibang, 1);
        });
        test('応答を返すこと', ()=>{
            const player = init_player();
            player.action({pingju:{name:''}}, reply);
            assert.ok(_reply);
        });
    });
    suite('jieju(jieju)', ()=>{
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
});
