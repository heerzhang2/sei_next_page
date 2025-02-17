/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {crtOmni, omniCalculateDefault, pushOmni} from "../../common/omni";
import {JumpMeasure, JumpOrgTag} from "../../common/general";

/**新的第四种项目列表配置模式： 新的检验项目大列表的配置做法。【特别注意】#span几个参数，最好不要跨越编辑区域去做配置，强制缩小影响波及范围可方便调试和修改。
 * @param noDefault 是否进行这个自动配置补缺的步骤；
 *【特殊部分】orc?._Oitems: 动态，用户自己增加的；
 * */
export const setupItemAreaRoute= ({rep, orc, theme, noDefault} :{rep:any,orc?:any, theme:any,noDefault?:boolean}
) => {
    let ari: any[] =[];
    pushOmni(ari,'1.1.4',[
        crtOmni('使用登记',{big:'A1.1.4 使用资料',bspan:1,seco:'A1.1.4',span:1,},{bspan:3,span:3,},
            <Text>(1)使用登记证，其内容与实物相符；
            </Text>, {nos:'1.1.4(1)',},true,),
        crtOmni('保养合同',{},undefined,
            <Text>(2)日常维护保养合同，由使用单位与取得相应许可的单位签订；
            </Text>, {nos:'1.1.4(2)',},true,),
        crtOmni('管理制',{},undefined,
            <Text>(3)应急救援管理制度和专用钥匙管理制度。
            </Text>, {nos:'1.1.4(3)',mergNos:'1.1.4',mergName:'使用资料'},false,'使用资料'),
        crtOmni('道通',{big:'A1.2.1机器空间',bspan:1,seco:'A1.2.1.1',},{bspan:2,span:2,},
            <Text>(1)通往机器空间的通道保持通畅，相关人员能够安全、方便、无阻碍地使用；如果通往机器空间的通道高出楼梯所到平面不超过 4.0m，可以采用固定的梯子作为通道；
            </Text>, {nos:'1.2.1.1(1)',},true,),
        crtOmni('通道照明',{},undefined,
            <Text>(2)进入机器空间的门附近的通道设有永久性电气照明。
            </Text>, {nos:'1.2.1.1(2)',mergNos:'1.2.1.1',mergName:'与通道门'},false,'通道及照明'),
    ],'1.1.4使用资料-1.2.1.1通道及照明');
    pushOmni(ari,'1.2.2',[
        crtOmni('照明',{big:'A1.2.2 井道',bspan:2,seco:'A1.2.2.1',span:1,},{bspan:8,span:2,},
            <Text>(1)井道内设有永久性电气照明；当部分封闭的井道附近有足够的电气照明时，井道内可以不设照明；
            </Text>, {nos:'1.2.2.1(1)',},true,),
        crtOmni('斜行梯',{},undefined,
            <Text>(2)斜行电梯的井道内设置永久性人行通道的，沿着人行通道设有应急照明。
            </Text>, {nos:'1.2.2.1(2)',mergNos:'1.2.2.1',mergName:'井道照明'},false,'井道照明'),
        crtOmni('缓固定',{seco:'*A1.2.2.17',},{span:6,},
            <Text>(1)缓冲器无松动、明显倾斜、断裂、塑性变形、剥落、破损、严重锈蚀等现象；
            </Text>, {nos:'1.2.2.17(1)',pre:'*'},true,),
        crtOmni('缓液位',{},undefined,
            <Text>(2)耗能型缓冲器液位应正确，验证柱塞复位的电气安全装置功能有效；
            </Text>, {nos:'1.2.2.17(2)',pre:'*'},true,),
        crtOmni('越程距标',{},undefined,
            <Text>(3)对重缓冲器附近设有清晰的对重越程距离标识；
            </Text>, {nos:'1.2.2.17(3)',pre:'*'},true,),
        crtOmni('撞板缓距',{},undefined,
            <Text>(4)当轿厢位于顶层端站平层位置时，对重装置撞板与其缓冲器顶面间的距离不超过对重越程距离标识上标注的最大允许值；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'1.2.2.17(4)',pre:'*'},true,),
        crtOmni('无火花',{},undefined,
            <Text>(5)防爆电梯的缓冲器与轿厢、对重（平衡重）的撞击面采取的无火花措施保持完好。
            </Text>, {nos:'1.2.2.17(5)',pre:'*'},true,),
        crtOmni(undefined,{},undefined,
            <Text>注：本条第（3）和第（4）项不适用于设置前置轿门的斜行电梯。
            </Text>, {mergNos:'1.2.2.17',pre:'*',mergName:'缓冲器'},false,'缓冲器'),
    ],'1.2.2.1井道照明-1.2.2.17缓冲器');
    pushOmni(ari,'1.2.3',[
        crtOmni('接地故',{big:'A1.2.3电气设备（装置）及控制',bspan:5,seco:'A1.2.3.3(3)',},{bspan:9,},
            <Text>(3)含有电气安全装置的电路发生接地故障时,驱动主机 立即停止运转，或者在第一次正常停止运转后，能够 防止驱动主机再启动;恢复电梯运行只能通过手动复 位。
                <JumpOrgTag tag={'_See_Memo4'}>见注（4）</JumpOrgTag>
            </Text>, {nos:'1.2.3.3(3)'},false,'接地故障保护措施'),
        crtOmni('旁路字样',{seco:'A1.2.3.4',},{span:4,},
            <Text>(1)层门和轿门旁路装置上或者附近标明“旁路”字样；
                <JumpOrgTag tag={'_See_Memo2'}>见注（2）</JumpOrgTag>
            </Text>, {nos:'1.2.3.4(1)',},true,),
        crtOmni('旁路关闭',{},undefined,
            <Text>(2)处于旁路状态时，能够旁路层门关闭触点、层门门 锁触点、轿门关闭触点、轿门门锁触点，但不能同时 旁路层门和轿门的触点;对于手动层门，不能同时旁路 层门关闭触点和层门门锁触点；
            </Text>, {nos:'1.2.3.4(2)',},true,),
        crtOmni('取消运行',{},undefined,
            <Text>(3)处于旁路状态时，取消正常运行（包括自动门的任何运行），并且只有在检修运行控制或者紧急电动运行控制下电梯才能运行，轿厢上的听觉信号和轿底的 闪烁灯在运行期间起作用；
            </Text>, {nos:'1.2.3.4(3)',},true,),
        crtOmni('监控门关',{},undefined,
            <Text>(4)提供独立的监控信号证实轿门处于关闭位置。
            </Text>, {nos:'1.2.3.4(4)',mergNos:'1.2.3.4',mergName:'门旁路'},false,'门旁路装置'),
        crtOmni('制动监测',{seco:'*A1.2.3.6'},undefined,
            <Text>(1)检查其是否能够监测制动器的每组制动力或者每次 动作时每组机械部件的正确动作（松开或者制动），当监测到失效时，是否能够防止电梯的正常运行。
                <JumpOrgTag tag={'_See_Memo2'}>见注（2）</JumpOrgTag>
            </Text>, {nos:'1.2.3.6',pre:'*',},false,'制动器状态监测功能'),
        crtOmni('急控制',{seco:'A1.2.3.9',span:1,},{span:2,},
            <Text>(1)紧急电动运行控制功能有效；
            </Text>, {nos:'1.2.3.9(1)',},true,),
        crtOmni('按钮方向',{},undefined,
            <Text>(2)操作紧急电动运行开关后，依靠持续按压按钮来控制轿厢运行，按钮上或者其附近清晰地标明运行方向；进行紧急电动运行操作时，易于观察轿厢是否在开锁区域。
            </Text>, {nos:'1.2.3.9(2)',mergNos:'1.2.3.9',mergName:'紧急控制'},false,'紧急电动运行控制'),
        crtOmni('动态测试',{seco:'*A1.2.3.10（1）'},undefined,
            <Text>(1)紧急操作和动态测试功能有效；
            </Text>, {nos:'1.2.3.10(1)',pre:'*'},false,'紧急操作和动态测试功能'),
    ],'1.2.3.3接地故障保护-1.2.3.10急操作和动态测试');
    pushOmni(ari,'1.2.3.11',[
        crtOmni('双向对讲',{bspan:2,seco:'*A1.2.3.11',span:1},{bspan:8,span:2},
            <Text>(1)轿厢内的紧急报警装置采用由应急电源供电的双向 对讲系统与救援服务持续联系;如果电梯行程大于30m
                或者轿厢内与进行紧急操作处之间无法直接对话，则 在轿厢内和进行紧急操作处还设置由应急电源供电的 双向对讲系统或者类似装置；
            </Text>, {nos:'1.2.3.11(1)',pre:'*'},true,),
        crtOmni('消防通信',{},undefined,
            <Text>(2)对于消防员电梯，还设有在优先召回和消防服务阶段用于轿厢和消防员入口层之间、轿厢和机房或者紧
                急和测试操作屏之间的双向对讲系统或者类似装置， 并且无需按压控制按钮即可实现轿厢和消防员入口层之间的通信。
            </Text>, {nos:'1.2.3.11(2)',pre:'*',mergNos:'1.2.3.11',mergName:'紧急报警'},false,'紧急报警装置(对讲系统)'),
        crtOmni('防爆证',{seco:'A1.2.3.12',span:1},{span:6,},
            <Text>(1)部件铭牌上标明型号、制造日期、防爆标志、防爆 合格证号、制造单位名称和相关技术参数，其防爆合 格证在有效期内；
            </Text>, {nos:'1.2.3.12(1)',},true,),
        crtOmni('壳光滑',{},undefined,
            <Text>(2)外壳光滑、无损伤，透明件无裂纹，接合面紧固严 密，相对运动的间隙防尘密封严密,紧固件无锈蚀、缺 损，密封垫圈完好；
            </Text>, {nos:'1.2.3.12(2)',},true,),
        crtOmni('警告标',{},undefined,
            <Text>(3)本质安全型电气部件（控制柜、操纵箱、召唤箱、 轿顶检修箱、接线箱盒、旋转编码器等）的本质安全 标志、无电气联锁隔爆型电气部件的“断电后开盖”警 告标志清晰；
            </Text>, {nos:'1.2.3.12(3)',},true,),
        crtOmni('隔爆面',{},undefined,
            <Text>(4)隔爆型电气部件的隔爆面无锈蚀层、机械伤痕和刷 漆现象；
            </Text>, {nos:'1.2.3.12(4)',},true,),
        crtOmni('浇封面',{},undefined,
            <Text>(5)浇封型电气部件的浇封表面无裂缝、剥落、被浇封 部分外露现象；
            </Text>, {nos:'1.2.3.12(5)',},true,),
        crtOmni('油浸型',{},undefined,
            <Text>(6)油浸型电气部件密封良好，无渗漏油，油位高度在 规定范围内;外壳、电气和机械连接所用的螺栓、螺母 以及注油、排油的螺栓塞等具有防松措施。
            </Text>, {nos:'1.2.3.12(6)',mergNos:'1.2.3.12',mergName:'防爆电'},false,'防爆电气部件'),
    ],'1.2.3.11紧急报警装置-1.2.3.12防爆电气部件');
    pushOmni(ari,'1.2.3.16',[
        crtOmni(undefined,{bspan:4,seco:'*A1.2.3.16',span:1},{bspan:13,span:5},
            <Text>检查当消防员电梯进入优先召回阶段后，应符合以下要求：
            </Text>, {},true,),
        crtOmni('呼梯取消',{},undefined,
            <Text>(1)层站控制和轿厢内控制以及受热、烟影响的门再开启保护装置均无效，已登记的呼梯均被取消，但开门 和紧急报警按钮以及开门超时报警装置均保持有效；
            </Text>, {nos:'1.2.3.16(1)',pre:'*'},true,),
        crtOmni('信号响',{},undefined,
            <Text>(2)轿厢内的听觉信号鸣响，直至门关闭；
            </Text>, {nos:'1.2.3.16(2)',pre:'*'},true,),
        crtOmni('脱群组',{},undefined,
            <Text>(3)电梯脱离群组独立运行；
            </Text>, {nos:'1.2.3.16(3)',pre:'*'},true,),
        crtOmni('消防层',{},undefined,
            <Text>(4)正在离开消防员入口层的消防员电梯，在可以正常 停站的最近楼层作一次停站，不开门，然后返回到消 防员入口层；正在驶向消防员入口层的消防员电梯，
                向消防员入口层不停站继续运行，如果已经开始停站，消防员电梯可在正常停站后不开门继续向消防员 入口层运行；到达后，停靠在该层,设置有消防员电梯 开关一侧的轿门和层门保持在完全打开位置。
            </Text>, {nos:'1.2.3.16(4)',pre:'*',mergNos:'1.2.3.16',mergName:'优召回'},false,'优先召回'),
        crtOmni(undefined,{seco:'*A1.2.3.17',span:1},{span:5},
            <Text>检查在消防员控制下使用消防员电梯时，应符合以下 要求：
            </Text>, {},true,),
        crtOmni('关门按钮',{},undefined,
            <Text>(1)持续按压轿厢内选层按钮或者关门按钮，使门关 闭，在门完全关闭前，如果释放按钮，门能够自动再 打开；如果轿厢停靠在层站，仅能通过持续按压轿厢 内开门按钮控制门打开，
                如果在距离门完全打开不超 过50mm 之前释放轿厢内开门按钮，门自动再关闭；
            </Text>, {nos:'1.2.3.17(1)',pre:'*'},true,),
        crtOmni('选层指令',{},undefined,
            <Text>(2)轿厢内选层指令每次只能登记一个，已登记的轿厢 内指令显示在轿厢内控制装置上;登记一个新的轿厢内 选层指令时，原来的指令被取消,并且在最短的时间内 运行到新登记的层站；
            </Text>, {nos:'1.2.3.17(2)',pre:'*'},true,),
        crtOmni('显示厢位',{},undefined,
            <Text>(3)供电电源有效时，在轿厢内和消防员入口层均显示出轿厢的位置；
            </Text>, {nos:'1.2.3.17(3)',pre:'*'},true,),
        crtOmni('热烟无效',{},undefined,
            <Text>(4)受热、烟影响的门再开启保护装置无效，但是轿门 重开门功能和开门按钮保持有效状态。
            </Text>, {nos:'1.2.3.17(4)',pre:'*',mergNos:'1.2.3.17',mergName:'消防服务'},false,'消防服务'),
        crtOmni('恢复正常',{seco:'*A1.2.3.18'},undefined,
            <Text>(1)检查是否只有当消防员电梯开关被转换到位置“0”， 并且电梯已回到消防员入口层时，消防员电梯才能恢 复到正常服务状态。
            </Text>, {nos:'1.2.3.18',pre:'*'},false,'恢复正常服务'),
        crtOmni('返消防层',{seco:'*A1.2.3.19',span:1},{span:2,},
            <Text>(1)检查是否只有当操作消防员电梯开关从位置“1”到“0”，保持至少5s，再回到“1”时，消防员电梯才能重新处于优先召回阶段，并且返回到消防员入口层。
            </Text>, {nos:'1.2.3.19',pre:'*'},true,),
        crtOmni(undefined,{},undefined,
            <Text>注：本条不适用于设置轿厢内消防员钥匙开关的消防 员电梯。
            </Text>, {pre:'*',mergNos:'1.2.3.19',mergName:'再优召回'},false,'再次优先召回'),
    ],'1.2.3.16优先召回-1.2.3.19再次召回');
    pushOmni(ari,'1.2.4.1',[
        crtOmni('主机开关',{big:'A1.2.4驱动主机',bspan:4,seco:'A1.2.4.1',},{bspan:10,},
            <Text>(1)在驱动主机附近1m 之内设有可以直接接近的主开关或者停止装置，并且功能有效。
            </Text>, {nos:'1.2.4.1',},false,'驱动主机停止装置'),
        crtOmni('独制动组',{seco:'*A1.2.4.3',},{span:3},
            <Text>(1)能够从井道外独立地测试每个制动组；
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos:'1.2.4.3(1)',pre:'*'},true,),
        crtOmni('制动器情',{},undefined,
            <Text>(2)制动器动作灵活，制动时制动闸瓦（制动钳）紧密、均匀地贴合在制动轮（制动盘）上，电梯运行时
                制动闸瓦（制动钳）与制动轮（制动盘）不发生摩 擦，制动闸瓦（制动钳）以及制动轮（制动盘）工作 面上无油污；
            </Text>, {nos:'1.2.4.3(2)',pre:'*'},true,),
        crtOmni('鼓式制动',{},undefined,
            <Text>(3)对于需要定期拆解保养的柱塞式电磁铁型式的杠杆鼓式制动器，维护保养单位按照受检电梯制造（改造）单位（该单位已经注销时，按照相应驱动主机的
                制造单位或者型式试验机构）的要求进行了拆解保 养，并且提供了拆解保养过程的视频或者照片等见证资料。
            </Text>, {nos:'1.2.4.3(3)',pre:'*',mergNos:'1.2.4.3',mergName:'制动器'},false,'制动器'),
        crtOmni('手制动',{seco:'*A1.2.4.7',},{span:5},
            <Text>(1)对于曳引与强制驱动电梯，能够通过持续手动操作 的机械装置或者由自动充电的紧急电源供电的电气装置打开驱动主机制动器，并且该装置的失效不会导致 制动功能的失效；
            </Text>, {nos:'1.2.4.7(1)',pre:'*'},true,),
        crtOmni('移到层站',{},undefined,
            <Text>(2)手动松开制动器后仅在重力作用下轿厢（运载装置）不能移动时，能够通过手动机械装置、独立于主电源供电的手动操作电动装置或者其他措施将轿厢 （运载装置）移动到附近层站；
            </Text>, {nos:'1.2.4.7(2)',pre:'*'},true,),
        crtOmni('带动手装',{},undefined,
            <Text>(3)如果电梯的移动可能带动手动机械装置，该装置是 平滑和无辐条的轮子；
            </Text>, {nos:'1.2.4.7(3)',pre:'*'},true,),
        crtOmni('作用电安',{},undefined,
            <Text>(4)如果手动机械装置可以从驱动主机上拆卸或者脱出，设有最迟在其连接到驱动主机时起作用的电气安全装置；
                <JumpOrgTag tag={'_See_Memo1'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'1.2.4.7(4)',pre:'*'},true,),
        crtOmni('易查锁',{},undefined,
            <Text>(7)在紧急操作处，易于检查轿厢是否在开锁区域。
            </Text>, {nos:'1.2.4.7(7)',pre:'*',mergNos:'1.2.4.7',mergName:'手动急操'},false,'手动紧急操作装置'),
        crtOmni('表面温',{seco:'A1.2.4.8'},undefined,
            <Text>(1)检查防爆电梯的电动机、减速器、液压泵站、制动 部件的外壳以及防爆电气部件外壳的最高表面温度不 超过整机防爆标志中的温度组别要求。
            </Text>, {nos:'1.2.4.8',},false,'表面温度'),
    ],'1.2.4.1驱动主机停止装置-1.2.4.8表面温度');
    pushOmni(ari,'1.2.5.1',[
        crtOmni(undefined,{big:'A1.2.5悬挂装置、补偿装置及旋转部件',bspan:2,seco:'A1.2.5.1',span:1},{bspan:6,span:3},
            <Text>检查悬挂钢丝绳、补偿钢丝绳是否符合以下要求:
                <JumpOrgTag tag={'_See_Memo4'}>见注（4）</JumpOrgTag>
            </Text>, {},true,),
        crtOmni('笼状畸',{},undefined,
            <Text>(1)无笼状畸变、绳股挤出、扭结、部分压扁、弯折、 严重锈蚀、铁锈填满绳股间隙、直径小于其公称直径 的90%等达到报废条件的现象;
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'1.2.5.1(1)',},true,),
        crtOmni('磨损断', {}, undefined,
            <div><Text>(2)一个捻距内的断丝数不超过下表所列数值。</Text>
                <Table tight  miniw={800}>
                  <TableBody>
                    <TableRow>
                        <CCell rowSpan={2}>断丝的形式</CCell><CCell colSpan={3}>钢丝绳的类型</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>6×19</CCell><CCell>8×19</CCell><CCell>9×19</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>均布在外层绳股上</CCell><CCell>24</CCell><CCell>30</CCell><CCell>34</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>集中在一或者两根外层绳股上</CCell><CCell>8</CCell><CCell>10</CCell><CCell>11</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>一根外绳股上相邻的断丝</CCell><CCell>4</CCell><CCell>4</CCell><CCell>4</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>绳谷（缝）断丝</CCell><CCell>1</CCell><CCell>1</CCell><CCell>1</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell colSpan={4}>注：上述断丝数参考长度为一个捻距，约为6d（d表示钢丝绳的公称直径，mm）</CCell>
                    </TableRow>
                </TableBody></Table>
            </div>, {nos: '1.2.5.1(2)',mergNos: '1.2.5.1', mergName: '钢丝绳'}, false, '钢丝绳'),
        crtOmni('覆层变形',{seco:'A1.2.5.2',},{span:3},
            <Text>(1)无包覆层变形（如鼓包、压痕、折痕、凹陷等）、 包覆带承载体外露或者刺出、承载体断裂等达到报废 条件的现象；
                <JumpOrgTag tag={'_See_Memo4'}>见注（4）</JumpOrgTag>
            </Text>, {nos:'1.2.5.2(1)',},true,),
        crtOmni('监测破断',{},undefined,
            <Text>(2)设有监测每根包覆带承载体强度的装置，当检测到 任一根承载体破断时，能够防止电梯的下一次正常启动；
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos:'1.2.5.2(2)',},true,),
        crtOmni('覆带用时',{},undefined,
            <Text>(3)用于查看包覆带使用时间或者电梯启动次数的装置完好。
            </Text>, {nos:'1.2.5.2(3)',mergNos:'1.2.5.2',mergName:'包覆带'},false,'包覆带'),
    ], '1.2.5.1钢丝绳-1.2.5.2包覆带');
    pushOmni(ari,'1.2.5.3',[
        crtOmni('端部裂纹',{bspan:3,seco:'A1.2.5.3',},{bspan:9,span:2},
            <Text>(1)悬挂装置的端部固定部件无裂纹、松动等现象，端接装置的弹簧、螺母、开口销等连接部件无缺损；
                <JumpOrgTag tag={'_See_Memo4'}>见注（4）</JumpOrgTag>
            </Text>, {nos:'1.2.5.3(1)',},true,),
        crtOmni('绳夹',{},undefined,
            <Text>(2)对于强制驱动电梯，采用带楔块的压紧装置或者至 少用两个绳夹将悬挂装置固定在卷筒上。
            </Text>, {nos:'1.2.5.3(2)',mergNos:'1.2.5.3',mergName:'悬挂端部'},false,'悬挂装置端部固定'),
        crtOmni('松绳保',{seco:'A1.2.5.6', },undefined,
            <Text>(1)如果轿厢（运载装置）悬挂在包覆带或者两根钢丝绳上，检查当任意一根悬挂装置发生异常相对伸长 时，是否能够通过电气安全装置防止电梯的正常运行。
            </Text>, {nos:'1.2.5.6', },false,'异常伸长保护措施'),
        crtOmni(undefined, {seco:'*A1.2.5.7',span:1},{span:6},
            <Text>检查是否符合以下要求
            </Text>, {},true,),
        crtOmni('额速不大',{},undefined,
            <Text>(1)电梯的额定速度不大于1.75m/s；
            </Text>, {nos:'1.2.5.7(1)',pre:'*'},true,),
        crtOmni('标识反轮',{},undefined,
            <Text>(2)反绳轮上或者附近设有永久固定和清晰的标识，标明反绳轮制造单位名称或者商标、制造日期、维护保养要求（如润滑方法与周期）及报废条件；
            </Text>, {nos:'1.2.5.7(2)',pre:'*'},true,),
        crtOmni('反轮保养',{},undefined,
            <Text>(3)维护保养单位按照要求进行了维护保养，并且提供 了维护保养过程的视频或者照片等见证资料；
            </Text>, {nos:'1.2.5.7(3)',pre:'*'},true,),
        crtOmni('轮轴偏转',{},undefined,
            <Text>(4)在进行本记录A1.3条所述的各项试验前、后，均未出现悬挂装置脱离绳槽（带槽）、轮及轮轴偏转、固定结构变形等现象。
            </Text>, {nos:'1.2.5.7(4)',pre:'*'},true,),
        crtOmni(undefined,{},undefined,
            <Text>注：对于未按照前款第（1）和第（2）项对非金属材 质反绳轮进行过监督检验的电梯，应当至少符合前款 第（3）和第（4）项的要求。
            </Text>, {pre:'*',mergNos:'1.2.5.7',mergName:'非金反轮'},false,'非金属材质反绳轮'),
    ], '1.2.5.3悬挂端部固定-1.2.5.7非金属反绳轮');
    pushOmni(ari,'1.2.6',[
        crtOmni('安窗电安',{big:'A1.2.6轿厢(运载装置)与对重(平衡重)',bspan:5,seco:'A1.2.6.3（3）',},{bspan:10,},
            <Text>(3)如果轿顶设置安全窗（消防员电梯应设置），安全窗的锁紧由电气安全装置验证，该装置动作后能够使电梯停止运行。
            </Text>, {nos:'1.2.6.3(3)',},false,'轿厢安全窗电气安全装置'),
        crtOmni('安门电安',{seco:'A1.2.6.4（3）',},undefined,
            <Text>(3)如果设有轿厢安全门，安全门的锁紧由电气安全装置验证。
            </Text>, {nos:'1.2.6.4(3)',},false,'轿厢安全门电气安全装置'),
        crtOmni('块固定',{seco:'A1.2.6.6',},{span:5,},
            <Text>(1)对重（平衡重）块无松动、移位等现象；
            </Text>, {nos:'1.2.6.6(1)',},true,),
        crtOmni('识别数',{},undefined,
            <Text>(2)具有能够快速识别对重（平衡重）块数量的措施 （例如标明数量或者总高度），并且该措施不会被混淆；
            </Text>, {nos:'1.2.6.6(2)',},true,),
        crtOmni('对重标识',{},undefined,
            <Text>(3)非金属材质对重（平衡重）块（架）上、轿顶上或 底坑内有清晰的标识，标明对重（平衡重）块制造单位名称或者商标和报废条件；
            </Text>, {nos:'1.2.6.6(3)',},true,),
        crtOmni('块开裂',{},undefined,
            <Text>(4)在进行本记录A1.3条所述的各项试验前、后，对重 （平衡重）块及其包覆物均无影响产品性能的开裂、破碎、剥落、腐蚀等现象。
            </Text>, {nos:'1.2.6.6(4)',},true,),
        crtOmni(undefined,{},undefined,
            <Text>对于未按照前款第（3）项对非金属材质对重（平衡 重）块进行过监督检验的电梯，应当至少符合前款第 （1）、第（2）、第（4）项的要求。
            </Text>, {mergNos:'1.2.6.6',mergName:'对重块'},false,'对重(平衡重)块'),
        crtOmni('轿厢照',{seco:'A1.2.6.8',},{span:2,},
            <Text>(1)轿厢正常照明和通风有效；
            </Text>, {nos:'1.2.6.8(1)',},true,),
        crtOmni('应急照明',{},undefined,
            <Text>(2)在正常照明电源发生故障的情况下，由紧急电源供电的应急照明能够自动投入工作。
            </Text>, {nos:'1.2.6.8(2)',mergNos:'1.2.6.8',mergName:'照明通风'},false,'轿厢照明及通风'),
        crtOmni('语音播报',{seco:'A1.2.6.9',},undefined,
            <Text>(1)检查在停电、故障停梯、轿厢位置校正（再平层除 外）、自动救援操作装置启动以及接收火灾信号退出 正常服务时，轿厢语音播报系统是否进行语音播报， 提示、安抚轿厢内乘客。
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos:'1.2.6.9',},false,'轿厢语音播报系统'),
    ], '1.2.6轿厢(运载装置)与对重(平衡重)');
    pushOmni(ari, '1.2.7.2', [
        crtOmni(undefined, {big: 'A1.2.7层门和轿门', bspan: 3, seco: '*A1.2.7.2', span:1}, {bspan: 7, span: 3},
            <Text>测量门关闭后的间隙是否符合以下要求:
                <JumpOrgTag tag={'_See_Memo4'}>见注（4）</JumpOrgTag>
            </Text>, { }, true, ),
        crtOmni('门扇间', { }, undefined,
            <Text>(1)门扇之间及门扇与立柱、门楣和地坎之间的间隙， 对于乘客电梯不大于6mm；对于载货电梯不大于 10mm；
                <JumpMeasure tag={'Gap'} rep={rep}>附录A 电梯门间隙、锁紧元件啮合长度等检验记录</JumpMeasure>
            </Text>, {nos: '1.2.7.2(1)', pre: '*',}, true, ),
        crtOmni('最不利', { }, undefined,
            <Text>(2)在水平滑动层门和折叠层门最快门扇的开启方向， 以150N的力施加在一个最不利的点，本条第（1）项 所述的间隙对于旁开门不大于30mm，对于中分门其 总和不大于45mm。
            </Text>, {nos: '1.2.7.2(2)', pre: '*', mergNos: '1.2.7.2', mergName: '门间隙'}, false, '门间隙'),
        crtOmni('再开启保', {seco: '*A1.2.7.4',}, undefined,
            <Text>(1)检查自动水平滑动门关闭过程中人员通过入口时， 保护装置是否能够自动使门重新开启。对于未按照前 款要求对门再开启保护装置进行过监督检验的电梯，
                检查当人员通过入口被正在关闭的门扇撞击或者将被 撞击时,保护装置是否能够自动使门重新开启。
            </Text>, {nos: '1.2.7.4',}, false, '门再开启保护装置'),
        crtOmni('门脱轨', {seco: '*A1.2.7.5'}, {span: 3},
            <Text>(1)层门和轿门正常运行时无脱轨、机械卡阻或者错位现象；
            </Text>, {nos: '1.2.7.5(1)', pre: '*',}, true, ),
        crtOmni('门导向', { }, undefined,
            <Text>(2)层门导向装置失效时，层门保持装置能够使层门保持在原有位置；
            </Text>, {nos: '1.2.7.5(2)', pre: '*',}, true, ),
        crtOmni('门啮合深', { }, undefined,
            <Text>(3)在层门底部保持装置上或者其附近设有识别保持装置最小啮合深度的标记，并且层门底部保持装置的啮合深度不小于标记所示的最小啮合深度。
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos: '1.2.7.5(3)', pre: '*', mergNos: '1.2.7.5', mergName: '门运行'}, false, '门的运行与导向'),
    ], '1.2.7.2门间隙-1.2.7.5门的运行与导向');
    pushOmni(ari, '1.2.7.6', [
        crtOmni('自动关门',{bspan: 3, seco: '*A1.2.7.6', }, {bspan: 8, span: 2},
            <Text>(1)在轿门驱动层门的情况下，当轿厢在开锁区域之外 时，自动关闭层门装置能够使开启的层门关闭；
            </Text>, {nos:'1.2.7.6(1)',pre:'*'}, true,),
        crtOmni('用重块',{},undefined,
            <Text>(2)自动关闭层门装置采用重块的，其防止重块坠落的 措施保持有效;对于防爆电梯，无火花措施保持完好。
            </Text>, {nos:'1.2.7.6(2)',pre:'*',mergNos:'1.2.7.6',mergName:'关闭层门'},false,'自动关闭层门装置'),
        crtOmni('专用钥',{ seco: '*A1.2.7.7', }, { span: 2},
            <Text>(1)每个层门均能够被专用钥匙从外面开启;紧急开锁 后，在层门闭合时门锁装置未保持在开锁位置；
            </Text>, {nos:'1.2.7.7(1)',pre:'*'}, true,),
        crtOmni('坑开层门',{},undefined,
            <Text>(2)如果只能通过层门进入底坑，则从底坑爬梯并且在高度1.80m内和最大水平距离0.80m范围内能够安全地触及门锁，或者能够通过永久设置的装置从底坑中打开层门。
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos:'1.2.7.7(2)',pre:'*',mergNos:'1.2.7.7',mergName:'紧急开锁'},false,'紧急开锁'),
        crtOmni('重力开锁',{ seco: '*A1.2.7.8', }, { span: 4},
            <Text>(1)锁紧动作由重力、永久磁铁或者弹簧来产生和保 持，即使永久磁铁或者弹簧失效，重力也不能导致开锁；
            </Text>, {nos:'1.2.7.8(1)',pre:'*'}, true,),
        crtOmni('锁紧啮合',{},undefined,
            <Text>(2)轿厢（运载装置）在锁紧元件啮合不小于7mm时才能启动；
            </Text>, {nos:'1.2.7.8(1)',pre:'*'}, true,),
        crtOmni('门电气安',{},undefined,
            <Text>(3)检查层门、轿门锁紧状态的电气安全装置功能有效;
            </Text>, {nos:'1.2.7.8(1)',pre:'*'}, true,),
        crtOmni('层电气安',{},undefined,
            <Text>(4)每个层门和轿门的闭合均由电气安全装置来验证； 如果滑动门是由数个间接机械连接的门扇组成，则未
                被锁住的门扇上设有电气安全装置以验证其闭合状态; 与门的驱动部件直接机械连接的轿门门扇可以不设置 电气安全装置。
                <JumpMeasure tag={'Gap'} rep={rep}>附录A 电梯门间隙、锁紧元件啮合长度等检验记录</JumpMeasure>
            </Text>, {nos:'1.2.7.8(2)',pre:'*',mergNos:'1.2.7.8',mergName:'锁紧闭合'},false,'门的锁紧与闭合'),
    ],'1.2.7.6门的锁紧与闭合-3.2.5.8层站标识');
    pushOmni(ari,'1.3.1',[
        crtOmni('救程序',{big:'*A1.3.1应急救援试验',bspan:1,seco:'*A1.3.1',span:1},{bspan:4,span:4},
            <Text>(1)检查机房内或者紧急和测试操作屏上是否设有清晰 的应急救援程序；
            </Text>, {nos:'1.3.1(1)',pre:'*',},true,),
        crtOmni('救通道',{},undefined,
            <Text>(2)对于曳引驱动乘客电梯和消防员电梯、曳引与强制 驱动载货电梯，检查建筑物内的救援通道是否保持通畅，应急救援人员是否能够无阻碍地抵达实施紧急操 作的位置，以及各层站处；
            </Text>, {nos:'1.3.1(2)',pre:'*',},true,),
        crtOmni('轿顶进入',{},undefined,
            <Text>(3)对于消防员电梯，检查用于消防员从轿厢内自救和 从轿厢外救援使用的救援装置（如便携式梯子、绳梯、安全绳系统、轿厢内踩踏点等）功能是否正常，
                用于消防员从轿顶进入轿厢的梯子是否能够从轿顶展开；
            </Text>, {nos:'1.3.1(3)',pre:'*',},true,),
        crtOmni('救援',{},undefined,
            <Text>(4)在各种载荷工况下，按照本条第（1）项所述的应 急救援程序实施操作，观察是否能够安全、及时地解救被困人员。
            </Text>, {nos:'1.3.1(4)',pre:'*',mergNos:'1.3.1',mergName:'急救'},false,'应急救援试验'),
        crtOmni('平衡符合',{big:'*A1.3.2平衡系数测试',bspan:1,seco:'*A1.3.2',span:1},{bspan:3,span:3},
            <Text>(1)对于当次定期检验需要进行本记录A1.3.12.2条所述试验的电梯，在轿厢内装载30%、40%、45%、50%、 60% 额定载重量的载荷运行，当轿厢与对重运行到同
                一水平位置时，测量电动机的电流值(对于直流电动机 同时测量电压值)，绘制电流(或者电压)—载荷曲线， 以向上、向下运行曲线的交点确定平衡系数，确认平衡系数是否在0.40～0.50之间，并且符合制造(改造)
                单位的设计值：对于斜行电梯和未按照上述要求对平 衡系数进行过监督检验的电梯，确认平衡系数是否在 0.40～0.50之间，或者符合制造(改造)单位的设计值；
            </Text>, {nos:'1.3.2(1)',pre:'*',},true,),
        crtOmni('平衡斜行',{},undefined,
            <Text>(2)进行本条第(1)项所述之外的定期检验时，对平衡系数进行确认或者测试(注)，判定其是否在0.40~0.50之间，并且符合制造(改造)单位的设计值;对于斜行电梯
                和未按照本条第(1)项对平衡系数进行过监督检验的电梯，判定其是否在0.40~0.50之间，或者符合制造(改造)单位的设计值。
            </Text>, {nos:'1.3.2(2)',pre:'*',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注：1、只有当本条检验结果为符合时方可以进行后续 各项试验。2、定期检验时，发现轿厢、对重或者其他 部件(如补偿装置)的重量发生变化，并且可能导致平 衡系数发生变化的,应当测试平衡系数。
            </Text>, { pre:'*',mergNos:'1.3.2',mergName:'平衡系'},false,'平衡系数测试'),
        crtOmni('超载保试',{big:'A1.3.3轿厢超载保护装置试验',bspan:1,seco:'A1.3.3',span:1},undefined,
            <Text>(1)对于当次定期检验需要进行本记录A1.3.12.2条所述 试验的电梯，或者发现轿厢自重发生变化等可能影响 轿厢超载保护装置有效性的情况，采用在轿厢内施加
                载荷的方式进行轿厢超载保护装置试验(注)，观察是否 最迟在轿厢内载荷达到110%额定载重量时能够检测出 超载，防止电梯正常启动及再平层，并且轿厢内有听 觉和视觉信号提示，自动门完全开启，手动门保持在
                未锁紧状态。对于未按照前款要求对轿厢超载保护装 置进行过监督检验的电梯，允许轿厢内只提供听觉信 号或者视觉信号。注:非本条所述的其他情况下，可以 采用模拟超载状态的方式进行验证。
            </Text>, {nos:'1.3.3',},false,'轿厢超载保护装置试验'),
    ],'1.3.1应急救援试验-1.3.3超载保护试验');
    //【非常地特殊】原始记录中有多个项目编号来对应同一个结果判定的！一个拆分区块的下有三个嵌套分区： 利用 mergLabel seco span 来辨识特殊点。
    pushOmni(ari,'1.3.4',[
        crtOmni('限速封记',{big:'*A1.3.4轿厢（运载装置）限速器-安全钳试验',bspan:1,seco:'*A1.3.4.1',span:1},{bspan:9,span:3},
            <Text>(1)各调节部位封记完好，运转时无碰擦、卡阻、转动 不灵活等现象，动作正常；
            </Text>, {nos:'1.3.4.1(1)',pre:'*' ,mergLabel:'限速器'},true,),
        crtOmni('速度校验',{},undefined,
            <Text>(2)动作速度符合要求。
            </Text>, {nos:'1.3.4.1(2)',pre:'*'},true,),
        crtOmni(undefined,{},undefined,
            <Text>检验时，可以通过查看限速器调试证书、校验记录， 结合限速器的状态确认其动作速度是否符合要求；发现调节部位封记缺损等可能影响限速器动作速度的情况，检验人员应当通过现场见证
                维护保养单位测试的 方式予以确认。
            </Text>, { },true, ),
        crtOmni(undefined,{seco:'*A1.3.4.2',span:1, },{span:5, },
            <Text>检查以下电气安全装置是否有效
            </Text>, { mergLabel:'电气安全装置'},true,),
        crtOmni('限速电安',{},undefined,
            <Text>(1)限速器或者其他装置上设置的在轿厢（运载装置） 上行、下行速度达到限速器动作速度之前动作的电气安全装置；
            </Text>, {nos:'1.3.4.2(1)',pre:'*'},true,),
        crtOmni('限速复位',{},undefined,
            <Text>(2)对于安全钳释放后限速器不能自动复位的，用于验证限速器复位状态的电气安全装置；
            </Text>, {nos:'1.3.4.2(2)',pre:'*'},true,),
        crtOmni('绳断裂',{},undefined,
            <Text>(3)用于检查限速器绳断裂或者过分伸长的电气安全装置；
            </Text>, {nos:'1.3.4.2(3)',pre:'*'},true,),
        crtOmni('钳电安',{},undefined,
            <Text>(4)轿厢（运载装置）上设置的在轿厢（运载装置）安全钳动作以前或者同时使驱动主机停止运转的电气安全装置。
            </Text>, {nos:'1.3.4.2(4)',pre:'*'},true, ),
        crtOmni('限钳联动',{seco:'*A1.3.4.3',span:1},{span:1},
            <Text>(1)轿厢空载，以检修速度下行的工况进行限速器-安全钳联动试验，限速器、安全钳动作应可靠，试验 后，未出现对电梯正常使用有不利影响的损坏(允许更 换摩擦部件和玻璃部件)。
            </Text>, {nos:'1.3.4.3',pre:'*', mergNos:'1.3.4', mergName:'轿限钳试', mergLabel:'联动试验'},false,'轿厢（运载装置）限速器-安全钳试验'),
    ],'1.3.4轿厢（运载装置）限速器-安全钳试验');
    pushOmni(ari, '1.3.5', [
        crtOmni('对限电安', {big: '*A1.3.5 对重（平衡重）限速器-安全钳试验', bspan: 1, seco: '*A1.3.5', span:1}, {bspan: 2, span: 2},
            <Text>(1)检查限速器及其电气安全装置是否符合本记录 A1.3.4.1条和A1.3.4.2条第（1）～（3）项的要求。
            </Text>, {nos: '1.3.5(1)', pre: '*', }, true, ),
        crtOmni('对限联动', { }, undefined,
            <Text>(2)轿厢空载，以检修速度上行的工况进行限速器-安全钳联动试验，限速器、安全钳动作应可靠，试验后，未出现对电梯正常使用有不利影响的损坏(允许更 换摩擦部件)。
            </Text>, {nos: '1.3.5(2)', pre: '*', mergNos: '1.3.5', mergName: '对限钳试'}, false, '对重（平衡重）限速器-安全钳试验'),
        crtOmni('缓冲试', {big: '*A1.3.6缓冲器试验', bspan: 1, seco: '*A1.3.6',}, undefined,
            <Text>(1)轿厢空载，以检修速度运行的工况使缓冲器被压 缩，轿厢（运载装置）、对重停在其上再离开后，观
                察缓冲器是否未出现对电梯正常使用有不利影响的损 坏（如明显倾斜、断裂、塑性变形、剥落、破损 等）。
            </Text>, {nos: '1.3.6', pre: '*'}, false, '缓冲器试验'),
        crtOmni('上超试法',{big:'*A1.3.7轿厢上行超速保护装置试验',bspan:1,seco:'*A1.3.7.1', },{bspan:4, },
            <Text>(1)检查控制柜或者紧急和测试操作屏上是否标有轿厢上行超速保护装置动作试验方法。
                <JumpOrgTag tag={'_See_Memo1'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'1.3.7.1',pre:'*' ,mergLabel:'试验方法'},true,),
        crtOmni('上超电安',{seco:'*A1.3.7.2', },undefined,
            <Text>(1)检查轿厢上行超速保护装置上的电气安全装置功能是否有效。
            </Text>, {nos:'1.3.7.2',pre:'*',mergLabel:'电气安全装置'},true,),
        crtOmni('上超监测',{seco:'*A1.3.7.3', },undefined,
            <Text>(1)采用存在内部冗余的制动器作为轿厢上行超速保护装置减速部件的，检查当制动器机械部件动作（松开 或者制动）失效或者制动力不足时，是否能防止电梯 正常运行。
            </Text>, {nos:'1.3.7.3',pre:'*',mergLabel:'监测功能'},true,),
        crtOmni('上超试验',{seco:'*A1.3.7.4', },undefined,
            <Text>(1)按照本记录A1.3.7.1条所述的试验方法进行动作试 验，观察轿厢上行超速保护装置动作是否可靠。 对于 配有轿厢上行超速保护装置但是未按照本记录A1.3.7
                条要求对其进行过监督检验并且不符合本记录 A1.3.7.1条要求的电梯（不要求其必须符合该条要 求），定期检验时可以轿厢空载、检修速度上行的工 况进行动作试验。
            </Text>, {nos:'1.3.7.4',pre:'*',mergNos:'1.3.7',mergName:'上超速保', mergLabel:'试验'},false,'轿厢上行超速保护装置试验'),
    ], '1.3.5对重限速器安全钳-1.3.7轿上行超速保护试验');
    pushOmni(ari, '1.3.8', [
        crtOmni('移保试法',{big:'*A1.3.8轿厢意外移动保护装置试验',bspan:1,seco:'*A1.3.8.1', },{bspan:4, },
            <Text>(1)检查控制柜或者紧急和测试操作屏上是否标有轿厢意外移动保护装置动作试验方法。
                <JumpOrgTag tag={'_See_Memo2'}>见注（2）</JumpOrgTag>
            </Text>, {nos:'1.3.8.1',pre:'*' ,mergLabel:'试验方法'},true,),
        crtOmni('移保电安',{seco:'*A1.3.8.2', },undefined,
            <Text>(1)检查轿厢意外移动保护装置上的电气安全装置功能 是否有效。
            </Text>, {nos:'1.3.8.2',pre:'*',mergLabel:'电气安全装置'},true,),
        crtOmni('自监测',{seco:'*A1.3.8.3', },undefined,
            <Text>(1)采用存在内部冗余的制动器作为轿厢意外移动保护 装置制停部件的，检查当制动器机械部件动作（松开 或者制动）失效或者制动力不足时，是否能够关闭轿 门和层门，并且能够防止电梯正常运行。
            </Text>, {nos:'1.3.8.3',pre:'*',mergLabel:'监测功能'},true,),
        crtOmni('移保试验',{seco:'*A1.3.8.4', },undefined,
            <Text>(1)按照本记录A1.3.8.1条所述的试验方法进行动作试验，观察轿厢意外移动保护装置动作是否可靠。
            </Text>, {nos:'1.3.8.4',pre:'*',mergNos:'1.3.8',mergName:'移动保', mergLabel:'试验'},false,'轿厢意外移动保护装置试验'),
        crtOmni('轮打滑', {big: '*A1.3.11曳引能力试验', bspan: 1, seco: '*A1.3.11.1', span:1}, {bspan: 2, span: 2},
            <Text>(1)轿厢空载，当对重压在缓冲器上而驱动主机按电梯上行方向旋转时，观察悬挂装置是否相对曳引轮打滑，或者驱动主机停止运转；
            </Text>, {nos: '1.3.11.1(1)', pre: '*', }, true, ),
        crtOmni('断电厢停', { }, undefined,
            <Text>(2)轿厢空载，以额定速度上行至行程上部，切断电动机与制动器供电，观察轿厢（运载装置）是否完全停止。
            </Text>, {nos: '1.3.11.1(2)', pre: '*', mergNos: '1.3.11.1', mergName: '空曳引试',}, false, '空载工况曳引能力试验'),
        crtOmni('制动试验', {big: '*A1.3.12 125% 额定载重量制动试验', bspan: 1, seco: '*A1.3.12.2',}, undefined,
            <Text>(1)轿厢内装载125%额定载重量的载荷，以额定速度 下行至行程下部，切断电动机与制动器供电，观察制 动器是否能够使驱动主机停止运转，并且轿厢及其附 联部件和导轨等无明显变形和损坏。
            </Text>, {nos: '1.3.12.2', pre: '*'}, false, '125%额定载重量制动试验'),
        crtOmni('运行试', {big: 'A1.3.13运行试验', bspan: 1, seco: 'A1.3.13',}, undefined,
            <Text>(1)轿厢空载，以额定速度上、下运行，观察呼梯、楼层显示等信号系统是否功能有效、指示正确、动作无误，轿厢是否平层良好，无异常现象发生。
            </Text>, {nos: '1.3.13', }, false, '运行试验'),
    ], '1.3.8轿厢意外移动保护装置试验-1.3.13运行试验');

    if(!noDefault)  ari=omniCalculateDefault(ari,{iclasDefault:"A", displayDefault:false});
    return { Item: ari, } as { [key: string]: any[] };
};
