/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text,} from "customize-easy-ui-component";
import {crtOmni, omniCalculateDefault, pushOmni} from "../../common/omni";
import {JumpMeasure, JumpOrgTag} from "../../common/general";

/**新的第四种项目列表配置模式： 新的检验项目大列表的配置做法。【特别注意】#span几个参数，最好不要跨越编辑区域去做配置，强制缩小影响波及范围可方便调试和修改。
 * @param noDefault 是否进行这个自动配置补缺的步骤；
 *【特殊部分】orc?._Oitems: 动态，用户自己增加的；
 * */
export const setupItemAreaRoute= ({rep, orc, theme, noDefault} :{rep:any,orc?:any, theme:any,noDefault?:boolean}
) => {
    let ari: any[] =[];
    pushOmni(ari,'3.1',[
        crtOmni(undefined,{big:'A3.1.4 使用资料',bspan:1,seco:'A3.1.4',span:1,},{bspan:4,span:4,},
            <Text>使用单位提供了以下适用于受检杂物电梯的资料：
            </Text>, {},true,),
        crtOmni('使用证',{},undefined,
            <Text>(1)使用登记证，其内容与实物相符；
            </Text>, {nos:'3.1.4(1)',},true,),
        crtOmni('保养合',{},undefined,
            <Text>(2)日常维护保养合同，由使用单位与取得相应许可的单位签订；
            </Text>, {nos:'3.1.4(2)',},true,),
        crtOmni('管理制',{},undefined,
            <Text>(3)应急救援管理制度和专用钥匙管理制度。
            </Text>, {nos:'3.1.4(3)',mergNos:'3.1.4',mergName:'使用资料'},false,'使用资料'),
        crtOmni('通道',{big:'A3.2.1机器空间与井道',bspan:1,seco:'A3.2.1.1(1)',},undefined,
            <Text>(1)通道保持通畅，相关人员能够安全、方便、无阻碍 地使用，并且设有永久性电气照明；
            </Text>, {nos:'3.2.1.1(1)',},false,'通往机器空间的通道'),
    ],'3.1.4 使用资料-3.2.1机器空间与井道');
    pushOmni(ari,'3.2.2',[
        crtOmni('接地故',{big:'A3.2.2电气设备和驱动主机',bspan:3,seco:'A3.2.2.3(3)',span:1,},{bspan:13,span:1,},
            <Text>(3)含有电气安全装置的电路发生接地故障时,驱动主机 立即停止运转,或者在第一次正常停止运转后,能够防止
                驱动主机再启动;恢复杂物电梯运行只能通过手动复位。
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos:'3.2.2.3(3)'},false,'接地故障保护措施'),
        crtOmni(undefined,{seco:'A3.2.2.4',span:1,},{span:7,},
            <Text>对于防爆杂物电梯,检查防爆电气部件是否符合以下要求:
            </Text>, {},true,),
        crtOmni('防爆证',{},undefined,
            <Text>(1)部件铭牌上标明型号、制造日期、防爆标志、防爆 合格证号、制造单位名称和相关技术参数，其防爆合格证在有效期内；
            </Text>, {nos:'3.2.2.4(1)',},true,),
        crtOmni('壳光滑',{},undefined,
            <Text>(2)外壳光滑、无损伤，透明件无裂纹，接合面紧固严密，相对运动的间隙防尘密封严密，紧固件无锈蚀、 缺损，密封垫圈完好；
            </Text>, {nos:'3.2.2.4(2)',},true,),
        crtOmni('警告标',{},undefined,
            <Text>(3)本质安全型电气部件（控制柜、操纵箱、召唤箱、 轿顶检修箱、接线箱盒、旋转编码器等）的本质安全
                标志、无电气联锁隔爆型电气部件的“断电后开盖”警告标志清晰；
            </Text>, {nos:'3.2.2.4(3)',},true,),
        crtOmni('隔爆面',{},undefined,
            <Text>(4)隔爆型电气部件的隔爆面无锈蚀层、机械伤痕和刷漆现象；
            </Text>, {nos:'3.2.2.4(4)',},true,),
        crtOmni('浇封面',{},undefined,
            <Text>(5)浇封型电气部件的浇封表面无裂缝、剥落、被浇封部分外露现象；
            </Text>, {nos:'3.2.2.4(5)',},true,),
        crtOmni('油浸型',{},undefined,
            <Text>(6)油浸型电气部件密封良好，无渗漏油，油位高度在规定范围内；外壳、电气和机械连接所用的螺栓、螺母以及注油、排油的螺栓塞等具有防松措施。
            </Text>, {nos:'3.2.2.4(6)',mergNos:'3.2.2.4',mergName:'防爆电'},false,'防爆电气部件'),
        crtOmni(undefined,{seco:'*A3.2.2.6',span:1,},{span:5,},
            <Text>检查是否符合以下要求：
            </Text>, {},true,),
        crtOmni('轮绳槽',{},undefined,
            <Text>(1)曳引轮绳槽、卷筒绳槽、链轮齿无缺损或者不正常磨损；
            </Text>, {nos:'3.2.2.6(1)',pre:'*',},true,),
        crtOmni('制动器',{},undefined,
            <Text>(2)制动器动作灵活、工作可靠；
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据及测量结果记录</JumpMeasure>
            </Text>, {nos:'3.2.2.6(2)',pre:'*',},true,),
        crtOmni('溢流阀',{},undefined,
            <Text>(3)通常情况下溢流阀的调定工作压力不超过满载压力 的140%，最大不高于满载压力的170%在此情况下需 提供相应的液压管路（包括液压缸）计算说明；
            </Text>, {nos:'3.2.2.6(3)',pre:'*',},true,),
        crtOmni('温度组',{},undefined,
            <Text>(4)防爆杂物电梯的电动机、减速器、液压泵站、制动部件的外壳以及防爆电气部件外壳的最高表面温度不超过整机防爆标志中的温度组别要求。
            </Text>, {nos:'3.2.2.6(4)',pre:'*',mergNos:'3.2.2.6',mergName:'驱动主机'},false,'驱动主机'),
    ],'3.2.2电气设备和驱动主机');
    pushOmni(ari,'3.2.3',[
        crtOmni(undefined,{big:'A3.2.3悬挂装置及旋转部件防护',bspan:2,seco:'A3.2.3.1',span:1},{bspan:7,span:4},
            <Text>检查是否符合以下要求：
            </Text>, {},true,),
        crtOmni('钢丝绳',{},undefined,
            <Text>(1)钢丝绳无笼状畸变、绳股挤出、扭结、部分压扁、弯折或者严重锈蚀等达到报废条件的现象；
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos:'3.2.3.1(1)',},true,),
        crtOmni('链条',{},undefined,
            <Text>(2)链条无严重磨损、锈蚀、变形或者断裂等达到报废条件的现象；
            </Text>, {nos:'3.2.3.1(2)',},true,),
        crtOmni('报废',{},undefined,
            <Text>(3)其他类型悬挂装置的磨损、变形等不超过制造单位设定的报废指标。
            </Text>, {nos:'3.2.3.1(3)',mergNos:'3.2.3.1',mergName:'悬挂装置'},false,'悬挂装置本体'),
        crtOmni(undefined,{seco:'A3.2.3.2',span:1},{span:3,},
            <Text>检查是否符合以下要求：
            </Text>, {},true,),
        crtOmni('端部裂纹',{},undefined,
            <Text>(1)悬挂装置的端部固定部件无裂纹、松动等现象,端接装置的弹簧、螺母、开口销等连接部件无缺损;
                <JumpOrgTag tag={'_See_Memo3'}>见注（3）</JumpOrgTag>
            </Text>, {nos:'3.2.3.2(1)',},true,),
        crtOmni('绳夹',{},undefined,
            <Text>(2)对于强制驱动杂物电梯,采用带模块的压紧装置或者至少用两个绳夹将悬挂装置固定在卷筒上。
            </Text>, {nos:'3.2.3.2(2)',mergNos:'3.2.3.2',mergName:'悬挂端部'},false,'悬挂装置端部固定'),
    ],'3.2.3悬挂装置及旋转部件防护');
    pushOmni(ari,'3.2.4',[
        crtOmni(undefined,{big:'A3.2.4轿厢与对重（平衡重）',bspan:2,seco:'A3.2.4.3',span:1},{bspan:7,span:4},
            <Text>对于采用手动开启层门的杂物电梯，检查是否设有表示轿厢在此层站的信号，并且符合以下要求：
            </Text>, {},true,),
        crtOmni('保持开',{},undefined,
            <Text>(1)轿厢停留在该层站期间保持开启；
                <JumpOrgTag tag={'_See_Memo2'}>见注（2）</JumpOrgTag>
            </Text>, {nos:'3.2.4.3(1)',},true,),
        crtOmni('自动关',{},undefined,
            <Text>(2)轿厢离开该层站后自动关闭；
            </Text>, {nos:'3.2.4.3(2)',},true,),
        crtOmni('信醒目',{},undefined,
            <Text>(3)醒目并且不被遮挡。
            </Text>, {nos:'3.2.4.3(3)',mergNos:'3.2.4.3',mergName:'厢位指示'},false,'轿厢位置指示信号'),
        crtOmni(undefined,{seco:'*A3.2.4.4',span:1},{span:3,},
            <Text>对于允许人员进人轿顶的杂物电梯,检查是否符合以下要求:
            </Text>, {},true,),
        crtOmni('械停止装',{},undefined,
            <Text>(1)轿厢设置机械停止装置以使其停在指定位置上;
                <JumpOrgTag tag={'_See_Memo1'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'3.2.4.4(1)',pre:'*',},true,),
        crtOmni('门旁停装',{},undefined,
            <Text>(2)在轿顶上或者井道内每一层门旁设有停止装置。
            </Text>, {nos:'3.2.4.4(2)',pre:'*',mergNos:'3.2.4.4',mergName:'轿厢移动'},false,'防止轿厢移动装置'),
    ],'3.2.4轿厢与对重（平衡重）');
    pushOmni(ari,'3.2.5.3',[
        crtOmni('再开启保',{big:'A3.2.5层门与轿门',bspan:4,seco:'*A3.2.5.3'},{bspan:6},
            <Text>(1)检查在自动门关闭过程中，人员或者货物被撞击或 者将被撞击时，保护装置是否能够自动使门重新开 启。
            </Text>, {nos:'3.2.5.3',pre:'*',},false,'门再开启保护装置'),
        crtOmni('门运导',{seco:'*A3.2.5.4',},undefined,
            <Text>(1)检查层门正常运行时，是否无脱轨、机械卡阻或者错位现象。
            </Text>, {nos:'3.2.5.4',pre:'*',},false,'门的运行与导向'),
        crtOmni(undefined,{seco:'*A3.2.5.5',span:1},{span:3,},
            <Text>检查是否符合以下要求：
            </Text>, {},true,),
        crtOmni('自动关门',{},undefined,
            <Text>(1)在轿门驱动层门的情况下，当轿厢在开锁区域之外时，自动关闭层门装置能够使开启的层门关闭；
            </Text>, {nos:'3.2.5.5(1)',pre:'*',},true,),
        crtOmni('用重块',{},undefined,
            <Text>(2)自动关闭层门装置采用重块的，其防止重块坠落的 措施保持有效；对于防爆杂物电梯，无火花措施保持完好。
            </Text>, {nos:'3.2.5.5(2)',pre:'*',mergNos:'3.2.5.5',mergName:'关闭层门'},false,'自动关闭层门装置'),
        crtOmni('急开锁',{seco:'A3.2.5.6',},undefined,
            <Text>(1)检查每个层门是否均能够被专用钥匙从外面开启； 紧急开锁后，在层门闭合时门锁装置是否未保持在开
                锁位置。对于允许按照JG 135—2000《杂物电梯》及 更早期标准生产的杂物电梯、可以仅在端站层门配置 紧急开锁装置。
            </Text>, {nos:'3.2.5.6',},false,'紧急开锁'),
    ],'3.2.5.3门再开启保护-3.2.5.6急开锁');
    pushOmni(ari,'3.2.5.7',[
        crtOmni(undefined,{bspan:2,seco:'*A3.2.5.7',span:1},{bspan:5,span:4},
            <Text>检查是否符合以下要求：
            </Text>, {},true,),
        crtOmni('重力开锁',{},undefined,
            <Text>(1)每个层门均设有门锁装置，其锁紧动作由重力、永久磁铁或者弹簧来产生和保持，即使永久磁铁或者弹失效，重力也不能导致开锁；
            </Text>, {nos:'3.2.5.7(1)',pre:'*',},true,),
        crtOmni('门电气安',{},undefined,
            <Text>(2)门的锁紧由电气安全装置电气证实，只有在层门锁紧后杂物电梯才能运行；对于同时满足额定速度不大于0.63m/s、开门高度不大于1.20m和层站地坎距地
                面高度不小于0.70m的杂物电梯，门的锁紧可以不由电气装置电气证实，但是当轿厢驶离开锁区域时，锁紧元件能够自动关闭，而且除了正常锁紧位置外，至少有第二个锁紧位置；
                <JumpOrgTag tag={'_See_Memo3'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'3.2.5.7(2)',pre:'*',},true,),
        crtOmni('层电气安',{},undefined,
            <Text>(3)每个层门的闭合均由电气安全装置来验证，如果滑动门是由数个间接机械连接的门扇组成，则未被锁住 的门扇上也设有电气安全装置以验证其闭合状态。
                <JumpOrgTag tag={'_See_Memo3'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'3.2.5.7(3)',pre:'*',mergNos:'3.2.5.7',mergName:'锁紧闭合'},false,'门的锁紧与闭合'),
        crtOmni('层标识',{seco:'*A3.2.5.8',},undefined,
            <Text>(1)检查每个层门或者其附近位置是否标示杂物电梯的 额定载重量，并且没有包含"禁止进入轿厢"文字的警 示标志。
            </Text>, {nos:'3.2.5.8',pre:'*',},false,'层站标识'),
    ],'3.2.5.7门的锁紧与闭合-3.2.5.8层站标识');
    pushOmni(ari,'3.3.1',[
        crtOmni('限速封记',{big:'*A3.3.1轿厢限速器-安全钳试验',bspan:1,seco:'*A3.3.1',span:1},{bspan:4,span:4},
            <Text>(1)检查限速器各调节部位封记是否完好，运转时无碰擦、卡阻、转动不灵活等现象，动作正常；
            </Text>, {nos:'3.3.1(1)',pre:'*',},true,),
        crtOmni('绳断裂',{},undefined,
            <Text>(2)检查当限速器绳或者安全绳断裂或者过分伸长时，是否能够通过电气安全装置防止杂物电梯的正常运行；
                <JumpOrgTag tag={'_See_Memo1'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'3.3.1(2)',pre:'*',},true,),
        crtOmni('安全钳',{},undefined,
            <Text>(3)检查轿厢上设置的在轿厢安全钳动作以前或者同时使驱动主机停止运转的电气安全装置功能是否有效；
                <JumpOrgTag tag={'_See_Memo1'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'3.3.1(3)',pre:'*',},true,),
        crtOmni('下行工况',{},undefined,
            <Text>(4)轿厢空载、额定速度或者检修速度下行的工况进行试验,观察限速器、安全钳动作是否可靠。
            </Text>, {nos:'3.3.1(4)',pre:'*',mergNos:'3.3.1',mergName:'轿限钳试'},false,'轿厢限速器-安全钳试验'),
        crtOmni('对限速封',{big:'*A3.3.2对重（平衡重）限速器-安全钳试验',bspan:1,seco:'*A3.3.2',span:1},{bspan:3,span:3},
            <Text>(1)检查限速器各调节部位封记是否完好，运转时无碰 擦、卡阻、转动不灵活等现象，动作正常；
            </Text>, {nos:'3.3.2(1)',pre:'*',},true,),
        crtOmni('对绳断裂',{},undefined,
            <Text>(2)检查当限速器绳或者安全绳断裂或者过分伸长时，是否能够通过电气安全装置防止杂物电梯的正常运行；
                <JumpOrgTag tag={'_See_Memo1'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'3.3.2(2)',pre:'*',},true,),
        crtOmni('限钳联动',{},undefined,
            <Text>(3)轿厢空载，以额定速度或者检修速度上行，进行限速器-安全钳联动试验；对于采用悬挂装置断裂或者安
                全绳触发的安全钳，轿厢空载，模拟悬挂装置断裂或 者安全绳被触发的状态进行试验，观察限速器、安全钳动作是否可靠。
            </Text>, {nos:'3.3.2(3)',pre:'*',mergNos:'3.3.2',mergName:'对限钳试'},false,'对重（平衡重）限速器-安全钳试验'),
    ],'3.3.1轿厢限速器-安全钳试验-3.3.2对重限钳试验');
    pushOmni(ari,'3.3.3',[
        crtOmni('破阀手动',{big:'*A3.3.3破裂阀试验',bspan:1,seco:'*A3.3.3',span:1},{bspan:2,span:2},
            <Text>(1)检查破裂阀附近是否标有杂物电梯整机制造单位规定的无需轿厢超载即可使破裂阀达到动作流量的手动操作方法。
            </Text>, {nos:'3.3.3(1)',pre:'*',},true,),
        crtOmni('破阀动作',{},undefined,
            <Text>(2)按照本项（1）所述的方法，轿厢空载下行，观察当达到破裂阀的动作速度时，轿厢是否被可靠制停：
            </Text>, {nos:'3.3.3(2)',pre:'*',mergNos:'3.3.3',mergName:'破裂阀试'},false,'破裂阀试验'),
        crtOmni('制上行',{big:'*A3.3.5制动试验',bspan:1,seco:'*A3.3.5(2)',},{bspan:1,},
            <Text>(2)对于曳引式杂物电梯，轿厢空载以额定速度上行至 行程上部，切断电动机与制动器供电，观察轿厢是否 能够完全停止。
                <JumpOrgTag tag={'_See_Memo1'}>见注（1）</JumpOrgTag>
            </Text>, {nos:'3.3.5(2)',pre:'*',},false,'制动试验'),
        crtOmni('运行试',{big:'A3.3.6运行试验',bspan:1,seco:'A3.3.6',},{bspan:1,},
            <Text>(1)轿厢空载,以额定速度上、下运行,观察呼梯、楼层 显示等信号系统是否功能有效、指示正确、动作无误, 无异常现象发生。
            </Text>, {nos:'3.3.6',},false,'运行试验'),
    ],'3.3.3破裂阀试验-3.3.6运行试验');

    if(!noDefault)  ari=omniCalculateDefault(ari,{iclasDefault:"A", displayDefault:false});
    return { Item: ari, } as { [key: string]: any[] };
};
