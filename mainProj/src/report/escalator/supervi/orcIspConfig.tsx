/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {crtOmni, omniCalculateDefault, pushOmni} from "../../common/omni";
import {JumpMeasure, } from "../../common/general";

/**新的第四种项目列表配置模式： 新的检验项目大列表的配置做法。【特别注意】#span几个参数，最好不要跨越编辑区域去做配置，强制缩小影响波及范围可方便调试和修改。
 * @param noDefault 是否进行这个自动配置补缺的步骤；
 *【特殊部分】orc?._Oitems: 动态，用户自己增加的；
 * */
export const setupItemAreaRoute= ({rep, orc, theme, noDefault} :{rep:any,orc?:any, theme:any,noDefault?:boolean}
) => {
    let ari: any[] =[];
    //【可能问题】前2个项目的：自拆分区域，最原始的记录对于确认日期是按照小项目独立编辑的模式，这里改成统一做法：都只有一个录入日期的做法。 ？sureCB()可以取经？
    pushOmni(ari,'2.1.1',[
        crtOmni(undefined,{big:'A2.1.1 制造资料',bspan:1,seco:'A2.1.1',span:1,},{bspan:9,span:9,},
            <Text>审查制造单位是否提供以下适用于受检设备的资料 (注 A2-1)：
            </Text>, { },true,),
        crtOmni('配置说',{},undefined,
            <Text>(1)配置说明，按照受检设备的实际配置，列明其 产品编号、型号、主要技术参数[包括名义速度、
                名义宽度、倾斜角、提升高度(适用于自动扶梯)、
                使用区段长度(适用于自动人行道)、工作类型、工
                作环境]，驱动主机布置型式和数量、梯路传动方
                式、驱动主机与梯级(踏板或者胶带)之间的连接方
                式、自动人行道踏面类型(踏板或者胶带)，主要部
                件和安全保护装置(注 A2-2)的产品名称、型号、
                编号(除驱动主机、控制柜之外的其他主要部件和
                安全保护装置可以不标注编号而标注制造批次
                号)、制造单位名称、型式试验证书编号、制造日
                期，以及附加制动器的型式、型号与编号；配置说
                明加盖整机制造单位(或者进口自动扶梯、自动人
                行道的国内代理商)公章或者检验专用章，并且注明签发日期；
            </Text>, {nos:'2.1.1(1)',},true,),
        crtOmni('生产许',{},undefined,
            <Text>(2)《特种设备生产许可证》(适用于境内制造单位)；
            </Text>, {nos:'2.1.1(2)',},true,),
        crtOmni('型式证',{},undefined,
            <Text>(3)型式试验证书，包括整机、主要部件和安全保 护装置的型式试验证书；
            </Text>, {nos:'2.1.1(3)',},true,),
        crtOmni('钢玻证',{},undefined,
            <Text>(4)玻璃护壁板的钢化玻璃证明；
            </Text>, {nos:'2.1.1(4)',},true,),
        crtOmni('带强度试',{},undefined,
            <Text>(5)扶手带破断强度试验报告(适用于公共交通型)；
            </Text>, {nos:'2.1.1(5)',},true,),
        crtOmni('安说明书',{},undefined,
            <Text>(6)安装使用维护保养说明书，包括安装、使用、
                维护保养说明(含工作制动器、附加制动器、驱动
                系统、梯路传动系统的检查调整内容)和应急救援说明；
            </Text>, {nos:'2.1.1(6)',},true,),
        crtOmni('质量证',{},undefined,
            <Text>(7)整机质量证明文件，包括整机制造单位的《特
                种设备生产许可证》编号，受检设备的设备品种、
                产品编号、型号、主要技术参数，安装单位的《特
                种设备生产许可证》编号、安装竣工日期、安装地
                点，受检设备符合相关安全技术规范的声明；整机
                质量证明文件加盖整机制造单位(或者进口自动扶
                梯、自动人行道的国内代理商)公章或者检验专用 章，并且注明签发日期。
            </Text>, {nos:'2.1.1(7)',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注 A2-1:提供的制造资料为复印件时，应当加盖整
                机制造单位(或者进口自动扶梯、自动人行道的国
                内代理商)公章或者检验专用章。<br/>
                注 A2-2:主要部件包括驱动主机、控制柜、梯级、
                踏板、梳齿支撑板、楼层板、梯级链、踏板链、滚
                轮，安全保护装置包括含有电子元件的安全电路、
                可编程电子安全相关系统。
            </Text>, {mergNos:'2.1.1',mergName:'制造资料'},false,'制造资料'),
        crtOmni(undefined,{big:'A2.1.2 安装资料',bspan:1,seco:'A2.1.2',span:1,},{bspan:7,span:7,},
            <Text>审查安装单位是否提供以下适用于受检设备的资料(注 A2-3)：
            </Text>, { },true,),
        crtOmni('安许可',{},undefined,
            <Text>(1)安装单位的《特种设备生产许可证》 ；
            </Text>, {nos:'2.1.2(1)',},true,),
        crtOmni('安告知',{},undefined,
            <Text>(2)安装告知证明资料；
            </Text>, {nos:'2.1.2(2)',},true,),
        crtOmni('建筑接',{},undefined,
            <Text>(3)受检设备相关建筑接口符合性声明，表明用于
                安装该设备的驱动站、转向站、分离机房、出入口
                畅通区域等按照相关规定进行了土建交接，并且满
                足相关要求，加盖安装单位公章或者检验专用章；
            </Text>, {nos:'2.1.2(3)',},true,),
        crtOmni('变设计',{},undefined,
            <Text>(4)变更设计证明文件(适用于发生设计变更时)，有
                由使用单位提出、经整机制造单位同意的见证；
            </Text>, {nos:'2.1.2(4)',},true,),
        crtOmni('自检报',{},undefined,
            <Text>(5)安装自检报告，由整机制造单位(或者进口自动
                扶梯、自动人行道的国内代理商)出具或者盖章确认。
            </Text>, {nos:'2.1.2(5)',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注 A2-3:提供的安装资料为复印件时，应当加盖安
                装单位公章或者检验专用章。
            </Text>, {mergNos:'2.1.2',mergName:'安装资料'},false,'安装资料'),
    ],'2.1.1制造资料-2.1.2安装资料');
    pushOmni(ari,'2.1.3',[
        crtOmni(undefined,{big:'A2.1.3 改造或者重大修理资料',bspan:1,seco:'A2.1.3',span:1,},{bspan:10,span:10,},
            <Text>审查改造或者修理单位是否提供以下适用于受检设备的资料：
            </Text>, {},true,),
        crtOmni('使用登',{},undefined,
            <Text>(1)改造或者重大修理受检设备的使用登记证(注 A2-4)；
            </Text>, {nos:'2.1.3(1)'},true,),
        crtOmni('改许可',{},undefined,
            <Text>(2)改造或者修理单位的《特种设备生产许可证》 ；
            </Text>, {nos:'2.1.3(2)'},true,),
        crtOmni('改告知',{},undefined,
            <Text>(3)改造或者重大修理告知证明资料；
            </Text>, {nos:'2.1.3(3)'},true,),
        crtOmni('改方案',{},undefined,
            <Text>(4)改造或者重大修理方案；
            </Text>, {nos:'2.1.3(4)'},true,),
        crtOmni('型试证',{},undefined,
            <Text>(5)加装或者更换的各主要部件和安全保护装置的型式试验证书；
            </Text>, {nos:'2.1.3(5)'},true,),
        crtOmni('增说明',{},undefined,
            <Text>(6)安装使用维护保养说明书(补充件)，根据改造或
                者重大修理情况增补的相关安装、使用、维护保养
                说明和应急救援说明；
            </Text>, {nos:'2.1.3(6)'},true,),
        crtOmni('改自检',{},undefined,
            <Text>(7)改造或者重大修理自检报告；
            </Text>, {nos:'2.1.3(7)'},true,),
        crtOmni('改质量证',{},undefined,
            <Text>(8)改造或者重大修理质量证明文件，包括受检设
                备的设备品种、使用登记证编号、型号、主要技术
                参数，改造或者修理单位的《特种设备生产许可
                证》编号、改造或者重大修理竣工日期，受检设备
                符合相关安全技术规范的声明；改造或者重大修理
                质量证明文件加盖改造或者修理单位公章或者检验
                专用章，并且注明签发日期。
            </Text>, {nos:'2.1.3(8)'},true,),
        crtOmni(undefined,{},undefined,
            <Text>注A 2-4:提供的改造或者重大修理资料为复印件
                时，应当加盖改造或者修理单位公章或者检验专用章。
            </Text>, {mergNos:'2.1.3',mergName:'改造资料'},false,'改造或者重大修理资料'),
        crtOmni(undefined,{big:'A2.1.5技术资料与铭牌（可识别标志）的一致性',bspan:1,seco:'A2.1.5',span:1,},{bspan:3,span:3,},
            <Text>审查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('制造配置',{},undefined,
            <Text>(1)驱动主机、控制柜、含有电子元件的安全电
                路、可编程电子安全相关系统的铭牌或者可识别标
                志(含有电子元件的安全电路、可编程电子安全相
                关系统可以采用可识别标志)上标注的产品型号、
                编号(制造批次号)、制造单位名称或者商标、型式
                试验证书编号(除驱动主机和控制柜之外的其他主
                要部件和安全保护装置可以不标注型式试验证书编
                号)、制造日期与配置说明[见A2.1.1条第(1)项]一致；
            </Text>, {nos:'2.1.5(1)'},true,),
        crtOmni('改造铭牌',{},undefined,
            <Text>(2)驱动主机、控制柜、含有电子元件的安全电
                路、可编程电子安全相关系统的铭牌或者可识别标
                志上标注的内容与相应的型式试验证书内容相符。
                改造、重大修理监督检验时，应当对加装或者更换
                的驱动主机、控制柜、含有电子元件的安全电路、
                可编程电子安全相关系统的铭牌或者可识别标志上
                标注的内容与相应型式试验证书的一致性进行审查。
            </Text>, {nos:'2.1.5(2)',mergNos:'2.1.5',mergName:'铭牌一致'},false,'技术资料与铭牌（可识别标志）的一致性'),
    ],'2.1.3改造修理资料-2.1.5技术资料与铭牌一致性');
    pushOmni(ari,'2.2.1.1',[
        crtOmni('照明',{big:'A2.2.1.1机房、驱动站和转向站',bspan:4,seco:'A2.2.1.1',},{bspan:11,},
            <Text>(1)检查桁架内的驱动站、转向站以及机房中是否
                设有电气照明，分离机房是否设有永久性电气照明。
            </Text>, {nos:'2.2.1.1'},false,'照明'),
        crtOmni(undefined,{seco:'A2.2.1.2',span:1,},{span:4,},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('零地线',{},undefined,
            <Text>(1)供电电源自进入机房或者驱动站、转向站起，
                中性导体(N，零线)与保护导体(PE，地线)始终分开；
            </Text>, {nos:'2.2.1.2(1)',},true,),
        crtOmni('线可靠连',{},undefined,
            <Text>(2)电气设备及线管、线槽的外露可导电部分与保
                护导体(PE，地线)可靠连接；
            </Text>, {nos:'2.2.1.2(2)',},true,),
        crtOmni('接地障',{},undefined,
            <Text>(3)含有电气安全装置的电路发生接地故障时，驱
                动主机立即停止运转。
            </Text>, {nos:'2.2.1.2(3)',mergNos:'2.2.1.2',mergName:'接地保护'},false,'接地保护措施'),
        crtOmni(undefined,{seco:'A2.2.1.3',span:1,},{span:4,},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('不断照明',{},undefined,
            <Text>(1)能够切断电动机、工作制动器和控制电路的电
                源，但是不能切断电源插座以及维护和检查所必需的照明电路的电源；
            </Text>, {nos:'2.2.1.3(1)',},true,),
        crtOmni('断开位置',{},undefined,
            <Text>(2)在断开位置上能够被锁住或者使其处于“隔离”位置；
            </Text>, {nos:'2.2.1.3(2)',},true,),
        crtOmni('开关识别',{},undefined,
            <Text>(3)多台设备的主开关设置在同一个机器空间内
                时，各主开关的操作机构易于识别。
            </Text>, {nos:'2.2.1.3(3)',mergNos:'2.2.1.3',mergName:'主开关'},false,'主开关'),
        crtOmni('设停开关',{seco:'A2.2.1.4',span:1,},{span:2,},
            <Text>(1)检查驱动站和转向站是否均设有停止开关（已经设置了主开关的驱动站除外）。
            </Text>, {nos:'2.2.1.4(1)',},true,),
        crtOmni('另设开关',{},undefined,
            <Text>(2)驱动装置安装在梯级、踏板或者胶带的载客分
                支和返回分支之间或者设置在转向站外部的，检查
                在驱动装置附近是否另设有停止开关。
            </Text>, {nos:'2.2.1.4(2)',mergNos:'2.2.1.4',mergName:'停止开关'},false,'停止开关'),
    ],'2.2.1.1照明-2.2.1.4停止开关');
    pushOmni(ari,'2.2.1.5',[
        crtOmni(undefined,{bspan:3,seco:'A2.2.1.5', span:1},{bspan:8,span:5},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('内站立面',{},undefined,
            <Text>(1)在机房、桁架内部的驱动站和转向站内，具有
                一个无任何永久固定设备的、站立面积足够大的空
                间，站立面积不小于0.30m2，其较短一边的长度不小于0.50m；
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.1.5(1)',},true,),
        crtOmni('立足区',{},undefined,
            <Text>(2)主驱动装置或者工作制动器装在梯级、踏板或
                者胶带的载客分支和返回分支之间时，在工作区段
                具有一个水平的立足区域，其面积不小于
                0.12m2，最小边尺寸不小于0.30m；
            </Text>, {nos:'2.2.1.5(2)',},true,),
        crtOmni('柜净空',{},undefined,
            <Text>(3)在分离机房内的控制柜前有一块净空间，其深
                度不小于0.70m，宽度不小于0.50m 与控制柜全
                宽的较大者，净高度不小于2.00m；
            </Text>, {nos:'2.2.1.5(3)',},true,),
        crtOmni('检净空',{},undefined,
            <Text>(4)在分离机房内对运动部件进行维护和检查以及
                紧急操作的地方有一块不小0.50m×0.60m的水平
                净空间，其净高度不小于2.00m。
            </Text>, {nos:'2.2.1.5(4)',mergNos:'2.2.1.5',mergName:'工作区域'},false,'工作区域'),
        crtOmni('旋转护',{seco:'A2.2.1.6',  },undefined,
            <Text>(1)检查驱动主机的旋转部件、驱动站和转向站的
                梯级或者踏板转向部分是否设有防护装置和警示标志，以防止人员受到伤害。
            </Text>, {nos:'2.2.1.6'},false,'旋转部件防护措施'),
        crtOmni('防爆证',{seco:'A2.2.1.7' },{span:2,},
            <Text>(1)检查受检设备启动后而工作制动器没有松开
                时，电气安全装置是否能够使驱动主机立即停止运行；
            </Text>, {nos:'2.2.1.7(1)',},true,),
        crtOmni('油浸型',{},undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.1.7(2)',mergNos:'2.2.1.7',mergName:'防爆电'},false,'工作制动器状态监测功能'),
    ],'2.2.1.5工作区域-2.2.1.7工作制动器状态监测');
    pushOmni(ari,'2.2.1.8',[
        crtOmni(undefined,{bspan:3,seco:'A2.2.1.8',span:1},{bspan:10,span:3},
            <Text>设有手动盘车装置的，检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('盘车轮',{},undefined,
            <Text>(1)盘车手轮是平滑和无辐条的，并且在其上或者
                附近清晰地标出操作说明和运行方向；
            </Text>, {nos:'2.2.1.8(1)',},true,),
        crtOmni('可拆电安',{},undefined,
            <Text>(2)对于可拆卸式手动盘车装置，设有最迟在该装
                置连接到驱动主机时起作用的电气安全装置。
            </Text>, {nos:'2.2.1.8(2)',mergNos:'2.2.1.8',mergName:'手动盘'},false,'手动盘车装置'),
        crtOmni('驱动电安',{seco:'A2.2.1.9',  },undefined,
            <Text>(1)检查当驱动主机驱动链过度松弛和断裂时，电
                气安全装置是否能够使受检设备自动停止运行，并
                且能够触发附加制动器动作(设有附加制动器时)。
            </Text>, {nos:'2.2.1.9'},false,'驱动链电气安全装置'),
        crtOmni(undefined,{seco:'A2.2.1.10',span:1 },{span:6,},
            <Text>检查其是否符合以下要求：
            </Text>, {},true,),
        crtOmni('检修插',{},undefined,
            <Text>(1)在驱动站和转向站内至少提供一个用于连接便
                携式检修控制装置的检修插座，该插座的设置能够
                使检修控制装置到达受检设备的任何位置；
            </Text>, {nos:'2.2.1.10(1)',},true,),
        crtOmni('检修开关',{},undefined,
            <Text>(2)检修控制装置上的停止开关功能有效；
            </Text>, {nos:'2.2.1.10(2)',},true,),
        crtOmni('方向标识',{},undefined,
            <Text>(3)检修控制装置上的运行方向标识清晰、正确；
            </Text>, {nos:'2.2.1.10(3)',},true,),
        crtOmni('检电安装',{},undefined,
            <Text>(4)操作检修控制装置时，其他所有启动开关均不起作用，电气安全装置[A2.2.1.7条、A2.2.2.7条第
                (3)项、A2.2.2.8条第(2)项、A2.2.3.2条、A2.2.4.2条、A2.2.4.3条所述可以除外]有效；
            </Text>, {nos:'2.2.1.10(4)',},true,),
        crtOmni('多个控制',{},undefined,
            <Text>(5)连接多个检修控制装置时，所有检修控制装置均不起作用。
            </Text>, {nos:'2.2.1.10(5)',mergNos:'2.2.1.10',mergName:'检修控制'},false,'检修控制装置'),
    ],'2.2.1.8手动盘车装置-2.2.1.10检修控制装置');
    pushOmni(ari,'2.2.2.1',[
        crtOmni('梳齿照',{big:'A2.2.2相邻区域',bspan:5,seco:'A2.2.2.1',},{bspan:8,},
            <Text>(1)测量在楼层板平面的梳齿与踏面相交线位置的照度是否至少为50lx。
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.1'},false,'梳齿与踏面相交线处的照度'),
        crtOmni('出入口区',{seco:'A2.2.2.2',  },undefined,
            <Text>(1)检查出入口区域是否充分畅通，其宽度至少等
                于扶手带外缘距离加上每边各80mm，纵深尺寸从
                扶手装置端部算起至少为2.50m；该区域的宽度不
                小于扶手带外缘之间距离的2倍加上每边各80mm
                时，其纵深尺寸允许减少至2.00m。
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.2'},false,'出入口区域'),
        crtOmni(undefined,{seco:'A2.2.2.3',span:1 },{span:3 },
            <Text>对于人员在出入口可能接触到扶手带的外缘并且引起危险的区域，检查是否设置能够阻止乘客进入该
                区域的永久固定的防护装置，或者符合以下要求的永久固定的防护装置：
            </Text>, {},true,),
        crtOmni('高出扶手',{},undefined,
            <Text>(1)至少高出扶手带100mm，位于扶手带外缘 80mm～120mm处；
            </Text>, {nos:'2.2.2.3(1)',},true,),
        crtOmni('板起高',{},undefined,
            <Text>(2)从楼层板起高度不小于1100mm。
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.3(2)',mergNos:'2.2.2.3',mergName:'出入防护'},false,'出入口防护装置'),
        crtOmni('垂净高',{seco:'A2.2.2.4',  },undefined,
            <Text>(1)检查梯级、踏板或者胶带上方的垂直净高度是
                否不小于2.30m，并且该净高度延续到扶手转向端端部。
            </Text>, {nos:'2.2.2.4'},false,'垂直净高度'),
        crtOmni('建筑障防',{seco:'A2.2.2.5',span:1 },{span:2,},
            <Text>(1)建筑障碍物会引起人员伤害的，检查是否采取了预防措施。
            </Text>, {nos:'2.2.2.5(1)',},true,),
        crtOmni('楼板交',{},undefined,
            <Text>(2)受检设备与楼板有交叉或者受检设备之间有交
                叉的，检查交叉处是否设有垂直固定、无锐利边缘
                的封闭防护挡板，其位于扶手带上方的防护高度不
                小于0.30m，并且延伸至扶手带下缘以下至少
                25mm。扶手带外缘与任何障碍物之间的距离不小于400mm的，可以不设置防护挡板。
                <JumpMeasure tag={'Measure'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.5(5)',mergNos:'2.2.2.5',mergName:'防护挡板'},false,'防护挡板'),
     ],'2.2.2.1梳齿与踏面相交线照度-2.2.2.5防护挡板');
     pushOmni(ari,'2.2.2.6',[
        crtOmni(undefined,{bspan:3,seco:'A2.2.2.6',span:1},{bspan:10,span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('墙壁距',{},undefined,
            <Text>(1)墙壁或者障碍物与扶手带外缘之间的水平距离不小于80mm，与扶手带下缘的垂直距离不小于 25mm；
                <JumpMeasure tag={'Measure2'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.6(1)',},true,),
        crtOmni('邻近距',{},undefined,
            <Text>(2)对于邻近布置的受检设备，其扶手带外缘之间的距离不小于160mm。
            </Text>, {nos:'2.2.2.6(2)',mergNos:'2.2.2.6',mergName:'扶手带距'},false,'扶手带距离'),
        crtOmni(undefined,{seco:'A2.2.2.7',span:1},{span:4 },
            <Text>对于多台连续并且无中间出口的受检设备，检查其是否符合以下要求:
            </Text>, { },true,),
        crtOmni('同输送力',{},undefined,
            <Text>(1)具有相同的输送能力并且同方向运行；
            </Text>, {nos:'2.2.2.7(1)',},true,),
        crtOmni('附加急停',{},undefined,
            <Text>(2)在梯级、踏板或者胶带到达梳齿与踏面相交线之前2.00m～3.00m处，设有乘客易于触及的附加紧急停止开关；
                <JumpMeasure tag={'Measure2'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.7(2)',},true,),
        crtOmni('也停止',{},undefined,
            <Text>(3)当其中一台受检设备停止运行时，其他继续运行可能造成人流拥堵的设备也停止运行。
            </Text>, {nos:'2.2.2.7(3)',mergNos:'2.2.2.7',mergName:'连输保护'},false,'连续输送保护'),
        crtOmni(undefined,{seco:'A2.2.2.8',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('盖倾覆',{},undefined,
            <Text>(1)检修盖板与楼层板的安装和固定能够防止因人员踩踏或者自重作用而导致倾覆、翻转；
            </Text>, {nos:'2.2.2.8(1)',},true,),
        crtOmni('移除电安 ',{},undefined,
            <Text>(2)监测检修盖板和楼层板的电气安全装置能够在移除任何一块检修盖板或者楼层板时动作，机械结
                构能够保证只能先移除某块检修盖板或者楼层板的，至少在移除该块检修盖板或者楼层板时电气安
                全装置动作。
            </Text>, {nos:'2.2.2.8(2)',mergNos:'2.2.2.8',mergName:'盖板楼板'},false,'检修盖板与楼层板'),
    ],'2.2.2.6扶手带距离-2.2.2.8检修盖板与楼层板');
    pushOmni(ari,'2.2.2.9',[
        crtOmni(undefined,{bspan:3,seco:'A2.2.2.9',span:1},{bspan:10,span:4 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('梳齿完',{},undefined,
            <Text>(1)梳齿板梳齿完好，无缺损；
            </Text>, {nos:'2.2.2.9(1)',},true,),
        crtOmni('啮合深',{},undefined,
            <Text>(2)梳齿板梳齿与踏面齿槽的啮合深度至少为4mm，梳齿槽根部与踏面的间隙不超过4mm；
                <JumpMeasure tag={'Measure2'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.9(2)',},true,),
        crtOmni('卡自动停',{},undefined,
            <Text>(3)梯级或者踏板进入梳齿板处有异物卡入，并且梳齿与梯级或者踏板不能正常啮合而导致梳齿板与
                梯级或者踏板发生碰撞时，受检设备能够自动停止运行。
            </Text>, {nos:'2.2.2.9(3)',mergNos:'2.2.2.9',mergName:'梳齿板'},false,'梳齿与梳齿板'),
        crtOmni(undefined,{seco:'A2.2.2.10',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('入口附近',{},undefined,
            <Text>(1)受检设备出入口附近设有紧急停止开关，必要时增设附加紧急停止开关，以使紧急停止开关之间
                的距离不超过30m(适用于自动扶梯)或者40m(适用于自动人行道)；
                <JumpMeasure tag={'Measure2'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.10(1)',},true,),
        crtOmni('开关标清',{},undefined,
            <Text>(2)各紧急停止开关标识清晰，对于位于扶手装置高度1/2以下的紧急停止开关，在扶手装置高度
                1/2以上的醒目位置还设有直径至少为80mm的红底白字“急停”指示标记，箭头指向该开关。
            </Text>, {nos:'2.2.2.10(2)',mergNos:'2.2.2.10',mergName:'急停开关'},false,'紧急停止开关'),
        crtOmni(undefined,{seco:'A2.2.2.11',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('产品铭',{},undefined,
            <Text>(1)在受检设备出入口的明显位置设有产品铭牌，至少标明产品名称、型号、编号、制造单位名称或
                者商标、制造日期；改造后的受检设备，加贴铭牌上标明主要技术参数、改造单位名称或者商标、改
                造竣工日期；
            </Text>, {nos:'2.2.2.11(1)',},true,),
        crtOmni('图形标',{},undefined,
            <Text>(2)在受检设备出入口附近设有包括必须拉住小孩、必须抱着宠物、必须握住扶手带和禁止使用非
                专用手推车等内容的安全乘用图形标志。
            </Text>, {nos:'2.2.2.11(2)',mergNos:'2.2.2.11',mergName:'铭牌标'},false,'铭牌与标志'),
    ],'2.2.2.9梳齿与梳齿板-2.2.2.11铭牌与标志');
    pushOmni(ari,'2.2.3.1',[
        crtOmni(undefined,{big:'A2.2.3扶手装置和围裙板',bspan:3,seco:'A2.2.3.1',span:1},{bspan:9,span:5 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('无龟裂',{},undefined,
            <Text>(1)扶手带完好，表面无龟裂、剥离、严重磨损，扶手带单一开裂处最大裂纹宽度不大于3mm；
                <JumpMeasure tag={'Measure2'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.1(1)',},true,),
        crtOmni('转向最低',{},undefined,
            <Text>(2)扶手转向端入口处的最低点与地板之间的垂直距离不小于0.10m，并且不大于0.25 m；
            </Text>, {nos:'2.2.3.1(2)',},true,),
        crtOmni('踏板平齐',{},undefined,
            <Text>(3)朝向梯级、踏板或者胶带一侧的部分光滑、平齐；装设方向与运行方向不一致的压条或者镶条凸
                出高度不大于3mm，其边缘呈圆角或者倒角状；沿运行方向的盖板连接处结构能够防止勾绊；
            </Text>, {nos:'2.2.3.1(3)',},true,),
        crtOmni('入口保护',{},undefined,
            <Text>(4)扶手带入口保护装置功能有效。
            </Text>, {nos:'2.2.3.1(4)',mergNos:'2.2.3.1',mergName:'扶手装'},false,'扶手装置'),
        crtOmni('带速监测',{seco:'A2.2.3.2',},undefined,
            <Text>(1)检查当扶手带速度与梯级、踏板或者胶带实际速度偏差最大超过15%，并且持续时间在5s～15s
                范围内时，扶手带速度监测装置是否能够使受检设备自动停止运行。
            </Text>, {nos:'2.2.3.2',},false,'扶手带速度监测装置'),
        crtOmni(undefined,{seco:'A2.2.3.3',span:1},{span:3 },
            <Text>人员能够爬上外盖板并且存在跌落风险的，检查在受检设备的外盖板上是否装设了符合以下要求的防爬装置：
            </Text>, { },true,),
        crtOmni('地面上方',{},undefined,
            <Text>(1)在位于地平面上方1000mm土50mm处；
                <JumpMeasure tag={'Measure2'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.3(1)',},true,),
        crtOmni('无踩脚处',{},undefined,
            <Text>(2)其高度至少与扶手带表面齐平，下部与外盖板相交，平行于外盖板方向上的延伸长度不小于
                1000mm，并且在此长度范围内无踩脚处。
            </Text>, {nos:'2.2.3.3(2)',mergNos:'2.2.3.3',mergName:'防爬装'},false,'防爬装置'),
    ],'2.2.3.1扶手装置-2.2.3.3防爬装置');
    pushOmni(ari,'2.2.3.4',[
        crtOmni('阻挡装',{bspan:4,seco:'A2.2.3.4', },{bspan:6, },
            <Text>(1)对于与墙相邻并且外盖板的宽度大于125mm的受检设备，或者相邻平行布置并且共用外盖板的宽
                度大于125mm的自动扶梯或者倾斜的自动人行道，检查在上、下端部装设的阻挡装置是否能够防
                止人员进入外盖板区域，并且延伸到高度距离扶手带下缘25mm～150mm处。
                <JumpMeasure tag={'Measure2'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.4',},false,'阻挡装置'),
        crtOmni('防滑行',{seco:'A2.2.3.5',},undefined,
            <Text>(1)自动扶梯或者倾斜的自动人行道和相邻的墙之间装有接近扶手带高度的扶手盖板，并且建筑物
                (墙)和扶手带中心线之间的距离大于300mm时，或者相邻自动扶梯或者倾斜的自动人行道的扶手带
                中心线之间的距离大于400mm时，检查在扶手盖板上装设的防滑行装置是否无锐角或者锐边，与扶
                手带的距离不小于100mm，并且防滑行装置之间的间隔距离不大于1800mm，高度不小于20mm。
                <JumpMeasure tag={'Measure3'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.5',},false,'防滑行装置'),
        crtOmni('护板间',{seco:'A2.2.3.6',},undefined,
            <Text>(1)检查护壁板之间的间隙是否不大于4mm，其边缘是否呈圆角或者倒角状。
            </Text>, {nos:'2.2.3.6',},false,'护壁板间隙'),
        crtOmni(undefined,{seco:'A2.2.3.7',span:1},{span:3 },
            <Text>检查其是否符合下列要求之一：
            </Text>, { },true,),
        crtOmni('水平间',{},undefined,
            <Text>(1)任何一侧的水平间隙不大于4mm，并且两侧对称位置处的间隙总和不大于7mm；
                <JumpMeasure tag={'Measure3'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.7(1)',},true,),
        crtOmni('垂直间',{},undefined,
            <Text>(2)围裙板设置在踏板之上时，踏板表面与围裙板下端的垂直间隙不大于4mm，踏板侧边与围裙板
                垂直投影间不产生间隙。
            </Text>, {nos:'2.2.3.7(2)',mergNos:'2.2.3.7',mergName:'裙板踏间'},false,'围裙板与梯级、踏板间隙'),
    ],'2.2.3.4阻挡装置-2.2.3.7围裙板与梯级、踏板间隙');
    pushOmni(ari,'2.2.3.8',[
        crtOmni('围裙板',{bspan:3,seco:'A2.2.3.8', },{bspan:5, },
            <Text>(1)检查围裙板是否垂直、平滑，板与板之间的接缝是否为对接缝。
            </Text>, {nos:'2.2.3.8',},false,'围裙板'),
        crtOmni(undefined,{seco:'A2.2.3.9',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('围板松',{},undefined,
            <Text>(1)无松动、缺损等现象；
            </Text>, {nos:'2.2.3.9(1)',},true,),
        crtOmni('端点位置',{},undefined,
            <Text>(2)端点位于梳齿与踏面相交线前(梯级侧)不小于50mm，但不大于150mm的位置。
                <JumpMeasure tag={'Measure3'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.9(2)',mergNos:'2.2.3.9',mergName:'围板防夹'},false,'围裙板防夹装置'),
        crtOmni('防夹开关',{seco:'A2.2.3.10',},undefined,
            <Text>(1)对于设有围裙板防夹开关的自动扶梯，检查夹入梯级和围裙板之间的异物最迟到达围裙板防夹开
                关处时，该开关是否能够有效动作，使自动扶梯在该梯级到达梳齿板前自动停止运行。
            </Text>, {nos:'2.2.3.10',},false,'围裙板防夹开关'),
    ],'2.2.3.8围裙板-2.2.3.10围裙板防夹开关');
    //【例外】快消费生成的：2.2.4.1头尾两个纯文本行的: 先按照 sk: 【3，1】预设的，生成之后的代码再人工修改！
    pushOmni(ari,'2.2.4.1',[
        crtOmni(undefined,{big:'A2.2.4梯级、踏板（胶带）及其驱动元件',bspan:3,seco:'A2.2.4.1',span:1},{bspan:8,span:4 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('胶带好',{},undefined,
            <Text>(1)梯级、踏板或者胶带完好，无破损；
            </Text>, {nos:'2.2.4.1(1)',},true,),
        crtOmni('踏板隙',{},undefined,
            <Text>(2)在工作区段内的任何位置，从踏面测得的两个相邻梯级或者踏板之间的间隙不大于6mm；在自
                动人行道过渡曲线区段，如果踏板的前缘和相邻踏板的后缘啮合，其间隙允许增至8mm（注 A2-5）。
                <JumpMeasure tag={'Measure3'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.4.1(2)',},true,),
        crtOmni(undefined,{ },undefined,
            <Text>注A2-5：检验时，至少抽取20%的可见梯级或者踏板测量相应的间隙。
            </Text>, {mergNos:'2.2.4.1',mergName:'踏板胶带'},false,'梯级、踏板（胶带）'),
        crtOmni('下陷梯级',{seco:'A2.2.4.2',span:1},{span:2 },
            <Text>(1)检查梯级或者踏板下陷导致不再与梳齿啮合时，电气安全装置是否能够使受检设备自动停止运
                行，并且下陷的梯级或者踏板不会到达梳齿与踏面相交线；
            </Text>, {nos:'2.2.4.2(1)',},true,),
        crtOmni('故障锁',{ },undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.2(2)',mergNos:'2.2.4.2',mergName:'梯级陷保'},false,'梯级、踏板下陷保护'),
        crtOmni('电安停',{seco:'A2.2.4.3',span:1},{span:2 },
            <Text>(1)检查由梯级或者踏板缺失而导致的缺口从梳齿板位置出现之前，电气安全装置是否能够使受检设
                备自动停止运行；
            </Text>, {nos:'2.2.4.3(1)',},true,),
        crtOmni('缺梯锁',{ },undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.3(2)',mergNos:'2.2.4.3',mergName:'梯级缺保'},false,'梯级、踏板缺失保护'),
    ],'2.2.4.1梯级、踏板（胶带）-2.2.4.3梯级、踏板缺失保护');
    pushOmni(ari,'2.2.4.4',[
        crtOmni('改方向停',{bspan:3,seco:'A2.2.4.4',span:1},{bspan:5,span:2 },
            <Text>(1)检查梯级、踏板或者胶带改变规定运行方向时，非操纵逆转保护装置是否能够使自动扶梯或者
                倾斜角不小于6°的自动人行道自动停止运行；
            </Text>, {nos:'2.2.4.4(1)',},true,),
        crtOmni('逆转锁定',{ },undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.4(2)',mergNos:'2.2.4.4',mergName:'逆转保'},false,'非操纵逆转保护'),
        crtOmni('元件断裂',{seco:'A2.2.4.5',span:1},{span:2 },
            <Text>(1)检查直接驱动梯级、踏板或者胶带的元件断裂或者过分伸长时，受检设备是否能够自动停止运行；
            </Text>, {nos:'2.2.4.5(1)',},true,),
        crtOmni('驱元锁定',{ },undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.5(2)',mergNos:'2.2.4.5',mergName:'驱元件保'},false,'驱动元件保护'),
        crtOmni('伸缩保',{seco:'A2.2.4.6',},undefined,
            <Text>(1)检查驱动装置与转向装置之间的距离发生过分伸长或者缩短时，受检设备是否能够自动停止运行。
            </Text>, {nos:'2.2.4.6',},false,'距离伸缩保护'),
    ],'2.2.4.4非操纵逆转保护-2.2.4.6距离伸缩保护');
    pushOmni(ari,'2.3.1',[
        crtOmni('使用进',{big:'A2.3.1 运行试验',bspan:1,seco:'A2.3.1',span:1},{bspan:3,span:3 },
            <Text>(1)对于由使用者的进入而自动启动或者加速的受检设备，观察在使用者到达梳齿与踏面相交线之
                前，受检设备是否已经启动和加速，其运行方向标识是否正确并且清晰可见；
            </Text>, {nos:'2.3.1(1)',},true,),
        crtOmni('反向进',{},undefined,
            <Text>(2)对于由使用者的进入而自动启动的受检设备，观察、测量当使用者从预定运行方向进入时，是否
                经过足够的时间(至少为预期输送时间再加上10s)才能自动停止运行：当使用者从预定运行方向相反
                的方向进入时，是否仍按照预先确定的方向启动，运行时间不少于10s；
                <JumpMeasure tag={'Measure3'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.3.1(2)',},true,),
        crtOmni('运行稳',{ },undefined,
            <Text>(3)受检设备空载，以正常速度进行两个方向的连续运行，观察其是否运行平稳,无异常碰擦、干
                涉、松动、抖动和声响。
            </Text>, {nos:'2.3.1(3)',mergNos:'2.3.1',mergName:'运行试验'},false,'运行试验'),
        crtOmni('扶带偏差',{big:'A2.3.2扶手带运行速度偏差',seco:'A2.3.2',},undefined,
            <Text>(1)受检设备空载运行，分别测量、计算两个运行方向的扶手带运行速度相对于梯级、踏板或者胶带
                实际速度的偏差，判断其是否在0～+2%范围内
                <JumpMeasure tag={'HandrailBias'} rep={rep}>附录A：空载梯级（踏板、胶带）和扶手带运行速度偏差</JumpMeasure>
            </Text>, {nos:'2.3.2',},false,'扶手带运行速度偏差试验'),
    ],'2.3.1运行试验-2.3.2扶手带运行速度偏差试验');
    pushOmni(ari,'2.3.3',[
        crtOmni(undefined,{big:'A2.3.3 制停距离试验',bspan:1,seco:'A2.3.3',span:1},{bspan:3,span:3 },
            <div><Text>进行制停距离试验时，制停距离从用于制停的电气装置被触发时开始测量。自动扶梯监督检验时，将
                总制动载荷均匀分布在上部2/3的可见梯级上进行下行制停距离试验；自动人行道监督检验时，进行
                两个方向的空载制停距离试验。 测量受检设备的制停距离是否分别符合表A2-1、表A2-2的要求。</Text>
            </div>, { }, true,),
        crtOmni('扶梯停距',{},undefined,
            <div>
                <div css={{display: 'flex',width:'max-content',margin:'auto'}}><Text css={{whiteSpace: 'nowrap'}}>(1)</Text>
                    <Table tight miniw={800}><TableBody>
                        <TableRow><CCell colSpan={2}>表A2-1 自动扶梯制停距离</CCell></TableRow>
                        <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                        <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                        <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                        <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
                    </TableBody></Table>
                </div>
                <JumpMeasure tag={'Measure3'} rep={rep}>七、观测数据和测量结果记录</JumpMeasure>
            </div>, {nos: '2.3.3(1)',}, true,),
        crtOmni('人行停距', {}, undefined,
            <div css={{display: 'flex',width:'max-content',margin:'auto'}}><Text css={{whiteSpace: 'nowrap'}}>(2)</Text>
                <Table tight miniw={800}><TableBody>
                    <TableRow><CCell colSpan={2}>表A2-2 自动人行道制停距离</CCell></TableRow>
                    <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                    <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                    <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                    <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
                    <TableRow><CCell>0.90m/s</CCell><CCell>0.55m～1.70m</CCell></TableRow>
                </TableBody></Table>
           </div>, {nos:'2.3.3(2)',mergNos:'2.3.3',mergName:'制距试验'},false,'制停距离试验'),
        crtOmni('断电路',{big:'A2.3.4 附加制动器试验',seco:'A2.3.4',span:1},{bspan:3, span:3 },
            <Text>(1)检查在附加制动器动作开始时是否能够强制切断控制电路；
            </Text>, {nos:'2.3.4(1)',},true,),
        crtOmni('可靠停',{},undefined,
            <Text>(2)自动扶梯监督检验时，将总制动载荷均匀分布在上部2/3的可见梯级上进行试验；自动人行道监
                督检验时，进行空载试验。在工作制动器松开状态下，受检设备下行时触发附加制动器动作，观察附
                加制动器是否能够使受检设备可靠制停；
            </Text>, {nos:'2.3.4(2)',},true,),
        crtOmni('两驱动主',{ },undefined,
            <Text>(3)如果受检设备设有两个及以上驱动主机，并且采用工作制动器互为附加制动器时,检查每一制动
                器是否均符合本条第(1)和第(2)项的要求。
            </Text>, {nos:'2.3.4(3)',mergNos:'2.3.4',mergName:'附制动试'},false,'附加制动器试验'),
    ],'2.3.3制停距离试验-2.3.4附加制动器试验');

    if(!noDefault)  ari=omniCalculateDefault(ari,{iclasDefault:"A", displayDefault:false});
    return { Item: ari, } as { [key: string]: any[] };
};
