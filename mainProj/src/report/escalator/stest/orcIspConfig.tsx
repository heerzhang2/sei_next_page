/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {crtOmni, omniCalculateDefault, pushOmni} from "../../common/omni";
import {JumpMeasure, } from "../../common/general";

export const setupItemAreaRoute= ({rep, orc, theme, noDefault} :{rep:any,orc?:any, theme:any,noDefault?:boolean}
) => {
    let ari: any[] =[];
    pushOmni(ari,'2.1.1',[
        crtOmni(undefined,{big:'A2.1.1使用资料',bspan:1,seco:'A2.1.1',span:1},{bspan:3, span:3, },
            <Text>审查使用单位是否提供以下适用于受检设备的资料：
            </Text>, { },true, ),
        crtOmni('保养说明',{},undefined,
            <Text>(1)电气原理图、安装使用维护保养说明书、检验和检测报告；
            </Text>, {nos:'2.1.1(1)', },true, ),
        crtOmni('保养记录',{},undefined,
            <Text>(2)日常使用状况记录、维护保养记录、运行故障和事故记录。
            </Text>, {nos:'2.1.1(2)', mergNos:'2.1.1',mergName:'使用资料',},false, '使用资料',),
    ],'2.1.1使用资料-2.1.1使用资料');
    pushOmni(ari,'2.2.1.1',[
        crtOmni('机房照明',{big:'A2.2.1机房、驱动站和转向站',bspan:4,seco:'A2.2.1.1',},{bspan:10, },
            <Text>(1)检查桁架内的驱动站、转向站以及机房中是否设有电气照明，分离机房是否设有永久性电气照明。
            </Text>, {nos:'2.2.1.1',},false,'照明'),
        crtOmni(undefined,{seco:'A2.2.1.2',span:1},{ span:3, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('接地',{},undefined,
            <Text>(1)电气设备及线管、线槽的外露可导电部分与保护导体(PE，地线)可靠连接；
            </Text>, {nos:'2.2.1.2(1)', },true, ),
        crtOmni('接地故障',{},undefined,
            <Text>(2)含有电气安全装置的电路发生接地故障时，驱动主机立即停止运转。
            </Text>, {nos:'2.2.1.2(2)', mergNos:'2.2.1.2',mergName:'接地保护',},false, '接地保护措施',),
        crtOmni(undefined,{seco:'*A2.2.1.3',span:1},{ span:4, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('主开设置',{},undefined,
            <Text>(1)能够切断电动机、工作制动器和控制电路的电源，但是不能切断电源插座以及维护和检查所必需的照明电路的电源；
            </Text>, {nos:'2.2.1.3(1)',pre:'*', },true, ),
        crtOmni('主开断开',{},undefined,
            <Text>(2)在断开位置上能够被锁住或者使其处于“隔离”位置；
            </Text>, {nos:'2.2.1.3(2)',pre:'*', },true, ),
        crtOmni('开关识别',{},undefined,
            <Text>(3)多台设备的主开关设置在同一个机器空间内时，各主开关的操作机构易于识别。
            </Text>, {nos:'2.2.1.3(3)',pre:'*', mergNos:'2.2.1.3',mergName:'主开关',},false, '主开关',),
        crtOmni('均设开关',{seco:'*A2.2.1.4',span:1},{ span:2, },
            <Text>(1)检查驱动站和转向站是否均设有停止开关(已经设置了主开关的驱动站除外)。
            </Text>, {nos:'2.2.1.4(1)',pre:'*', },true, ),
        crtOmni('站外设置',{},undefined,
            <Text>(2)驱动装置安装在梯级、踏板或者胶带的载客分支和返回分支之间或者设置在转向站外部的，检查在驱动装置附近是否另设有停止开关。
            </Text>, {nos:'2.2.1.4(2)',pre:'*', mergNos:'2.2.1.4',mergName:'停止开关',},false, '停止开关',),
    ],'2.2.1.1照明-2.2.1.4停止开关');
    pushOmni(ari,'2.2.1.5',[
        crtOmni('旋转防护',{bspan:4,seco:'A2.2.1.5',},{bspan:7, },
            <Text>(1)检查驱动主机的旋转部件、驱动站和转向站的梯级或者踏板转向部分是否设有防护装置和警示标志，以防止人员受到伤害。
            </Text>, {nos:'2.2.1.5',},false,'旋转部件防护措施'),
        crtOmni('制动没松',{seco:'A2.2.1.6',span:1},{ span:2, },
            <Text>(1)检查受检设备启动后而工作制动器没有松开时，电气安全装置是否能够使驱动主机立即停止运行；
            </Text>, {nos:'2.2.1.6(1)', },true, ),
        crtOmni('故障锁定',{},undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.1.6(2)', mergNos:'2.2.1.6',mergName:'制动监测',},false, '工作制动器状态监测功能',),
        crtOmni(undefined,{seco:'A2.2.1.7',span:1},{ span:3, },
            <Text>设有手动盘车装置的，检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('盘车',{},undefined,
            <Text>(1)盘车手轮是平滑和无辐条的，并且在其上或者附近清晰地标出操作说明和运行方向；
            </Text>, {nos:'2.2.1.7(1)', },true, ),
        crtOmni('盘车电安',{},undefined,
            <Text>(2)对于可拆卸式手动盘车装置，设有最迟在该装置连接到驱动主机时起作用的电气安全装置。
            </Text>, {nos:'2.2.1.7(2)', mergNos:'2.2.1.7',mergName:'手动盘车',},false, '手动盘车装置',),
        crtOmni('驱链电安',{seco:'*A2.2.1.8',},undefined,
            <Text>(1)检查当驱动主机驱动链过度松弛和断裂时，电气安全装置是否能够使受检设备自动停止运行，并且能够触发附加制动器动作(设有附加制动器时)。
            </Text>, {nos:'2.2.1.8',pre:'*',},false,'驱动链电气安全装置'),
    ],'2.2.1.5旋转部件防护措施-2.2.1.8驱动链电气安全装置');
    pushOmni(ari,'2.2.1.9',[
        crtOmni(undefined,{bspan:1,seco:'*A2.2.1.9',span:1},{bspan:9, span:9, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('检修插座',{},undefined,
            <Text>(1)在驱动站和转向站内至少提供一个用于便携式检修控制装置连接的检修插座，该插座的设置能够使检修控制装置到达受检设备的任何位置；
            </Text>, {nos:'2.2.1.9(1)',pre:'*', },true, ),
        crtOmni('检停止开',{},undefined,
            <Text>(2)检修控制装置上的停止开关功能有效；
            </Text>, {nos:'2.2.1.9(2)',pre:'*', },true, ),
        crtOmni('方向标识',{},undefined,
            <Text>(3)检修控制装置上的运行方向标识清晰、正确；
            </Text>, {nos:'2.2.1.9(3)',pre:'*', },true, ),
        crtOmni('检修电安',{},undefined,
            <Text>(4)操作检修控制装置时，其他所有启动开关均不起作用，电气安全装置[本附件A2.2.1.6条、A2.2.2.6条第(3)项、A2.2.2.7条第(2)项、A2.2.3.2条、A2.2.4.2条、A2.2.4.3条所述可以除
                外]有效；
            </Text>, {nos:'2.2.1.9(4)',pre:'*', },true, ),
        crtOmni('一个检控',{},undefined,
            <Text>(5)当连接一个以上的检修控制装置时，所有检修控制装置均不起作用。
            </Text>, {nos:'2.2.1.9(5)',pre:'*', },true, ),
        crtOmni(undefined,{},undefined,
            <Text>对于允许按照GB 16899—1997《自动扶梯和自动人行道的制造与安装安全规范》及更早期标准生产的受检设备，检查其是否符合本条(1)～(3)项以及以下要求：
            </Text>, { },true, ),
        //项目编码的，标识 不明确：
        crtOmni('检安开关',{},undefined,
            <Text>(1)操作检修控制装置时，其他所有启动开关均不起作用，安全开关和安全电路仍起作用；
            </Text>, {nos:'2.2.1.9(11)',pre:'*', },true, ),
        crtOmni('检同时启',{},undefined,
            <Text>(2)当连接多个检修控制装置时，或者均不起作用，或者需要同时启动才能起作用。
            </Text>, {nos:'2.2.1.9(12)',pre:'*', mergNos:'2.2.1.9',mergName:'检修控制',},false, '检修控制装置',),
    ],'2.2.1.9检修控制装置');
    pushOmni(ari,'2.2.2.1',[
        crtOmni('梳齿照度',{big:'A2.2.2相邻区域',bspan:4,seco:'A2.2.2.1',},{bspan:7, },
            <Text>(1)测量在楼层板平面的梳齿与踏面相交线位置的照度是否至少为50lx。
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.1',},false,'梳齿与踏面相交线处的照度'),
        crtOmni('出入口',{seco:'A2.2.2.2',},undefined,
            <Text>(1)检查出入口区域是否充分畅通，其宽度至少等于扶手带外缘距离加上每边各80mm，纵深尺寸从扶手装置端部算起至少为2.50m；该区域的宽度不小于扶手带外缘之间距离的2倍加上每边各80mm 时，其纵
                深尺寸允许减少至2.00m。
            </Text>, {nos:'2.2.2.2',},false,'出入口区域'),
        crtOmni(undefined,{seco:'*A2.2.2.3',span:1},{ span:3, },
            <Text>对于人员在出入口可能接触到扶手带的外缘并且引起危险的区域，检查是否设置能够阻止乘客进入该区域的永久固定的防护装置，或者符合以下要求的永久固定的防护装置[对于未按照《电
                梯监督检验和定期检验规则》对出入口防护装置进行过监督检验的，允许只满足下列第(1)项要求]：
            </Text>, { },true, ),
        crtOmni('高出扶带',{},undefined,
            <Text>(1)至少高出扶手带100mm，位于扶手带外缘80mm～120mm处；
            </Text>, {nos:'2.2.2.3(1)',pre:'*', },true, ),
        crtOmni('楼板起高',{},undefined,
            <Text>(2)从楼层板起高度不小于1100mm。
            </Text>, {nos:'2.2.2.3(2)',pre:'*', mergNos:'2.2.2.3',mergName:'出入防护',},false, '出入口防护装置',),
        crtOmni('挡板',{seco:'*A2.2.2.4',span:1},{ span:2, },
            <Text>(1)建筑障碍物会引起人员伤害的，检查是否采取了预防措施。
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.4(1)',pre:'*', },true, ),
        crtOmni('挡板尺寸',{},undefined,
            <Text>(2)受检设备与楼板有交叉或者受检设备之间有交叉的，检查交叉处是否设有垂直固定、无锐利边缘的封闭防护挡板，其位于扶手带上方的防护高度不小于0.30m，并且延伸至扶手带下缘以
                下至少25mm。扶手带外缘与任何障碍物之间的距离不小于400mm的，可以不设置防护挡板。
            </Text>, {nos:'2.2.2.4(2)',pre:'*', mergNos:'2.2.2.4',mergName:'防护挡板',},false, '防护挡板',),
    ],'2.2.2.1梳齿与踏面相交线处的照度-2.2.2.4防护挡板');
    pushOmni(ari,'2.2.2.5',[
        crtOmni(undefined,{bspan:3,seco:'A2.2.2.5',span:1},{bspan:10, span:3, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('带缘距',{},undefined,
            <Text>(1)墙壁或者障碍物与扶手带外缘之间的水平距离不小于80mm，与扶手带下缘的垂直距离不小于25mm；
            </Text>, {nos:'2.2.2.5(1)', },true, ),
        crtOmni('邻近布置',{},undefined,
            <Text>(2)对于邻近布置的受检设备，其扶手带外缘之间的距离不小于160mm。
            </Text>, {nos:'2.2.2.5(2)', mergNos:'2.2.2.5',mergName:'扶手带距',},false, '扶手带距离',),
        crtOmni(undefined,{seco:'*A2.2.2.6',span:1},{ span:4, },
            <Text>对于多台连续并且无中间出口的受检设备，检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('相同输送',{},undefined,
            <Text>(1)具有相同的输送能力并且同方向运行；
            </Text>, {nos:'2.2.2.6(1)',pre:'*', },true, ),
        crtOmni('附加急停',{},undefined,
            <Text>(2)在梯级、踏板或胶带到达梳齿与踏面相交线之前2.00m～3.00m处，设有乘客易于触及的附加紧急停止开关；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.6(2)',pre:'*', },true, ),
        crtOmni('也停止',{},undefined,
            <Text>(3)当其中一台受检设备停止运行时，其他继续运行可能造成人流拥堵的设备也停止运行。
            </Text>, {nos:'2.2.2.6(3)',pre:'*', mergNos:'2.2.2.6',mergName:'连续输送',},false, '连续输送保护',),
        crtOmni(undefined,{seco:'*A2.2.2.7',span:1},{ span:3, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('防倾覆',{},undefined,
            <Text>(1)检修盖板与楼层板的安装和固定能够防止因人员踩踏或者自重作用而导致倾覆、翻转；
            </Text>, {nos:'2.2.2.7(1)',pre:'*', },true, ),
        crtOmni('盖板电安',{},undefined,
            <Text>(2)监测检修盖板和楼层板的电气安全装置能够在移除任何一块检修盖板或者楼层板时动作，机械结构能够保证只能先移除某块检修盖板或者楼层板的，至少在移除该块检修盖板或者楼层板时电气安全装置动作。
            </Text>, {nos:'2.2.2.7(2)',pre:'*', mergNos:'2.2.2.7',mergName:'盖板',},false, '检修盖板与楼层板',),
    ],'2.2.2.5扶手带距离-2.2.2.7检修盖板与楼层板');
    pushOmni(ari,'2.2.2.8',[
        crtOmni(undefined,{bspan:3,seco:'*A2.2.2.8',span:1},{bspan:10, span:4, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('梳齿缺损',{},undefined,
            <Text>(1)梳齿板梳齿完好，无缺损；
            </Text>, {nos:'2.2.2.8(1)',pre:'*', },true, ),
        crtOmni('齿啮合深',{},undefined,
            <Text>(2)梳齿板梳齿与踏面齿槽的啮合深度至少为4mm，梳齿槽根部与踏面的间隙不超过4mm；
            </Text>, {nos:'2.2.2.8(2)',pre:'*', },true, ),
        crtOmni('异物卡',{},undefined,
            <Text>(3)梯级或者踏板进入梳齿板处有异物卡入，并且梳齿与梯级或者踏板不能正常啮合而导致梳齿板与梯级或者踏板发生碰撞时，受检设备能够自动停止运行。
            </Text>, {nos:'2.2.2.8(3)',pre:'*', mergNos:'2.2.2.8',mergName:'梳齿板',},false, '梳齿与梳齿板',),
        crtOmni(undefined,{seco:'*A2.2.2.9',span:1},{ span:3, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('入口开关',{},undefined,
            <Text>(1)受检设备出入口附近设有紧急停止开关，必要时增设附加紧急停止开关，以使紧急停止开关之间的距离不超过30m(适用于自动扶梯)或者40m(适用于自动人行道)；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.2.9(1)',pre:'*', },true, ),
        crtOmni('急停标记',{},undefined,
            <Text>(2)各紧急停止开关标识清晰，对于位于扶手装置高度1/2以下的紧急停止开关，在扶手装置高度1/2以上的醒目位置还设有直径至少为 80mm的红底白字“急停”指示标记，箭头指向该开关。
            </Text>, {nos:'2.2.2.9(2)',pre:'*', mergNos:'2.2.2.9',mergName:'紧急停止',},false, '紧急停止开关',),
        crtOmni(undefined,{seco:'A2.2.2.10',span:1},{ span:3, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('铭牌',{},undefined,
            <Text>(1)在受检设备出入口的明显位置设有产品铭牌，至少标明产品名称、型号、编号、制造单位名称或者商标、制造日期(对于在本规则实施前已经投入使用的受检设备，可以在出入口的明显位
                置设置标有产品型号、编号、制造年份、制造单位名称或者商标的产品标识)；改造后的受检设备，加贴铭牌上标明主要技术参数、改造单位名称或者商标、改造竣工日期；
            </Text>, {nos:'2.2.2.10(1)', },true, ),
        crtOmni('乘用标志',{},undefined,
            <Text>(2)在受检设备出入口附近设有包括必须拉住小孩、必须抱着宠物、必须握住扶手带和禁止使用非专用手推车等内客的安全乘用图形标志。
            </Text>, {nos:'2.2.2.10(2)', mergNos:'2.2.2.10',mergName:'铭牌标志',},false, '铭牌与标志',),
    ],'2.2.2.8梳齿与梳齿板-2.2.2.10铭牌与标志');
    pushOmni(ari,'2.2.3.1',[
        crtOmni(undefined,{big:'A2.2.3扶手装置和围裙板',bspan:5,seco:'*A2.2.3.1',span:1},{bspan:9, span:5, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('扶手龟裂',{},undefined,
            <Text>(1)扶手带完好、表面无龟裂、剥离、严重磨损，扶手带单一开裂处最大裂纹宽度不大于3mm；
            </Text>, {nos:'2.2.3.1(1)',pre:'*', },true, ),
        crtOmni('扶入最低',{},undefined,
            <Text>(2)扶手转向端入口处的最低点与地板之间的垂直距离不小于0.10m，并且不大于0.25m；
            </Text>, {nos:'2.2.3.1(2)',pre:'*', },true, ),
        crtOmni('带光滑',{},undefined,
            <Text>(3)朝向梯级、踏板或者胶带一侧的部分光滑、平齐；装设方向与运行方向不一致的压条或者镶条凸出高度不大于 3mm，其边缘呈圆角或者倒角状；沿运行方向的盖板连接处结构能够防止勾绊；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据和测量结果记录(上)</JumpMeasure>
            </Text>, {nos:'2.2.3.1(3)',pre:'*', },true, ),
        crtOmni('入口保护',{},undefined,
            <Text>(4)扶手带入口保护装置功能有效。
            </Text>, {nos:'2.2.3.1(4)',pre:'*', mergNos:'2.2.3.1',mergName:'扶手带',},false, '扶手装置',),
        crtOmni('带速监测',{seco:'A2.2.3.2',},undefined,
            <Text>(1)检查当扶手带速度与梯级、踏板或者胶带实际速度偏差最大超过15%，并且持续时间在5s～15s范围内时，扶手带速度监测装置是否能够使受检设备自动停止运行。
            </Text>, {nos:'2.2.3.2',},false,'扶手带速度监测装置'),
        crtOmni('防爬',{seco:'*A2.2.3.3',},undefined,
            <Text>(1)人员能够爬上外盖板并且存在跌落风险的，检查在受检设备的外盖板上是否装设了符合以下要求的防爬装置：(1)在位于地平面上方1000mm±50mm处；(2)其高度至少与扶手带表面齐
                平，下部与外盖板相交，平行于外盖板方向上的延伸长度不小于1000mm，并且在此长度范围内无踩脚处。
                <JumpMeasure tag={'Measure2'} rep={rep}>八、观测数据和测量结果记录(下)</JumpMeasure>
            </Text>, {nos:'2.2.3.3',pre:'*',},false,'防爬装置'),
        crtOmni('阻挡装置',{seco:'*A2.2.3.4',},undefined,
            <Text>(1)对于与墙相邻并且外盖板的宽度大于125mm的受检设备，或者相邻平行布置并且共用外盖板的宽度大于125mm 的自动扶梯或者倾斜的自动人行道，检查在上、下端部装设的阻挡装置
                是否能够防止人员进入外盖板区域，并且延伸到高度距离扶手带下缘25mm-150mm处。
            </Text>, {nos:'2.2.3.4',pre:'*',},false,'阻挡装置'),
        crtOmni('防滑装置',{seco:'*A2.2.3.5',},undefined,
            <Text>(1)自动扶梯或者倾斜的自动人行道和相邻的墙之间装有接近扶手带高度的扶手盖板，并且建筑物(墙)和扶手带中心线之间的距离大于300mm时，或者相邻自动扶梯或者倾斜的自动人行道的
                扶手带中心线之间的距离大于400mm时，检查在扶手盖板上装设的防滑行装置是否无锐角或者 锐边，与扶手带的距离不小于100mm，并且防滑行装置之间的间隔距离不大于1800mm，高度不小于20mm。
                <JumpMeasure tag={'Measure2'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.5',pre:'*',},false,'防滑行装置'),
    ],'2.2.3.1扶手装置-2.2.3.5防滑行装置');
    pushOmni(ari,'2.2.3.6',[
        crtOmni('壁板间隙',{bspan:4,seco:'A2.2.3.6',},{bspan:8, },
            <Text>(1)检查护壁板之间的间隙是否不大于4mm，其边缘是否呈圆角或者倒角状。
                <JumpMeasure tag={'Measure2'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.6',},false,'护壁板间隙'),
        crtOmni(undefined,{seco:'*A2.2.3.7',span:1},{ span:3, },
            <Text>检查其是否符合下列要求之一：
            </Text>, { },true, ),
        crtOmni('水平间隙',{},undefined,
            <Text>(1)任何一侧的水平间隙不大于4mm，并且两侧对称位置处的间隙总和不大于7mm；
            </Text>, {nos:'2.2.3.7(1)',pre:'*', },true, ),
        crtOmni('垂直间隙',{},undefined,
            <Text>(2)围裙板设置在踏板之上时，踏板表面与围裙板下端的垂直间隙不大于4mm，踏板侧边与围裙板垂直投影间不产生间隙。
            </Text>, {nos:'2.2.3.7(2)',pre:'*', mergNos:'2.2.3.7',mergName:'踏板间隙',},false, '围裙板与梯级、踏板间隙',),
        crtOmni(undefined,{seco:'A2.2.3.8',span:1},{ span:3, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('围板松动',{},undefined,
            <Text>(1)无松动、缺损等现象；
            </Text>, {nos:'2.2.3.8(1)', },true, ),
        crtOmni('梳齿踏面',{},undefined,
            <Text>(2)端点位于梳齿与踏面相交线前(梯级侧)不小于50mm，但不大于 150mm 的位置。
                <JumpMeasure tag={'Measure2'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.3.8(2)', mergNos:'2.2.3.8',mergName:'围板防夹',},false, '围裙板防夹装置',),
        crtOmni('防夹开关',{seco:'A2.2.3.9',},undefined,
            <Text>(1)对于设有围裙板防夹开关的自动扶梯，检查夹入梯级和围裙板之间的异物最迟到达围裙板防夹开关处时，该开关是否能够有效动作，使自动扶梯在该梯级到达梳齿板前自动停止运行。
            </Text>, {nos:'2.2.3.9',},false,'围裙板防夹开关'),
    ],'2.2.3.6护壁板间隙-2.2.3.9围裙板防夹开关');
    pushOmni(ari,'2.2.4.1',[
        crtOmni(undefined,{big:'A2.2.4梯级、踏板(胶带)及其驱动元件',bspan:6,seco:'A2.2.4.1',span:1},{bspan:12, span:3, },
            <Text>检查其是否符合以下要求：
            </Text>, { },true, ),
        crtOmni('踏板完好',{},undefined,
            <Text>(1)梯级、踏板或者胶带完好，无破损；
            </Text>, {nos:'2.2.4.1(1)', },true, ),
        crtOmni('踏间隙',{},undefined,
            <Text>(2)在工作区段内的任何位置，从踏面测得的两个相邻梯级或者踏板之间的间隙不大于6mm；在自动人行道过渡曲线区段，如果踏板的前缘和相邻踏板的后缘啮合，其间隙允许增至8mm。
                <JumpMeasure tag={'Measure2'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.2.4.1(2)', mergNos:'2.2.4.1',mergName:'梯级踏板',},false, '梯级、踏板(胶带)',),
        crtOmni('下陷设置',{seco:'*A2.2.4.2',span:1},{ span:2, },
            <Text>(1)检查梯级或者踏板下陷导致不再与梳齿啮合时，电气安全装置是否能够使受检设备自动停止运行，并且下陷的梯级或者踏板不会到达梳齿与踏面相交线；
            </Text>, {nos:'2.2.4.2(1)',pre:'*', },true, ),
        crtOmni('下陷障锁',{},undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.2(2)',pre:'*', mergNos:'2.2.4.2',mergName:'下陷保护',},false, '梯级、踏板下陷保护',),
        crtOmni('缺失设置',{seco:'*A2.2.4.3',span:1},{ span:2, },
            <Text>(1)检查由梯级或者踏板缺失而导致的缺口从梳齿板位置出现之前，电气安全装置是否能够使受检设备自动停止运行；
            </Text>, {nos:'2.2.4.3(1)',pre:'*', },true, ),
        crtOmni('缺失障锁',{},undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.3(2)',pre:'*', mergNos:'2.2.4.3',mergName:'缺失保护',},false, '梯级、踏板缺失保护',),
        crtOmni('逆转限制',{seco:'*A2.2.4.4',span:1},{ span:2, },
            <Text>(1)检查梯级、踏板或者胶带改变规定运行方向时，非操纵逆转保护装置是否能够使自动扶梯或者倾斜角不小于6°的自动人行道自动停止运行；
            </Text>, {nos:'2.2.4.4(1)',pre:'*', },true, ),
        crtOmni('逆转障锁',{},undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.4(2)',pre:'*', mergNos:'2.2.4.4',mergName:'逆转保护',},false, '非操纵逆转保护',),
        crtOmni('元件限制',{seco:'*A2.2.4.5',span:1},{ span:2, },
            <Text>(1)检查直接驱动梯级、踏板或者胶带的元件断裂或者过分伸长时，受检设备是否能够自动停止运行；
            </Text>, {nos:'2.2.4.5(1)',pre:'*', },true, ),
        crtOmni('元件障锁',{},undefined,
            <Text>(2)故障锁定功能是否保持有效。
            </Text>, {nos:'2.2.4.5(2)',pre:'*', mergNos:'2.2.4.5',mergName:'元件保护',},false, '驱动元件保护',),
        crtOmni('距离伸缩',{seco:'*A2.2.4.6',},undefined,
            <Text>(1)检查驱动装置与转向装置之间的距离发生过分伸长或者缩短时，受检设备是否能够自动停止运行。
            </Text>, {nos:'2.2.4.6',pre:'*',},false,'距离伸缩保护'),
    ],'2.2.4.1梯级、踏板(胶带)-2.2.4.6距离伸缩保护');
    pushOmni(ari,'2.3.1',[
        crtOmni('方向清晰',{big:'*A2.3.1运行试验',bspan:1,seco:'*A2.3.1',span:1},{bspan:3, span:3, },
            <Text>(1)对于由使用者的进入而自动启动或者加速的受检设备，观察在使用者到达梳齿与踏面相交线之前，受检设备是否已经启动和加速，其运行方向标识是否正确并且清晰可见；
            </Text>, {nos:'2.3.1(1)',pre:'*', },true, ),
        crtOmni('运时不少',{},undefined,
            <Text>(2)对于由使用者的进入而自动启动的受检设备，观察、测量当使用者从预定运行方向进入时，是否经过足够的时间(至少为预期输送时间再加上 10s)才能自动停止运行；当使用者从预定运行方向相反的方向进入
                时，是否仍按照预先确定的方向启动，运行时间不少于10s；
                <JumpMeasure tag={'Measure2'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </Text>, {nos:'2.3.1(2)',pre:'*', },true, ),
        crtOmni('运行平稳',{},undefined,
            <Text>(3)受检设备空载，以正常速度进行两个方向的连续运行，观察其是否运行平稳，无异常碰擦、干涉、松动、抖动和声响。
            </Text>, {nos:'2.3.1(3)',pre:'*', mergNos:'2.3.1',mergName:'运行试验',},false, '运行试验',),
        crtOmni('带速偏差',{big:'扶手带速度偏差',bspan:1,seco:'*A2.3.2',},{bspan:1, },
            <Text>(1)受检设备空载运行，分别测量、计算两个运行方向的扶手带运行速度相对于梯级、踏板或者胶带实际速度的偏差，判断其是否在0～+2%范围内。
                <JumpMeasure tag={'HandrailBias'} rep={rep}>附录A：扶手带运行速度偏差试验</JumpMeasure>
            </Text>, {nos:'2.3.2',pre:'*',},false,'扶手带运行速度偏差试验'),
    ],'2.3.1运行试验-2.3.2扶手带运行速度偏差试验');
    pushOmni(ari,'2.3.3',[
        crtOmni(undefined,{big:'*A2.3.3空载制停距离试验',bspan:1,seco:'*A2.3.3',span:1},{bspan:3, span:3, },
            <Text>进行两个方向的空载制停距离试验，制停距离从用于制停的电气装置被触发时开始测量，测量受检设备的制停距离是否分别符合表A2-1、表A2-2的要求：
            </Text>, { },true, ),
        crtOmni('停距扶梯', {}, undefined,
            <div>
                <div css={{display: 'flex', width: 'max-content', margin: 'auto'}}><Text
                    css={{whiteSpace: 'nowrap'}}>(1)</Text>
                    <Table tight miniw={800}><TableBody>
                        <TableRow><CCell colSpan={2}>表A2-1 自动扶梯制停距离</CCell></TableRow>
                        <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                        <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                        <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                        <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
                    </TableBody></Table>
                </div>
                <JumpMeasure tag={'Measure2'} rep={rep}>八、观测数据和测量结果记录</JumpMeasure>
            </div>,
            {nos: '2.3.3(1)', pre: '*',}, true,),
        crtOmni('停距人行', {}, undefined,
            <div css={{display: 'flex', width: 'max-content', margin: 'auto'}}><Text
                css={{whiteSpace: 'nowrap'}}>(2)</Text>
                <Table tight miniw={800}><TableBody>
                    <TableRow><CCell colSpan={2}>表A2-2 自动人行道制停距离</CCell></TableRow>
                    <TableRow><CCell>名义速度</CCell><CCell>制停距离范围</CCell></TableRow>
                    <TableRow><CCell>0.50m/s</CCell><CCell>0.20m～1.00m</CCell></TableRow>
                    <TableRow><CCell>0.65m/s</CCell><CCell>0.30m～1.30m</CCell></TableRow>
                    <TableRow><CCell>0.75m/s</CCell><CCell>0.40m～1.50m</CCell></TableRow>
                    <TableRow><CCell>0.90m/s</CCell><CCell>0.55m～1.70m</CCell></TableRow>
                </TableBody></Table>
            </div>,
            {nos: '2.3.3(2)', pre: '*', mergNos: '2.3.3', mergName: '制停距离',}, false, '空载制停距离试验',),
        crtOmni('切断电路', {big:'*A2.3.4附加制动器试验',bspan: 1, seco: '*A2.3.4', span: 1}, {bspan: 3, span: 3,},
            <Text>(1)检查在附加制动器动作开始时是否能够强制切断控制电路；
            </Text>, {nos: '2.3.4(1)', pre: '*',}, true,),
        crtOmni('可靠制停', {}, undefined,
            <Text>(2)受检设备空载，在工作制动器松开状态下，下行时触发附加制动器动作，观察附加制动器是否能够使受检设备可靠制停；
            </Text>, {nos: '2.3.4(2)', pre: '*',}, true,),
        crtOmni('两个主机', {}, undefined,
            <Text>(3)如果受检设备设有两个及以上驱动主机，并且采用工作制动器互为附加制动器时，检查每一制动器是否均符合本条第(1)和第(2)项的要求。
            </Text>, {nos: '2.3.4(3)', pre: '*', mergNos: '2.3.4', mergName: '附加制动',}, false, '附加制动器试验',),
    ], '2.3.3空载制停距离试验-2.3.4附加制动器试验');
    pushOmni(ari,'2.4.1',[
        crtOmni(undefined,{big:'2.4 其它',bspan:2,seco:'2.4.1',span:1},{bspan:7, span:3, },
            <Text>公众聚集场所的电梯和住宅小区的自动扶梯和自动人行道，应当配备符合有关规定和标准的视频监控设施
            </Text>, { },true, ),
        crtOmni('监控摄像',{},undefined,
            <Text>（1）设置情况:自动扶梯和自动人行道的出口或入口（需能监控到扶梯和人行道的运行全行程）是否设置视频监控设施，视频监控设施包含摄像头和监控终端;
            </Text>, {nos:'2.4.1(1)',iclas:'', },true, ),
        crtOmni('有人值守',{},undefined,
            <Text>（2）功能功能检查:摄像头拍摄的图像画面能清晰显示在监控终端的显示器或其它显示设备上，显示设备原则上要求安装在有人值守的场所;监控终端应当具有数据存储功能，数据的保存
                期不得少于1个月，所配置的存储设备容量应当满足要求
            </Text>, {nos:'2.4.1(2)',iclas:'', mergNos:'2.4.1',mergName:'视频监控',},false, '视频监控设施',),
        crtOmni(undefined,{seco:'2.4.2',span:1},{ span:4, },
            <Text>自动扶梯和自动人行道应当配备能够实现远程监测功能的装置，并提供标准数据接口
            </Text>, { },true, ),
        crtOmni('监测装置',{},undefined,
            <Text>（1）设置情况:自动扶梯和自动人行道是否设置远程监测装置，是否提供标准数据接口
            </Text>, {nos:'2.4.2(1)',iclas:'', },true, ),
        crtOmni('界面显示',{},undefined,
            <Text>（2）功能检查：现功能检查:现场通过判断远程监测装置的采集方式和现场布置情况，查看标准数据接口是否符合要求，企业监测平台软件界面是否正确显示电梯运行实时数据，是否能够
                正确输出故障信息，并通过模拟故障随机抽查附件所列的部分信息进行验证;
            </Text>, {nos:'2.4.2(2)',iclas:'', },true, ),
        crtOmni('数据传输',{},undefined,
            <Text>（3）数据传输要求:检查电梯远程监测相关数据是否已根据《福建省电梯安全管理条例》要求，接入已具备条件的当地政府端电梯公共服务平台。通过当地市场监管部门授权的公共账户
                或所检电梯维保单位账户，登录当地政府端电梯公共服务平台，查看电梯远程监测的相关数据是否有效接入。
            </Text>, {nos:'2.4.2(3)',iclas:'', mergNos:'2.4.2',mergName:'远程监测',},false, '远程监测装置',),
    ],'2.4.1视频监控设施-2.4.2远程监测装置');

    if (!noDefault) ari = omniCalculateDefault(ari, {iclasDefault: "A", displayDefault: false});
    return {Item: ari,} as { [key: string]: any[] };
};
