/** @jsxImportSource @emotion/react */
import * as React from "react";
import {Text,} from "customize-easy-ui-component";
import {crtOmni, omniCalculateDefault, pushOmni} from "../../common/omni";
import {JumpMeasure,} from "../../common/general";

/*项目列表配置模式： 新的检验项目大列表的配置做法。【特别注意】#span几个参数，最好不要跨越编辑区域去做配置，强制缩小影响波及范围可方便调试和修改。
 *【特殊部分】orc?._Oitems: 动态，用户自己增加的；
 * */
export const setupItemAreaRoute= ({rep, orc, theme, noDefault} :{rep:any,orc?:any, theme:any,noDefault?:boolean}
) => {
    let ari: any[] =[];
    pushOmni(ari,'3.1.1',[
        crtOmni(undefined,{big:'A3.1技术资料审查',bspan:2,seco:'A3.1.1',span:1,},{bspan:16,span:9,},
            <Text>杂物电梯制造单位提供了以下适用于受检杂物电梯的资料：
            </Text>, {},true,),
        crtOmni('制配置',{},undefined,
            <Text>(1)配置说明，按照杂物电梯的实际配置，列明其 产品编号、型号、主要技术参数[包括提升高度、 轿厢尺寸、额定载重量、额定速度、层站数、控制 方式、油缸数量和顶升方式（适用于液压驱动杂物
                电梯）、区域防爆等级和整机防爆标志（适用于防 爆杂物电梯）]，主要部件和安全保护装置（注 A3-2）的产品名称、型号、编号（绳头组合、门 锁装置、含有电子元件的安全电路、可编程电子安
                全相关系统，可以不标注编号而标注制造批次 号）、制造单位名称、型式试验证书编号、制造日 期，悬挂装置的名称、型号、主要参数（如直径、 数量）；配置说明加盖整机制造单位（或者进口杂
                物电梯的国内代理商）公章或者检验专用章，并且注明签发日期；
            </Text>, {nos:'3.1.1(1)',},true,),
        crtOmni('生产许可',{},undefined,
            <Text>(2)《特种设备生产许可证》（适用于境内制造单位）；
            </Text>, {nos:'3.1.1(2)',},true,),
        crtOmni('型试证',{},undefined,
            <Text>(3)型式试验证书，包括整机、主要部件和安全保 护装置的型式试验证书；
            </Text>, {nos:'3.1.1(3)',},true,),
        crtOmni('调试证',{},undefined,
            <Text>(4)限速器、渐进式安全钳、破裂阀的调试证书；
            </Text>, {nos:'3.1.1(4)',},true,),
        crtOmni('其他证明',{},undefined,
            <Text>(5)其他证明文件，包括采用一根悬挂装置的防护说明，是否允许人员进入杂物电梯机房、井道、底坑和轿顶的说明；
            </Text>, {nos:'3.1.1(5)',},true,),
        crtOmni('保养说',{},undefined,
            <Text>(6)安装使用维护保养说明书，包括安装、使用、 维护保养说明和应急救援说明；
            </Text>, {nos:'3.1.1(6)',},true,),
        crtOmni('质量证',{},undefined,
            <Text>(7)整机质量证明文件，包括整机制造单位的《特种设备生产许可证》编号，杂物电梯的设备品种、 产品编号、型号、主要技术参数、安装单位的《特 种设备生产许可证》编号、安装竣工日期、安装地
                点，杂物电梯符合相关安全技术规范的声明；整机 质量证明文件加盖整机制造单位（或者进口杂物电 梯的国内代理商）公章或者检验专用章，并且注明 签发日期。
            </Text>, {nos:'3.1.1(7)',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注 A3-1：提供的制造资料为复印件时，应当加盖 整机制造单位（或者进口杂物电梯的国内代理商） 公章或者检验专用章。
            </Text>, {mergNos:'3.1.1',mergName:'制造资料'},false,'制造资料'),
        crtOmni(undefined,{seco:'A3.1.2',span:1,},{span:7,},
            <Text>安装单位提供了以下适用于受检杂物电梯的资料：
            </Text>, {},true,),
        crtOmni('安装许可',{},undefined,
            <Text>(1)安装单位的《特种设备生产许可证》；
            </Text>, {nos:'3.1.2(1)',},true,),
        crtOmni('安装告知',{},undefined,
            <Text>(2)安装告知证明资料；
            </Text>, {nos:'3.1.2(2)',},true,),
        crtOmni('建筑接口',{},undefined,
            <Text>(3)杂物电梯相关建筑接口符合性声明，表明用于 安装该杂物电梯的机器空间、井道、层站以及井道 下方人员可以到达的空间等按照相关规定进行了土
                建交接，并且满足相关要求，加盖安装单位公章或 者检验专用章；
            </Text>, {nos:'3.1.2(3)',},true,),
        crtOmni('变更设计',{},undefined,
            <Text>(4)变更设计证明文件（适用于发生设计变更时），有由使用单位提出、经整机制造单位同意的 见证；
            </Text>, {nos:'3.1.2(4)',},true,),
        crtOmni('自检报告',{},undefined,
            <Text>(5)安装自检报告，由整机制造单位（或者进口杂 物电梯的国内代理商）出具或者盖章确认。
            </Text>, {nos:'3.1.2(5)',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注A3-3：提供的安装资料为复印件时，应当加盖 安装单位公章或者检验专用章。
            </Text>, {mergNos:'3.1.2',mergName:'安装资料'},false,'安装资料'),
    ],'3.1.1制造资料-3.1.2安装资料');
    pushOmni(ari,'3.1.3',[
        crtOmni(undefined,{bspan:2,seco:'A3.1.3',span:1,},{bspan:13,span:11,},
            <Text>改造或者修理单位提供了以下适用于受检杂物电梯的资料：
            </Text>, {},true,),
        crtOmni('使登记',{},undefined,
            <Text>(1)改造或者重大修理杂物电梯的使用登记证；
            </Text>, {nos:'3.1.3(1)',},true,),
        crtOmni('改生产许',{},undefined,
            <Text>(2)改造或者修理单位的《特种设备生产许可证》；
            </Text>, {nos:'3.1.3(2)',},true,),
        crtOmni('改告知资',{},undefined,
            <Text>(3)改造或者重大修理告知证明资料；
            </Text>, {nos:'3.1.3(3)',},true,),
        crtOmni('改造方案',{},undefined,
            <Text>(4)改造或者重大修理方案；
            </Text>, {nos:'3.1.3(4)',},true,),
        crtOmni('试验证',{},undefined,
            <Text>(5)加装或者更换的各主要部件和安全保护装置的型式试验证书；
            </Text>, {nos:'3.1.3(5)',},true,),
        crtOmni('换调试证',{},undefined,
            <Text>(6)加装或者更换的限速器、渐进式安全钳、破裂阀的调试证书；
            </Text>, {nos:'3.1.3(6)',},true,),
        crtOmni('保养书',{},undefined,
            <Text>(7)安装使用维护保养说明书（补充件），根据改 造或者重大修理情况增补的相关安装、使用、维护保养说明和应急救援说明；
            </Text>, {nos:'3.1.3(7)',},true,),
        crtOmni('改自检报',{},undefined,
            <Text>(8)改造或者重大修理自检报告；
            </Text>, {nos:'3.1.3(8)',},true,),
        crtOmni('改质量证',{},undefined,
            <Text>(9)改造或者重大修理质量证明文件，包括杂物电 梯的设备品种、使用登记证编号、型号、主要技术 参数、改造或者修理单位的《特种设备生产许可 证》编号、改造或者重大修理竣工日期，杂物电梯
                符合相关安全技术规范的声明；改造或者重大修理 质量证明文件加盖改造或者修理单位公章或者检验 专用章，并且注明签发日期。
            </Text>, {nos:'3.1.3(9)',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注A3-4：提供的改造或者重大修理资料为复印件时，应当加盖改造或者修理单位公章或者检验专用章。
            </Text>, {mergNos:'3.1.3',mergName:'改造资料'},false,'改造或重大维修资料'),
        crtOmni('铭识别',{seco:'A3.1.5',span:1,},{span:2,},
            <Text>(1)主要部件(绳头组合除外)和安全保护装置的铭牌或者可识别标志(含有电子元件的安全电路、可编 程电子安全相关系统可以采用可识别标志)上标注 的产品型号、编号（制造批次号）、制造单位名称
                或者商标、型式试验证书编号（含有电子元件的安 全电路、可编程电子安全相关系统可以不标注型式 试验证书编号）、制造日期与配置说明[见本附件 A3.1.1条第（1）项]一致；
            </Text>, {nos:'3.1.5(1)',},true,),
        crtOmni('铭一致',{},undefined,
            <Text>(2)主要部件和安全保护装置的铭牌或者可识别标志上标注的内容与相应的型式试验证书内容相符。 改造、重大修理监督检验时，应当对加装或者更换
                的主要部件和安全保护装置的铭牌或者可识别标志 上标注的内容与相应型式试验证书的一致性进行审查。
            </Text>, {nos:'3.1.5(2)',mergNos:'3.1.5',mergName:'资料铭牌'},false,'技术资料与铭牌（可识别标志）的一致性'),
    ],'3.1.3改造或重大维修资料-3.1.5资料铭牌一致');
    pushOmni(ari,'3.2.1.1',[
        crtOmni('通道畅',{big:'A3.2.1 机器空间与井道',bspan:3,seco:'A3.2.1.1',span:1,},{bspan:7,span:5,},
            <Text>(1)通道保持通畅，相关人员能够安全、方便、无阻碍地使用，并且设有永久性电气照明；
            </Text>, {nos:'3.2.1.1(1)',},true,),
        crtOmni('通道门锁',{},undefined,
            <Text>(2)通道门、通道活板门、检修门和检修活板门能够可靠锁住；
            </Text>, {nos:'3.2.1.1(2)',},true,),
        crtOmni('警示标',{},undefined,
            <Text>(3)对于人员可进入的机房，通道门、通道活板门 外侧设有包含“杂物电梯机器——危险未授权人员禁止入内”文字的警示标志；
            </Text>, {nos:'3.2.1.1(3)',},true,),
        crtOmni('不用钥匙',{},undefined,
            <Text>(4)对于人员可进入的机房，当通道门和通道活板门开启后不用钥匙能够将其关闭和锁住，门锁住后不用钥匙能够从机房内将门打开；
            </Text>, {nos:'3.2.1.1(4)',},true,),
        crtOmni('不可进距',{},undefined,
            <Text>(5)对于人员不可进入的机房，从检修门或者检修活板门边缘到检查、维护的任一部件的水平距离不大于0.60m。
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'3.2.1.1(5)',mergNos:'3.2.1.1',mergName:'使用资料'},false,'通往机器空间的通道及门、活板门'),
        crtOmni('空间专用',{seco:'A3.2.1.2',},undefined,
            <Text>(1)检查机器空间是否未用于杂物电梯以外的其他用途。
            </Text>, {nos:'3.2.1.2',},false,'机器空间专用'),
        crtOmni('井道封闭',{seco:'A3.2.1.3',},undefined,
            <Text>(1)检查除必要的开口外是否完全封闭。
            </Text>, {nos:'3.2.1.3',},false,'井道封闭措施'),
        crtOmni('井道畅',{bspan:2,seco:'A3.2.1.4',span:1,},{bspan:7,span:3,},
            <Text>(1)不能向井道内开启；门上装有用钥匙开启的锁，门开启后不用钥匙能够将其关闭和锁住，门锁住后不用钥匙能够从井道内将门打开；
            </Text>, {nos:'3.2.1.4(1)',},true,),
        crtOmni('门电安装',{},undefined,
            <Text>(2)验证门关闭状态的电气安全装置功能有效；
            </Text>, {nos:'3.2.1.4(2)',},true,),
        crtOmni('井警示标',{},undefined,
            <Text>(3)对于人员不可进入的井道，在井道外的检修门或者检修活板门附近有包含“禁止进入杂物电梯井道”文字的警示标志
            </Text>, {nos:'3.2.1.4(3)',mergNos:'3.2.1.4',mergName:'井检修门'},false,'井道上的检修门和检修活板门'),
        crtOmni(undefined,{seco:'A3.2.1.5',span:1,},{span:4,},
            <Text>轿厢、对重(平衡重)之下存在人员能够到达的空间的，检查其是否符合以下要求:
            </Text>, {},true,),
        crtOmni('缓冲器',{},undefined,
            <Text>(1)在轿厢和对重(平衡重)的行程底部极限位置设置缓冲器；
            </Text>, {nos:'3.2.1.5(1)',},true,),
        crtOmni('设安钳',{},undefined,
            <Text>(2)对于电力驱动的杂物电梯或者间接作用式液压驱动杂物电梯，在轿厢、对重(平衡重)上设置安全钳；
            </Text>, {nos:'3.2.1.5(2)',},true,),
        crtOmni('节流阀',{},undefined,
            <Text>(3)对于直接作用式液压驱动杂物电梯，设置安全钳、破裂阀或者节流阀(单向节流阀)。
            </Text>, {nos:'3.2.1.5(3)',mergNos:'3.2.1.5',mergName:'井下防护'},false,'井道下方防护措施'),
    ],'3.2.1.1通往机器通道-3.2.1.5井道下方防护');
    pushOmni(ari,'3.2.1.6',[
        crtOmni(undefined,{bspan:3,seco:'A3.2.1.6',span:1,},{bspan:12,span:3,},
            <Text>人员可以进入井道下部的，检查对重（平衡重）运行的区域是否具有下列防护措施之一：
            </Text>, {},true,),
        crtOmni('刚性隔障',{},undefined,
            <Text>(1)采用刚性隔障防护，该隔障从对重（平衡重）位于最低位置时的最低点延伸到底坑地面以上最小2.00m处，其宽度至少等于对重（平衡重）宽度；
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'3.2.1.6(1)',},true,),
        crtOmni('行程限制',{},undefined,
            <Text>(2)在井道内设置可移动装置，该装置能够将对重（平衡重）的运行行程限制在底坑地面以上不小于 1.80m或者行程允许最大高度处。
            </Text>, {nos:'3.2.1.6(2)',mergNos:'3.2.1.6',mergName:'对重防护'},false,'对重（平衡重）运行区域防护措施'),
        crtOmni(undefined,{seco:'A3.2.1.7',span:1,},{span:4,},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('积水',{},undefined,
            <Text>(1)底坑地面平整，无渗水、积水；
            </Text>, {nos:'3.2.1.7(1)',},true,),
        crtOmni('最低距离',{},undefined,
            <Text>(2)对于人员可进入的井道，井道内设置可移动的装置，当轿厢停在其上面时，该装置保证在底坑地面与轿厢的最低部件之间的自由垂直距离至少为 1.80m或者行程允许最大值；
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'3.2.1.7(2)',},true,),
        crtOmni('停止装',{},undefined,
            <Text>(3)对于人员可进入的井道，底坑内设有在进入底坑时以及在底坑地面上均能够方便操作的停止装置，并且功能有效。
            </Text>, {nos:'3.2.1.7(3)',mergNos:'3.2.1.7',mergName:'底坑'},false,'底坑'),
        crtOmni(undefined,{seco:'A3.2.1.8',span:1,},{span:5,},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('柱塞不触',{},undefined,
            <Text>(1)采用缓冲器或者限位挡块来限制轿厢和对重（平衡重）的下部行程；对于液压驱动杂物电梯，当缓冲器完全压缩或者当轿厢停在限位挡块上时，柱塞不触及缸筒的底座；
            </Text>, {nos:'3.2.1.8(1)',},true,),
        crtOmni('限位挡松',{},undefined,
            <Text>(2)缓冲器或者限位挡块无松动、明显倾斜、断裂、塑性变形、剥落、破损、严重锈蚀等现象；
            </Text>, {nos:'3.2.1.8(2)',},true,),
        crtOmni('柱塞复位',{},undefined,
            <Text>(3)耗能型缓冲器液位正确，验证柱塞复位的电气安全装置功能有效；
            </Text>, {nos:'3.2.1.8(3)',},true,),
        crtOmni('无火花措',{},undefined,
            <Text>(4)防爆杂物电梯的缓冲器与轿厢、对重（平衡重）的撞击面采取的无火花措施保持完好。
            </Text>, {nos:'3.2.1.8(4)',mergNos:'3.2.1.8',mergName:'缓冲器限'},false,'缓冲器或者限位挡块'),
    ],'3.2.1.6对重运行区域-3.2.1.8缓冲器限位挡');
    pushOmni(ari,'3.2.2.1',[
        crtOmni('主开关',{big:'A3.2.2电气设备和驱动主机',bspan:4,seco:'A3.2.2.1',span:1,},{bspan:13,span:1,},
            <Text>(1)检查每台杂物电梯是否单独设有易于直接接近的主开关；机房为多台杂物电梯共用的，检查各主开关的操作机构是否易于识别。
            </Text>, {nos:'3.2.2.1'},false,'主开关'),
        crtOmni('错相保',{seco:'A3.2.2.2',span:1,},{span:1,},
            <Text>(1)检查断相、错相保护功能是否有效；杂物电梯 运行与相序无关时，可以不设错相保护。
            </Text>, {nos:'3.2.2.2'},false,'断相、错相保护功能'),
        crtOmni(undefined,{seco:'A3.2.2.3',span:1,},{span:4,},
            <Text>检查其是否符合以下要求:
            </Text>, {},true,),
        crtOmni('电源',{},undefined,
            <Text>(1)供电电源自进入机器空间起，中性导体(N，零 线)与保护导体(PE，地线)始终分开；
            </Text>, {nos:'3.2.2.3(1)',},true,),
        crtOmni('可靠连接',{},undefined,
            <Text>(2)机器空间的电气设备及线管、线槽的外露可导电部分与保护导体(PE，地线)可靠连接；
            </Text>, {nos:'3.2.2.3(2)',},true,),
        crtOmni('故障立停',{},undefined,
            <Text>(3)含有电气安全装置的电路发生接地故障时，驱动主机立即停止运转，或者在第一次正常停止运转后，能够防止驱动主机再启动；恢复杂物电梯运行只能通过手动复位。
            </Text>, {nos:'3.2.2.3(3)',mergNos:'3.2.2.3',mergName:'接地保护'},false,'接地保护'),
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
    ],'3.2.2.1主开关3.2.2.4防爆电气部件');
    pushOmni(ari,'3.2.2.5',[
        crtOmni(undefined,{bspan:2,seco:'A3.2.2.5',span:1,},{bspan:10,span:5,},
            <Text>对于防爆杂物电梯，检查其防爆电缆是否符合以下要求:
            </Text>, {},true,),
        crtOmni('电缆损伤',{},undefined,
            <Text>(1)电缆上易发生机械损伤的部位采取的保护措施完好；
            </Text>, {nos:'3.2.2.5(1)',},true,),
        crtOmni('浅蓝标',{},undefined,
            <Text>(2)本质安全电路的电缆或者电线以及防护套管在进出位置设置的浅蓝色标识清晰完好；
            </Text>, {nos:'3.2.2.5(2)',},true,),
        crtOmni('密封圈',{},undefined,
            <Text>(3)非本质安全型防爆电气部件的电缆引入装置能够夹紧电缆，其密封措施（弹性密封圈或者填料）完好；
            </Text>, {nos:'3.2.2.5(3)',},true,),
        crtOmni('封堵件',{},undefined,
            <Text>(4)用于封堵非本质安全型防爆电气部件外壳上多余的电缆引入孔的封堵件完好。
            </Text>, {nos:'3.2.2.5(4)',mergNos:'3.2.2.5',mergName:'防爆电缆'},false,'防爆电缆'),
        crtOmni(undefined,{seco:'A3.2.2.6',span:1,},{span:5,},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('轮绳槽',{},undefined,
            <Text>(1)曳引轮绳槽、卷筒绳槽、链轮齿无缺损或者不正常磨损；
            </Text>, {nos:'3.2.2.6(1)',},true,),
        crtOmni('制动器',{},undefined,
            <Text>(2)制动器动作灵活、工作可靠；
            </Text>, {nos:'3.2.2.6(2)',},true,),
        crtOmni('调定压力',{},undefined,
            <Text>(3)通常情况下溢流阀的调定工作压力不超过满载压力的140%，最大不高于满载压力的170%[在此情况下需提供相应的液压管路（包括液压缸）计算说明]；
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'3.2.2.6(3)',},true,),
        crtOmni('温度组',{},undefined,
            <Text>(4)防爆杂物电梯的电动机、减速器、液压泵站、制动部件的外壳以及防爆电气部件外壳的最高表面温度不超过整机防爆标志中的温度组别要求。
            </Text>, {nos:'3.2.2.6(4)',mergNos:'3.2.2.6',mergName:'驱动主机'},false,'驱动主机'),
    ],'3.2.2.5防爆电缆3.2.2.6驱动主机');
    pushOmni(ari,'3.2.3',[
        crtOmni(undefined,{big:'A3.2.3悬挂装置及旋转部件防护',bspan:5,seco:'A3.2.3.1',span:1},{bspan:12,span:4},
            <Text>检查是否符合以下要求：
            </Text>, {},true,),
        crtOmni('钢丝绳',{},undefined,
            <Text>(1)钢丝绳无笼状畸变、绳股挤出、扭结、部分压扁、弯折或者严重锈蚀等达到报废条件的现象；
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
            </Text>, {nos:'3.2.3.2(1)',},true,),
        crtOmni('绳夹',{},undefined,
            <Text>(2)对于强制驱动杂物电梯,采用带模块的压紧装置或者至少用两个绳夹将悬挂装置固定在卷筒上。
            </Text>, {nos:'3.2.3.2(2)',mergNos:'3.2.3.2',mergName:'悬挂端部'},false,'悬挂装置端部固定'),
        crtOmni(undefined,{seco:'A3.2.3.3',span:1},{span:3,},
            <Text>对于强制驱动杂物电梯，检查其是否符合以下要求:
            </Text>, {},true,),
        crtOmni('15圈丝',{},undefined,
            <Text>(1)当轿厢停在完全压缩的绥冲器或者限位挡块上时，卷简的绳槽中至少保留1.5圈的钢丝绳；
            </Text>, {nos:'3.2.3.3(1)',},true,),
        crtOmni('卷绕层',{},undefined,
            <Text>(2)卷筒上只能卷绕一层钢丝绳。
            </Text>, {nos:'3.2.3.3(2)',mergNos:'3.2.3.3',mergName:'绳卷绕'},false,'钢丝绳卷绕'),
        crtOmni('松链保',{seco:'A3.2.3.4',},undefined,
            <Text>(1)对于强制驱动杂物电梯，或者设置了检查悬挂 绳(链)松驰的电气安全装置的间接作用式液压驱动 杂物电梯，检查悬挂绳(链)松驰时，电气安全装置 是否能够防止杂物电梯的正常运行。
            </Text>, {nos:'3.2.3.4',},false,'松绳(链)保护措施'),
        crtOmni('旋转部防',{seco:'A3.2.3.5'},undefined,
            <Text>(1)检查曳引轮、滑轮、链轮、限速器和张紧轮是 否均设有防护装置，以避免人身伤害、钢丝绳（链 条）因松弛而脱离绳槽（链轮）、异物进入钢丝绳
                （链条）与绳槽（链轮）之间，并且防护装置与运 动部件无碰擦。
            </Text>, {nos:'3.2.3.5',},false,'旋转部件防护装置'),
    ],'3.2.3悬挂装置及旋转部件防护');
    pushOmni(ari,'3.2.4',[
        crtOmni('厢尺寸',{big:'A3.2.4轿厢与对重（平衡重）',bspan:4,seco:'A3.2.4.1',span:1},{bspan:9,span:1},
            <Text>(1)检查是否轿底面积不大于1.00m²，轿厢深度不 大于1.00m、高度不大于1.20m。如果轿厢由几个 固定的间隔组成，并且每一间隔高度均符合本条要 求，则轿厢总高度允许大于1.20m。
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'3.2.4.1',},false,'轿厢尺寸'),
        crtOmni('厢铭牌',{seco:'A3.2.4.2',span:1},{span:1},
            <Text>(1)检查轿厢内是否设有铭牌，标明制造单位名称 或者商标、整机防爆标志（适用于防爆杂物电 梯）；改造后的杂物电梯，加贴铭牌上标明改造单
                位名称或者商标、整机防爆标志（适用于防爆杂物 电梯）、改造竣工日期。
            </Text>, {nos:'3.2.4.2',},false,'轿厢内铭牌'),
        crtOmni(undefined,{seco:'A3.2.4.3',span:1},{span:4},
            <Text>对于采用手动开启层门的杂物电梯，检查是否设有表示轿厢在此层站的信号，并且符合以下要求：
            </Text>, {},true,),
        crtOmni('保持开',{},undefined,
            <Text>(1)轿厢停留在该层站期间保持开启；
            </Text>, {nos:'3.2.4.3(1)',},true,),
        crtOmni('自动关',{},undefined,
            <Text>(2)轿厢离开该层站后自动关闭；
            </Text>, {nos:'3.2.4.3(2)',},true,),
        crtOmni('信醒目',{},undefined,
            <Text>(3)醒目并且不被遮挡。
            </Text>, {nos:'3.2.4.3(3)',mergNos:'3.2.4.3',mergName:'厢位指示'},false,'轿厢位置指示信号'),
        crtOmni(undefined,{seco:'A3.2.4.4',span:1},{span:3,},
            <Text>对于允许人员进人轿顶的杂物电梯,检查是否符合以下要求:
            </Text>, {},true,),
        crtOmni('械停止装',{},undefined,
            <Text>(1)轿厢设置机械停止装置以使其停在指定位置上;
            </Text>, {nos:'3.2.4.4(1)',},true,),
        crtOmni('门旁停装',{},undefined,
            <Text>(2)在轿顶上或者井道内每一层门旁设有停止装置。
            </Text>, {nos:'3.2.4.4(2)',mergNos:'3.2.4.4',mergName:'轿厢移动'},false,'防止轿厢移动装置'),
    ],'3.2.4轿厢与对重-3.2.4.4防轿厢移动');
    pushOmni(ari,'3.2.4.5',[
        crtOmni('护脚板',{big:'A3.2.4轿厢与对重（平衡重）',bspan:4,seco:'A3.2.4.5',span:1},{bspan:9,span:1},
            <Text>(1)对于需要在开门的情况下进行再平层的杂物电梯，检查其轿厢地坎下是否设有护脚板，其垂直部 分的高度不小于有效开锁区域的高度，宽度不小于 层站入口宽度。
            </Text>, {nos:'3.2.4.5',},false,'护脚板'),
        crtOmni(undefined,{seco:'A3.2.4.6',span:1},{span:4},
            <Text>对于采用垂直滑动门的杂物电梯，如果其服务位置 与层站等高，并且用固定在层站上的自动搭接地坎 取代护脚板的，检查自动搭接地坎是否符合以下要求：
            </Text>, {},true,),
        crtOmni('层门关',{},undefined,
            <Text>(1)层门开启时自动移动到服务位置，在层门关闭作用下收起；
            </Text>, {nos:'3.2.4.6(1)',},true,),
        crtOmni('厢地坎',{},undefined,
            <Text>(2)宽度不小于轿厢入口宽度，长度不小于开锁区域的1/2加50mm与轿厢地板至层门地坎的距离加 20mm的较大者；
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'3.2.4.6(2)',},true,),
        crtOmni('地板重叠',{},undefined,
            <Text>(3)无论轿厢在何位置，均与轿厢地板有不小于 20mm的重叠。
            </Text>, {nos:'3.2.4.6(3)',mergNos:'3.2.4.6',mergName:'搭接地坎'},false,'自动搭接地坎'),
        crtOmni(undefined,{seco:'A3.2.4.7',span:1},{span:3,},
            <Text>轿厢入口处设有挡板、栅栏、卷帘、轿门等时，检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('入口电安',{},undefined,
            <Text>(1)验证其关闭状态的电气安全装置功能有效；
            </Text>, {nos:'3.2.4.7(1)',},true,),
        crtOmni('入口脱轨',{},undefined,
            <Text>(2)正常运行时无脱轨、机械卡阻或者错位现象。
            </Text>, {nos:'3.2.4.7(2)',mergNos:'3.2.4.7',mergName:'厢入口'},false,'轿厢入口'),
        crtOmni('对重块',{seco:'A3.2.4.8',span:1},{span:1},
            <Text>(1)检查对重（平衡重）块是否无松动、移位等现象。
            </Text>, {nos:'3.2.4.8',},false,'对重（平衡重）块'),
    ],'3.2.4.5护脚板-3.2.4.8对重块');
    pushOmni(ari,'3.2.5.1',[
        crtOmni('门厢隙',{big:'A3.2.5层门与轿门',bspan:5,seco:'A3.2.5.1',span:1},{bspan:7,span:1},
            <Text>(1)在层门全开状态下，测量层门或者层门框架与 轿厢之间的间隙是否不大于35mm。
                <JumpMeasure tag={'Gap'} rep={rep}>附录A 杂物电梯轿厢与层门之间的间隙、门间隙检验记录</JumpMeasure>
            </Text>, {nos:'3.2.5.1',},false,'层门与轿厢的间隙'),
        crtOmni('门间隙',{seco:'A3.2.5.2',},undefined,
            <Text>(1)门关闭后，测量门扇之间及门扇与立柱、门楣 和地坎之间的间隙是否不大于6mm。使用过程中 由于磨损，允许达到10mm。
            </Text>, {nos:'3.2.5.2',},false,'门间隙'),
        crtOmni('再开启保',{seco:'A3.2.5.3',},undefined,
            <Text>(1)检查在自动门关闭过程中，人员或者货物被撞 击或者将被撞击时，保护装置是否能够自动使门重新开启。
            </Text>, {nos:'3.2.5.3',},false,'门再开启保护装置'),
        crtOmni('门运导',{seco:'A3.2.5.4',},undefined,
            <Text>(1)检查层门正常运行时，是否无脱轨、机械卡阻 或者错位现象。
            </Text>, {nos:'3.2.5.4',},false,'门的运行与导向'),
        crtOmni(undefined,{seco:'A3.2.5.5',span:1},{span:3},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('自动关门',{},undefined,
            <Text>(1)在轿门驱动层门的情况下，当轿厢在开锁区域之外时，自动关闭层门装置能够使开启的层门关闭；
            </Text>, {nos:'3.2.5.5(1)',},true,),
        crtOmni('用重块',{},undefined,
            <Text>(2)自动关闭层门装置采用重块的，其防止重块坠落的措施保持有效；对于防爆杂物电梯，无火花措施保持完好。
            </Text>, {nos:'3.2.5.5(2)',mergNos:'3.2.5.5',mergName:'关闭层门'},false,'自动关闭层门装置'),
    ],'3.2.5.1层门轿厢间隙-3.2.5.5自动关层门');
    pushOmni(ari,'3.2.5.6',[
        crtOmni('急开锁',{bspan:3,seco:'A3.2.5.6',span:1},{bspan:6,span:1},
            <Text>(1)检查每个层门是否均能够被专用钥匙从外面开启； 紧急开锁后，在层门闭合时门锁装置是否未保持在开
                锁位置。对于允许按照JG 135—2000《杂物电梯》及 更早期标准生产的杂物电梯、可以仅在端站层门配置 紧急开锁装置。
            </Text>, {nos:'3.2.5.6',},false,'紧急开锁'),
        crtOmni(undefined,{seco:'A3.2.5.7',span:1},{span:4},
            <Text>检查是否符合以下要求：
            </Text>, {},true,),
        crtOmni('重力开锁',{},undefined,
            <Text>(1)每个层门均设有门锁装置，其锁紧动作由重力、永久磁铁或者弹簧来产生和保持，即使永久磁铁或者弹失效，重力也不能导致开锁；
            </Text>, {nos:'3.2.5.7(1)',},true,),
        crtOmni('门电气安',{},undefined,
            <Text>(2)门的锁紧由电气安全装置电气证实，只有在层门锁紧后杂物电梯才能运行；对于同时满足额定速度不大于0.63m/s、开门高度不大于1.20m和层站地坎距地
                面高度不小于0.70m的杂物电梯，门的锁紧可以不由电气装置电气证实，但是当轿厢驶离开锁区域时，锁紧元件能够自动关闭，而且除了正常锁紧位置外，至少有第二个锁紧位置；
            </Text>, {nos:'3.2.5.7(2)',},true,),
        crtOmni('层电气安',{},undefined,
            <Text>(3)每个层门的闭合均由电气安全装置来验证，如果滑动门是由数个间接机械连接的门扇组成，则未被锁住 的门扇上也设有电气安全装置以验证其闭合状态。
            </Text>, {nos:'3.2.5.7(3)',mergNos:'3.2.5.7',mergName:'锁紧闭合'},false,'门的锁紧与闭合'),
        crtOmni('层标识',{seco:'A3.2.5.8',},undefined,
            <Text>(1)检查每个层门或者其附近位置是否标示杂物电梯的额定载重量，并且没有包含"禁止进入轿厢"文字的警示标志。
            </Text>, {nos:'3.2.5.8',},false,'层站标识'),
    ],'3.2.5.7门的锁紧与闭合-3.2.5.8层站标识');
    pushOmni(ari,'3.3.1',[
        crtOmni('限速封记',{big:'A3.3.1轿厢限速器-安全钳试验',bspan:1,seco:'A3.3.1',span:1},{bspan:4,span:4},
            <Text>(1)检查限速器各调节部位封记是否完好，运转时无碰擦、卡阻、转动不灵活等现象，动作正常；
            </Text>, {nos:'3.3.1(1)',},true,),
        crtOmni('绳断裂',{},undefined,
            <Text>(2)检查当限速器绳或者安全绳断裂或者过分伸长时，是否能够通过电气安全装置防止杂物电梯的正常运行；
            </Text>, {nos:'3.3.1(2)',},true,),
        crtOmni('安全钳',{},undefined,
            <Text>(3)检查轿厢上设置的在轿厢安全钳动作以前或者同时使驱动主机停止运转的电气安全装置功能是否有效；
            </Text>, {nos:'3.3.1(3)',},true,),
        crtOmni('下行工况',{},undefined,
            <Text>(4)轿厢空载、额定速度或者检修速度下行的工况进行试验,观察限速器、安全钳动作是否可靠。
            </Text>, {nos:'3.3.1(4)',mergNos:'3.3.1',mergName:'轿限钳试'},false,'轿厢限速器-安全钳试验'),
        crtOmni('对限速封',{big:'A3.3.2对重（平衡重）限速器-安全钳试验',bspan:1,seco:'A3.3.2',span:1},{bspan:3,span:3},
            <Text>(1)检查限速器各调节部位封记是否完好，运转时无碰 擦、卡阻、转动不灵活等现象，动作正常；
            </Text>, {nos:'3.3.2(1)',},true,),
        crtOmni('对绳断裂',{},undefined,
            <Text>(2)检查当限速器绳或者安全绳断裂或者过分伸长时，是否能够通过电气安全装置防止杂物电梯的正常运行；
            </Text>, {nos:'3.3.2(2)',},true,),
        crtOmni('限钳联动',{},undefined,
            <Text>(3)轿厢空载，以额定速度或者检修速度上行，进行限速器-安全钳联动试验；对于采用悬挂装置断裂或者安
                全绳触发的安全钳，轿厢空载，模拟悬挂装置断裂或 者安全绳被触发的状态进行试验，观察限速器、安全钳动作是否可靠。
            </Text>, {nos:'3.3.2(3)',mergNos:'3.3.2',mergName:'对限钳试'},false,'对重（平衡重）限速器-安全钳试验'),
    ],'3.3.1轿厢限速器-安全钳试验-3.3.2对重限钳试验');
    pushOmni(ari,'3.3.3',[
        crtOmni('破阀手动',{big:'A3.3.3破裂阀试验',bspan:1,seco:'A3.3.3',span:1},{bspan:2,span:2},
            <Text>(1)检查破裂阀附近是否标有杂物电梯整机制造单位规定的无需轿厢超载即可使破裂阀达到动作流量的手动操作方法。
            </Text>, {nos:'3.3.3(1)',},true,),
        crtOmni('破阀动作',{},undefined,
            <Text>(2)按照本项（1）所述的方法，轿厢空载下行，观察当达到破裂阀的动作速度时，轿厢是否被可靠制停：
            </Text>, {nos:'3.3.3(2)',mergNos:'3.3.3',mergName:'破裂阀试'},false,'破裂阀试验'),
        crtOmni('沉降试',{big:'A3.3.4 沉降试验',bspan:1,seco:'A3.3.4',},{bspan:1,},
            <Text>(1)对于液压驱动杂物电梯，轿厢内装载额定载重 量的载荷停在上端站，测量10min 内的下沉距离 是否不超过10mm。
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'3.3.4',},false,'沉降试验'),
        crtOmni('制下行',{big:'A3.3.5制动试验',bspan:1,seco:'A3.3.5',span:1},{bspan:2,span:2},
            <Text>(1)轿厢内装载125%额定载重量的载荷，以额定速度下行至行程下部，切断电动机与制动器供电、观察制动器是否能够使驱动主机停止运转，曳引式杂物电梯轿厢是否能够完全停止；
            </Text>, {nos:'3.3.5(1)',},true,),
        crtOmni('制上行',{},undefined,
            <Text>(2)对于曳引式杂物电梯，轿厢空载以额定速度上行至 行程上部，切断电动机与制动器供电，观察轿厢是否 能够完全停止。
            </Text>, {nos:'3.3.5(2)',mergNos:'3.3.5',mergName:'制动试验'},false,'制动试验'),
        crtOmni('运行试',{big:'A3.3.6运行试验',seco:'A3.3.6',},undefined,
            <Text>(1)轿厢空载,以额定速度上、下运行,观察呼梯、楼层 显示等信号系统是否功能有效、指示正确、动作无误,无异常现象发生。
            </Text>, {nos:'3.3.6',},false,'运行试验'),
    ],'3.3.3破裂阀试验-3.3.6运行试验');

    if(!noDefault)  ari=omniCalculateDefault(ari,{iclasDefault:"A", displayDefault:false});
    return { Item: ari, } as { [key: string]: any[] };
};
