/** @jsxImportSource @emotion/react */
import * as React from "react";
import {CCell, Table, TableBody, TableRow, Text,} from "customize-easy-ui-component";
import {crtOmni, omniCalculateDefault, pushOmni} from "../../common/omni";
import {Link as RouterLink} from "../../../routing/Link";

/**新的第四种项目列表配置模式： 新的检验项目大列表的配置做法。【特别注意】#span几个参数，最好不要跨越编辑区域去做配置，强制缩小影响波及范围可方便调试和修改。
 * @param noDefault 是否进行这个自动配置补缺的步骤；
 * */
export const setupItemAreaRoute= ({verId, repId, theme, noDefault} :{verId:string, repId:string,theme:any,noDefault?:boolean}
) => {
    let ari: any[] =[];
    pushOmni(ari,'1.1',[
        crtOmni(undefined,{big:'1技术资料',bspan:6,seco:'制造资料',span:6},{bspan:8,span:8,tspan:0},
            <Text>电梯制造单位提供了以下用中文描述的出厂随机文件：
            </Text>, {nos:'1.1',iclas:'A'},true,),
        crtOmni('制造许可',{},undefined,
            <Text>（1）制造许可证明文件，许可范围能够覆盖受检电梯的相应参数；
            </Text>, {nos:'1.1(1)',},true,'(1)制造许可证明文件'),
        crtOmni('型试书',{},undefined,
            <Text>（2）电梯整机型式试验证书，其参数范围和配置表适用于受检电梯；
            </Text>, {nos:'1.1(2)'},true,'(2)整机型式试验证书'),
        crtOmni('质量文',{},undefined,
            <Text>（3）产品质量证明文件，注有制造许可证明文件编号、产品编号、主要技术参数，限速器、安全钳、缓冲器、含有电子元件的安全电路(如果有)、可编程电子安全相关系统(如果有)、轿厢上行超速保护装置(如果有)、轿厢意外移动
                保护装置、驱动主机、控制柜的型号和编号，门锁装置、层门和玻璃轿门(如果有)的型号，以及悬挂装置的名称、型号、主要参数(如直径、数量)，并且有电梯整机制造单位的公章或者检验专用章以及制造日期；
            </Text>, {nos:'1.1(3)',},true,'(3)产品质量证明文件'),
        crtOmni('安全资料',{},undefined,
            <Text>（4）门锁装置、限速器、安全钳、缓冲器、含有电子元件的安全电路(如果有)、可编程电子安全相关系统(如果有)、轿厢上行超速保护装置(如果有)、轿厢意外移动保护装置、驱动主机、控制柜、层门和玻璃轿门(如果有)的型式试验证书，
                以及限速器和渐进式安全钳的调试证书；
            </Text>, {nos:'1.1(4)'},true,'(4)安全保护装置、主要部件型式试验证书及有关资料'),
        crtOmni('原理图',{},undefined,
            <Text>（5）电气原理图，包括动力电路和连接电气安全装置的电路；
            </Text>, {nos:'1.1(5)'},true,'(5)电气原理图'),
        crtOmni('说明书',{},undefined,
            <Text>（6）安装使用维护说明书，包括安装、使用、日常维护保养和应急救援等方面操作说明的内容。
            </Text>, {nos:'1.1(6)'},true,'(6)安装使用维护说明书'),
        crtOmni(undefined,{},undefined,
            <Text>注A-1：上述文件如为复印件则必须经电梯整机制造单位加盖公章或者检验专用章；对于进口电梯，则应当加盖国内代理商的公章或者检验专用章。
            </Text>, {mergNos:'1.1',mergName:'制造资料',display:true,},false,),
        crtOmni(undefined,{bspan:6,seco:'安装资料',span:6},{bspan:8,span:8},
            <Text>安装单位提供了以下安装资料：
            </Text>, {nos:'1.2',iclas:'A'},true,),
        crtOmni('告知书',{},undefined,
            <Text>（1）安装许可证明文件和安装告知书，许可证范围能够覆盖受检电梯的相应参数；
            </Text>, {nos:'1.2(1)'},true,'(1)安装许可证明文件和告知书'),
        crtOmni('施工案',{},undefined,
            <Text>（2）施工方案，审批手续齐全；
            </Text>, {nos:'1.2(2)'},true,'(2)施工方案'),
        crtOmni('勘测图',{},undefined,
            <Text>（3）用于安装该电梯的机房(机器设备间)、井道的布置图或者土建工程勘测图，有安装单位确认符合要求的声明和公章或者检验专用章，表明其通道、通道门、井道顶部空间、底坑空间、楼层间距、井道内防护、安全距离、井道下方人可以
                到达的空间等满足安全要求；
            </Text>, {nos:'1.2(3)'},true,'(3)机房(机器设备间)和井道布置图或者勘测图'),
        crtOmni('自检报',{},undefined,
            <Text>（4）施工过程记录和自检报告，检查和试验项目齐全、内容完整，施工和验收手续齐全；
            </Text>, {nos:'1.2(4)'},true,'(4)施工过程记录和自检报告'),
        crtOmni('设计证明',{},undefined,
            <Text>（5）变更设计证明文件（如安装中变更设计时），履行了由使用单位提出、经电梯整机制造单位同意的程序；
            </Text>, {nos:'1.2(5)'},true,'(5)变更设计证明文件'),
        crtOmni('安装质量',{},undefined,
            <Text>（6）安装质量证明文件，包括电梯安装合同编号、安装单位安装许可证明文件编号、产品编号、主要技术参数等内容，并且有安装单位公章或者检验合格章以及竣工日期。
            </Text>, {nos:'1.2(6)'},true,'(6)安装质量证明文件'),
        crtOmni(undefined,{},undefined,
            <Text>注A-2：上述文件如为复印件则必须经安装单位加盖公章或或者检验专用章
            </Text>, {mergNos:'1.2',mergName:'安装资料',display:true,},false,),
    ],'1.1制造资料-1.2安装资料');
    pushOmni(ari,'1.3',[
        crtOmni(undefined,{bspan:7,seco:'改造、重大修理资料',span:7},{bspan:9,span:9},
            <Text>改造或者重大修理单位提供了以下改造或者重大修理资料：
            </Text>, {nos:'1.3',iclas:'A'},true,),
        crtOmni('告知书改',{},undefined,
            <Text>（1）改造或者修理许可证和改造或者重大修理告知书，许可证范围能够覆盖受检电梯的相应参数；
            </Text>, {nos:'1.3(1)',},true,'(1)改造(修理)许可证明文件和告知书'),
        crtOmni('施工案改',{},undefined,
            <Text>（2）改造或者重大修理的清单以及施工方案，施工方案的审批手续齐全；
            </Text>, {nos:'1.3(2)'},true,'(2)改造(重大修理)清单和施工方案'),
        crtOmni('型试书改',{},undefined,
            <Text>（3）加装或者更换的安全保护装置或者主要部件产品质量证明文件、型式试验证书以及限速器和渐进式安全钳的调试证书(如发生更换)；
            </Text>, {nos:'1.3(3)'},true,'(3)加装、更换的安全保护装置、主要部件的型式试验证书及有关资料'),
        crtOmni('节能资料',{},undefined,
            <Text>（4）拟加装的自动救援操作装置、能量回馈节能装置、IC卡系统的下述资料(属于重大修理时)： ①加装方案(含电气原理图和接线图)； ②产品质量证明文件，标明产品型号、产品编号、主要技术参数，并且有产品制造单位的
                公章或者检验专用章以及制造日期； ③安装使用维护说明书，包括安装、使用、日常维护保养以及与应急救援操作方面有关的说明。
            </Text>, {nos:'1.3(4)'},true,'(4)自动救援操作装置、能量回馈节能装置、IC卡系统的资料'),
        crtOmni('施作人证',{},undefined,
            <Text>（5）施工现场作业人员持有的特种设备作业人员证；
            </Text>, {nos:'1.3(5)'},true,'(5)特种设备作业人员证'),
        crtOmni('自检报改',{},undefined,
            <Text>（6）施工过程记录和自检报告，检查和试验项目齐全、内容完整，施工和验收手续齐全；
            </Text>, {nos:'1.3(6)'},true,'(6)施工过程记录和自检报告'),
        crtOmni('质量文改',{},undefined,
            <Text>（7）改造或者重大修理质量证明文件，包括电梯的改造或者重大修理合同编号、改造或者重大修理单位的许可证明文件编号、电梯使用登记编号、主要技术参数等内容，并且有改造或者重大修理单位的公章或者检验专用章以及竣工日期。
            </Text>, {nos:'1.3(7)'},true,'(7)改造(重大修理)质量证明文件'),
        crtOmni(undefined,{},undefined,
            <Text>注A-3：上述文件如为复印件则必须经改造或者重大修理单位加盖公章或者检验专用章。
            </Text>, {mergNos:'1.3',mergName:'改修资料',display:true,},false),
        crtOmni(undefined,{bspan:5,seco:'使用资料',span:5},{bspan:6,span:6},
            <Text>使用单位提供了以下资料：
            </Text>, {nos:'1.4',iclas:'B'},true,),
        crtOmni('使用登记',{},undefined,
            <Text>（1）使用登记资料，内容与实物相符；
            </Text>, {nos:'1.4(1)',},true,'(1)使用登记资料'),
        crtOmni('技术档案',{},undefined,
            <Text>（2）安全技术档案，至少包括1.1、1.2、1.3所述文件资料[1.3(5)除外]，以及监督检验报告、定期检验报告、日常检查与使用状况记录、日常维护保养记录、年度自行检查记录或者报告、应急救援演习记录、运行故障和事故记录等，保存
                完好（本规则实施前已经完成安装、改造或重大修理的，1.1、1.2、1.3项所述文件资料如有缺陷，应当由使用单位联系相关单位予以完善，可不作为本项审核结论的否决内容）；
            </Text>, {nos:'1.4(2)',},true,'(2)安全技术档案'),
        crtOmni('管理规章',{},undefined,
            <Text>（3）以岗位责任制为核心的电梯运行管理规章制度，包括事故与故障的应急措施和救援预案、电梯钥匙使用管理制度等；
            </Text>, {nos:'1.4(3)',},true,'(3)管理规章制度'),
        crtOmni('保养合同',{},undefined,
            <Text>（4）与取得相应资质单位签订的日常维护保养合同；
            </Text>, {nos:'1.4(4)',},true,'(4)日常维护保养合同'),
        crtOmni('作业人证',{},undefined,
            <Text>（5）按照规定配备的电梯安全管理人员的特种设备作业人员证。
            </Text>, {nos:'1.4(5)',mergNos:'1.4',mergName:'使用资料',display:true,},false,'(5)特种设备作业人员证'),
    ],'1.3改造、重大修理资料-1.4使用资料');
    pushOmni(ari,'2.1',[
        crtOmni('通道设置',{big:'2机房（机器设备间）及相关设备',bspan:5,seco:'通道与通道门',span:2},undefined,
            <Text>（1）应当在任何情况下均能够安全方便地使用通道。采用梯子作为通道时，必须符合以下条件： ①通往机房(机器设备间)的通道不应当高出楼梯所到平面4m； ②梯子必须固定在通道上而不能被移动； ③梯子高度超过1.50m时，
                其与水平方向的夹角应当在65°～75°之间，并不易滑动或者翻转； ④靠近梯子顶端应当设置容易握住的把手。
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Measure`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>八、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {nos:'2.1(1)',},true,'(1)通道设置'),
        crtOmni('通道照明',{},undefined,
            <Text>（2）通道应当设置永久性电气照明
            </Text>, {nos:'2.1(2)',mergNos:'2.1',mergName:'与通道门',display:true,},false,'(2)通道照明','2通道照明'),
        crtOmni('房专用',{span:0},{seco:'机房（机器设备间）专用',span:1},
            <Text>（1）机房（机器设备间）应当专用，不得用于电梯以外的其他用途
            </Text>, {nos:'2.2',},false,'机房(机器设备间)专用','机房专用'),
        crtOmni('柜前净空',{seco:'安全空间',span:2},undefined,
            <Text>（1）在控制柜前有一块净空面积，其深度不小于0.70m，宽度为0.50 m或者控制柜全宽（两者中的大值），净高度不小于2m；
            </Text>, {nos:'2.3(1)',},true,'(1)控制柜前的净空面积'),
        crtOmni('净空维修',{},undefined,
            <Text>（2）对运动部件进行维修和检查以及紧急操作的地方有一块不小于0.50m×0.60m的水平净空面积，其净高度不小于2m
            </Text>, {nos:'2.3(2)',mergNos:'2.3',mergName:'安全空间',display:true,},false,'(2)维修、操作处的净空面积','操作的净空面积'),
    ],'2.1通道与通道门-2.3安全空间');
    pushOmni(ari,'2.5',[
        crtOmni('照明开',{bspan:10,seco:'照明与插座',span:3},undefined,
            <Text>（1）机房(机器设备间)设有永久性电气照明；在靠近入口(或者多个入口)处的适当高度设置一个开关，控制机房(机器设备间)照明；
            </Text>, {nos:'2.5(1)',},true,'(1)照明、照明开关'),
        crtOmni('电插座',{},undefined,
            <Text>（2）机房应当至少设置一个2P＋PE型电源插座；
            </Text>, {nos:'2.5(2)'},true,'(2)电源插座',),
        crtOmni('轿厢照',{},undefined,
            <Text>（3）应当在主开关旁设置控制井道照明、轿厢照明和插座电路电源的开关
            </Text>, {nos:'2.5(3)',mergNos:'2.5',mergName:'与插座',display:true,},false,'(3)井道、轿厢照明和插座电源开关',),
        crtOmni('开关设',{seco:'主开关',span:3},undefined,
            <Text>（1）每台电梯应当单独装设主开关，主开关应当易于接近和操作；无机房电梯主开关的设置还应当符合以下要求： ①如果控制柜不是安装在井道内，主开关应当安装在控制柜内，如果控制柜安装在井道内，主开关应当设置在紧急操作屏上； ②如果
                从控制柜处不容易直接操作主开关，该控制柜应当设置能分断主电源的断路器； ③在电梯驱动主机附近1m之内，应当有可以接近的主开关或者符合要求的停止装置，且能够方便地进行操作。
            </Text>, {nos:'2.6(1)',iclas:'B'},true,'(1)主开关设置'),
        crtOmni('照明控制',{},undefined,
            <Text>（2）主开关不得切断轿厢照明和通风、机房（机器设备间）照明和电源插座、轿顶与底坑的电源插座、电梯井道照明、报警装置的供电电路；
            </Text>, {nos:'2.6(2)'},true,'(2)与照明等电路的控制关系',),
        crtOmni('误操作',{},undefined,
            <Text>（3）主开关应当具有稳定的断开和闭合位置，并且在断开位置时能用挂锁或其他等效装置锁住，能够有效的防止误操作
            </Text>, {nos:'2.6(3)',mergNos:'2.6',mergName:'主开关',display:true,},false,'(3)防止误操作装置','防误操作的装置'),
        crtOmni('铭牌驱动',{seco:'驱动主机',span:4},undefined,
            <Text>（1）驱动主机上设有铭牌，标明制造单位名称、型号、编号、技术参数和型式试验机构的名称或者标志，铭牌和型式试验证书内容相符；
            </Text>, {nos:'2.7(1)',iclas:'B'},true,'(1)铭牌'),
        crtOmni('主机工况',{},undefined,
            <Text>（2）驱动主机工作时无异常噪声和振动；
            </Text>, {nos:'2.7(2)'},true,'(2)工作状况',),
        crtOmni('轮槽磨',{},undefined,
            <Text>（3）曳引轮轮槽不得有缺损或者不正常磨损；如果轮槽的磨损可能影响曳引能力时，进行曳引能力验证试验；
            </Text>, {nos:'2.7(3)'},true,'(3)轮槽磨损',),
        crtOmni('制动器情',{},undefined,
            <Text>（4）制动器动作灵活，制动时制动闸瓦(制动钳)紧密、均匀地贴合在制动轮(制动盘)上，电梯运行时制动闸瓦(制动钳)与制动轮(制动盘)不发生摩擦，制动闸瓦(制动钳)以及制动轮(制动盘)工作面上没有油污
            </Text>, {nos:'2.7(4)',mergNos:'2.7',mergName:'驱动主机',display:true,},false,'(4)制动器动作情况','2.7(4)制动器动作'),
    ],'2.5照明与插座-2.7驱动主机');
    pushOmni(ari,'2.8',[
        crtOmni('铭牌柜',{bspan:11,seco:'控制柜、紧急操作和动态测试装置',span:11},undefined,
            <Text>（1）控制柜上设有铭牌，标明制造单位名称、型号、编号、技术参数和型式试验机构的名称或者标志，铭牌和型式试验证书内容相符；
            </Text>, {nos:'2.8(1)',iclas:'B'},true,'(1)铭牌'),
        crtOmni('断错相',{},undefined,
            <Text>（2）断相、错相保护功能有效，电梯运行与相序无关时，可以不设错相保护；
            </Text>, {nos:'2.8(2)'},true,'(2)断错相保护',),
        crtOmni('制动电气',{},undefined,
            <Text>（3）电梯正常运行时，切断制动器电流至少用两个独立的电气装置来实现，当电梯停止时，如果其中一个接触器的主触点未打开，最迟到下一次运行方向改变时，应当防止电梯再运行；
            </Text>, {nos:'2.8(3)'},true,'(3)制动器电气装置设置',),
        crtOmni('紧急电',{},undefined,
            <Text>（4）紧急电动运行装置应当符合以下要求： ①依靠持续揿压按钮来控制轿厢运行，此按钮有防止误操作的保护，按钮上或者其近旁标出相应的运行方向； ②一旦进入检修运行，紧急电动运行装置控制轿厢运行的功能由检修控制装置所取代；
                ③进行紧急电动运行操作时，易于观察到轿厢是否在开锁区
            </Text>, {nos:'2.8(4)'},true,'(4)紧急电动运行装置',),
        crtOmni('急动态测',{},undefined,
            <Text>（5）无机房电梯的紧急操作和动态测试装置应当符合以下要求： ①在任何情况下均能够安全方便地从井道外接近和操作该装置； ②能够直接或者通过显示装置观察到轿厢的运动方向、速度以及是否位于开锁区； ③装置上设有永久性照明和照明开关；
                ④装置上设有停止装置或者主开关；
            </Text>, {nos:'2.8(5)'},true,'(5)紧急操作和动态测试装置',),
        crtOmni('旁路装',{},undefined,
            <Text>（6）层门和轿门旁路装置应当符合以下要求： ①在层门和轿门旁路装置上或者其附近标明‘旁路’字样，并且标明旁路装置的‘旁路’状态或者‘关’状态； ②旁路时取消正常运行(包括动力操作的自动门的任何运行)；只有在检修运行或者紧急电动运行
                状态下，轿厢才能够运行；运行期间，轿厢上的听觉信号和轿底的闪烁灯起作用； ③能够旁路层门关闭触点、层门门锁触点、轿门关闭触点、轿门门锁触点；不能同时旁路层门和轿门的触点；对于手动层门，不能同时旁路层门关闭触点和层门门锁触点；
                ④提供独立的监控信号证实轿门处于关闭位置；
            </Text>, {nos:'2.8(6)'},true,'(6)层门和轿门旁路装置',),
        crtOmni('门回路',{},undefined,
            <Text>（7）应当具有门回路检测功能，当轿厢在开锁区域内、轿门开启并且层门门锁释放时，监测检查轿门关闭位置的电气安全装置、检查层门门锁锁紧位置的电气安全装置和轿门监控信号的正确动作；如果监测到上述装置的故障，能够防止电梯的正常运行；
            </Text>, {nos:'2.8(7)'},true,'(7)门回路检测功能',),
        crtOmni('制动故障',{},undefined,
            <Text>（8）应当具有制动器故障保护功能，当监测到制动器的提起(或者释放)失效时，能够防止电梯的正常启动；
            </Text>, {nos:'2.8(8)'},true,'(8)制动器故障保护',),
        crtOmni('救援装',{},undefined,
            <Text>（9）自动救援操作装置(如果有)应当符合以下要求： ①设有铭牌，标明制造单位名称、产品型号、产品编号、主要技术参数；加装的自动救援操作装置的铭牌和该装置的产品质量证明文件相符； ②在外电网断电至少等待3s后自动投入救援运行，电梯
                自动平层并且开门； ③当电梯处于检修运行、紧急电动运行、电气安全装置动作或者主开关断开时，不得投入救援运行； ④设有一个非自动复位的开关，当该开关处于关闭状态时，该装置不能启动救援运行；
            </Text>, {nos:'2.8(9)'},true,'(9)自动救援操作装置',),
        crtOmni('节能装',{},undefined,
            <Text>（10） 加装的分体式能量回馈节能装置应当设有铭牌，标明制造单位名称、产品型号、产品编号、主要技术参数，铭牌和该装置的产品质量证明文件相符；
            </Text>, {nos:'2.8(10)'},true,'(10)分体式能量回馈节能装置',),
        crtOmni('IC卡',{},undefined,
            <Text>（11）加装的IC卡系统应当设有铭牌，标明制造单位名称、产品型号、产品编号、主要技术参数，铭牌和该系统的产品质量证明文件相符
            </Text>, {nos:'2.8(11)',mergNos:'2.8',mergName:'控制柜',display:true,},false,'(11)IC卡系统','2.8(11)IC卡系统'),
    ],'2.8控制柜、紧急操作和动态测试装置');
    pushOmni(ari,'2.9',[
        crtOmni('铭牌限速',{bspan:7,seco:'限速器',span:4},undefined,
            <Text>（1）限速器上设有铭牌，标明制造单位名称、型号、编号、技术参数和型式试验机构的名称或者标志，铭牌和型式试验证书、调试证书内容相符，并且铭牌上标注的限速器动作速度与受检电梯相适应
            </Text>, {nos:'2.9(1)',iclas:'B'},true,'(1)铭牌'),
        crtOmni('电气安全',{},undefined,
            <Text>（2）限速器或者其他装置上设有在轿厢上行或者下行速度达到限速器动作速度之前动作的电气安全装置，以及验证限速器复位状态的电气安全装置
            </Text>, {nos:'2.9(2)',},true,'(2)电气安全装置'),
        crtOmni('封记',{},undefined,
            <Text>（3）限速器各调节部位封记完好，运转时不得出现碰擦、卡阻、转动不灵活等现象，动作正常
            </Text>, {nos:'2.9(3)',},true,'(3)封记及运转情况'),
        crtOmni('速度校验',{},undefined,
            <Text>（4）受检电梯的维护保养单位应当每2年(对于使用年限不超过15年的限速器)或者每年(对于使用年限超过15年的限速器)进行一次限速器动作速度校验，校验结果应当符合要求
            </Text>, {nos:'2.9(4)',mergNos:'2.9',mergName:'限速器',display:true,},false,'(4)动作速度校验',),
        crtOmni('中性导',{seco:'接地',span:2},undefined,
            <Text>（1）供电电源自进入机房（机器设备间）起，中性导体（N，零线）与保护导体（PE，地线）应当始终分开；
            </Text>, {nos:'2.10(1)',},true,'(1)中性导体与保护导体的设置'),
        crtOmni('接地连接',{},undefined,
            <Text>（2）所有电气设备及线管、线槽的外露可以导电部分应当与保护导体（PE，地线）可靠连接
            </Text>, {nos:'2.10(2)',mergNos:'2.10',mergName:'接地',display:true,},false,'(2)接地连接',),
        crtOmni('电气绝缘',{span:0},{seco:'电气绝缘',span:1},
            <div><Text>（1）动力电路、照明电路和电气安全装置电路的绝缘电阻应当符合下述要求：</Text>
                <Table tight  miniw={800}><TableBody>
                    <TableRow>
                        <CCell>标称电压</CCell><CCell>测试电压（直流）/V</CCell><CCell>绝缘电阻/MΩ</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>安全电压</CCell><CCell>250</CCell><CCell>≥0.25</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>≤500</CCell><CCell>500</CCell><CCell>≥0.50</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>＞500</CCell><CCell>1000</CCell><CCell>≥1.00</CCell>
                    </TableRow>
                </TableBody></Table>
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/ObservationRoom`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>八、观测数据及测量结果记录</Text>
                </RouterLink>
            </div>, {nos:'2.11',},false,'电气绝缘'),
    ],'2.9限速器-2.11电气绝缘');
    pushOmni(ari,'2.12',[
        crtOmni('铭牌超保',{big:'2机房（机器设备间）',bspan:4,seco:'轿厢上行超速保护装置',span:2},undefined,
            <Text>（1）轿厢上行超速保护装置上应当设有铭牌，标明制造单位名称、型号、编号、技术参数和型式试验机构名称或者标志，铭牌和型式试验证书内容相符
            </Text>, {nos:'2.12(1)',iclas:'B'},true,'(1)铭牌'),
        crtOmni('试验超保',{},undefined,
            <Text>（2）控制屏或者紧急操作和动态测试装置上标注电梯整机制造单位规定的轿厢上行超速保护装置动作试验方法
            </Text>, {nos:'2.12(2)',mergNos:'2.12',mergName:'厢上超速',display:true,},false,'(2)试验方法',),
        crtOmni('铭牌意外',{seco:'轿厢意外移动保护装置',span:2},undefined,
            <Text>（1）轿厢意外移动保护装置上设有铭牌，标明制造单位名称、型号、编号、技术参数和型式试验机构的名称或者标志，铭牌和型式试验证书内容相符
            </Text>, {nos:'2.13(1)',iclas:'B'},true,'(1)铭牌'),
        crtOmni('试验意外',{},undefined,
            <Text>（2）控制柜或者紧急操作和动态测试装置上标注电梯整机制造单位规定的轿厢意外移动保护装置动作试验方法，该方法与型式试验证书所标注的方法一致
            </Text>, {nos:'2.13(2)',mergNos:'2.13',mergName:'厢意外移',display:true,},false,'(2)试验方法',),
        crtOmni('井封',{big:'3井道及相关设备',bspan:7,span:0},{bspan:7,seco:'井道封闭',span:1},
            <Text>（1）除必要的开口外井道应当完全封闭；当建筑物中不要求井道在火灾情况下具有防止火焰蔓延的功能时，允许采用部分封闭井道，但在人员可正常接近电梯处应当设置无孔的高度足够的围壁，以防止人员遭受电梯运动部件直接危害，或者用手持
                物体触及井道中的电梯设备
            </Text>, {nos:'3.1',},false,'井道封闭'),
        crtOmni('全压缓冲',{seco:'曳引驱动电梯井道顶部空间',span:2},undefined,
            <Text>（1）当对重完全压在缓冲器上时，应当同时满足以下条件： ①轿厢导轨提供不小于0.1+0.035v2（m）的进一步制导行程； ②轿顶可以站人的最高面积的水平面与位于轿厢投影部分井道顶最低部件的水平面之间的自由垂直距离不小于
                1.0+0.035v2（m）； ③井道顶的最低部件与轿顶设备的最高部件之间的间距(不包括导靴、钢丝绳附件等)不小于0.3+0.035v２（m）,与导靴或滚轮、曳引绳附件、垂直滑动门的横梁或部件的最高部分之间的间距不小于0.1 +0.035v2（m）；
                ④轿顶上方应当有一个不小于0.5m×0.6m×0.8m的空间（任意平面朝下即可）。注A-4：当采用减行程缓冲器并且对电梯驱动主机正常减速进行有效监控时0.035v2可以用下值代替： ①电梯额定速度不大于4m/s时，可以减少到1/2，但是不小于0.25m；
                ②电梯额定速度大于4m/s时，可以减少到1/3，但是不小于0.28m。
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Headspace#Headspace`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录B 当对重压实缓冲器时，顶部空间数据的测量记录</Text>
                </RouterLink>
            </Text>, {nos:'3.2(1)',},true,'(1)当对重完全压在缓冲器上时应当同时满足的条件注：A1：制导行程；A2：站人距离；A3：井道顶与轿顶设备最高部件间距；A4：井道顶与导靴、曳引绳附件等最高部分间距',"(1)当对重完全压在缓冲器上时应当同时满足"),
        crtOmni('制导程',{},undefined,
            <Text>（2）当轿厢完全压在缓冲器上时，对重导轨有不小于0.1+0.035v2（m）的制导行程。
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Measure#Measure`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>八、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {nos:'3.2(2)',mergNos:'3.2',mergName:'顶空',display:true,},false,'(2)对重导轨制导行程',),
        crtOmni('门设',{seco:'井道安全门',span:4},undefined,
            <Text>（1）当相邻两层门地坎的间距大于11m时，其间应当设置高度不小于1.80m、宽度不小于0.35m的井道安全门（使用轿厢安全门时除外）；
            </Text>, {nos:'3.4(1)',},true,'(1)安全门设置'),
        crtOmni('门方向',{},undefined,
            <Text>（2）不得向井道内开启；
            </Text>, {nos:'3.4(2)',},true,'(2)门的开启方向'),
        crtOmni('门锁',{},undefined,
            <Text>（3）应当装设用钥匙开启的锁，当门开启后不用钥匙能够将其关闭和锁住，在门锁住后，不用钥匙也能够从井道内将门打开；
            </Text>, {nos:'3.4(3)',},true,'(3)门锁'),
        crtOmni('门电安',{},undefined,
            <Text>（4）应当设置电气安全装置以验证门的关闭状态。
            </Text>, {nos:'3.4(4)',mergNos:'3.4',mergName:'安全门',display:true,},false,'(4)电气安全装置',),
    ],'2.12轿厢上行超速保护装置-3.4井道安全门');
    pushOmni(ari,'3.5',[
        crtOmni('检门尺寸',{bspan:10,seco:'井道检修门',span:4},undefined,
            <Text>（1）高度不小于1.40m，宽度不小于0.60m；
            </Text>, {nos:'3.5(1)',},true,'(1)门的尺寸'),
        crtOmni('检门方',{},undefined,
            <Text>（2）不得向井道内开启；
            </Text>, {nos:'3.5(2)',},true,'(2)门的开启方向'),
        crtOmni('检门锁',{},undefined,
            <Text>（3）应当装设用钥匙开启的锁，当门开启后不用钥匙能够将其关闭和锁住，在门锁住后，不用钥匙也能够从井道内将门打开；
            </Text>, {nos:'3.5(3)',},true,'(3)门锁'),
        crtOmni('检门安',{},undefined,
            <Text>（4）应当设置电气安全装置以验证门的关闭状态。
            </Text>, {nos:'3.5(4)',mergNos:'3.5',mergName:'检修门',},false,'(4)电气安全装置',),
        crtOmni('支架数',{seco:'导轨',span:4},undefined,
            <Text>（1）每根导轨应当至少有2个导轨支架，其间距一般不大于2.50m（如果间距大于2.50m应当有计算依据），安装于井道上、下端部的非标准长度导轨的支架数量应当满足设计要求；
            </Text>, {nos:'3.6(1)',},true,'(1)支架个数与间距'),
        crtOmni('支架',{},undefined,
            <Text>（2）导轨支架应当安装牢固，焊接支架的焊缝满足设计要求，锚栓（如膨胀螺栓）固定只能在井道壁的混凝土构件上使用；
            </Text>, {nos:'3.6(2)',},true,'(2)支架安装'),
        crtOmni('铅垂度',{},undefined,
            <Text>（3）每列导轨工作面每5m铅垂线测量值间的相对最大偏差，轿厢导轨和设有安全钳的T型对重导轨不大于1.2mm，不设安全钳的T型对重导轨不大于2.0mm；
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/GuideRail#GuideRail`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录A 电梯导轨检验记录</Text>
                </RouterLink>
            </Text>, {nos:'3.6(3)',},true,'(3)导轨工作面铅垂度'),
        crtOmni('顶偏差',{},undefined,
            <Text>（4）两列导轨顶面的距离偏差，轿厢导轨为0～+2mm，对重导轨为0～+3mm。
            </Text>, {nos:'3.6(4)',mergNos:'3.6',mergName:'导轨',},false,'(4)导轨顶面距离偏差',),
        crtOmni('厢井距',{span:0},{seco:'轿厢与井道壁距离',span:1},
            <Text>（1）轿厢与面对轿厢入口的井道壁的间距不大于0.15m，对于局部高度不大于0.50m或者采用垂直滑动门的载货电梯，该间距可以增加到0.20m。如果轿厢装有机械锁紧的门并且门只能在开锁区内打开时，则上述间距不受限制。
            </Text>, {nos:'3.7',iclas:'B'},false,'轿厢与井道壁距离'),
        crtOmni('坎下井壁',{span:0},{seco:'层门地坎下端井道壁',span:1},
            <Text>（1）每个层门地坎下的井道壁应当符合以下要求：形成一个与层门地坎直接连接的连续垂直表面，由光滑而坚硬的材料构成（如金属薄板）；其高度不小于开锁区域的一半加上50mm，宽度不小于门入口的净宽度两边各加25mm。
            </Text>, {nos:'3.8',},false,'层门地坎下端井道壁'),
    ],'3.5井道检修门-3.8层门地坎下端井道壁');
    pushOmni(ari,'3.9',[
        crtOmni('对重护',{bspan:11,seco:'井道内防护',span:2},{bspan:12,span:2},
            <Text>（1）对重（平衡重）的运行区域应当采用刚性隔障保护，该隔障从底坑地面上不大于0.30m处，向上延伸到离底坑地面至少2.50m的高度，宽度应当至少等于对重（平衡重）宽度两边各加0.10m；
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Measure2#Measure2`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>八、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {nos:'3.9(1)',},true,'(1)对重(平衡重)运行区域防护'),
        crtOmni('多台间',{},undefined,
            <Text>（2）在装有多台电梯的井道中，不同电梯的运动部件之间应当设置隔障，隔障应当至少从轿厢、对重（平衡重）行程的最低点延伸到最低层站楼面以上2.50m高度，并且有足够的宽度以防止人员从一个底坑通往另一个底坑，如果轿厢顶部边缘
                和相邻电梯的运动部件之间的水平距离小于0.50m，隔障应当贯穿整个井道，宽度至少等于运动部件或者运动部件的需要保护部分的宽度每边各加0.10m。
            </Text>, {nos:'3.9(2)',mergNos:'3.9',mergName:'内防护',},false,'(2)多台电梯运动部件之间防护',),
        crtOmni('极限开关',{span:0},{seco:'极限开关',span:1},
            <Text>（1）井道上下两端应当装设极限开关，该开关在轿厢或者对重（如果有）接触缓冲器前起作用，并且在缓冲器被压缩期间保持其动作状态
            </Text>, {nos:'3.10',iclas:'B'},false,'极限开关'),
        crtOmni('井照明',{span:0},{seco:'井道照明',span:1},
            <Text>（1）井道应当装设永久性电气照明。对于部分封闭井道，如果井道附近有足够的电气照明，井道内可以不设照明
            </Text>, {nos:'3.11',},false,'井道照明'),
        crtOmni('坑底',{seco:'底坑设施与装置',span:4},undefined,
            <Text>（1）底坑底部应当光滑平整，不得渗水、漏水；
            </Text>, {nos:'3.12(1)',},true,'(1)底坑底部'),
        crtOmni('坑进入',{},undefined,
            <Text>（2）如果没有其他通道，应当在底坑内设置一个从层门进入底坑的永久性装置（如梯子），该装置不得凸入电梯的运行空间；
            </Text>, {nos:'3.12(2)',},true,'(2)进入底坑的装置'),
        crtOmni('坑停止',{},undefined,
            <Text>（3）底坑内应当设置在进入底坑时和底坑地面上均能方便操作的停止装置，停止装置的操作装置为双稳态、红色、标以“停止”字样，并且有防止误操作的保护；
            </Text>, {nos:'3.12(3)',},true,'(3)停止装置'),
        crtOmni('坑开关',{},undefined,
            <Text>（4）底坑内应当设置2P+PE型电源插座，以及在进入底坑时能方便操作的井道灯开关
            </Text>, {nos:'3.12(4)',mergNos:'3.12',mergName:'底坑',},false,'(4)电源插座与井道灯开关',),
        crtOmni(undefined,{seco:'底坑空间',span:3},{span:4},
            <Text>轿厢完全压在缓冲器上时，底坑空间尺寸应当同时满足以下要求：
            </Text>, {},true,),
        crtOmni('空间尺',{},undefined,
            <Text>（1）底坑中有一个不小于0.50m×0.60m×1.0m的空间（任一面朝下即可）；
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Pitspace#Pitspace`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录C：当轿厢压实缓冲器时，底坑空间数据的测量记录</Text>
                </RouterLink>
            </Text>, {nos:'3.13(1)',},true,'(1)底坑空间尺寸'),
        crtOmni('底厢距',{},undefined,
            <Text>（2）底坑底面与轿厢最低部件的自由垂直距离不小于0.50m，当垂直滑动门的部件、护脚板和相邻井道壁之间，轿厢最低部件和导轨之间的水平距离在0.15m之内时，此垂直距离允许减少到0.10m；当轿厢最低部件和导轨之间的水平距离
                大于0.15m但小于0.50m时，此垂直距离可按线性关系增加至0.50m；
            </Text>, {nos:'3.13(2)',},true,'(2)底坑底面与轿厢部件距离'),
        crtOmni('低高距',{},undefined,
            <Text>（3）底坑中固定的最高部件和轿厢最低部件之间的距离不小于0.30m。
            </Text>, {nos:'3.13(3)',mergNos:'3.13',mergName:'坑空间',},false,'(3)轿厢最低部件与底坑最高部件距离',),
    ],'3.9井道内防护-3.13底坑空间');
    pushOmni(ari,'3.14',[
        crtOmni('张紧式',{bspan:8,seco:'限速绳张紧装置',span:2},undefined,
            <Text>（1）限速器绳应当用张紧轮张紧，张紧轮（或者其配重）应当有导向装置；
            </Text>, {nos:'3.14(1)',iclas:'B'},true,'(1)张紧形式、导向装置'),
        crtOmni('电安张',{},undefined,
            <Text>（2）当限速器绳断裂或者过分伸长时，应当通过一个电气安全装置的作用，使电梯停止运转。
            </Text>, {nos:'3.14(2)',mergNos:'3.14',mergName:'张紧装',},false,'(2)电气安全装置',),
        crtOmni('缓选型',{seco:'缓冲器',span:5},undefined,
            <Text>（1）轿厢和对重的行程底部极限位置应当设置缓冲器；蓄能型缓冲器只能用于额定速度不大于1m/s的电梯，耗能型缓冲器可以用于任何额定速度的电梯；
            </Text>, {nos:'3.15(1)',iclas:'B'},true,'(1)缓冲器选型'),
        crtOmni('缓标签',{},undefined,
            <Text>（2）缓冲器上应当设有铭牌，标明制造单位名称、型号、编号、技术参数和型式试验机构标识，铭牌或者标签和型式试验合格证内容应当相符；
            </Text>, {nos:'3.15(2)',},true,'(2)铭牌或者标签'),
        crtOmni('缓固定',{},undefined,
            <Text>（3）缓冲器应当固定可靠、无明显倾斜，并且无断裂、塑性变形、剥落、破损等现象；
            </Text>, {nos:'3.15(3)',},true,'(3)固定和完好情况'),
        crtOmni('缓液位',{},undefined,
            <Text>（4）耗能型缓冲器液位应当正确，有验证柱塞复位的电气安全装置；
            </Text>, {nos:'3.15(4)',},true,'(4)液位和电气安全装置'),
        crtOmni('越程距',{},undefined,
            <Text>（5）对重缓冲器附近应当设置永久性的明显标识，标明当轿厢位于顶层端站平层位置时，对重装置撞板与其缓冲器顶面间的最大允许垂直距离；并且该垂直距离不超过最大允许值。
            </Text>, {nos:'3.15(5)',mergNos:'3.15',mergName:'缓冲器',},false,'(5)对重越程距离',),
        crtOmni('下空护',{span:0},{seco:'井道下方空间的防护',span:1},
            <Text>（1）如果井道下方有人能够到达的空间，应当将对重缓冲器安装于(或者平衡重运行区域下面是)一直延伸到坚固地面上的实心桩墩，或者在对重(平衡重)上装设安全钳
            </Text>, {nos:'3.16',iclas:'B'},false,'井道下方空间的防护'),
    ],'3.14限速绳张紧装置-3.16井道下方空间的防护');
    pushOmni(ari,'4.1',[
        crtOmni('轿检修',{big:'4轿厢与对重',bspan:13,seco:'轿顶电气装置',span:3},{bspan:15,span:3},
            <Text>（1）轿顶应当装设一个易于接近的检修运行控制装置，并且符合以下要求： ①由一个符合电气安全装置要求，能够防止误操作的双稳态开关（检修开关）进行操作； ②一经进入检修运行时，即取消正常运行（包括任何自动门操作）、
                紧急电动运行、对接操作运行，只有再一次操作检修开关，才能使电梯恢复正常工作； ③依靠持续揿压按钮来控制轿厢运行，此按钮有防止误操作的保护，按钮上或其近旁标出相应的运行方向； ④该装置上设有一个停止装置，停止装置的操作
                装置为双稳态、红色并标以“停止”字样，并且有防止误操作的保护； ⑤检修运行时，安全装置仍然起作用；
            </Text>, {nos:'4.1(1)',},true,'(1)检修装置'),
        crtOmni('轿停止',{},undefined,
            <Text>（2）轿顶应当装设一个从入口处易于接近的停止装置，停止装置的操作装置为双稳态、红色并标以“停止”字样，并且有防止误操作的保护。如果检修运行控制装置设在从入口处易于接近的位置，该停止装置也可以设在检修运行控制装置上；
            </Text>, {nos:'4.1(2)',},true,'(2)停止装置'),
        crtOmni('轿插座',{},undefined,
            <Text>（3）轿顶应当装设2P+PE型电源插座。
            </Text>, {nos:'4.1(3)',mergNos:'4.1',mergName:'轿顶电'},false,'(3)电源插座',),
        crtOmni(undefined,{seco:'轿顶护栏',span:4},{span:5},
            <Text>井道壁离轿顶外侧边缘水平方向自由距离超过0.30m时，轿顶应当装设护栏，并且满足以下要求：
            </Text>, {},true,),
        crtOmni('栏的',{},undefined,
            <Text>（1）由扶手、0.10m高的护脚板和位于护栏高度一半处的中间栏杆组成；
            </Text>, {nos:'4.2(1)',},true,'(1)护栏的组成'),
        crtOmni('栏扶手',{},undefined,
            <Text>（2）当护栏扶手外缘与井道壁的自由距离不大于0.85m时，扶手高度不小于0.70m，当该自由距离大于0.85m时，扶手高度不小于1.10m；
            </Text>, {nos:'4.2(2)',},true,'(2)扶手高度'),
        crtOmni('栏位置',{},undefined,
            <Text>（3）护栏装设在距轿顶边缘最大为0.15m之内，并且其扶手外缘和井道中的任何部件之间的水平距离不小于0.10m；
            </Text>, {nos:'4.2(3)',},true,'(3)装设位置'),
        crtOmni('栏警示',{},undefined,
            <Text>（4）护栏上有关于俯伏或斜靠护栏危险的警示符号或者须知。
            </Text>, {nos:'4.2(4)',mergNos:'4.2',mergName:'轿顶栏'},false,'(4)警示标志',),
        crtOmni(undefined,{seco:'安全窗(门)',span:3},{span:4},
            <Text>如果轿厢设有安全窗（门），应当符合以下要求：
            </Text>, {},true,),
        crtOmni('手动锁',{},undefined,
            <Text>（1）设有手动上锁装置，能够不用钥匙从轿厢外开启，用规定的三角钥匙从轿厢内开启；
            </Text>, {nos:'4.3(1)',},true,'(1)手动上锁装置'),
        crtOmni('窗开启',{},undefined,
            <Text>（2）轿厢安全窗不能向轿厢内开启，并且开启位置不超出轿厢的边缘，轿厢安全门不能向轿厢外开启，并且出入路径没有对重（平衡重）或者固定障碍物；
            </Text>, {nos:'4.3(2)',},true,'(2)安全门(窗)开启'),
        crtOmni('窗电安',{},undefined,
            <Text>（3）其锁紧由电气安全装置予以验证。
            </Text>, {nos:'4.3(3)',mergNos:'4.3',mergName:'安全窗'},false,'(3)电气安全装置',),
        crtOmni('厢重距',{span:0},{seco:'轿厢和对重间距',span:1},
            <Text>（1）轿厢及关联部件与对重（平衡重）之间的距离应当不小于50mm。
            </Text>, {nos:'4.4',},false,'轿厢和对重(平衡重)间距'),
        crtOmni('块固定',{seco:'对重(平衡重)块',span:2},undefined,
            <Text>（1）对重(平衡重)块可靠固定；
            </Text>, {nos:'4.5(1)',iclas:'B'},true,'(1)固定'),
        crtOmni('识别数',{},undefined,
            <Text>（2）具有能够快速识别对重(平衡重)块数量的措施(例如标明对重块的数量或者总高度)
            </Text>, {nos:'4.5(2)',mergNos:'4.5',mergName:'对重块'},false,'(2)识别数量的措施',),
    ],'4.1轿顶电气装置-4.5对重(平衡重)块');
    pushOmni(ari,'4.6',[
        crtOmni('效面积',{bspan:8,seco:'轿厢面积',span:2},{bspan:9,span:2},
            <div><Text>（1）轿厢有效面积应当符合下述规定。下述各额定载重量对应的轿厢最大有效面积允许增加不大于所列值5%的面积：</Text>
                <Table tight  miniw={800}><TableBody>
                    <TableRow>
                        <CCell>Q①</CCell><CCell>S②</CCell><CCell>Q①</CCell><CCell>S②</CCell><CCell>Q①</CCell><CCell>S②</CCell><CCell>Q①</CCell><CCell>S②</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>100</CCell><CCell>0.37</CCell><CCell>525</CCell><CCell>1.45</CCell><CCell>900</CCell><CCell>2.20</CCell><CCell>1275</CCell><CCell>2.95</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>180</CCell><CCell>0.58</CCell><CCell>600</CCell><CCell>1.60</CCell><CCell>975</CCell><CCell>2.35</CCell><CCell>1350</CCell><CCell>3.10</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>225</CCell><CCell>0.70</CCell><CCell>630</CCell><CCell>1.66</CCell><CCell>1000</CCell><CCell>2.40</CCell><CCell>1425</CCell><CCell>3.25</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>300</CCell><CCell>0.90</CCell><CCell>675</CCell><CCell>1.75</CCell><CCell>1050</CCell><CCell>2.50</CCell><CCell>1500</CCell><CCell>3.40</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>375</CCell><CCell>1.10</CCell><CCell>750</CCell><CCell>1.90</CCell><CCell>1125</CCell><CCell>2.65</CCell><CCell>1600</CCell><CCell>3.56</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>400</CCell><CCell>1.17</CCell><CCell>800</CCell><CCell>2.00</CCell><CCell>1200</CCell><CCell>2.80</CCell><CCell>2000</CCell><CCell>4.20</CCell>
                    </TableRow>
                    <TableRow>
                        <CCell>450</CCell><CCell>1.30</CCell><CCell>825</CCell><CCell>2.05</CCell><CCell>1250</CCell><CCell>2.90</CCell><CCell>2500</CCell><CCell>5.00</CCell>
                    </TableRow>
                </TableBody></Table>
                <Text>对于汽车电梯，额定载重量应当按照单位轿厢面积不小于200kg/㎡计算。注A-5：①额定重量，Kg；②轿厢最大有效面积，㎡；③一人电梯最小值；④二人电梯最小值；⑤额定重量超过2500kg时，每增加100kg，
                    面积增加0.16㎡，对于中间载重量，其面积由线性插入法确定。</Text>
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/ObservationSheet`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>八、观测数据及测量结果记录</Text>
                </RouterLink>
            </div>, {nos:'4.6(1)',},true,'(1)有效面积'),
        crtOmni('超面积',{},undefined,
            <Text>(2)对于为了满足使用要求而轿厢面积超出上述规定的载货电梯，必须满足以下条件： ①在从层站装卸区域总可看见的位置上设置标志，表明该载货电梯的额定载重量； ②该电梯专用于运送特定轻质货物，其体积可保证
                在装满轿厢情况下，该货物的总质量不会超过额定载重量； ③该电梯由专职司机操作，并严格限制人员进入。
            </Text>, {nos:'4.6(2)',mergNos:'4.6',mergName:'厢面积'},false,'(2)轿厢超面积载货电梯的控制条件',),
        crtOmni('轿铭牌',{seco:'轿厢内铭牌',span:2},undefined,
            <Text>（1）轿厢内应当设置铭牌，标明额定载重量及乘客人数(载货电梯只标载重量)、制造单位名称或者商标；改造后的电梯，铭牌上应当标明额定载重量及乘客人数(载货电梯只标载重量)、改造单位名称、改造竣工日期等；
            </Text>, {nos:'4.7(1)',},true,'(1)铭牌'),
        crtOmni('层按钮',{},undefined,
            <Text>（2）设有IC卡系统的电梯，轿厢内的出口层选层按钮应当采用凸起的星形图案予以标识，或者采用比其他按钮明显凸起的绿色按钮
            </Text>, {nos:'4.7(2)',mergNos:'4.7',mergName:'轿铭标'},false,'(2)出口层选层按钮标识',),
        crtOmni(undefined,{seco:'紧急照明和报警装置',span:2},{span:3},
            <Text>轿厢内应当装设符合下述要求的紧急报警装置和紧急照明：
            </Text>, {},true,),
        crtOmni('急照明',{},undefined,
            <Text>（1）正常照明电源中断时，能够自动接通紧急照明电源；
            </Text>, {nos:'4.8(1)',iclas:'B'},true,'(1)紧急照明'),
        crtOmni('报警',{},undefined,
            <Text>（2）紧急报警装置采用对讲系统以便与救援服务持续联系，当电梯行程大于30m时，在轿厢和机房（或者紧急操作地点）之间也设置对讲系统，紧急报警装置的供电来自本条（1）所述的紧急照明电源或者等效电源；在启动
                对讲系统后，被困乘客不必再做其他操作
            </Text>, {nos:'4.8(2)',mergNos:'4.8',mergName:'紧急照明'},false,'(2)紧急报警装置',),
        crtOmni('地脚',{span:0},{seco:'地坎护脚板',span:1},
            <Text>（1）轿厢地坎下应当装设护脚板，其垂直部分的高度不小于0.75m，宽度不小于层站入口宽度。
            </Text>, {nos:'4.9',},false,'地坎护脚板'),
        crtOmni('超载',{span:0},{seco:'超载保护装置',span:1},
            <Text>（1）设置当轿厢内的载荷超过额定载重量时，能够发出警示信号，并且使轿厢不能运行的超载保护装置。该装置最迟在轿厢内的载荷达到110％额定载重量(对于额定载重量小于750kg的电梯，最迟在超载量达到75kg)时动作，
                防止电梯正常启动及再平层，并且轿内有音响或者发光信号提示，动力驱动的自动门完全打开，手动门保持在未锁状态
            </Text>, {nos:'4.10',},false,'超载保护装置'),
    ],'4.6轿厢面积-4.10超载保护装置');
    pushOmni(ari,'4.11',[
        crtOmni('钳铭牌',{bspan:2,seco:'安全钳',span:2},undefined,
            <Text>（1）安全钳上应当设有铭牌，标明制造单位名称、型号、编号、技术参数和型式试验机构的名称或者标志，铭牌和型式试验证书、调试证书内容应当相符；
            </Text>, {nos:'4.11(1)',iclas:'B'},true,'(1)铭牌'),
        crtOmni('钳电安',{},undefined,
            <Text>（2）轿厢上应当装设一个在轿厢安全钳动作以前或者同时动作的电气安全装置。
            </Text>, {nos:'4.11(2)',mergNos:'4.11',mergName:'安全钳'},false,'(2)电气安全装置',),
        crtOmni('磨损断',{big:'5悬挂装置、补偿装置及旋转部件防护',bspan:5,span:0},{bspan:5,seco:'悬挂装置、补偿装置的磨损、断丝、变形',span:1},
            <div><Text>出现下列情况之一时，悬挂钢丝绳和补偿钢丝绳应当报废：<br/>
                ①出现笼状畸变、绳股挤出、扭结、部分压扁、弯折；<br/>②一个捻距内出现的断丝数大于下表列出的数值时：</Text>
                <Table tight  miniw={800}><TableBody>
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
                <Text>③钢丝绳直径小于其公称直径的90%；<br/>④钢丝绳严重锈蚀，铁锈填满绳股间隙。<br/>
                    采用其他类型悬挂装置的，悬挂装置的磨损、变形等不得超过制造单位设定的报废指标</Text>
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/ObservationSheet`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>八、观测数据及测量结果记录</Text>
                </RouterLink>
            </div>, {nos:'5.1',},false,'悬挂装置、补偿装置的磨损、断丝、变形等情况'),
        crtOmni('端固定',{span:0},{seco:'端部固定',span:1},
            <Text>（1）悬挂钢丝绳绳端固定应当可靠，弹簧、螺母、开口销等连接部件无缺损。采用其他类型悬挂装置的，其端部固定应当符合制造单位的规定。
            </Text>, {nos:'5.2',},false,'绳端固定'),
        crtOmni('补固定',{seco:'补偿装置',span:3},undefined,
            <Text>（1）补偿绳（链）端固定应当可靠；
            </Text>, {nos:'5.3(1)',},true,'(1)绳(链)端固定'),
        crtOmni('补电安',{},undefined,
            <Text>（2）应当使用电气安全装置来检查补偿绳的最小张紧位置；
            </Text>, {nos:'5.3(2)',},true,'(2)电气安全装置'),
        crtOmni('绳防跳',{},undefined,
            <Text>（3）当电梯的额定速度大于3.5m/s时，还应当设置补偿绳防跳装置，该装置动作时应当有一个电气安全装置使电梯驱动主机停止运转。
            </Text>, {nos:'5.3(3)',mergNos:'5.3',mergName:'补偿装'},false,'(3)补偿绳防跳装置',),
    ],'4.11安全钳-5.3补偿装置');
    pushOmni(ari,'5.5',[
        crtOmni('松绳保',{big:'5悬挂装置、补偿装置及',bspan:2,span:0},{bspan:2,seco:'松绳(链)保护',span:1},
            <Text>（1）如果轿厢悬挂在两根钢丝绳或者链条上，则应当设置检查绳(链)松弛的电气安全装置，当其中一根钢丝绳(链条)发生异常相对伸长时，电梯应当停止运行
            </Text>, {nos:'5.5',iclas:'B'},false,'松绳(链)保护'),
        crtOmni('旋转件',{span:0},{seco:'旋转部件的防护',span:1},
            <Text>（1）在机房（机器设备间）内的曳引轮、滑轮、链轮、限速器，在井道内的曳引轮、滑轮、链轮、限速器及张紧轮、补偿绳张紧轮，在轿厢上的滑轮、链轮等与钢丝绳、链条形成传动的旋转部件，均应当设置防护装置，以避免人身伤害、
                钢丝绳或链条因松弛而脱离绳槽或链轮、异物进入绳与绳槽或链与链轮之间；对于允许按照GB 7588—1995及更早期标准生产的电梯，可以按照以下要求检验： ①采用悬臂式曳引轮或者链轮时，有防止钢丝绳脱离绳槽或者链条脱离链轮的
                装置，并且当驱动主机不装设在井道上部时，有防止异物进入绳与绳槽之间或者链条与链轮之间的装置； ②井道内的导向滑轮、曳引轮、轿架上固定的反绳轮和补偿绳张紧轮，有防止钢丝绳脱离绳槽和进入异物的防护装置
            </Text>, {nos:'5.6',},false,'旋转部件的防护'),
        crtOmni('门地坎距',{big:'6轿门与层门',bspan:5,span:0},{bspan:6,seco:'门地坎距离',span:1},
            <Text>（1）轿厢地坎与层门地坎的水平距离不得大于35mm。
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Gap`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录D 电梯层门间隙、门锁啮合深度等检验记录</Text>
                </RouterLink>
            </Text>, {nos:'6.1',},false,'门地坎距离'),
        crtOmni('门标识',{span:0},{seco:'门标识',span:1},
            <Text>（1）层门和玻璃轿门上设有标识，标明制造单位名称、型号，并且与型式试验证书内容相符
            </Text>, {nos:'6.2',},false,'门标识'),
        crtOmni(undefined,{seco:'门间隙',span:2},{span:3},
            <Text>门关闭后，应当符合以下要求：
            </Text>, {},true,),
        crtOmni('门扇间',{},undefined,
            <Text>（1）门扇之间及门扇与立柱、门楣和地坎之间的间隙，对于乘客电梯不大于6mm；对于载货电梯不大于8mm，使用过程中由于磨损，允许达到10mm；
            </Text>, {nos:'6.3(1)',},true,'(1)门扇间隙'),
        crtOmni('最不利',{},undefined,
            <Text>（2）在水平移动门和折叠门主动门扇的开启方向，以150N的人力施加在一个最不利的点，前条所述的间隙允许增大，但对于旁开门不大于30mm，对于中分门其总和不大于45mm。
            </Text>, {nos:'6.3(2)',mergNos:'6.3',mergName:'门间隙'},false,'(2)人力施加在最不利点时间隙',),
        crtOmni('玻璃门',{span:0},{seco:'玻璃门防拖曳措施',span:1},
            <Text>（1）层门和轿门采用玻璃门时，应当有防止儿童的手被拖曳的措施
            </Text>, {nos:'6.4',},false,'玻璃门防拖曳措施'),
    ],'5.5松绳(链)保护-6.4玻璃门防拖曳措施');
    pushOmni(ari,'6.5',[
        crtOmni('门夹人',{bspan:8,span:0},{bspan:8,seco:'防止门夹人的保护',span:1},
            <Text>（1）动力驱动的自动水平滑动门应当设置防止门夹人的保护装置，当人员通过层门入口被正在关闭的门扇撞击或者将被撞击时，该装置应当自动使门重新开启
            </Text>, {nos:'6.5',iclas:'B'},false,'防止门夹人的保护装置'),
        crtOmni('门运行',{span:0},{seco:'门的运行与导向',span:1},
            <Text>（1）层门和轿门正常运行时不得出现脱轨、机械卡阻或者在行程终端时错位；由于磨损、锈蚀或者火灾可能造成层门导向装置失效时，应当设置应急导向装置，使层门保持在原有位置。
            </Text>, {nos:'6.6',iclas:'B'},false,'门的运行与导向'),
        crtOmni('关层门',{span:0},{seco:'自动关闭层门',span:1},
            <Text>（1）在轿门驱动层门的情况下，当轿厢在开锁区域之外时，如果层门开启（无论何种原因），应当有一种装置能够确保该层门自动关闭。自动关闭装置采用重块时，应当有防止重块坠落的措施。
            </Text>, {nos:'6.7',iclas:'B'},false,'自动关闭层门装置'),
        crtOmni('急开锁',{span:0},{seco:'紧急开锁装置',span:1},
            <Text>（1）每个层门均应当能够被一把符合要求的钥匙从外面开启；紧急开锁后，在层门闭合时门锁装置不应当保持开锁位置。
            </Text>, {nos:'6.8',iclas:'B'},false,'紧急开锁装置'),
        crtOmni('层门锁',{seco:'门的锁紧',span:2},undefined,
            <Text>（1）每个层门都应当设有符合下述要求的门锁装置： ①门锁装置上设有铭牌，标明制造单位名称、型号和型式试验机构的名称或者标志，铭牌和型式试验证书内容相符； ②锁紧动作由重力、永久磁铁或者弹簧来产生和保持，即使
                永久磁铁或者弹簧失效，重力亦不能导致开锁； ③轿厢在锁紧元件啮合不小于7mm时才能启动； ④门的锁紧由一个电气安全装置来验证，该装置由锁紧元件强制操作而没有任何中间机构，并且能够防止误动作；
            </Text>, {nos:'6.9(1)',iclas:'B'},true,'(1)层门门锁装置'),
        crtOmni('轿门锁',{},undefined,
            <Text>（2）如果轿门采用了门锁装置，该装置应当符合本条(1)的要求
            </Text>, {nos:'6.9(2)',mergNos:'6.9',mergName:'锁紧'},false,'(2)轿门门锁装置',),
        crtOmni('门联锁',{seco:'门的闭合',span:2},undefined,
            <Text>（1）正常运行时应当不能打开层门，除非轿厢在该层门的开锁区域内停止或停站；如果一个层门或者轿门（或者多扇门中的任何一扇门）开着，在正常操作情况下，应当不能启动电梯或者不能保持继续运行；
            </Text>, {nos:'6.10(1)',iclas:'B'},true,'(1)机电联锁'),
        crtOmni('门闭电',{},undefined,
            <Text>（2）每个层门和轿门的闭合都应当由电气安全装置来验证，如果滑动门是由数个间接机械连接的门扇组成，则未被锁住的门扇上也应当设置电气安全装置以验证其闭合状态。
            </Text>, {nos:'6.10(2)',mergNos:'6.10',mergName:'门闭合'},false,'(2)电气安全装置',),
    ],'6.5防止门夹人的保护装置-6.10门的闭合');
    pushOmni(ari,'6.11',[
        crtOmni('门限装',{bspan:3,seco:'轿门开门限制装置及轿门的开启',span:2},undefined,
            <Text>（1）应当设置轿门开门限制装置，当轿厢停在开锁区域外时，能够防止轿厢内的人员打开轿门离开轿厢；
            </Text>, {nos:'6.11(1)',iclas:'B'},true,'(1)轿门开门限制装置'),
        crtOmni('开门',{},undefined,
            <Text>（2）在轿厢意外移动保护装置允许的最大制停距离范围内，打开对应的层门后，能够不用工具(三角钥匙或者永久性设置在现场的工具除外)从层站处打开轿门
            </Text>, {nos:'6.11(2)',mergNos:'6.11',mergName:'开门限'},false,'(2)轿门的开启',),
        crtOmni('门刀',{span:0},{seco:'门刀、门锁滚轮与地坎间隙',span:1},
            <Text>（1）轿门门刀与层门地坎，层门锁滚轮与轿厢地坎的间隙应当不小于5mm；电梯运行时不得互相碰擦
            </Text>, {nos:'6.12',},false,'门刀、门锁滚轮与地坎间隙'),
        crtOmni(undefined,{big:'7无机房电梯附加项目',bspan:7,seco:'轿顶上或者轿厢内的作业场地',span:4},{bspan:9,span:5},
            <Text>检查、维修驱动主机、控制柜的作业场地设在轿顶上或轿内时，应当具有以下安全措施：
            </Text>, {},true,),
        crtOmni('无械锁',{},undefined,
            <Text>（1）设置防止轿厢移动的机械锁定装置；
            </Text>, {nos:'7.1(1)',},true,'(1)机械锁定装置'),
        crtOmni('无锁电安',{},undefined,
            <Text>（2）设置检查机械锁定装置工作位置的电气安全装置，当该机械锁定装置处于非停放位置时，能防止轿厢的所有运行；
            </Text>, {nos:'7.1(2)',},true,'(2)检查机械锁定装置工作位置的电气安全装置'),
        crtOmni('无修门',{},undefined,
            <Text>（3）若在轿厢壁上设置检修门（窗），则该门（窗）不得向轿厢外打开，并且装有用钥匙开启的锁，不用钥匙能够关闭和锁住，同时设置检查检修门（窗）锁定位置的电气安全装置；
            </Text>, {nos:'7.1(3)',},true,'(3)轿厢检修门（窗）设置'),
        crtOmni('门开内移',{},undefined,
            <Text>（4）在检修门（窗）开启的情况下需要从轿内移动轿厢时，在检修门（窗）的附近设置轿内检修控制装置，轿内检修控制装置能够使检查门（窗）锁定位置的电气安全装置失效，人员站在轿顶时，不能使用该装置来移动轿厢；如果
                检修门（窗）的尺寸中较小的一个尺寸超过0.20m，则井道内安装的设备与该检修门（窗）外边缘之间的距离应小于0.30m
            </Text>, {nos:'7.1(4)',mergNos:'7.1',mergName:'内作业场'},false,'(4)检修门（窗）开启时从轿内移动轿厢的要求'),
        crtOmni(undefined,{seco:'底坑内的作业场地',span:3},{span:4},
            <Text>检查、维修驱动主机、控制柜的作业场地设在底坑时，如果检查、维修工作需要移动轿厢或可能导致轿厢的失控和意外移动，应当具有以下安全措施：
            </Text>, {},true,),
        crtOmni('无械制停',{},undefined,
            <Text>（1）设置停止轿厢运动的机械制停装置，使工作场地内的地面与轿厢最低部件之间的距离不小于2m；
            </Text>, {nos:'7.2(1)',},true,'(1)机械制停装置'),
        crtOmni('无制电安',{},undefined,
            <Text>（2）设置检查机械制停装置工作位置的电气安全装置，当机械制停装置处于非停放位置且未进入工作位置时，能防止轿厢的所有运行，当机械制停装置进入工作位置后，仅能通过检修装置来控制轿厢的电动移动；
            </Text>, {nos:'7.2(2)',},true,'(2)检查机械制停装置工作位置的电气安全装置'),
        crtOmni('道外电复',{},undefined,
            <Text>（3）在井道外设置电气复位装置，只有通过操纵该装置才能使电梯恢复到正常工作状态，该装置只能由工作人员操作。
            </Text>, {nos:'7.2(3)',mergNos:'7.2',mergName:'坑内作场'},false,'(3)井道外电气复位装置'),
    ],'6.11轿门开门限制装置及轿门的开启-7.2底坑内的作业场地');
    pushOmni(ari,'7.3',[
        crtOmni(undefined,{bspan:7,seco:'平台上的作业场地',span:5},{bspan:10,span:7},
            <Text>检查、维修机器设备的作业场地设在平台上时，如果该平台位于轿厢或者对重的运行通道中，则应当具有以下安全措施：
            </Text>, {},true,),
        crtOmni('平台设置',{},undefined,
            <Text>（1）平台是永久性装置，有足够的机械强度，并且设置护栏；
            </Text>, {nos:'7.3(1)',},true,'(1)平台设置'),
        crtOmni('台进出装',{},undefined,
            <Text>（2）设有可以使平台进入（退出）工作位置的装置，该装置只能由工作人员在底坑或者在井道外操作，由一个电气安全装置确认平台完全缩回后电梯才能运行；
            </Text>, {nos:'7.3(2)',},true,'(2)平台进(出)装置与电气安全装置'),
        crtOmni('台锁装',{},undefined,
            <Text>（3）如果检查、维修作业不需要移动轿厢，则设置防止轿厢移动的机械锁定装置和检查机械锁定装置工作位置的电气安全装置，当机械锁定装置处于非停放位置时，能防止轿厢的所有运行；
            </Text>, {nos:'7.3(3)',},true,'(3)机械锁定装置与电气安全装置'),
        crtOmni('台械止挡',{},undefined,
            <Text>（4）如果检查（维修）作业需要移动轿厢，则设置活动式机械止挡装置来限制轿厢的运行区间，当轿厢位于平台上方时，该装置能够使轿厢停在上方距平台至少2m处，当轿厢位于平台下方时，该装置能够使轿厢停在平台下方符合
                3.2井道 顶部空间要求的位置；
            </Text>, {nos:'7.3(4)'},true,'(4)活动式机械止挡装置'),
        crtOmni('械止电安',{},undefined,
            <Text>（5）设置检查机械止挡装置工作位置的电气安全装置，只有机械止挡装置处于完全缩回位置时才允许轿厢移动，只有机械止挡装置处于完全伸出位置时才允许轿厢在前条所限定的区域内移动。
            </Text>, {nos:'7.3(5)',},true,'(5)检查机械止挡装置工作位置的电气安全装置'),
        crtOmni(undefined,{},undefined,
            <Text>如果该平台不位于轿厢或者对重的运行通道中，则应当满足上述（1）的要求
            </Text>, {mergNos:'7.3',mergName:'台作场'},false,),
        crtOmni(undefined,{seco:'附加检修控制装置',span:2},{span:3},
            <Text>如果需要在轿厢内、底坑或者平台上移动轿厢，则应当在相应位置上设置附加检修控制装置，并且符合以下要求：
            </Text>, {},true,),
        crtOmni('附修控装',{},undefined,
            <Text>（1）每台电梯只能设置1个附加检修装置；附加检修控制装置的型式要求与轿顶检修控制装置相同；
            </Text>, {nos:'7.4(1)',},true,'(1)附加检修控制装置设置'),
        crtOmni('附修互锁',{},undefined,
            <Text>（2）如果一个检修控制装置被转换到“检修”，则通过持续按压该控制装置上的按钮能够移动轿厢；如果两个检修控制装置均被转换到“检修”位置，则从任何一个检修控制装置都不可能移动轿厢，
                或者当同时按压两个检修控制装置上相同方向的按钮时，才能够移动轿厢
            </Text>, {nos:'7.4(2)',mergNos:'7.4',mergName:'附修控'},false,'(2)与轿顶检修的互锁'),
    ],'7.3平台上的作业场地-7.4附加检修控制装置');
    pushOmni(ari,'8.1',[
        crtOmni('平衡系',{big:'8试验',bspan:5,span:0},{bspan:5,seco:'平衡系数试验',span:1},
            <Text>（1）曳引电梯的平衡系数应当在0.40～0.50之间，或者符合制造（改造）单位的设计值
                <RouterLink href={`/report/ROL-JJ/ver/${verId}/${repId}/Equilibrium#Equilibrium`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录E 8.1B平衡系数试验和8.8C电梯速度检验记录</Text>
                </RouterLink>
            </Text>, {nos:'8.1',iclas:'B'},false,'平衡系数试验'),
        crtOmni('上速保装',{span:0},{seco:'轿厢上行超速保护',span:1},
            <Text>（1）当轿厢上行速度失控时，轿厢上行超速保护装置应当动作，使轿厢制停或者至少使其速度降低至对重缓冲器的设计范围；该装置动作时，应当使一个电气安全装置动作
            </Text>, {nos:'8.2',},false,'轿厢上行超速保护装置试验'),
        crtOmni('制停',{seco:'轿厢意外移动保护装置试验',span:2},undefined,
            <Text>（1）轿厢在井道上部空载，以型式试验证书所给出的试验速度上行并触发制停部件，仅使用制停部件能够使电梯停止，轿厢的移动距离在型式试验证书给出的范围内；
            </Text>, {nos:'8.3(1)',iclas:'B'},true,'(1)制停情况'),
        crtOmni('自监测',{},undefined,
            <Text>（2）如果电梯采用存在内部冗余的制动器作为制停部件，则当制动器提起(或者释放)失效，或者制动力不足时，应当关闭轿门和层门，并且防止电梯的正常启动
            </Text>, {nos:'8.3(2)',mergNos:'8.3',mergName:'移动保'},false,'(2)自监测功能'),
        crtOmni('钳试验',{span:0},{seco:'轿厢限速器－安全钳试验',span:1},
            <Text>（1）施工监督检验：轿厢装有下述载荷，以检修速度下行，进行限速器-安全钳联动试验，限速器－安全钳动作应当可靠: ①瞬时式安全钳，轿厢装载额定载重量，对于轿厢面积超出规定的载货电梯，以轿厢实际面积按规定所对应的
                额定载重量作为试验载荷； ②渐进式安全钳：轿厢装载125%额定载重量；对于轿厢面积超出规定的载货电梯，取125%额定载重量与轿厢实际面积按规定所对应的额定载重量两者中的较大值作为试验载荷；对于额定载重量按照单位轿厢
                有效面积不小于200kg/m2计算的汽车电梯，轿厢装载150%额定载重量
            </Text>, {nos:'8.4',iclas:'B'},false,'轿厢限速器－安全钳试验'),
        /*截至这里span：若太多了，将bspan做拆分，重新再配置*/
        crtOmni('对限速器',{bspan:6,span:0},{bspan:6,seco:'对重限速器—安全钳试',span:1},
            <Text>（1）轿厢空载，以检修速度上行，进行限速器- 安全钳联动试验，限速器－安全钳动作应当可靠
            </Text>, {nos:'8.5',iclas:'B'},false,'对重(平衡重)限速器—安全钳试验'),
        crtOmni('运行试',{span:0},{seco:'运行试验',span:1},
            <Text>（1）轿厢分别空载、满载，以正常运行速度上、下运行，呼梯、楼层显示等信号系统功能有效、指示正确、动作无误，轿厢平层良好，无异常现象发生；对于设有IC卡系统的电梯，轿厢内的人员无需通过IC卡系统即可到达建筑物
                的出口层，并且在电梯退出正常服务时，自动退出IC卡功能
            </Text>, {nos:'8.6',},false,'运行试验'),
        crtOmni('救程序',{seco:'应急救援试验',span:3},undefined,
            <Text>（1）在机房内或者紧急操作和动态测试装置上设有明晰的应急救援程序；
            </Text>, {nos:'8.7(1)',iclas:'B'},true,'(1)救援程序'),
        crtOmni('救通道',{},undefined,
            <Text>（2）建筑物内的救援通道保持通畅，以便相关人员无阻碍地抵达实施紧急操作的位置和层站等处；
            </Text>, {nos:'8.7(2)',},true,'(2)救援通道'),
        crtOmni('救援',{},undefined,
            <Text>（3）在各种载荷工况下，按照本条(1)所述的应急救援程序实施操作，能够安全、及时地解救被困人员
            </Text>, {nos:'8.7(3)',mergNos:'8.7',mergName:'急救'},false,'(3)救援操作'),
        crtOmni('梯速',{span:0},{seco:'电梯速度',span:1},
            <Text>（1）当电源为额定频率，电动机施以额定电压时，轿厢承载0.5倍额定载重量，向下运行至行程中段（除去加速和减速段）时的速度，不得大于额定速度的105％，不宜小于额定速度的92％。
            </Text>, {nos:'8.8',},false,'电梯速度'),
    ],'8.1平衡系数试验-8.8电梯速度');
    pushOmni(ari,'8.9',[
        crtOmni('空载曳',{bspan:5,span:0},{bspan:5,seco:'空载曳引检查',span:1},
            <Text>（1）当对重压在缓冲器上而曳引机按电梯上行方向旋转时，应当不能提升空载轿厢
            </Text>, {nos:'8.9',iclas:'B'},false,'空载曳引检查'),
        crtOmni('上制动',{span:0},{seco:'上行制动工况曳引',span:1},
            <Text>（1）轿厢空载以正常运行速度上行至行程上部，切断电动机与制动器供电，轿厢应当完全停止
            </Text>, {nos:'8.10',iclas:'B'},false,'上行制动工况曳引检查'),
        crtOmni('下制动',{span:0},{seco:'下行制动工况曳引',span:1},
            <Text>（1）轿厢装载125%额定载重量，以正常运行速度下行至行程下部，切断电动机与制动器供电，轿厢应当完全停止
            </Text>, {nos:'8.11',iclas:'A'},false,'下行制动工况曳引检查'),
        crtOmni('静态曳',{span:0},{seco:'静态曳引试验',span:1},
            <Text>（1）对于轿厢面积超过规定的载货电梯，以轿厢实际面积所对应的125%额定载重量进行静态曳引试验；对于额定载重量按照单位轿厢有效面积不小于200kg/ m2计算的汽车电梯，以150%额定载重量做静态曳引试验；历时10min，
                曳引绳应当没有打滑现象
            </Text>, {nos:'8.12',iclas:'A'},false,'静态曳引试验'),
        crtOmni('制动试',{span:0},{seco:'制动试验',span:1},
            <Text>（1）轿厢装载125%额定载重量，以正常运行速度下行时，切断电动机和制动器供电，制动器应当能够使驱动主机停止运转，试验后轿厢应无明显变形和损坏
            </Text>, {nos:'8.13',iclas:'A'},false,'制动试验'),
        crtOmni('视频',{big:'9其他',bspan:3,span:0},{bspan:3,seco:'视频监控设施',span:1},
            <Text>（1） 公众聚集场所的电梯和住宅小区的电梯，应当配备符合有关规定和标准的视频监控设施。
            </Text>, {nos:'9.1',iclas:'B'},false,'视频监控设施'),
        crtOmni('远程监',{span:0},{seco:'远程监测装置',span:1},
            <Text>（2）新安装的乘客电梯应当配备能够实现远程监测功能的装置，并提供标准数据接口。
            </Text>, {nos:'9.2',iclas:'B'},false,'远程监测装置'),
        crtOmni('降温',{span:0},{seco:'机房通风降温措施',span:1},
            <Text>（3）采取在机房安装空调等通风降温措施，保证电梯机房内温度符合相关标准要求。
            </Text>, {nos:'9.3',iclas:'B'},false,'机房通风降温措施'),
    ],'8.9空载曳引检查-9.3机房通风降温措施');

    if(!noDefault)  ari=omniCalculateDefault(ari,{iclasDefault:"C",});
    return { Item: ari, } as { [key: string]: any[] };
};

