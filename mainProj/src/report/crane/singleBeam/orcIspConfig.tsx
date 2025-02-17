/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    CCell, Table, TableBody, TableRow, Text,
} from "customize-easy-ui-component";
import { Link as RouterLink, } from "../../../routing/Link";
import {crtInos, crtInsp, crtNoMg, crtOmni, omniCalculateDefault, pushOmni} from "../../common/omni";

/**新的第四种项目列表配置模式： 新的检验项目大列表的配置做法。【特别注意】#span几个参数，最好不要跨越编辑区域去做配置，强制缩小影响波及范围可方便调试和修改。
 * 配置检验项目。 正式报告的权重合计=1.8；权重还是改成原始记录为准的吧。 Calculate default values
 * */
export const setupItemAreaRoute= ({verId, repId, theme, noDefault} :{verId:string, repId:string,theme:any,noDefault?:boolean}
) => {
    let ari: any[] =[];
    pushOmni(ari,'2.1',
        [crtOmni('重量标志',crtInos('2作业环境和外观检查',3,),crtInos(undefined,7,'2.1起重量标志',1,'2.1',1),
                  <Text>（1）起重机明显部位标注的额定起重量标志应清晰、符合规定。</Text>,
                crtNoMg(undefined,undefined,'2.1',undefined),false,'2.1 额定起重量标志',),
            crtOmni('业环境',crtInos(undefined,),crtInos(undefined,undefined,'2.2安全距离及相关尺寸',5,'2.2',5),
                <Text>（1）在最不利位置和最不利装载条件下，起重机的所有运动部分（吊具和其他取物装置除外）与建筑物的净距规定如下：距固定部分不小于0.05m；距任何栏杆或扶手不小于0.10m；距出入区不小于0.50m（出入区是指允许人员进出的
                    所有通道，但工作平台除外）。
                    <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Measure`}>
                        <Text variant="h4" css={{"@media print": {display: 'none'}}}>九、观测数据及测量结果记录</Text>
                    </RouterLink>
                </Text>,
                crtNoMg(undefined,undefined,undefined,undefined,),true,undefined,'（1）在最不利位'),
            crtOmni('界限线',crtInos(),undefined,
                <Text>（2）起重机械各运动部分的下界限线与下方的一般出入区（从地面或从属于建筑物的固定或活动部分算起，工作或维修平台及类似物除外）之间的垂直距离不应小于1.7m，与通常不准人出入的下方的固定或活动部分及与栏杆顶部的垂直
                    距离不应小于0.5m。</Text>,
                undefined,true,),
            crtOmni('维修平台',crtInos(),undefined,
                <Text>（3）各运动部分的上界限线与上方的固定或活动部分之间的垂直距离，在保养区域和维修平台等处≥0.5m，如果不会对人员产生危险，此距离可减小到0.1m。</Text>,
                crtNoMg(undefined,undefined,),true,undefined,),
            crtOmni('输电距',crtInos(),undefined,
                <div><Text>（4）起重机工作时，臂架、吊具、辅具、钢丝绳、缆风绳及载荷等，与输电线的最小距离应符合下表的规定：</Text>
                    <Table tight  miniw={800}><TableBody>
                        <TableRow>
                            <CCell>线路电压(kV)</CCell><CCell>＜1</CCell><CCell>1～20</CCell><CCell>35～110</CCell><CCell>154</CCell><CCell>220</CCell><CCell>330</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell>最小距离(m)</CCell><CCell>1.5</CCell><CCell>2</CCell><CCell>4</CCell><CCell>5</CCell><CCell>6</CCell><CCell>7</CCell>
                        </TableRow>
                    </TableBody></Table></div>,
                crtNoMg(),true,),
            crtOmni('电裸线',crtInos(),undefined,
                <Text>（5）起重机械馈电裸滑线与周围设备的安全距离应符合以下的规定，否则应采取安全防护措施：距地面高度大于3500mm;距汽车通道高度大于6000mm; 距一般管道大于1000mm; 距氧气管道及设备大于1500mm;
                    距易燃气体及液体管道大于3000mm。</Text>,
                crtNoMg('安全距离',undefined,undefined,undefined,'2.2 安全距离','2.2',false),false,undefined,),
            crtOmni('行轨道',crtInos(undefined,),crtInos(undefined,undefined,'2.3',1,'2.3',1),
                <Text>（1）起重机运行轨道应无明显松动和影响其安全运行的明显缺陷。</Text>,
                crtNoMg(undefined,undefined,'2.3',undefined),false,'2.3 起重机运行轨道',),
        ],'2 作业环境和外观检查');
    pushOmni(ari,'3.1',
        [crtOmni('焊缝裂',crtInos('3金属结构检查',1,),crtInos(undefined,3,'3.1',3,'3.1',3),
                    <Text>（1）主要受力结构件的连接焊缝无明显可见的裂纹。</Text>,
                    undefined,true,),
            crtOmni('效厚度',crtInos(),undefined,
                <Text>（2）主要受力构件断面有效厚度不低于设计厚度的90%。</Text>,
                undefined,true,),
            crtOmni('螺栓销',crtInos(),undefined,
                <Text>（3）螺栓和销轴等连接无明显松动、缺件、损坏等缺陷。</Text>,
                crtNoMg('金属结构',undefined,undefined,undefined,'主要受力结构件','3.1',false),false,),
            crtOmni('主零部',crtInos('4主要零部件检查',4,undefined,0),crtInos(undefined,7,'4.1一般要求',4,),
                <Text>（1）起重机械的主要零部件（包括吊具、钢丝绳、滑轮、开式齿轮、车轮、卷筒、环链等）按照相关安全技术规范及其相应标准，不应有严重磨损、变形、缺损，达到报废要求应报废。</Text>,
                undefined,true,),
            crtOmni('车轨道',crtInos(),undefined,
                <Text>（2）小车轨道和横移导轨应无明显松动和影响其安全运行的明显缺陷。</Text>,
                undefined,true,),
            crtOmni('机防爆',crtInos(),undefined,
                <Text>（3）防爆起重机上的零部件、安全保护装置和电动葫芦等需要采用符合防爆要求的，应不低于整机防爆级别和温度组别。</Text>,
                undefined,true,),
            crtOmni('无火花',crtInos(),undefined,
                <Text>（4）防爆起重机上装设的防止钢丝绳脱槽装置应采用无火花材料制造。</Text>,
                crtNoMg('一般要',undefined,undefined,undefined,'4.1  一般要求（磨损、变形、缺损、证明文件等）','4.1',false),false,),
            crtOmni('具悬牢',crtInos(undefined,undefined,'4.2吊具',3),undefined,
                <Text>（1）吊钩、电磁吸盘、抓斗、横梁等吊具悬挂牢固可靠。
                </Text>, crtNoMg(undefined,undefined,'4.2(1)',undefined,),false,'(1) 吊具的悬挂'),
            crtOmni('防脱钩',crtInos(),undefined,
                <Text>（2）吊钩应当设置防脱钩装置（司索人员无法靠近吊钩的除外），并且有效。
                </Text>, crtNoMg(undefined,undefined,'4.2(2)',undefined,),false,'(2) 吊钩的防脱钩装置'),
            crtOmni('不焊补',crtInos(),undefined,
                <Text>（3）吊钩不应当焊补，铸造起重机钩口防磨保护鞍座完整。
                </Text>, crtNoMg(undefined,undefined,'4.2(3)',undefined,),false,'(3) 吊钩焊补、铸造起重机钩口防磨保护鞍座'),
        ],'3 金属结构检查-4.2吊具');
    pushOmni(ari,'4.3.1',
        [crtOmni('绳规格',crtInos(undefined,7,'4.3钢丝绳',6,undefined,0),crtInos(undefined,11,undefined,10,'4.3.1',1),
                <Text>（1）钢丝绳的规格、型号应符合设计要求，与滑轮和卷筒相匹配；首次检验时和新更换的钢丝绳应有出厂合格证明。
                </Text>,crtNoMg(undefined,undefined,'4.3.1'),false,'4.3.1 钢丝绳配置'),
            crtOmni('绳端固定',crtInos(undefined,undefined,undefined,undefined,undefined,0),crtInos(undefined,undefined,undefined,undefined,'4.3.2',2),
                <Text>（1）钢丝绳绳端固定牢固、可靠，压板固定时的压板不少于2个(电动葫芦不少于3个)，除固定钢丝绳 的圈数外，卷筒上至少保留2圈钢丝绳作为安全圈。
                </Text>,undefined,true,),
            crtOmni('绳夹间',crtInos(),undefined,
                <div><Text>（2）卷筒上的绳端固定装置有防松或者自紧的性能；用金属压制接头固定时，接头无裂纹；用楔块固 定时，楔套无裂纹，楔块无松动；用绳夹固定时，绳夹安装正确，绳夹数满足要求。绳夹压板应当在钢 丝绳长头一边，
                    绳夹间距等于钢丝绳直径的6～7倍。</Text>
                    <Table tight  miniw={800}><TableBody>
                        <TableRow>
                            <CCell>钢丝绳直径(mm)</CCell><CCell>≤19</CCell><CCell>19～32</CCell><CCell>32～38</CCell><CCell>38～44</CCell><CCell>44～60</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell>绳夹最少数量(组)</CCell><CCell>3</CCell><CCell>4</CCell><CCell>5</CCell><CCell>6</CCell><CCell>7</CCell>
                        </TableRow>
                    </TableBody></Table></div>,
                crtNoMg('钢丝绳',undefined,undefined,undefined,'4.3.2 钢丝绳固定','4.3.2',false),false,),
            crtOmni('运炽热',crtInos(undefined,undefined,undefined,undefined,'4.3.3用于特殊场合的钢丝绳的报废',2),crtInos(undefined,undefined,undefined,undefined,'4.3.3',2),
                <Text>（1）吊运炽热金属、熔融金属或者危险品的起重机械用钢丝绳不应有严重断丝。断丝数达到GB/T5972-2006《起重机械用钢丝绳检验和报废实用规范》所规定的钢丝绳断丝数的一半（包括钢丝绳表面腐蚀进行的折减），应当予以报废。
                </Text>,crtNoMg(undefined,undefined,'4.3.3(1)'),false,'(1) 吊运炽热金属、熔融金属或者危险品的起重机械用钢丝绳的断丝数'),
            crtOmni('丝报废',crtInos(),crtInos(),
                <Text>（2）防爆型起重机钢丝绳有断丝，应当予以报废。
                </Text>,crtNoMg(undefined,undefined,'4.3.3(2)'),false,'(2) 防爆型起重机钢丝绳断丝情况'),
            crtOmni(undefined,crtInos(undefined,undefined,undefined,undefined,'4.3.4吊运熔融金属起重机的主起升机构（电动葫芦除外）钢丝绳系统',2,'4.3.4.1',1),
                    crtInsp(undefined,undefined,5,4),
                <Text> 吊运熔融金属起重机的主起升机构（电动葫芦除外）钢丝绳缠绕系统应符合以下要求：
                </Text>,crtNoMg(),true,),
            crtOmni('双吊点',crtInos(),crtInos(),
                <Text>（1）双吊点应当采用4根钢丝绳缠绕系统。
                </Text>,crtNoMg(),true,),
            crtOmni('单吊点',crtInos(),crtInos(),
                <Text>（2）单吊点至少采用2根钢丝绳缠绕系统。
                </Text>,crtNoMg(),true,),
            crtOmni('用平衡滑',crtInos(),crtInos(),
                <Text>（3）主起升机构钢丝绳缠绕系统中，不应当采用平衡滑轮。
                </Text>,crtNoMg('钢丝绳缠',undefined,undefined,undefined,'主起升机构钢丝绳缠绕系统','4.3.4.1',false),false,),
            crtOmni('用途钢丝',crtInos(undefined,undefined,undefined,undefined,undefined,undefined,'4.3.4.2',1),
                {four:'4.3.4.2',fspan:1},
                <Text>（2）应选用性能不低于GB/T8918-2006《重要用途钢丝绳》规定的钢丝绳。
                </Text>,crtNoMg(undefined,undefined,'4.3.4.2'),false,'主起升机构钢丝绳'),
            crtOmni('卷筒卡',{span:0}, {seco:'4.4',span:1},
                <Text>（1）配备有导绳装置的卷筒在整个工作范围内有效排绳，无卡阻现象。
                </Text>,{nos:'4.4'},false,'4.4 导绳器'),
        ],'4.3 钢丝绳-4.4 导绳器');
    pushOmni(ari,'5.1.1',
        [crtOmni('常闭制',crtInos('5安全保护和防护',2,'5.1制动器',2,'5.1.1',1,undefined,0),crtInos(undefined,4,undefined,4,'5.1.1.1',1),
                  <Text>（1）动力驱动的起重机(液压缸驱动的除外)，其起升、变幅、运行、回转机构应都装设可靠的制动装置；当机构要求具有载荷支持作用时，应装设机械常闭式制动器。</Text>,
                crtNoMg(undefined,undefined,undefined,undefined,undefined,),true,),
            crtOmni('线路保护',crtInos(),crtInos(undefined,undefined,undefined,undefined,'5.1.1.2',3),
                <Text>（1）与电动机同时控制的制动器：制动器线路应设有保护装置，在出现故障时能迅速切断电动机和制动器的电源；如电动机接至制动器的导线长度不大于5m，制动器可不单独设这样的保护。与电动机分开控制的制动器：制动器的控制要
                    采取预防措施，使得起动和制动时不出现任何失控的运动。如有电气制动，机械制动应在电气制动之后作用。电动机通电时制动器不得抱闸，短暂过渡状态除外。</Text>,
                crtNoMg(),true),
            crtOmni('制延时',crtInos(),undefined,
                <Text>（2）安全制动器：对设有安全制动器的起升机构，在正常作业时，其支持制动器动作后，安全制动器延时动作，其延时动作时间可调；在进行紧急制动时，安全制动器应立即动作。</Text>,
                undefined,true),
            crtOmni('意外断电',crtInos(),undefined,
                <Text>（3）意外断电：对于系统意外断电时制动器的动作会引起机械设备损坏倾翻的情况，应采取适当措施保证意外断电时制动器的安全动作过程。</Text>,
                crtNoMg('制动器',undefined,undefined,undefined,'制动器设置与控制','5.1.1',false),false,undefined,),
            crtOmni(undefined,{third:'5.1.2',tspan:1,fspan:0},crtInos('5安全保护和防护装置检查',11,'5.1.2 吊运熔融金属起重机的制动器设置专项要求',11,'5.1.2.1',5),
                <Text>采用电动葫芦作为起升机构吊运熔融金属的起重机，其制动器的设置应符合以下要求：</Text>,
                crtNoMg(undefined,undefined,undefined,undefined,undefined,),true,),
            crtOmni('低速级制',crtInos(),undefined,
                <Text>（1）当额定起重量大于5t且小于或者等于16t时，除设置工作制动器外，还应当在电动葫芦的低速级上设置安全制动器。</Text>,
                undefined,true),
            crtOmni('等于5t',crtInos(),undefined,
                <Text>（2）当额定起重量小于或者等于5t时，除设置工作制动器外，还应当在低速级上设置安全制动器，或者电动葫芦按照1.5倍额定起重量设计。</Text>,
                undefined,true),
            crtOmni('高温隔',crtInos(),undefined,
                <Text>（3）选用具有高温隔热功能的电动葫芦。</Text>,
                undefined,true),
            crtOmni('低于M6',crtInos(),undefined,
                <Text>（4）电动葫芦的工作级别不应低于M6。</Text>,
                undefined,true),
            crtOmni(undefined,crtInos(),crtInos(undefined,undefined,undefined,undefined,'5.1.2.2.1',3),
                <Text>吊运熔融金属起重机，额定起重量为75t以上（含75t）主起升机构（除电动葫芦以外）制动器应符合下列要求：</Text>,
                undefined,true),
            crtOmni('起升机',crtInos(),undefined,
                <Text>（1）主起升机构应符合以下要求之一： (a)主起升机构设置两套驱动装置，并且在输出轴刚性连接； (b)主起升机构两套驱动装置在输出轴上无刚性连接，或者主起升机构只设置一套驱动装置的，在钢丝绳卷筒上
                    设置安全制动器。</Text>,
                undefined,true),
            crtOmni('两套驱',crtInos(),undefined,
                <Text>（2）主起升机构设置两套驱动装置，当其中一套驱动装置发生故障时，另一套驱动装置应当能够保证在额定起重量时完成至少一个工作循环。 注C-4：两套驱动装置指两台电动机、两套减速系统、一套或者多套
                    卷筒装置和四套制动器。</Text>,
                undefined,true),
            crtOmni(undefined,crtInos(),crtInos(undefined,undefined,undefined,undefined,'5.1.2.2.2',3),
                <Text>吊运熔融金属起重机，额定起重量为75t以下（不含75t）主起升机构（除电动葫芦以外）制动器应符合下列要求：</Text>,
                undefined,true),
            crtOmni('液压鼓',crtInos(),undefined,
                <Text>（1）主起升机构的驱动轴上应装设两套符合JB/T 6406-2006《电力液压鼓式制动器》或者JB/T 7020-2006《电力液压盘式制动器》要求并且能够独立工作的制动器。</Text>,
                crtNoMg(undefined,undefined,undefined,undefined,undefined,),true),
            crtOmni('安全系',crtInos(),undefined,
                <Text>（2）每套制动器的安全系数应满足以下的规定：a)每套驱动装置应装有两个支持制动器，每一个制动器的制动安 全系数不低于1.25；b)对于两套彼此有刚性联系的驱动装置，每套装置应装有两个支持制动器，每一个制动器的制动安全
                    系数不应低于1.10；c)对于采用行星差动减速器传动，每套驱动装置也应装有两个支持制动器，每一个制动 器的制动安全系数不应低于1.75。</Text>,
                crtNoMg('熔融吊',undefined,undefined,undefined,'吊运熔融金属起重机的制动器设置专项要求','5.1.2',false),
                false,undefined,),
        ],'5.1.1 制动器设置与控制-5.1.2吊运熔融金属的制动器');
    pushOmni(ari,'5.1.3',
        [crtOmni('露铆钉',{big:'5安全保护和防护装置检查',bspan:5,span:3,third:'5.1.3制动器零件检查',tspan:3,fspan:0},crtInos(undefined,10,'5.1.3制动器零件检查',3,'5.1.3.1',1),
                    <Text>（1）制动器的零件无裂纹、过度磨损(摩擦片磨损达原厚度的50％或者露出铆钉)、塑性变形、缺件等 缺陷，液压制动器无漏油现象。
                    </Text>, {nos:'5.1.3(1)'},false,'(1)制动器的零部件无裂纹、过度磨损、塑性变形、缺件等缺陷，液压制动器无漏油现象',),
            crtOmni('摩擦片',{fspan:0}, {third:'5.1.3.2',tspan:1},
                <Text>（2）制动器打开时制动轮与摩擦片无摩擦现象，制动器闭合时制动轮与摩擦片接触均匀，无影响制动性能的缺陷和油污。
                </Text>, {nos:'5.1.3(2)'},false,'(2) 制动轮与摩擦片无摩擦、缺陷和油污情况'),
            crtOmni('推动器油',{fspan:0}, {third:'5.1.3.3',tspan:1},
                <Text>（3）制动器的推动器无漏油现象。
                </Text>, {nos:'5.1.3(3)'},false,'(3) 制动器推动器无漏油现象'),
         /*在正式报告：自拆分例子显示不显示display:false开关，同时@span需配合修正*/
            crtOmni(undefined,{seco:'5.2',span:1,tspan:0}, {span:6},
                <Text>起升高度(下降深度)限位器应符合以下要求：
                </Text>, {},true,),
            crtOmni('高度限',{tspan:0}, {},
                <Text>（1）起升机构均应装设起升高度限位器。用内燃机驱动，中间无电气、液压、气压等传动环节而直接进行机械连接的起升机构，可以配备灯光或声响报警装置，以替代限位开关。除已经安装了传动式高度限位装置（如齿轮、蜗轮蜗杆
                    传动式高度限位器等）的起重机起升机构外，其它桥式、门式起重机的起升机构，应当按规定同时安装两种不同形式的高度限位装置，如重锤式、断火式、压板式高度限位器等任意两种。
                </Text>, {},true,'（1）'),
            crtOmni('上极位',{tspan:0}, {},
                <Text>（2）当取物装置上升到设计规定的上极限位置时，应能立即切断起升动力源。在此极限位置的上方，还应留有足够的空余高度，以适应上升制动行程的要求。
                </Text>, {},true,'（2）'),
            crtOmni('第二级限',{tspan:0}, {},
                <Text>（3）吊运熔融金属的起重机，还应装设防止越程冲顶的第二级起升高度限位器，第二级起升高度限位器应分断更高一级的动力源。
                </Text>, {},true,'（3）'),
            crtOmni('降深限',{tspan:0}, {},
                <Text>（4）需要时（如起升高度大于20m的吊运熔融金属的起重机），还应设下降深度限位器；当取物装置下降到设计规定的下极限位置时，应能立即切断下降动力源。
                </Text>, {},true,'（4）'),
            crtOmni('反方向动',{tspan:0}, {},
                <Text>（5）上述运动方向的电源切断后，仍可进行相反方向运动（第二级起升高度限位器除外）。
                </Text>, {mergName:'运程限器',display:false,mergNos:'5.2',mergLabel:'起升高度（下降深度）限位器',},false,'（5）'),
            crtOmni('行程限',{seco:'5.3',span:1,tspan:0}, {span:1},
                <Text>（1）起重机和起重小车(悬挂型电动葫芦运行小车除外),应在每个运行方向装设运行行程限位器,在达到设计规定的极限位置时自动切断前进方向的动力源。
                </Text>, {nos:'5.3'},false,'运行行程限位器'),
        ],'5.1.3 制动器零件检查-5.3 运行行程限位器');
    pushOmni(ari,'5.4',
        [crtOmni('倾覆危',{bspan:5,seco:'5.4起重量限制器',span:2,},{bspan:12,span:4,third:'5.4.1',tspan:2},
                <Text>（1）动力驱动的无倾覆危险的起重机械和有倾覆危险且在一定的幅度变化范围内额定起重量不变化的起重机械，应装设起重量限制器。
                </Text>, {nos:'5.4.1(1)'},true,),
            crtOmni('限制设置',{}, {},
                <Text>（2）以环链电动葫芦作为起升机构的起重机械可以采用安全离合器的方式来达到超载保护功能。
                </Text>, {mergName:'超载保',mergNos:'5.4.1',mergLabel:'5.4.1设置',nos:'5.4.1(2)',display:false},false,),
            crtOmni('离地面',{},{third:'5.4.2',tspan:2},
                <Text>（1）对起重量限制器，保持载荷离地面100mm～200mm，逐渐无冲击继续加载至1.05倍的额定起重量，应切断上升方向动作，但是机构允许下降方向的运动。
                </Text>, {nos:'5.4.2(1)'},true,),
            crtOmni('环链葫',{}, {},
                <Text>（2）环链葫芦作为起升机构使用时，其出厂合格证明和型式试验证书齐全。
                </Text>, {mergName:'重限制',mergNos:'5.4.2',mergLabel:'5.4.2 首次检验专项要求',nos:'5.4.2(2)',display:false},false,),
            crtOmni(undefined,{seco:'5.6抗风防滑装置',span:3},{span:8,third:'5.6.1',tspan:6},
                <Text>抗风防滑装置的设置应符合以下要求：
                </Text>, {},true,),
            crtOmni('轨道式',{},{},
                <Text>（1）室外工作的轨道式起重机应装设可靠的抗风防滑装置，并应满足规定的工作状态和非工作状态抗风防滑要求。
                </Text>, {},true,),
            crtOmni('构联锁',{},{},
                <Text>（2）工作状态下的抗风制动装置可采用制动器、轮边制动器、夹轨器、顶轨器、压轨器、别轨器等，其制动与释放动作应考虑与运行机构联锁并应能从控制室内自动进行操作。
                </Text>, {},true,),
            crtOmni('锚定装',{},{},
                <Text>（3）只装设抗风制动装置而无锚定装置的，抗风制动装置应能承受起重机非工作状态下的风载荷；当工作状态下的抗风制动装置不能满足非工作状态下的抗风防滑要求时，还应装设牵缆式、插销式或其他形式
                    的锚定装置。起重机有锚定装置时，锚定装置应能独立承受起重机非工作状态下的风载荷。
                </Text>, {},true,),
            crtOmni('非工作状',{},{},
                <Text>（4）非工作状态下的抗风防滑设计，如果只采用制动器、轮边制动器、夹轨器、顶轨器、压轨器、别轨器等抗风制动装置，其制动与释放动作也应考虑与运行机构联锁,并应能从控制室内自动进行操作(手动控制防风装置除外)。
                </Text>, {},true,),
            crtOmni('全可靠',{},{},
                <Text>（5）锚定装置应确保在下列情况下起重机及其相关部件的安全可靠：a) 起重机进入非工作状态并且锚定时；b) 起重机处于工作状态，起重机进行正常作业并实施锚定时；c) 起重机处于工作状态且在正常作业，
                    突然遭遇超过工作状态极限风速的风载而实施锚定时。
                </Text>, {mergName:'防滑装置',mergLabel:'(1)抗风防滑装置设置',mergNos:'5.6.1',display:false},false,),
            crtOmni('气保护',{}, {third:'5.6.2',tspan:1},
                <Text>（1）钳口夹紧情况、锚定的可靠性以及电气保护装置的工作状况应正常，其顶轨器、楔块式防爬器、自锁式防滑动装置动作功能应正常。
                </Text>, {nos:'5.6.2'},false,'(2)动作试验'),
            crtOmni('无缺损',{}, {third:'5.6.3',tspan:1},
                <Text>（2）零件应无缺损。
                </Text>, {nos:'5.6.3'},false,'(3)零件无缺损'),
        ],'5.4 起重量限制器-5.6.3抗风防滑装置');
    pushOmni(ari,'5.7',[
            crtOmni('两台上',{big:'5安全保护和防护装置检查',bspan:6,span:0,},{bspan:13,seco:'5.7',span:1},
                <Text>（1）当两台或者两台以上的起重机械或者起重小车运行在同一轨道上，或者不在同一轨道且有碰撞可能时，应装设防碰撞装置。
                </Text>, {nos:'5.7'},false,'5.7 防碰撞装置'),
            crtOmni('蜂鸣器',{span:0}, {seco:'5.8',span:1},
                <Text>（1）起重机上是否设置蜂鸣器、闪光灯等作业报警装置。
                </Text>, {nos:'5.8'},false,'5.8 报警装置'),
            crtOmni('设缓冲',{span:0},{seco:'5.9',span:2},
                <Text>（1）在轨道上运行的起重机的运行机构、起重小车的运行机构以及起重机的变幅机构等应装设缓冲器或者缓冲装置(缓冲器或者缓冲装置可以安装在起重机上或者轨道端部止挡装置上)。
                </Text>, {},true,),
            crtOmni('机脱轨',{}, {},
                <Text>（2）轨道端部止挡装置应牢固可靠，应能够防止起重机脱轨。
                </Text>, {mergName:'端止挡',mergNos:'5.9',mergLabel:'5.9 缓冲器和端部止挡',display:false},false,),
            crtOmni('急停止',{span:0}, {seco:'5.10',span:1},
                <Text>（1）起重机械紧(应)急停止开关应能够切断起重机械动力电源，并且不能自动复位，应装设在司机操作方便的地方。
                </Text>, {nos:'5.10'},false,'5.10 紧（应）急停止开关'),
            crtOmni('清扫器',{span:0}, {seco:'5.11',span:1},
                <Text>（1）当物料有可能积存在轨道上成为运行的障碍时，在轨道上行驶的起重机和起重小车，在台车架(或者端梁)下面和小车架下面应装设轨道清扫器，扫轨板底面与轨道顶面之间的间隙应不大于10mm。
                    <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Measure`}>
                        <Text variant="h4" css={{"@media print": {display: 'none'}}}>九、观测数据及测量结果记录</Text>
                    </RouterLink>
                </Text>, {nos:'5.11'},false,'5.11 轨道清扫器'),
            crtOmni(undefined,{span:0},{seco:'5.12',span:7,},
                <Text>联锁保护装置应符合以下要求：
                </Text>, {},true,),
            crtOmni('门联锁',{},{},
                <Text>（1）出入起重机械的门、司机室到桥架上的门，应能联锁保护。若使用说明书没有特别说明能够保证使用安全的，当门打开时，动力电源应不能接通，如处于运行状态，当门打开时，动力电源应断开，
                    所有机构运行均应停止。
                </Text>, {},true,),
            crtOmni('通道口',{},{},
                <Text>（2）司机室与进入通道有相对运动时，进入司机室的通道口，应设联锁保护；当通道口的门打开时，应断开由于机构动作可能会对人员造成危险的机构的电源。
                </Text>, {},true,),
            crtOmni('一处操作',{},{},
                <Text>（3）可在两处或多处操作的起重机，应有联锁保护，以保证只能在一处操作，防止两处或多处同时都能操作。
                </Text>, {},true,),
            crtOmni('手动驱',{},{},
                <Text>（4）当既可以电动，也可以手动驱动时，相互间的操作转换应能联锁。
                </Text>, {},true,),
            crtOmni('夹轨器',{},{},
                <Text>（5）夹轨器等制动装置和锚定装置应能与运行机构联锁。
                </Text>, {},true,),
            crtOmni('放平后',{},{},
                <Text>（6）对小车在可俯仰的悬臂上运行的起重机，悬臂俯仰机构与小车运行机构应能联锁，使俯仰悬臂放平后小车方能运行。
                </Text>, {mergName:'锁保护',mergNos:'5.12',mergLabel:'5.12 联锁保护装置',display:false},false,),
        ],'5.7 防碰撞装置-5.12联锁保护装置');
    pushOmni(ari,'5.13',[
        crtOmni('风速仪',{big:'5安全保护和防护装置检查',bspan:7,span:0,},{bspan:7,seco:'5.13',span:1},
            <Text>（1）起升高度大于50m的露天工作起重机应安装风速仪，并且应安装在起重机上部迎风处。
            </Text>, {nos:'5.13'},false,'5.13 风速仪'),
        crtOmni('防雨罩',{span:0}, {seco:'5.14',span:1},
            <Text>（1）起重机械上外露的有可能伤人的运动零部件防护罩、防护栏应齐全，露天作业的起重机械的电气设备防雨罩应齐全，吊运熔融金属起重机的隔热装置应完好。
            </Text>, {nos:'5.14'},false,'5.14 防护罩、防护栏、隔热装置'),
        crtOmni('两圈缆',{span:0}, {seco:'5.16',span:1},
            <Text>（1）运行距离大于电缆长度时，电缆卷筒放缆终点开关功能应有效，在卷筒上应至少有两圈电缆。
            </Text>, {nos:'5.16'},false,'5.16 电缆卷筒终端限位装置'),
        crtOmni('伸缩止挡',{span:0}, {seco:'5.22',span:1},
            <Text>（1）集装箱吊具转锁装置安全联锁、伸缩装置安全联锁、伸缩止挡及其限位应有效。
            </Text>, {nos:'5.22'},false,'5.22 集装箱吊具专项保护装置'),
        crtOmni('翻安全钩',{seco:'5.23桥、门式起重机专项安全保护和防护装置',span:3}, {seco:'5.23桥、门式起重机专项安全保护和防护装置',span:3,third:'5.23.1',tspan:1},
            <Text>（1）在主梁一侧落钩的单主梁起重机防倾翻安全钩，当小车正常运行时，应能够保证安全钩与主梁的间隙合理，运行无卡阻。
            </Text>, {nos:'5.23.1'},false,'5.23.1 防倾翻安全钩'),
        crtOmni('跨度大',{}, {third:'5.23.2',tspan:1},
            <Text>（1）对于跨度大于40m的门式起重机，应设置偏斜显示或者限制装置。
            </Text>, {nos:'5.23.2'},false,'5.23.2 偏斜显示（限制）装置'),
        crtOmni('触线护',{}, {third:'5.23.3',tspan:1},
            <Text>（1）桥式起重机的滑触线应设置防护装置 。多层布置桥式起重机时，下层起重机应采用电缆或者安全滑触线供电。
            </Text>, {nos:'5.23.3'},false,'5.23.3 导电滑触线的安全防护'),
    ],'5.13 风速仪-5.12联锁保护装置');
    pushOmni(ari,'6.1',[
        crtOmni('平衡阀',{big:'6 液压系统检查',bspan:3,span:0,},{bspan:3,seco:'6.1',span:1},
            <Text>（1）平衡阀和液压锁与执行机构为刚性连接。
            </Text>, {nos:'6.1'},false,'(1)平衡阀和液压锁与执行机构连接'),
        crtOmni('回路无漏',{span:0,}, {seco:'6.2',span:1},
            <Text>（2）液压回路无漏油现象。
            </Text>, {nos:'6.2'},false,'(2)液压回路无漏油现象'),
        crtOmni('防爆阀',{span:0,}, {seco:'6.3',span:1},
            <Text>（3）液压缸安全限位装置、防爆阀(或者截止阀)无损坏。
            </Text>, {nos:'6.3'},false,'(3)液压缸安全限位装置、防爆阀(截止阀)'),
        crtOmni('刚性连',{big:'7 司机室检查',bspan:2,span:0,},{bspan:2,seco:'7.1',span:1},
            <Text>（1）司机室配有灭火器。司机室地板应用防滑的非金属隔热材料覆盖。各操作装置标志完好、醒目。
            </Text>, {nos:'7.1'},false,'(1)灭火器、地板覆盖材料、标志'),
        crtOmni('回路无',{span:0,}, {seco:'7.2',span:1},
            <Text>（2）司机室的固定连接牢固，无明显缺陷。在露天工作设置防风、防雨、防晒等防护装置。
            </Text>, {nos:'7.2'},false,'(2)固定牢固，无明显缺陷，露天工作的司机室有防护装置'),
        crtOmni('电气有效',{big:'8 电气检查',bspan:4,seco:'8.1电气设备',span:2,tspan:0},{bspan:4,span:2,third:'8.1.1',tspan:1},
            <Text>（1）电气设备功能应有效。
            </Text>, {nos:'8.1.1'},false,'(1)电气设备功能有效'),
        crtOmni('级绝缘',{tspan:0}, {third:'8.1.2',tspan:1},
            <Text>（1）防爆型、绝缘型、吊运熔融金属的起重机械电气设备及其元器件应与工作环境的防爆、绝缘、温度等级相适应，并且有防护措施；吊运熔融金属的起重机械主起升机构(电动葫芦除外)电动机应采用符合JB/ T10104-2011
                《YZ系列起重及冶金用三相异步电动机 技术条件》和JB/T10105-1999《YZR 系列起重及冶金用绕线转子三相异步电动机 技术条件》中规定的起重及冶金用电动机（必要时也可采用符合起重机要求的其他类型电动机）；环境温度
                超过40℃的场合，应选用H级绝缘的电动机或者采取相应的必要措施。
            </Text>, {nos:'8.1.2'},false,'(2)防爆型、绝缘型、吊运熔融金属的起重机械电气设备及其元器件'),
        crtOmni('电机保',{span:0,}, {seco:'8.2',span:1},
            <Text>（1）电动机应具有如下一种以上(含一种)的保护功能(电动葫芦除外)，具体选用是否按照电动机及其控制方式确定：<br/>(a)瞬动或者反时限动作的过电流保护，其瞬时动作电流整定值应当约为电动机最大起动电流的1.25倍；
                <br/>(b)在电动机内设置热传感元件； <br/>(c)热过载保护。
            </Text>, {nos:'8.2'},false,'8.2 电动机的保护'),
        crtOmni('线路护',{span:0,}, {seco:'8.3',span:1},
            <Text>（1）所有外部线路都应当具有短路或者接地引起的过电流保护功能。
            </Text>, {nos:'8.3'},false,'8.3 线路保护'),
    ],'6 液压系统检查-8.3 线路保护');
    pushOmni(ari,'8.4',[
        crtOmni('错相护',{big:'8电气检查',bspan:9,span:0,},{bspan:12,seco:'8.4',span:1},
            <Text>（1）当错相和缺相会引起危险时，应装设错相和缺相保护。
            </Text>, {nos:'8.4'},false,'8.4 错相与缺相保护'),
        crtOmni('零位保',{span:0,}, {seco:'8.5',span:1},
            <Text>（1）起重机各传动机构应设有零位保护。运行中若因故障或失压停止运行后，重新恢复供电时，机构不得自行动作，应人为将控制器置回零位后，机构才能重新起动。
            </Text>, {nos:'8.5'},false,'8.5 零位保护(机构运行采用自动复位按钮控制的除外)'),
        crtOmni('电源断',{span:0,}, {seco:'8.6',span:1},
            <Text>（1）当起重机械供电电源中断后，凡涉及安全或者不宜自动开启的用电设备应均处于断电状态，避免恢复供电后用电设备自动运行。
            </Text>, {nos:'8.6'},false,'8.6 失压保护)'),
        crtOmni('定子失电',{span:0,}, {seco:'8.7',span:1},
            <Text>（1）对于吊运熔融金属或者发生事故后可能造成重大危险或者损失的起重机械起升机构，电动机应设置定子异常失电保护功能，当调速装置或者正反向接触器故障导致电动机失控时，制动器能够立即上闸。
            </Text>, {nos:'8.7'},false,'8.7 电动机定子异常失电保护'),
        crtOmni('超速关',{span:0,}, {seco:'8.8',span:1},
            <Text>（1）对于重要的、负载超速会引起危险的起升机构和非平衡式变幅机构，应设置超速开关。采用可控硅定子调压、涡流制动器、能耗制动、可控硅供电、直流机组供电调速及其他由于调速可能造成超速的起重机起升机构和非平衡式变幅机构
                必须设置超速保护。吊运熔融金属的起重机，其主起升机构应当设置超速保护，额定起重量不大于5t的电动葫芦除外。超速开关的整定值取决于控制系统性能和额定下降速度，通常为额定下降速度的1.25～1.4倍
            </Text>, {nos:'8.8'},false,'8.8 超速保护装置'),
        crtOmni('外露可导',{seco:'8.9起重机械接地',span:4,third:'8.9.1电气设备接地',tspan:2,fspan:0}, {span:7,third:'8.9.1',tspan:2},
            <Text>（1）电气设备正常情况下不带电的外露可导电部分直接与供电电源保护接地线连接。
            </Text>, {nos:'8.9.1(1)'},false,'(1)电气设备接地'),
        crtOmni('可靠接地',{fspan:0}, { },
            <Text>（2）起重机械上所有电气设备外壳、金属导线管、金属支架及金属线槽均根据配电网情况进行可靠接地(保护接地或者保护接零)。
            </Text>, {nos:'8.9.1(2)'},false,'(2)外壳、金属导线管、金属支架及金属线槽接地'),
        crtOmni('接地非焊',{third:'8.9.2金属结构接地',tspan:2,four:'8.9.2.1',fspan:1}, {tspan:5,four:'8.9.2.1',fspan:2},
            <Text>（1）应设置专用接地线，金属结构的连接有非焊接处，应采用另装设接地干线或者跨接线的处理。
            </Text>, {},true,),
        crtOmni('载流零线',{}, { },
            <Text>（2）按照规定禁用金属结构和接地线作为载流零线(电气系统电压为安全电压除外)。
            </Text>, {mergName:'接地线',mergNos:'8.9.2.1',mergLabel:'接地线',display:false},false,),
        crtOmni('TN接地',{four:'8.9.2.2',fspan:1}, {fspan:3},
            <Text>（1）采用TN接地系统时，PE线重复接地每一处的接地电阻不大于10Ω。
                <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Measure`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>九、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {},true,),
        crtOmni('TT接地',{}, { },
            <Text>（2）采用TT接地系统时，起重机设置漏电保护装置，电气设备的外露可导电部分(电源保护接地线)的接地电阻不大于4Ω。
            </Text>, {},true,),
        crtOmni('IT接地',{}, { },
            <Text>（3）采用IT接地系统时，起重机电气设备的外露可导电部分(电源保护接地线)的接地电阻不大于4Ω。
            </Text>, {mergName:'接地阻',mergNos:'8.9.2.2',mergLabel:'接地电阻',display:false},false,),
    ],'8.4 错相与缺相保护-8.9 起重机械接地');
    pushOmni(ari,'8.10',[
        crtOmni('小500',{bspan:7,seco:'8.10电气线路对地绝缘电阻',span:2,tspan:-1,fspan:0},{bspan:7,seco:'8.10',span:2},
            <Text>（1）额定电压小于或者等于500V时，不低于1.0MΩ；防爆起重机不低于1.5MΩ。
                <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Measure`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>九、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {nos:'8.10(1)'},false,'(1)额定电压不大于500V的电阻(或者防爆起重机的绝缘电阻，MΩ)'),
        crtOmni('绝缘起重',{fspan:0},{},
            <Text>（2）绝缘起重机械，电气线路对地、吊钩与滑轮、起升机构与小车架、小车架与大车的绝缘值均不低于1.0MΩ。
            </Text>, {nos:'8.10(2)'},false,'(2)绝缘型起重机械绝缘电阻 (MΩ)'),
        crtOmni('移照明',{seco:'8.11照明',span:2,tspan:0},{seco:'8.11',span:2},
            <Text>（1）))起重机械的司机室、通道、电气室、机房等，其可移动式照明应是安全电压。
                <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Measure`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>九、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {nos:'8.11(1)'},false,'(1)可移动式照明安全电压(V)'),
        crtOmni('照明线',{tspan:0},{},
            <Text>（2）按规定禁用金属结构做照明线路的回路。
            </Text>, {nos:'8.11(2)'},false,'(2)禁用金属结构做照明线路的回路'),
        crtOmni('信号指',{seco:'8.12信号指示',span:3,tspan:-1,fspan:0},{seco:'8.12',span:3},
            <Text>（1）起重机械总电源开关状态在司机室内有明显的信号指示。
            </Text>, {nos:'8.12(1)'},false,'(1)总电源开关状态的信号指示'),
        crtOmni('清楚听',{fspan:0},{},
            <Text>（2）起重机械(跟随式操作控制的除外)有警示音响信号，并且在起重机械工作场地范围内能够清楚地听到。
            </Text>, {nos:'8.12(2)'},false,'(2)警示音响信号'),
        crtOmni('具锁指示',{fspan:0},{},
            <Text>（3）集装箱专用吊具开闭锁指示信号灯有效。
            </Text>, {nos:'8.12(3)'},false,'(3)集装箱专用吊具开闭锁指示信号灯'),
        crtOmni('全监控',{bspan:0},{big:'9',bspan:1,seco:'9.1',span:1},
            <Text>（1）大型起重机械安全监控管理系统检查符合要求。
            </Text>, {nos:'9.1'},false,'9 大型起重机械安全监控管理系统检查'),
    ],'8.10电气线路对地绝缘电阻-9 安全监控管理系统');
    pushOmni(ari,'10.1',[
        crtOmni('制动可',{big:'10 性能试验',bspan:4,seco:'B10.1 空载试验',span:4,tspan:0},{bspan:4,seco:'10.1',span:4},
            <Text>（1）各机构运转正常，制动可靠；
            </Text>, {nos:'10.1(1)',iclas:'B'},false,'(1)运转、制动情况'),
        crtOmni('电气控',{tspan:0},{},
            <Text>（2）操纵系统、电气控制系统工作正常。
            </Text>, {nos:'10.1(2)',iclas:'B'},false,'(2)操纵系统、电气控制系统工作情况'),
        crtOmni('无啃轨',{tspan:0},{},
            <Text>（3）起重机械沿轨道全长运行无啃轨现象。
            </Text>, {nos:'10.1(3)',iclas:'B'},false,'(3)沿轨道全长运行无啃轨现象'),
        crtOmni('和防护',{tspan:0},{},
            <Text>（4）各种安全保护和防护装置工作可靠有效。
            </Text>, {nos:'10.1(4)',iclas:'B'},false,'(4)各种安全装置和防护装置工作情况'),
        crtOmni('设计文',{big:'11首次检验附加检验项目',bspan:3,seco:'11.1产品技术文件',span:2,tspan:0},{bspan:6,span:2},
            <Text>（1）起重机械设计文件(总图、主要受力结构件图、电气原理图、液压或者气动系统原理图)齐全，并且存档保管。
            </Text>, {nos:'11.1(1)'},false,'(1)起重机械设计文件'),
        crtOmni('型式试验',{tspan:0},{},
            <Text>（2）产品制造单位的制造许可证明或者《特种设备行政许可受理决定书》等相关证明、产品质量合格证明、安装使用维护说明书等随机资料，以及安全保护装置和电动葫芦的型式试验合格证明齐全。
                使用单位还应当提供自检记录。
            </Text>, {nos:'11.1(2)'},false,'(2)产品技术资料、安全保护装置和电动葫芦型式试验证明等'),
        crtOmni(undefined,{span:0},{seco:'11.2起重机械的作业环境和起重机外观',span:4,third:'',tspan:1},
            <Text>通向起重机械通道、起重机械上的通道、平台、梯子和栏杆应符合以下要求：
            </Text>, {},true),
        crtOmni('与平台',{},{third:'11.2.1',tspan:1},
            <Text>1 通道与平台：<br/>（1）起重机上所有操作部位以及要求经常检查和保养的部位，凡离地面距离超过2m的，都应通过斜梯（或楼梯）、平台、通道或直梯到达，梯级的两边应装设护栏。<br/>（2）起重机处在正常工作状态下的任何位置时，
                人员应能方便安全地进出司机室。通向起重机的通道应畅通。只有在空间受到限制时，才允许通过司机室顶部或地板进入司机室。<br/>（3）斜梯、通道和平台的净空高度不应低于1.8m。运动部分附近的通道和平台的净宽度不应小于0.5m；如果
                设有扶手或栏杆，在高度不超过0.6m的范围内，通道的净宽度可减至0.4m。固定部分之间的通道净宽度不应小于0.4m。<br/>（4）工作人员可能停留的每一个表面都应当保证不发生永久变形。<br/>（5）通道离下方裸露动力线的高度小于0.5m
                时，应在这些区域采用实体式地板；当通道靠近动力线时，应对这些动力线加以保护。
                <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Measure`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>九、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {nos:'11.2.1'},true,),
        crtOmni('与直梯',{},{third:'11.2.2',tspan:1},
            <Text>2 斜梯与直梯：<br/>（1）凡高度差超过0.5m的通行路径应做成斜梯或直梯。高度不超过2m的垂直面上（例如桥架主梁的走台与端梁之间），可以设踏脚板，踏脚板两侧应设有扶手。<br/>（2）斜梯：(a)斜梯的倾斜角不应超过75°。
                (b)斜梯两侧应设置栏杆。斜梯的一侧靠墙壁时，只在另一侧设置栏杆。(c)梯级踏板表面应防滑。<br/>（3）直梯：(a)高度2m以上的直梯应有护圈，护圈从2.0m高度起开始安装。(b)直梯每10m至少应设一个休息平台。(c)梯级终端踏板或
                踏杆不应超过平台平面。
            </Text>, {nos:'11.2.2'},true,),
        crtOmni('栏杆',{},{third:'11.2.3',tspan:1},
            <Text>3 栏杆：<br/>（1）在起重机上的以下部位应装设栏杆：(a) 用于进行起重机安装、拆卸、试验、维修和保养，且高于地面2m的工作部位；(b)通往离地面高度2m以上的操作室、检修保养部位的通道；(c) 在起重机上存在跌落高度
                大于1m的危险通道及平台。 <br/>（2）栏杆的设置应满足以下要求：(a) 栏杆上部表面的高度不低于1m，栏杆下部有高度不低于0.1m的踢脚板，在踢脚板与手扶栏杆之间有不少于一根的中间横杆；（b) 栏杆开口处应有防止人员
                跌落的保护措施。
                <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Measure`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>九、观测数据及测量结果记录</Text>
                </RouterLink>
            </Text>, {mergName:'环境外观',mergNos:'11.2',mergLabel:'11.2起重机械的作业环境和起重机外观',nos:'11.2.3',display:false},false),
    ],'10性能试验-11.2起重机械的作业环境和起重机外观');
    pushOmni(ari,'11.3',[
        crtOmni('各机构运',{bspan:3,seco:'11.3性能试验',span:3,tspan:0},{bspan:4,seco:'11.3.1 额定载荷试验',span:4,third:'11.3.1.1',tspan:1},
            <Text>（1）各运行机构运转正常。
            </Text>, {nos:'11.3.1.1'},true),
        crtOmni('受力结构',{},{third:'11.3.1.2',tspan:1},
            <Text>（1）主要受力结构件无明显裂纹、连接松动，无构件损坏等影响起重机性能和安全的缺陷。
            </Text>, {nos:'11.3.1.1'},true),
        crtOmni('定位精度',{},{third:'11.3.1.3',tspan:2},
            <Text>（1）对低定位精度要求的桥、门式起重机，或者具有无级调速控制特性的桥、门式起重机，采用低起升速度和低加速度能达到可接受定位精度的桥、门式起重机，挠度要求不大于S/500；使用简单控制系统就能达到中等定位精度的桥、
                门式起重机，挠度要求不大于S/750；需要高定位精度的桥、门式起重机，挠度要求不大于S/1000。调速控制系统和定位精度若设计文件要求不明确的，挠度要求如下：A1～A3级，挠度不大于S/700；A4～A6级，挠度不大于S/800；A7、
                A8级，挠度不大于S/1000。
            </Text>, {nos:'11.3.1.3(1)'},true),
        crtOmni('臂端挠度',{},{},
            <Text>（2）悬臂端挠度不大于L1/350或者L2/350。
                <RouterLink href={`/report/SINGB-IN/ver/${verId}/${repId}/Stiffness`}>
                    <Text variant="h4" css={{"@media print": {display: 'none'}}}>附录A 11.3.1.3项 主梁挠度值测量记录</Text>
                </RouterLink>
            </Text>, {mergName:'定载荷',mergNos:'11.3.1',mergLabel:'11.3.1 额定载荷试验',nos:'11.3.1.3(2)',display:false},false),
        crtOmni('永久变形',{tspan:0},{bspan:5,seco:'11.3.2 静载试验',span:3},
            <Text>（1）起升额定载荷，离地面100～200mm处，逐渐加载至1.25倍的额定载荷，悬空不少于10分钟，卸载后主要受力结构件应无明显裂纹、永久变形、油漆剥落。最多重复三次后不得有永久变形。
            </Text>, {nos:'11.3.2(1)'},true),
        crtOmni('连接处',{},{},
            <Text>（2）主要机构连接处未出现松动或者损坏。
            </Text>, {nos:'11.3.2(2)'},true),
        crtOmni('其他坏',{},{},
            <Text>（3）无影响性能和安全的其他损坏。
            </Text>, {mergName:'静载试',mergNos:'11.3.2',mergLabel:'11.3.2 静载荷试验',nos:'11.3.2(3)',display:false},false),
        crtOmni('动升降',{tspan:0},{seco:'11.3.3 动载试验',span:2},
            <Text>（1）起重机的各起升机构应分别起吊1.1倍的额定载荷进行试验，按照电动机接电持续率及其工作循环进行升降、大小车运行的单独和联动试验。对各机构在其整个运动范围内作反复起动和制动，还应包括对悬挂着的试验载荷作空中起动，
                此时载荷不应发生不受控制的运动。验验后，各机构动作灵活、制动性能可靠。
            </Text>, {nos:'11.3.3(1)'},true),
        crtOmni('动无损',{},{},
            <Text>（2）结构和机构无损坏，连接无松动。
            </Text>, {mergName:'动载试',mergNos:'11.3.3',mergLabel:'11.3.3 动载荷试验',nos:'11.3.3(2)',display:false},false),
        crtOmni('附属装',{big:'12 其他项目',bspan:1,span:0},{bspan:4,seco:'12.1',span:1},
            <Text>（1）整机的附属装置等符合要求。
            </Text>, {nos:'12.1'},false,'整机的附属装置等'),
    ],'11.3额定载荷试验-12整机的附属装置');

    if(!noDefault)  ari=omniCalculateDefault(ari,{ });        //调试时设checkName=true确保没错
    return { Item: ari, } as { [key: string]: any[] };
};

