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
    pushOmni(ari,'1.1.1',[
        crtOmni(undefined,{big:'A1.1.1使用资料',bspan:1,seco:'A1.1.1',span:1},{bspan:3,span:3 },
            <Text>审查使用单位是否提供以下适用于受检电梯的资料：
            </Text>, { },true,),
        crtOmni('保养说明',{},undefined,
            <Text>(1)电气原理图、液压系统原理图、安装使用维护保养说明书、检验和检测报告；
            </Text>, {nos:'1.1.1(1)',},true,),
        crtOmni('保养记录',{},undefined,
            <Text>(2)日常使用状况记录、维护保养记录、运行故障和事故记录。
            </Text>, {nos:'1.1.1(2)',mergNos:'1.1.1',mergName:'使用资料'},false,'使用资料'),
        crtOmni(undefined,{big:'A1.2.1机器空间',bspan:2,seco:'A1.2.1.1',span:1},{bspan:6,span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('通道畅',{},undefined,
            <Text>(1)通往机器空间的通道保持通畅，相关人员能够安全、方便、无阻碍地使用；如果通往机器空间的通道高出楼梯所到平面不超过4.0m，可以采用固定的梯子作为通道；
            </Text>, {nos:'1.2.1.1(1)',},true,),
        crtOmni('门照明',{},undefined,
            <Text>(2)进入机器空间的门附近的通道设有永久性电气照明。
            </Text>, {nos:'1.2.1.1(2)',mergNos:'1.2.1.1',mergName:'通道照明'},false,'通道及照明'),
        crtOmni(undefined,{seco:'A1.2.1.2',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('通道门',{},undefined,
            <Text>(1)机房通道门不能向机房内开启，其高度不小于1.80m，宽度不小于0.60m；门上装有用钥匙开启的锁，门开启后不用钥匙能够将其关闭和锁住，门锁住后不用钥匙能够从机房内将门打开；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据及测量结果记录</JumpMeasure>
            </Text>, {nos:'1.2.1.2(1)',},true,),
        crtOmni('门警示标',{},undefined,
            <Text>(2)机房通道门外侧设有包含“电梯机器——危险 未经允许禁止入内” 文字的警示标志。
            </Text>, {nos:'1.2.1.2(2)',mergNos:'1.2.1.2',mergName:'机房标志'},false,'机房通道门及警示标志'),
    ],'1.1.1使用资料-1.2.1.2机房通道门及警示标志');
    pushOmni(ari,'1.2.2.1',[
        crtOmni(undefined,{big:'A1.2.2井道',bspan:3,seco:'A1.2.2.1',span:1},{bspan:11,span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('井内照明',{},undefined,
            <Text>(1)井道内设有永久性电气照明；当部分封闭的井道附近有足够的电气照明时，井道内可以不设照明；
            </Text>, {nos:'1.2.2.1(1)',},true,),
        crtOmni('人行照明',{},undefined,
            <Text>(2)斜行电梯的井道内设置永久性人行通道的，沿着人行通道设有应急照明。
            </Text>, {nos:'1.2.2.1(2)',mergNos:'1.2.2.1',mergName:'井道照明'},false,'井道照明'),
        crtOmni(undefined,{seco:'A1.2.2.2',span:1},{span:4 },
            <Text>检查其是否符合下列要求之一：
            </Text>, { },true,),
        crtOmni('固定梯子',{},undefined,
            <Text>(1)供人员从层门进入底坑的梯子为永久设置的固定式梯子，并且不凸入电梯的运行空间；
            </Text>, {nos:'1.2.2.2(1)',},true,),
        crtOmni('非固定梯',{},undefined,
            <Text>(2)供人员从层门进入底坑的梯子为永久设置的非固定式梯子，如果该梯子在展开位置可能与运动部件发生碰撞，当其不在存放位置时，能够通过电气安全装置防止电梯运行；
            </Text>, {nos:'1.2.2.2(2)',},true,),
        crtOmni('坑门',{},undefined,
            <Text>(3)供人员进入底坑的通道门不向底坑内开启，其高度不小于1.80m，宽度不小于0.60m（对于斜行电梯，可以采用尺寸不小于0.80m×0.80m的活板门）；门上装有带钥匙的锁，门开启后不用钥匙能够将其关闭
                和锁住，门锁住后不用钥匙能够从底坑内将门打开；在井道外，通道门附近设有包含“电梯井道——危险 未经允许禁止入内” 文字的警示标志。
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据及测量结果记录</JumpMeasure>
            </Text>, {nos:'1.2.2.2(3)',mergNos:'1.2.2.2',mergName:'进底坑'},false,'进入底坑的措施'),
        crtOmni(undefined,{seco:'A1.2.2.3',span:1},{span:4 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('停止装',{},undefined,
            <Text>(1)底坑内设有在进入底坑时以及在底坑地面上均能够方便操作的停止装置和进入底坑时方便操作的井道照明操作装置，并且功能有效；
            </Text>, {nos:'1.2.2.3(1)',},true,),
        crtOmni('积水',{},undefined,
            <Text>(2)底坑地面平整，无渗水、积水；
            </Text>, {nos:'1.2.2.3(2)',},true,),
        crtOmni('水位限制',{},undefined,
            <Text>(3)消防员电梯的底坑内水位限制措施功能有效。
            </Text>, {nos:'1.2.2.3(3)',mergNos:'1.2.2.3',mergName:'底坑设施'},false,'底坑设施和装置'),
    ],'1.2.2.1井道照明-1.2.2.3底坑设施和装置');
    pushOmni(ari,'1.2.2.4',[
        crtOmni(undefined,{bspan:2,seco:'*A1.2.2.4',span:1},{bspan:8,span:7 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('缓冲松动',{},undefined,
            <Text>(1)缓冲器无松动、明显倾斜、断裂、塑性变形、剥落、破损、严重锈蚀等现象；
            </Text>, {nos:'1.2.2.4(1)',pre:'*',},true,),
        crtOmni('缓冲液位',{},undefined,
            <Text>(2)耗能型缓冲器液位正确，验证柱塞复位的电气安全装置功能有效；
            </Text>, {nos:'1.2.2.4(2)',pre:'*',},true,),
        crtOmni('对重距标',{},undefined,
            <Text>(3)对重缓冲器附近设有清晰的对重越程距离标识；
            </Text>, {nos:'1.2.2.4(3)',pre:'*',},true,),
        crtOmni('撞板顶距',{},undefined,
            <Text>(4)当轿厢位于顶层端站平层位置时，对重装置撞板与其缓冲器顶面间的距离不超过对重越程距离标识上标注的最大允许值；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据及测量结果记录</JumpMeasure>
            </Text>, {nos:'1.2.2.4(4)',pre:'*',},true,),
        crtOmni('无火花措',{},undefined,
            <Text>(5)防爆电梯的缓冲器与轿厢、对重（平衡重）的撞击面采取的无火花措施保持完好。
            </Text>, {nos:'1.2.2.4(5)',pre:'*',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注：（3）（4）不适用于设置前置轿门的斜行电梯。
            </Text>, {pre:'*',mergNos:'1.2.2.4',mergName:'缓冲器'},false,'缓冲器'),
        crtOmni('极位限制',{seco:'A1.2.2.5',},undefined,
            <Text>(1)检查极限位置限制装置是否能够在轿厢（运载装置）、对重接触缓冲器之前或者柱塞接触缓冲停止装置之前起作用，并且在缓冲器被压缩或者柱塞在缓冲停止区的期间能够保持其作用状
                态。注：该条不适用于设置前置轿门的斜行电梯。
            </Text>, {nos:'1.2.2.5',},false,'极限位置限制装置'),
    ],'1.2.2.4缓冲器-1.2.2.5极限位置限制装置');
    pushOmni(ari,'1.2.3.1',[
        crtOmni('主开关',{big:'A1.2.3电气设备（装置）及控制',bspan:5,seco:'A1.2.3.1', },{bspan:11, },
            <Text>(1)检查每台电梯是否单独配置主开关，并且其不能切断轿厢照明和通风、机器空间照明、电梯井道照明以及轿顶、滑轮间和底坑电源插座的电源。
            </Text>, {nos:'1.2.3.1',},false,'主开关'),
        crtOmni('错相保',{seco:'A1.2.3.2',},undefined,
            <Text>(1)检查断相、错相保护功能是否有效；电梯运行与相序无关时，可以不设错相保护。
            </Text>, {nos:'1.2.3.2',},false,'断相、错相保护功能'),
        crtOmni(undefined,{seco:'A1.2.3.3',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('地线接',{},undefined,
            <Text>(1)机器空间的电气设备及线管、线槽的外露可导电部分与保护导体（PE，地线）可靠连接；
            </Text>, {nos:'1.2.3.3(1)',},true,),
        crtOmni('接地故障',{},undefined,
            <Text>(2)含有电气安全装置的电路发生接地故障时,驱动主机立即停止运转，或者在第一次正常停止运转后，能够防止驱动主机再启动；恢复电梯运行只能通过手动复位。
            </Text>, {nos:'1.2.3.3(2)',mergNos:'1.2.3.3',mergName:'接地保护'},false,'接地保护措施'),
        crtOmni(undefined,{seco:'A1.2.3.4',span:1},{span:5 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('旁路字样',{},undefined,
            <Text>(1)层门和轿门旁路装置上或者附近标明“旁路”字样；
            </Text>, {nos:'1.2.3.4(1)',},true,),
        crtOmni('旁关触点',{},undefined,
            <Text>(2)处于旁路状态时，能够旁路层门关闭触点、层门门锁触点、轿门关闭触点、轿门门锁触点，但不能同时旁路层门和轿门的触点；对于手动层门，不能同时旁路层门关闭触点和层门门锁触点；
            </Text>, {nos:'1.2.3.4(2)',},true,),
        crtOmni('取消运行',{},undefined,
            <Text>(3)处于旁路状态时，取消正常运行（包括自动门的任何运行），并且只有在检修运行控制或者紧急电动运行控制下电梯才能运行，轿厢上的听觉信号和轿底的闪烁灯在运行期间起作用；
            </Text>, {nos:'1.2.3.4(3)',},true,),
        crtOmni('轿门关监',{},undefined,
            <Text>(4)提供独立的监控信号证实轿门处于关闭位置。
            </Text>, {nos:'1.2.3.4(4)',mergNos:'1.2.3.4',mergName:'门旁路装'},false,'门旁路装置'),
        crtOmni('门回路监',{seco:'*A1.2.3.5',},undefined,
            <Text>(1)检查当轿厢停在开锁区域内、轿门开启并且层门门锁释放时，门回路监测系统是否对检查轿门关闭位置的电气安全装置、检查层门锁紧装置锁紧位置的电气安全装置，或者轿门电气安全
                装置和层门电气安全装置所构成的电路，以及监控信号的正确动作进行监测，监测到故障时是否能够防止电梯的正常运行。
            </Text>, {nos:'1.2.3.5',pre:'*',},false,'门回路监测功能'),
    ],'1.2.3.1主开关-1.2.3.5门回路监测功能');
    pushOmni(ari,'1.2.3.6',[
        crtOmni('制动监测',{bspan:4,seco:'*A1.2.3.6', },{bspan:11, },
            <Text>(1)检查其是否能够监测制动器的每组制动力或者每次动作时每组机械部件的正确动作（松开或者制动），当监测到失效时，是否能够防止电梯的正常运行。
            </Text>, {nos:'1.2.3.6',pre:'*',},false,'制动器状态监测功能'),
        crtOmni(undefined,{seco:'A1.2.3.7',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('紧急控制',{},undefined,
            <Text>(1)紧急电动运行控制功能有效；
            </Text>, {nos:'1.2.3.7(1)',},true,),
        crtOmni('按钮控制',{},undefined,
            <Text>(2)操作紧急电动运行开关后，依靠持续按压按钮来控制轿厢运行，按钮上或者其附近清晰地标明运行方向；进行紧急电动运行操作时，易于观察轿厢是否在开锁区域。
            </Text>, {nos:'1.2.3.7(2)',mergNos:'1.2.3.7',mergName:'紧急运行'},false,'紧急电动运行控制'),
        crtOmni(undefined,{seco:'*A1.2.3.8',span:1},{span:4 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('动态测试',{},undefined,
            <Text>(1)紧急操作和动态测试功能有效；
            </Text>, {nos:'1.2.3.8(1)',pre:'*',},true,),
        crtOmni('观察窗',{},undefined,
            <Text>(2)设有显示装置或者观察窗，以获得轿厢运行方向、速度以及是否到达开锁区域的信息；
            </Text>, {nos:'1.2.3.8(2)',pre:'*',},true,),
        crtOmni('屏停止装',{},undefined,
            <Text>(3)设有停止装置，除非在其附近1m之内有可以直接接近的主开关或者其他停止装置。
            </Text>, {nos:'1.2.3.8(3)',pre:'*',mergNos:'1.2.3.8',mergName:'测试操屏'},false,'紧急和测试操作屏'),
        crtOmni(undefined,{seco:'*A1.2.3.9',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('双向对讲',{},undefined,
            <Text>(1)轿厢内的紧急报警装置采用由应急电源供电的双向对讲系统与救援服务持续联系；如果电梯行程大于30m或者轿厢内与进行紧急操作处之间无法直接对话，则在轿厢内和进行紧急操作处
                还设置由应急电源供电的双向对讲系统或者类似装置；
            </Text>, {nos:'1.2.3.9(1)',pre:'*',},true,),
        crtOmni('消防通',{},undefined,
            <Text>(2)对于消防员电梯，还设有在优先召回和消防服务阶段用于轿厢和消防员入口层之间、轿厢和机房或者紧急和测试操作屏之间的双向对讲系统或者类似装置，并且无需按压控制按钮即可实
                现轿厢和消防员入口层之间的通信。
            </Text>, {nos:'1.2.3.9(2)',pre:'*',mergNos:'1.2.3.9',mergName:'报警装置'},false,'紧急报警装置(对讲系统)'),
    ],'1.2.3.6制动器状态监测-1.2.3.9紧急报警装置');
    pushOmni(ari,'1.2.3.10',[
        crtOmni(undefined,{bspan:2,seco:'A1.2.3.10',span:1},{bspan:11,span:6 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('外壳光滑',{},undefined,
            <Text>(1)外壳光滑、无损伤，透明件无裂纹，接合面紧固严密，相对运动的间隙防尘密封严密,紧固件无锈蚀、缺损，密封垫圈完好；
            </Text>, {nos:'1.2.3.10(1)',},true,),
        crtOmni('本质安全',{},undefined,
            <Text>(2)本质安全型电气部件（控制柜、操纵箱、召唤箱、轿顶检修箱、接线箱盒、旋转编码器等）的本质安全标志、无电气联锁隔爆型电气部件的“断电后开盖”警告标志清晰；
            </Text>, {nos:'1.2.3.10(2)',},true,),
        crtOmni('隔爆电气',{},undefined,
            <Text>(3)隔爆型电气部件的隔爆面无锈蚀层、机械伤痕和刷漆现象；
            </Text>, {nos:'1.2.3.10(3)',},true,),
        crtOmni('浇封电气',{},undefined,
            <Text>(4)浇封型电气部件的浇封表面无裂缝、剥落、被浇封部分外露现象；
            </Text>, {nos:'1.2.3.10(4)',},true,),
        crtOmni('油浸电气',{},undefined,
            <Text>(5)油浸型电气部件密封良好，无渗漏油，油位高度在规定范围内；外壳、电气和机械连接所用的螺栓、螺母以及注油、排油的螺栓塞等具有防松措施。
            </Text>, {nos:'1.2.3.10(5)',mergNos:'1.2.3.10',mergName:'防爆电气'},false,'防爆电气部件'),
        crtOmni(undefined,{seco:'A1.2.3.11',span:1},{span:5 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('电缆损伤',{},undefined,
            <Text>(1)电缆上易发生机械损伤的部位采取的保护措施完好；
            </Text>, {nos:'1.2.3.11(1)',},true,),
        crtOmni('浅蓝标',{},undefined,
            <Text>(2)本质安全电路的电缆或者电线以及防护套管在进出位置设置的浅蓝色标识清晰完好；
            </Text>, {nos:'1.2.3.11(2)',},true,),
        crtOmni('密封圈',{},undefined,
            <Text>(3)非本质安全型防爆电气部件的电缆引入装置能够夹紧电缆，其密封措施（弹性密封圈或者填料）完好；
            </Text>, {nos:'1.2.3.11(3)',},true,),
        crtOmni('缆孔封堵',{},undefined,
            <Text>(4)用于封堵非本质安全型防爆电气部件外壳上多余的电缆引入孔的封堵件完好。
            </Text>, {nos:'1.2.3.11(4)',mergNos:'1.2.3.11',mergName:'防爆电缆'},false,'防爆电缆'),
    ],'1.2.3.10防爆电气部件-1.2.3.11防爆电缆');
    pushOmni(ari,'1.2.3.12',[
        crtOmni(undefined,{bspan:4,seco:'*A1.2.3.12',span:1},{bspan:13,span:5 },
            <Text>检查当消防员电梯进入优先召回阶段后，是否符合以下要求：
            </Text>, { },true,),
        crtOmni('呼梯取消',{},undefined,
            <Text>(1)层站控制和轿厢内控制以及受热、烟影响的门再开启保护装置均无效，已登记的呼梯均被取消，但开门和紧急报警按钮以及开门超时报警装置均保持有效；
            </Text>, {nos:'1.2.3.12(1)',pre:'*',},true,),
        crtOmni('鸣响',{},undefined,
            <Text>(2)轿厢内的听觉信号鸣响，直至门关闭；
            </Text>, {nos:'1.2.3.12(2)',pre:'*',},true,),
        crtOmni('脱离群组',{},undefined,
            <Text>(3)电梯脱离群组独立运行；
            </Text>, {nos:'1.2.3.12(3)',pre:'*',},true,),
        crtOmni('消防入口',{},undefined,
            <Text>(4)正在离开消防员入口层的消防员电梯，在可以正常停站的最近楼层作一次停站，不开门，然后返回到消防员入口层；正在驶向消防员入口层的消防员电梯，向消防员入口层不停站继续运
                行，如果已经开始停站，消防员电梯可在正常停站后不开门继续向消防员入口层运行；到达后，停靠在该层,设置有消防员电梯开关一侧的轿门和层门保持在完全打开位置。
            </Text>, {nos:'1.2.3.12(4)',pre:'*',mergNos:'1.2.3.12',mergName:'优先召回'},false,'优先召回'),
        crtOmni(undefined,{seco:'*A1.2.3.13',span:1},{span:5 },
            <Text>检查在消防员控制下使用消防员电梯时，是否符合以下要求：
            </Text>, { },true,),
        crtOmni('门自动关',{},undefined,
            <Text>(1)持续按压轿厢内选层按钮或者关门按钮，使门关闭，在门完全关闭前，如果释放按钮，门能够自动再打开；如果轿厢停靠在层站，仅能通过持续按压轿厢内开门按钮控制门打开，如果在
                距离门完全打开不超过50mm之前释放轿厢内开门按钮，门自动再关闭；
            </Text>, {nos:'1.2.3.13(1)',pre:'*',},true,),
        crtOmni('选层登记',{},undefined,
            <Text>(2)轿厢内选层指令每次只能登记一个，已登记的轿厢内指令显示在轿厢内控制装置上；登记一个新的轿厢内选层指令时，原来的指令被取消,并且在最短的时间内运行到新登记的层站；
            </Text>, {nos:'1.2.3.13(2)',pre:'*',},true,),
        crtOmni('显轿厢位',{},undefined,
            <Text>(3)供电电源有效时，在轿厢内和消防员入口层均显示出轿厢的位置；
            </Text>, {nos:'1.2.3.13(3)',pre:'*',},true,),
        crtOmni('热烟保护',{},undefined,
            <Text>(4)受热、烟影响的门再开启保护装置无效，但是轿门重开门功能和开门按钮保持有效状态。
            </Text>, {nos:'1.2.3.13(4)',pre:'*',mergNos:'1.2.3.13',mergName:'消防服务'},false,'消防服务'),
        crtOmni('恢复正常',{seco:'*A1.2.3.14',},undefined,
            <Text>(1)检查是否只有当消防员电梯开关被转换到位置“0”，并且电梯已回到消防员入口层时，消防员电梯才能恢复到正常服务状态。
            </Text>, {nos:'1.2.3.14',pre:'*',},false,'恢复正常服务'),
        crtOmni('保持5s',{seco:'*A1.2.3.15',span:1},{span:2 },
            <Text>(1)检查是否只有当操作消防员电梯开关从位置“1”到“0”，保持至少5s，再回到“1”时，消防员电梯才能重新处于优先召回阶段，并且返回到消防员入口层。
            </Text>, {nos:'1.2.3.15(1)',pre:'*',},true,),
        crtOmni(undefined,{ },undefined,
            <Text>注：该条不适用于设置轿厢内消防员钥匙开关的消防员电梯。
            </Text>, {pre:'*',mergNos:'1.2.3.15',mergName:'再次召回'},false,'再次优先召回'),
    ],'1.2.3.12优先召回-1.2.3.15再次优先召回');
    pushOmni(ari,'1.2.4.1',[
        crtOmni('主机停止',{big:'A1.2.4 驱动主机',bspan:5,seco:'A1.2.4.1', },{bspan:13, },
            <Text>(1)检查在驱动主机附近1m之内是否设有可以直接接近的主开关或者停止装置，并且功能有效。
            </Text>, {nos:'1.2.4.1',},false,'驱动主机停止装置'),
        crtOmni('曳引绳槽',{seco:'A1.2.4.2',},undefined,
            <Text>(1)检查曳引轮绳槽（带槽）是否无缺损或者不正常磨损。
            </Text>, {nos:'1.2.4.2',},false,'曳引轮绳槽（带槽）'),
        crtOmni(undefined,{seco:'*A1.2.4.3',span:1},{span:4 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('独测制动',{},undefined,
            <Text>(1)能够从井道外独立地测试每个制动组；
            </Text>, {nos:'1.2.4.3(1)',pre:'*',},true,),
        crtOmni('制动动作',{},undefined,
            <Text>(2)制动器动作灵活，制动时制动闸瓦（制动钳）紧密、均匀地贴合在制动轮（制动盘）上，电梯运行时制动闸瓦（制动钳）与制动轮（制动盘）不发生摩擦，制动闸瓦（制动钳）以及制动
                轮（制动盘）工作面上无油污；
            </Text>, {nos:'1.2.4.3(2)',pre:'*',},true,),
        crtOmni('鼓式制动',{},undefined,
            <Text>(3)对于需要定期拆解保养的柱塞式电磁铁型式的杠杆鼓式制动器，维护保养单位按照受检电梯制造（改造）单位（该单位已经注销时，按照相应驱动主机的制造单位或者型式试验机构）的
                要求进行了拆解保养，并且提供了拆解保养过程的视频或者照片等见证资料。
            </Text>, {nos:'1.2.4.3(3)',pre:'*',mergNos:'1.2.4.3',mergName:'制动器'},false,'制动器'),
        crtOmni(undefined,{seco:'*A1.2.4.7',span:1},{span:6 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('手动机械',{},undefined,
            <Text>(1)对于曳引与强制驱动电梯，能够通过持续手动操作的机械装置或者由自动充电的紧急电源供电的电气装置打开驱动主机制动器，并且该装置的失效不会导致制动功能的失效；
            </Text>, {nos:'1.2.4.7(1)',pre:'*',},true,),
        crtOmni('松开制动',{},undefined,
            <Text>(2)手动松开制动器后仅在重力作用下轿厢（运载装置）不能移动时，能够通过手动机械装置、独立于主电源供电的手动操作电动装置或者其他措施将轿厢（运载装置）移动到附近层站；
            </Text>, {nos:'1.2.4.7(2)',pre:'*',},true,),
        crtOmni('无辐轮子',{},undefined,
            <Text>(3)如果电梯的移动可能带动手动机械装置，该装置是平滑和无辐条的轮子；
            </Text>, {nos:'1.2.4.7(3)',pre:'*',},true,),
        crtOmni('主机电安',{},undefined,
            <Text>(4)如果手动机械装置可以从驱动主机上拆卸或者脱出，设有最迟在其连接到驱动主机时起作用的电气安全装置；
            </Text>, {nos:'1.2.4.7(4)',pre:'*',},true,),
        crtOmni('厢开锁否',{},undefined,
            <Text>(7)在紧急操作处，易于检查轿厢是否在开锁区域。
            </Text>, {nos:'1.2.4.7(7)',pre:'*',mergNos:'1.2.4.7',mergName:'手动急操'},false,'手动紧急操作装置'),
        crtOmni('表面温',{seco:'A1.2.4.8',},undefined,
            <Text>(1)检查防爆电梯的电动机、减速器、液压泵站、制动部件的外壳以及防爆电气部件外壳的最高表面温度是否不超过整机防爆标志中的温度组别要求。
            </Text>, {nos:'1.2.4.8',},false,'表面温度'),
    ],'1.2.4.1驱动主机停止装置-1.2.4.8表面温度');
    pushOmni(ari,'1.2.5.1',[
        crtOmni(undefined,{big:'A1.2.5悬挂装置、补偿装置及旋转部件',bspan:3,seco:'A1.2.5.1',span:1},{bspan:10,span:3 },
            <Text>检查悬挂钢丝绳、补偿钢丝绳是否符合以下要求:
            </Text>, { },true,),
        crtOmni('笼状畸变',{},undefined,
            <Text>(1)无笼状畸变、绳股挤出、扭结、部分压扁、弯折、严重锈蚀、铁锈填满绳股间隙、直径小于其公称直径的90%等达到报废条件的现象；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据及测量结果记录</JumpMeasure>
            </Text>, {nos:'1.2.5.1(1)',},true,),
        crtOmni('捻距断丝',{},undefined,
            <div>(2)一个捻距内的断丝数（注）不超过下表所列数值。
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
            </div>, {nos: '1.2.5.1(2)', mergNos: '1.2.5.1', mergName: '钢丝绳'}, false, '钢丝绳'),
        crtOmni(undefined, {seco: 'A1.2.5.2', span: 1}, {span: 4},
            <Text>检查其是否符合以下要求：
            </Text>, {}, true,),
        crtOmni('覆层变形', {}, undefined,
            <Text>(1)无包覆层变形（如鼓包、压痕、折痕、凹陷等）、包覆带承载体外露或者刺出、承载体断裂等达到报废条件的现象；
            </Text>, {nos: '1.2.5.2(1)',}, true,),
        crtOmni('监测承载', {}, undefined,
            <Text>(2)设有监测每根包覆带承载体强度的装置，当检测到任一根承载体破断时，能够防止电梯的下一次正常启动；
            </Text>, {nos: '1.2.5.2(2)',}, true,),
        crtOmni('覆带用时', {}, undefined,
            <Text>(3)用于查看包覆带使用时间或者电梯启动次数的装置完好。
            </Text>, {nos: '1.2.5.2(3)', mergNos: '1.2.5.2', mergName: '包覆带'}, false, '包覆带'),
        crtOmni(undefined, {seco: 'A1.2.5.3', span: 1}, {span: 3},
            <Text>检查其是否符合以下要求：
            </Text>, {}, true,),
        crtOmni('端部松动', {}, undefined,
            <Text>(1)悬挂装置的端部固定部件无裂纹、松动等现象，端接装置的弹簧、螺母、开口销等连接部件无缺损；
            </Text>, {nos: '1.2.5.3(1)',}, true,),
        crtOmni('两绳夹', {}, undefined,
            <Text>(2)对于强制驱动电梯，采用带楔块的压紧装置或者至少用两个绳夹将悬挂装置固定在卷筒上。
            </Text>, {nos: '1.2.5.3(2)', mergNos: '1.2.5.3', mergName: '端部固定'}, false, '悬挂装置端部固定'),
    ], '1.2.5.1钢丝绳-1.2.5.3悬挂装置端部固定');
    pushOmni(ari,'1.2.5.4',[
        crtOmni(undefined,{bspan:4,seco:'A1.2.5.4',span:1},{bspan:12,span:4 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('补偿固定',{},undefined,
            <Text>(1)补偿装置的端部固定部件无裂纹、松动等现象；
            </Text>, {nos:'1.2.5.4(1)',},true,),
        crtOmni('防跳装置',{},undefined,
            <Text>(2)使用电气安全装置来检查补偿绳的最小张紧位置（对于斜行电梯，当不采用重力张紧装置时，设置电气安全装置检查补偿绳的最大张紧位置）；当电梯的额定速度大于3.5m/s（对于斜
                行电梯，大于2.5m/s）时，设有防跳装置，该装置动作时由电气安全装置使电梯停止运行；
            </Text>, {nos:'1.2.5.4(2)',},true,),
        crtOmni('防爆补偿',{},undefined,
            <Text>(3)防爆电梯的补偿链（绳）外部无火花措施保持完好，并且运动时不与其他金属构件、底坑地面相碰擦。
            </Text>, {nos:'1.2.5.4(3)',mergNos:'1.2.5.4',mergName:'补偿装置'},false,'补偿装置'),
        crtOmni('伸长保护',{seco:'A1.2.5.5',},undefined,
            <Text>(1)如果轿厢（运载装置）悬挂在包覆带或者两根钢丝绳上，检查当任意一根悬挂装置发生异常相对伸长时，是否能够通过电气安全装置防止电梯的正常运行。
            </Text>, {nos:'1.2.5.5',},false,'异常伸长保护措施'),
        crtOmni(undefined,{seco:'*A1.2.5.6',span:1},{span:6 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('速度17',{},undefined,
            <Text>(1)电梯的额定速度不大于1.75m/s；
            </Text>, {nos:'1.2.5.6(1)',pre:'*',},true,),
        crtOmni('反绳标识',{},undefined,
            <Text>(2)反绳轮上或者附近设有永久固定和清晰的标识，标明反绳轮制造单位名称或者商标、制造日期、维护保养要求（如润滑方法与周期）及报废条件；
            </Text>, {nos:'1.2.5.6(2)',pre:'*',},true,),
        crtOmni('保养见证',{},undefined,
            <Text>(3)维护保养单位按照要求进行了维护保养，并且提供了维护保养过程的视频或者照片等见证资料；
            </Text>, {nos:'1.2.5.6(3)',pre:'*',},true,),
        crtOmni('脱离绳槽',{},undefined,
            <Text>(4)在进行A1.3条所述的各项试验前、后，均未出现悬挂装置脱离绳槽（带槽）、轮及轮轴偏转、固定结构变形等现象。
            </Text>, {nos:'1.2.5.6(4)',pre:'*',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注：对于未按照《电梯监督检验和定期检验规则》附件A中A1.2.5.7条第（1）和第（2）项对非金属材质反绳轮进行过监督检验的电梯，应当至少符合第（3）和第（4）项的要求。
            </Text>, {pre:'*',mergNos:'1.2.5.6',mergName:'反绳轮'},false,'非金属材质反绳轮'),
        crtOmni('旋转防护',{seco:'A1.2.5.7',},undefined,
            <Text>(1)检查曳引轮、滑轮、限速器和张紧轮是否设置防护装置，以避免人身伤害、钢丝绳（包覆带）因松弛而脱离绳槽（带槽）、异物进入钢丝绳（包覆带）与绳槽（带槽）之间，并且防护
                装置与运动部件无碰擦。对于允许按照GB 7588—1995《电梯制造与安装安全规范》及更早期标准生产的电梯，采用悬臂式曳引轮的，检查是否至少设有防止钢丝绳脱离绳槽的装置，并且
                当驱动主机不装设在井道上部时，有防止异物进入绳与绳槽之间的装置。
            </Text>, {nos:'1.2.5.7',},false,'旋转部件防护装置'),
    ],'1.2.5.4补偿装置-1.2.5.7旋转部件防护装置');
    pushOmni(ari,'1.2.6.1',[
        crtOmni('顶设停止',{big:'A1.2.6轿厢（运载装置）与对重（平衡重）',bspan:4,seco:'A1.2.6.1',span:1},{bspan:10,span:2 },
            <Text>(1)检查轿顶上距入口不大于1m处是否设有易于接近的停止装置（注），并且功能有效；该装置也可以是距入口不大于1m的检修控制装置上的停止装置。
            </Text>, {nos:'1.2.6.1(1)',},true,),
        crtOmni(undefined,{ },undefined,
            <Text>注:对于斜行电梯，仅当轿顶作为工作区域时应当设置轿顶停止装置。
            </Text>, {mergNos:'1.2.6.1',mergName:'轿顶停止'},false,'轿顶停止装置'),
        crtOmni('厢安全窗',{seco:'A1.2.6.2',},undefined,
            <Text>(1)如果设有轿厢安全窗，检查安全窗的锁紧是否由电气安全装置验证。
            </Text>, {nos:'1.2.6.2',},false,'轿厢安全窗'),
        crtOmni('厢安全门',{seco:'A1.2.6.3',},undefined,
            <Text>(1)如果设有轿厢安全门，检查安全门的锁紧是否由电气安全装置验证。
            </Text>, {nos:'1.2.6.3',},false,'轿厢安全门'),
        crtOmni(undefined,{seco:'A1.2.6.4',span:1},{span:6 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('对重松动',{},undefined,
            <Text>(1)对重（平衡重）块无松动、移位等现象；
            </Text>, {nos:'1.2.6.4(1)',},true,),
        crtOmni('识别对重',{},undefined,
            <Text>(2)具有能够快速识别对重（平衡重）块数量的措施（例如标明数量或者总高度），并且该措施不会被混淆；
            </Text>, {nos:'1.2.6.4(2)',},true,),
        crtOmni('对重标识',{},undefined,
            <Text>(3)非金属材质对重（平衡重）块（架）上、轿顶上或者底坑内有清晰的标识，标明对重（平衡重）块制造单位名称或者商标和报废条件；
            </Text>, {nos:'1.2.6.4(3)',},true,),
        crtOmni('对重开裂',{},undefined,
            <Text>(4)在进行A1.3条所述的各项试验前、后，对重（平衡重）块及其包覆物均无影响产品性能的开裂、破碎、剥落、腐蚀等现象。
            </Text>, {nos:'1.2.6.4(4)',},true,),
        crtOmni(undefined,{},undefined,
            <Text>对于未按照《电梯监督检验和定期检验规则》附件A中 A1.2.6.6条第（3）项对非金属材质对重（平衡重）块进行过监督检验的电梯，应当至少符合第（1）、第（2）、第（4）项的要求。
            </Text>, {mergNos:'1.2.6.4',mergName:'对重平块'},false,'对重(平衡重)块'),
    ],'1.2.6.1轿顶停止装置-1.2.6.4对重(平衡重)块');
    pushOmni(ari,'1.2.6.5',[
        crtOmni(undefined,{bspan:4,seco:'A1.2.6.5',span:1},{bspan:8,span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('照明通风',{},undefined,
            <Text>(1)轿厢正常照明和通风有效；
            </Text>, {nos:'1.2.6.5(1)',},true,),
        crtOmni('应急照明',{},undefined,
            <Text>(2)在正常照明电源发生故障的情况下，由紧急电源供电的应急照明能够自动投入工作。
            </Text>, {nos:'1.2.6.5(2)',mergNos:'1.2.6.5',mergName:'轿厢通风'},false,'轿厢照明及通风'),
        crtOmni('语音播报',{seco:'A1.2.6.6',},undefined,
            <Text>(1)检查在停电、故障停梯、轿厢位置校正（再平层除外）、自动救援操作装置启动以及接收火灾信号退出正常服务时，轿厢语音播报系统是否进行语音播报，提示、安抚轿厢内乘客。
            </Text>, {nos:'1.2.6.6',},false,'轿厢语音播报系统'),
        crtOmni(undefined,{seco:'A1.2.6.7',span:1},{span:3 },
            <Text>检查其是否符合下列要求之一：
            </Text>, { },true,),
        crtOmni('脚板高',{},undefined,
            <Text>(1)对于非斜行电梯，轿厢护脚板的垂直部分高度不小于0.75m，宽度不小于层站入口宽度；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据及测量结果记录</JumpMeasure>
            </Text>, {nos:'1.2.6.7(1)',},true,),
        crtOmni('脚斜行梯',{},undefined,
            <Text>(2)对于斜行电梯，轿厢护脚板的宽度至少等于运载装置位于开锁区域内时相应层站入口可能暴露的整个净宽度；设有侧置轿门时，其垂直部分的尺寸能够保护所有可能暴露的表面；设有前
                置轿门时，面对较低的层站侧，垂直部分的高度不小于0.30m。
            </Text>, {nos:'1.2.6.7(2)',mergNos:'1.2.6.7',mergName:'护脚板'},false,'轿厢护脚板'),
        crtOmni('扶手立柱',{seco:'A1.2.6.8',},undefined,
            <Text>(1)检查斜行电梯轿厢内是否设有供乘客就近抓握的扶手、立柱等装置。
            </Text>, {nos:'1.2.6.8',},false,'扶手、立柱等装置'),
    ],'1.2.6.5轿厢照明及通风-1.2.6.8扶手、立柱');
    pushOmni(ari,'1.2.7.1',[
        crtOmni(undefined,{big:'A1.2.7层门和轿门',bspan:4,seco:'*A1.2.7.1',span:1},{bspan:9,span:3 },
            <Text>测量门关闭后的间隙是否符合以下要求:
            </Text>, { },true,),
        crtOmni('门扇之间',{},undefined,
            <Text>(1)门扇之间及门扇与立柱、门楣和地坎之间的间隙，对于乘客电梯不大于6mm；对于载货电梯不大于10mm；
                <JumpMeasure tag={'Gap'} rep={rep}>附录A 电梯层门和轿门间隙、门锁啮合长度及门刀、滚轮与地坎间距检测记录</JumpMeasure>
            </Text>, {nos:'1.2.7.1(1)',pre:'*',},true,),
        crtOmni('最不利点',{},undefined,
            <Text>(2)在水平滑动层门和折叠层门最快门扇的开启方向，以150N的力施加在一个最不利的点，本条第（1）项所述的间隙对于旁开门不大于30mm，对于中分门其总和不大于45mm。
            </Text>, {nos:'1.2.7.1(2)',pre:'*',mergNos:'1.2.7.1',mergName:'门间隙'},false,'门间隙'),
        crtOmni('玻璃防曳',{seco:'A1.2.7.2',},undefined,
            <Text>(1)检查防止儿童的手被玻璃门拖曳的措施是否有效。
            </Text>, {nos:'1.2.7.2',},false,'玻璃门防拖曳措施'),
        crtOmni('门再开保',{seco:'*A1.2.7.3',},undefined,
            <Text>(1)检查自动水平滑动门关闭过程中人员通过入口时，保护装置是否能够自动使门重新开启。对于未按照《电梯监督检验和定期检验规则》附件A中A1.2.7.4条第一款要求对门再开启保护装置
                进行过监督检验的电梯，检查当人员通过入口被正在关闭的门扇撞击或者将被撞击时，保护装置是否能够自动使门重新开启。
            </Text>, {nos:'1.2.7.3',pre:'*',},false,'门再开启保护装置'),
        crtOmni(undefined,{seco:'*A1.2.7.4',span:1},{span:4 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('脱轨卡阻',{},undefined,
            <Text>(1)层门和轿门正常运行时无脱轨、机械卡阻或者错位现象；
            </Text>, {nos:'1.2.7.4(1)',pre:'*',},true,),
        crtOmni('层门保持',{},undefined,
            <Text>(2)层门导向装置失效时，层门保持装置能够使层门保持在原有位置；
            </Text>, {nos:'1.2.7.4(2)',pre:'*',},true,),
        crtOmni('最小啮合',{},undefined,
            <Text>(3)在层门底部保持装置上或者其附近设有识别保持装置最小啮合深度的标记，并且层门底部保持装置的啮合深度不小于标记所示的最小啮合深度。
            </Text>, {nos:'1.2.7.4(3)',pre:'*',mergNos:'1.2.7.4',mergName:'门导向'},false,'门的运行与导向'),
    ],'1.2.7.1门间隙-1.2.7.4门的运行与导向');
    pushOmni(ari,'1.2.7.5',[
        crtOmni(undefined,{bspan:4,seco:'*A1.2.7.5',span:1},{bspan:12,span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('关层门',{},undefined,
            <Text>(1)在轿门驱动层门的情况下，当轿厢在开锁区域之外时，自动关闭层门装置能够使开启的层门关闭；
            </Text>, {nos:'1.2.7.5(1)',pre:'*',},true,),
        crtOmni('重块坠',{},undefined,
            <Text>(2)自动关闭层门装置采用重块的，其防止重块坠落的措施保持有效；对于防爆电梯，无火花措施保持完好。
            </Text>, {nos:'1.2.7.5(2)',pre:'*',mergNos:'1.2.7.5',mergName:'自动关门'},false,'自动关闭层门装置'),
        crtOmni(undefined,{seco:'*A1.2.7.6',span:1},{span:3 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('专用钥匙',{},undefined,
            <Text>(1)每个层门均能够被专用钥匙从外面开启；紧急开锁后，在层门闭合时门锁装置未保持在开锁位置；
            </Text>, {nos:'1.2.7.6(1)',pre:'*',},true,),
        crtOmni('底坑开门',{},undefined,
            <Text>(2)如果只能通过层门进入底坑，则从底坑爬梯并且在高度1.80m内和最大水平距离0.80m范围内能够安全地触及门锁，或者能够通过永久设置的装置从底坑中打开层门。
            </Text>, {nos:'1.2.7.6(2)',pre:'*',mergNos:'1.2.7.6',mergName:'紧急开锁'},false,'紧急开锁'),
        crtOmni(undefined,{seco:'*A1.2.7.7',span:1},{span:5 },
            <Text>检查其是否符合以下要求：
            </Text>, { },true,),
        crtOmni('弹簧失效',{},undefined,
            <Text>(1)锁紧动作由重力、永久磁铁或者弹簧来产生和保持，即使永久磁铁或者弹簧失效，重力也不能导致开锁；
            </Text>, {nos:'1.2.7.7(1)',pre:'*',},true,),
        crtOmni('锁紧启动',{},undefined,
            <Text>(2)轿厢（运载装置）在锁紧元件啮合不小于7mm时才能启动；
                <JumpMeasure tag={'Gap'} rep={rep}>附录A 电梯层门和轿门间隙、门锁啮合长度及门刀、滚轮与地坎间距检测记录</JumpMeasure>
            </Text>, {nos:'1.2.7.7(2)',pre:'*',},true,),
        crtOmni('门锁电安',{},undefined,
            <Text>(3)检查层门、轿门锁紧状态的电气安全装置功能有效；
            </Text>, {nos:'1.2.7.7(3)',pre:'*',},true,),
        crtOmni('滑动门',{},undefined,
            <Text>(4)每个层门和轿门的闭合均由电气安全装置来验证；如果滑动门是由数个间接机械连接的门扇组成，则未被锁住的门扇上设有电气安全装置以验证其闭合状态；与门的驱动部件直接机械连
                接的轿门门扇可以不设置电气安全装置。
            </Text>, {nos:'1.2.7.7(4)',pre:'*',mergNos:'1.2.7.7',mergName:'门锁紧'},false,'门的锁紧与闭合'),
        crtOmni('门刀地坎',{seco:'A1.2.7.8',},undefined,
            <Text>(1)检查轿门门刀与层门地坎、层门门锁滚轮与轿厢地坎的间隙是否不小于5mm，并且电梯运行时不互相碰擦。
            </Text>, {nos:'1.2.7.8',},false,'门刀、门锁滚轮与地坎间隙'),
    ],'1.2.7.5自动关层门-1.2.7.8门刀、门锁滚轮与地坎间隙');
    pushOmni(ari,'1.3.1',[
        crtOmni('救援程序',{big:'*A1.3.1应急救援试验',bspan:1,seco:'*A1.3.1',span:1},{bspan:5,span:5 },
            <Text>(1)检查机房内或者紧急和测试操作屏上是否设有清晰的应急救援程序；
            </Text>, {nos:'1.3.1(1)',pre:'*',},true,),
        crtOmni('无阻碍',{},undefined,
            <Text>(2)对于曳引驱动乘客电梯和消防员电梯、曳引与强制驱动载货电梯，检查建筑物内的救援通道是否保持通畅，应急救援人员是否能够无阻碍地抵达实施紧急操作的位置，以及各层站处（注）；
            </Text>, {nos:'1.3.1(2)',pre:'*',},true,),
        crtOmni('轿顶进入',{},undefined,
            <Text>(3)对于消防员电梯，检查用于消防员从轿厢内自救和从轿厢外救援使用的救援装置（如便携式梯子、绳梯、安全绳系统、轿厢内踩踏点等）功能是否正常，用于消防员从轿顶进入轿厢的梯
                子是否能够从轿顶展开；
            </Text>, {nos:'1.3.1(3)',pre:'*',},true,),
        crtOmni('解救',{},undefined,
            <Text>(4)在各种载荷工况下，按照本条第（1）项所述的应急救援程序实施操作，观察是否能够安全、及时地解救被困人员。
            </Text>, {nos:'1.3.1(4)',pre:'*',},true,),
        crtOmni(undefined,{ },undefined,
            <Text>注:对于按TSG T7001—2009（含第1、第2号修改单）、TSG T7002—2011（含第1、第2号修改单）实施前监督检验合格的和在现有建筑物中增设的曳引驱动乘客电梯和消防员电梯、曳引
                与强制驱动载货电梯，因建筑结构等原因而难以达到本条中有关无阻碍地抵达各层站处这一要求时，如果使用单位采取了有效措施（例如:保证救援人员可以通过钥匙或者强制手段打开通往
                电梯层站的门窗等阻隔，及时到达实施救援的层站，并且按规定开展了应急救援演练）并且征得了相关利益方的同意，同时符合本条中的其他要求，可以判定本条的检测结果为符合要求。
            </Text>, {mergNos:'1.3.1',pre:'*',mergName:'救援试验'},false,'应急救援试验'),
        crtOmni(undefined,{big:'*A1.3.2平衡系数测试',bspan:1,seco:'*A1.3.2',span:1},{bspan:4,span:4 },
            <Text>对平衡系数进行确认或者测试，判断其是否符合下列要求之一：
            </Text>, { },true,),
        crtOmni('4050',{},undefined,
            <Text>(1)在0.40~0.50之间，并且符合制造（改造）单位的设计值；
            </Text>, {nos:'1.3.2(1)',pre:'*',},true,),
        crtOmni('斜行未按',{},undefined,
            <Text>(2)在0.40~0.50之间，或者符合制造（改造）单位的设计值[仅适用于斜行电梯和未按照《电梯监督检验和定期检验规则》附件A中A1.3.2条第（1）项对平衡系数进行过监督检验的电梯]。
            </Text>, {nos:'1.3.2(2)',pre:'*',},true,),
        crtOmni(undefined,{},undefined,
            <Text>注:①只有当本条即A1.3.2检测结果为符合时方可以进行后续各项试验。②检测时，发现轿厢、对重或者其他部件（如补偿装置）的重量发生变化，并且可能导致平衡系数发生变化的，应当
                测试平衡系数。
                <JumpMeasure tag={'Equilibrium'} rep={rep}>附录B A1.3.2平衡系数测试</JumpMeasure>
            </Text>, {pre:'*',mergNos:'1.3.2',mergName:'平衡测试'},false,'平衡系数测试'),
    ],'1.3.1应急救援试验-1.3.2平衡系数测试');
    pushOmni(ari, '1.3.3', [
        crtOmni('厢超载保', {big: 'A1.3.3轿厢超载保护装置试验', bspan:1,seco:'A1.3.3',span:1,},{bspan:1,span:1,},
            <Text>(1)进行轿厢超载保护装置试验，观察是否最迟在轿厢内载荷达到110%额定载重量时能够检测
                出超载，防止电梯正常启动及再平层（对于液压驱动电梯，防止电梯正常启动），并且轿厢内
                有听觉和视觉信号提示，自动门完全开启，手动门保持在未锁紧状态。对于未按照《电梯监督
                检验和定期检验规则》附件A中 A1.3.3 条第一款对轿厢超载保护装置进行过监督检验的电梯，
                允许轿厢内只提供听觉信号或者视觉信号。发现轿厢自重发生变化等可能影响轿厢超载保护装
                置有效性的情况，应当采用在轿厢内施加载荷的方式进行试验；其他情况下，可以采用模拟超
                载状态的方式进行验证。
            </Text>, {nos:'1.3.3'},false,'轿厢超载保护装置试验'),
        crtOmni(undefined,{big:'*A1.3.4轿厢（运载装置）限速器-安全钳试验',bspan:1,seco:'*A1.3.4',span:1,},{bspan:10,seco:'*A1.3.4.1',span:4,},
            <Text>检查其是否符合以下要求：
            </Text>, {mergLabel:'限速器'},true,),
        crtOmni('调节封记',{},undefined,
            <Text>(1)各调节部位封记完好，运转时无碰擦、卡阻、转动不灵活等现象，动作正常；
            </Text>, {nos:'1.3.4.1(1)',pre:'*'},true,),
        crtOmni('动速度',{},undefined,
            <Text>(2)动作速度符合要求。
                <JumpMeasure tag={'Limiter'} rep={rep}>附录C：限速器动作速度校验</JumpMeasure>
            </Text>, {nos:'1.3.4.1(2)',pre:'*'},true,),
        crtOmni(undefined,{},undefined,
            <Text>检测时，可以通过查看限速器调试证书、校验记录，结合限速器的状态确认其动作速度是否符
                合要求；发现调节部位封记缺损等可能影响限速器动作速度的情况，检测人员应当通过现场测
                试动作速度的方式予以确认。
            </Text>, { },true,),
        crtOmni(undefined,{ },{seco:'*A1.3.4.2',span:5,},
            <Text>检查以下电气安全装置功能是否有效:
            </Text>, {mergLabel:'电气安全装置'},true,),
        crtOmni('限速电安',{},undefined,
            <Text>(1)限速器或者其他装置上设置的在轿厢（运载装置）上行、下行速度达到限速器动作速度之前
                动作的电气安全装置；
            </Text>, {nos:'1.3.4.2(1)',pre:'*'},true,),
        crtOmni('验证复位',{},undefined,
            <Text>(2)对于安全钳释放后限速器不能自动复位的，用于验证限速器复位状态的电气安全装置；
            </Text>, {nos:'1.3.4.2(2)',pre:'*'},true,),
        crtOmni('绳断电安',{},undefined,
            <Text>(3)用于检查限速器绳断裂或者过分伸长的电气安全装置；
            </Text>, {nos:'1.3.4.2(3)',pre:'*'},true,),
        crtOmni('安全钳动',{},undefined,
            <Text>(4)轿厢（运载装置）上设置的在轿厢（运载装置）安全钳动作以前或者同时使驱动主机停止运
                转的电气安全装置。
            </Text>, {nos:'1.3.4.2(4)',pre:'*'},true,),
        //组合形自拆分区，恰好在自拆分大块的最后一行还要单独的做一个小分区，需要配置{span:1}特例。解决：useFormatOmni当中加了{ (!et.nconcl && et.rec?.span===1 && mergLastEt===et && et.mergLabel) &&；
        crtOmni('限钳联动',{ },{seco:'*A1.3.4.3',span:1,},
            <Text>(1)轿厢空载，以检修速度下行的工况进行限速器-安全钳联动试验，观察限速器、安全钳动作是否可靠。
            </Text>, {nos:'1.3.4.3',pre:'*',mergNos:'1.3.4',mergName:'限速钳试',mergLabel:'联动试验'},false,'轿厢（运载装置）限速器-安全钳试验'),
    ],'1.3.3轿厢超载保护-1.3.4轿厢限速安全钳试验');
    pushOmni(ari,'1.3.5',[
        crtOmni('对限速器',{big:'*A1.3.5对重（平衡重）限速器-安全钳试验',bspan:1,seco:'*A1.3.5',span:1},{bspan:3,span:3 },
            <Text>(1)检查限速器及其电气安全装置是否符合A1.3.4.1条和A1.3.4.2条第（1）～（3）项的要求；
                <JumpMeasure tag={'DzLimiter'} rep={rep}>附录C：限速器动作速度校验</JumpMeasure>
            </Text>, {nos:'1.3.5(1)',pre:'*',},true,),
        crtOmni('对钳联动',{},undefined,
            <Text>(2)轿厢空载，以检修速度上行的工况进行限速器-安全钳联动试验（注），观察限速器、安全钳动作是否可靠。
            </Text>, {nos:'1.3.5(2)',pre:'*',},true,),
        crtOmni(undefined,{ },undefined,
            <Text>注：对于采用除限速器以外方式触发的安全钳，按照电梯制造（改造）单位的要求进行试验。
            </Text>, {mergNos:'1.3.5',pre:'*',mergName:'对重钳试'},false,'对重（平衡重）限速器-安全钳试验'),
        crtOmni('缓冲器试',{big:'*A1.3.6缓冲器试验',bspan:1,seco:'*A1.3.6', },{bspan:1, },
            <Text>(1)轿厢空载，以检修速度运行的工况使缓冲器被压缩，轿厢（运载装置）、对重停在其上再离开后，观察缓冲器是否未出现对电梯正常使用有不利影响的损坏（如明显倾斜、断裂、塑性变
                形、剥落、破损等）。
            </Text>, {nos:'1.3.6',pre:'*',},false,'缓冲器试验'),
        crtOmni('超试方法',{big:'*A1.3.7轿厢（运载装置）上行超速保护装置试验',bspan:1,seco:'*A1.3.7',span:1},{bspan:4, seco:'*A1.3.7.1', span:1 },
            <Text>(1)检查控制柜或者紧急和测试操作屏上是否标有轿厢（运载装置）上行超速保护装置动作试验方法。
            </Text>, {nos:'1.3.7.1',pre:'*', mergLabel:'试验方法'},true,),
        crtOmni('上超电安 ',{},{seco:'*A1.3.7.2',span:1,},
            <Text>(1)检查轿厢（运载装置）上行超速保护装置上的电气安全装置功能是否有效。
            </Text>, {nos:'1.3.7.2',pre:'*', mergLabel:'电气安全装置'},true,),
        crtOmni('制动失效',{},{seco:'*A1.3.7.3',span:1,},
            <Text>(1)采用存在内部冗余的制动器作为轿厢（运载装置）上行超速保护装置减速部件的，检查当制动器机械部件动作（松开或者制动）失效或者制动力不足时，是否能够防止电梯正常运行。
            </Text>, {nos:'1.3.7.3',pre:'*', mergLabel:'监测功能'},true,),
        crtOmni('动作试',{ },{seco:'*A1.3.7.4',span:1,},
            <Text>(1)按照A1.3.7.1条所述的试验方法进行动作试验，观察轿厢（运载装置）上行超速保护装置动作是否可靠。对于配有轿厢（运载装置）上行超速保护装置但是未按照《电梯监督检验和定期
                检验规则》附件A中A1.3.7条对轿厢（运载装置）上行超速保护装置进行过监督检验并且不符合A1.3.7.1条要求的电梯（不要求其必须符合该条要求），可以轿厢空载、检修速度上行的工况
                进行动作试验。
            </Text>, {nos:'1.3.7.4',pre:'*',mergNos:'1.3.7',mergName:'上超速保', mergLabel:'试验'},false,'轿厢（运载装置）上行超速保护装置试验'),
    ],'1.3.5对重限速器-安全钳-1.3.7轿厢上行超速保护试验');
    pushOmni(ari,'1.3.8',[
        crtOmni('移试验法',{big:'*A1.3.8轿厢（运载装置）意外移动保护装置试验',bspan:1,seco:'*A1.3.8',span:1},{bspan:4, seco:'*A1.3.8.1',span:1,},
            <Text>(1)检查控制柜或者紧急和测试操作屏上是否标有轿厢（运载装置）意外移动保护装置动作试验方法。
            </Text>, {nos:'1.3.8.1',pre:'*', mergLabel:'试验方法'},true,),
        crtOmni('移保电安',{},{seco:'*A1.3.8.2',span:1,},
            <Text>(1)检查轿厢（运载装置）意外移动保护装置上的电气安全装置功能是否有效。
            </Text>, {nos:'1.3.8.2',pre:'*', mergLabel:'电气安全装置'},true,),
        crtOmni('移保监测',{},{seco:'*A1.3.8.3',span:1,},
            <Text>(1)采用存在内部冗余的制动器作为轿厢（运载装詈）意外移动保护装置制停部件的，检查当制动器机械部件动作（松开或者制动）失效或者制动力不足时，是否能够关闭轿门和层门，并且能够防止电梯正常运行。
            </Text>, {nos:'1.3.8.3',pre:'*', mergLabel:'监测功能'},true,),
        crtOmni('移保试',{ },{seco:'*A1.3.8.4',span:1,},
            <Text>(1)按照A1.3.8.1条所述的试验方法进行动作试验，观察轿厢（运载装置）意外移动保护装置动作是否可靠。
            </Text>, {nos:'1.3.8.4',pre:'*',mergNos:'1.3.8',mergName:'意外移保', mergLabel:'试验'},false,'轿厢（运载装置）意外移动保护装置试验'),
        crtOmni('曳引打滑',{big:'*A1.3.11曳引能力试验',bspan:1,seco:'*A1.3.11',span:1},{bspan:2,span:2 },
            <Text>(1)轿厢空载，当对重压在缓冲器上而驱动主机按电梯上行方向旋转时，观察悬挂装置是否相对曳引轮打滑，或者驱动主机停止运转；
            </Text>, {nos:'1.3.11(1)',pre:'*',},true,),
        crtOmni('切断电',{ },undefined,
            <Text>(2)轿厢空载，以额定速度上行至行程上部，切断电动机与制动器供电，观察轿厢（运载装置）是否完全停止。
            </Text>, {nos:'1.3.11(2)',pre:'*',mergNos:'1.3.11',mergName:'曳引力试'},false,'曳引能力试验'),
    ],'1.3.8轿厢意外移动保护装置-1.3.11曳引能力试验');
    pushOmni(ari,'1.3.12',[
        crtOmni('变形损',{big:'*A1.3.12 125%额定载重量制动试验',bspan:1,seco:'*A1.3.12',span:1},{bspan:2,span:2 },
            <Text>(1)轿厢内装载125%额定载重量的载荷，以额定速度下行至行程下部，切断电动机与制动器供电，观察制动器是否能够使驱动主机停止运转，并且轿厢及其附联部件和导轨等无明显变形和
                损坏（注）。
            </Text>, {nos:'1.3.12(1)',pre:'*',},true,),
        crtOmni(undefined,{ },undefined,
            <Text>注:以安装监督检验合格日期（按照《电梯监督检验和定期检验规则》进行改造监督检验的，以该改造监督检验合格日期）为基准，每6年对曳引驱动乘客电梯和曳引驱动消防员电梯进行一次
                本条所述的试验。
            </Text>, {pre:'*',mergNos:'1.3.12',mergName:'125试验'},false,'125%额定载重量制动试验'),
        crtOmni('运行试验',{big:'A1.3.13 运行试验',bspan:1,seco:'A1.3.13', },{bspan:1, },
            <Text>(1)轿厢空载，以额定速度上、下运行，观察呼梯、楼层显示等信号系统是否功能有效、指示正确、动作无误，轿厢平层良好，无异常现象发生。
            </Text>, {nos:'1.3.13',},false,'运行试验'),
        crtOmni(undefined,{big:'A1.3.14噪声测试',bspan:1,seco:'A1.3.14',span:1},{bspan:6,span:6 },
            <div>采用以下方法进行噪声测试，确认噪声的A频率计权声级是否符合以下表规定的值：
                <Table tight  miniw={800}>
                    <TableBody>
                        <TableRow>
                            <CCell>额定速度v</CCell><CCell>机房噪声</CCell><CCell>轿厢内噪声</CCell><CCell>开关门噪声</CCell><CCell>无机房电梯层门处噪声</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell>v&le;2.5m/s</CCell><CCell>&le;80dB</CCell><CCell>&le;55dB</CCell><CCell>&le;65dB</CCell><CCell>&le;65dB</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell>2.5m/s&le;v&le;6.0m/s</CCell><CCell>&le;85dB</CCell><CCell>&le;60B</CCell><CCell>&le;65dB</CCell>
                            <CCell rowSpan={2}>不超过制造单位的允许值。制造单位未规定的，按照额定速度为2.5m/s的电梯限值指标判定。</CCell>
                        </TableRow>
                        <TableRow>
                            <CCell>v&gt;6.0m/s</CCell><CCell colSpan={3}>不超过制造单位的允许值。制造单位未规定的，按照额定速度为6.0m/s的电梯限值指标判定。</CCell>
                        </TableRow>
                    </TableBody></Table>
            </div>, {}, true,),
        crtOmni('房噪声', {}, undefined,
            <Text>(1)机房噪声:电梯以额定速度运行，声音测量传感器置于距地面高1.5m、驱动主机 1.0m处测试，测试点不少于3点，取平均值；
                <JumpMeasure tag={'Measure'} rep={rep}>八、观测数据及测量结果记录</JumpMeasure>
            </Text>, {nos: '1.3.14(1)',}, true,),
        crtOmni('厢内噪', {}, undefined,
            <Text>(2)轿厢内噪声:电梯以额定速度全程上、下运行，声音测量传感器置于轿厢内中央、距地面高1.5m处测试，取最大值；
            </Text>, {nos: '1.3.14(2)',}, true,),
        crtOmni('开关门噪', {}, undefined,
            <Text>(3)开关门噪声:声音测量传感器置于层（轿）门宽度的中央、距门0.24m、地面高1.5m处，测试开、关门过程中的噪声，取最大值；
            </Text>, {nos: '1.3.14(3)',}, true,),
        crtOmni('层门噪', {}, undefined,
            <Text>(4)无机房电梯层门处噪声:声音测量传感器置于驱动主机安装位置最近层站开门宽度的中部对着层门，在水平方向距门扇0.5m，垂直方向距层站地面1.5m处测试，取出发端站门关闭后至到
                达端站门开启前，电梯全程上、下运行过程中以额定速度运行时的最大值。
            </Text>, {nos: '1.3.14(4)',}, true,),
        crtOmni(undefined, {}, undefined,
            <Text>注：该条仅适用于曳引驱动乘客电梯和曳引驱动消防员电梯。
            </Text>, { mergNos: '1.3.14', mergName: '噪声测试'}, false, '噪声测试'),
        ], '1.3.12 125%额定载重量制动试验-1.3.14噪声测试');
    pushOmni(ari,'1.4.1',[
        crtOmni('视频监',{big:'视频监控设施',bspan:1,seco:'A1.4.1', },{bspan:1, },
            <Text>公众聚集场所的电梯和住宅小区的电梯，应当配备符合有关规定和标准的视频监控设施。（1）设置情况：公众聚集场所的电梯和住宅小区的电梯轿厢内是否设置视频监控设施，视频监
                控设施包含摄像头和监控终端；（2）功能检查：摄像头拍摄的图像画面能清晰显示在监控终端的显示器或其它显示设备上，显
                示设备原则上要求安装在有人值守的场所;监控终端应当具有数据存储功能，数据的保存期不得少于1个月，所配置的存储设备容量应当满足要求。
            </Text>, {nos:'1.4.1',},false,'视频监控设施'),
        crtOmni('远程监',{big:'远程监测装置',bspan:1,seco:'A1.4.2', },{bspan:1, },
            <Text>乘客电梯应当配备能够实现远程监测功能的装置，并提供标准数据接口。（1）设置情况：乘客电梯是否配置远程监测装置，是否提供标准数据接口；
                （2）功能检查：现场通过判断远程监测装置的采集方式和现场布置情况，查看标准数据接口是否符合要求，企业监测平台软件界面是否正确显示电梯运行实时数据，是否能够正确输出故障
                信息，并通过模拟故障随机抽查附件所列的部分信息进行验证；（3）数据传输要求：检查电梯远程监测相关数据是否已根据《福建省电梯安全管理条例》要
                求，接入已具备条件的当地政府端电梯公共服务平台。通过当地市场监管部门授权的公共账户或所检电梯维保单位账户，登录当地政府端电梯公共服务平台，查看电梯远程监测的相关数据
                是否有效接入。
            </Text>, {nos:'1.4.2',},false,'远程监测装置'),
        crtOmni('房通风降',{big:'机房通风降温措施',bspan:1,seco:'A1.4.3', },{bspan:1, },
            <Text>采取在机房安装空调等通风降温措施，保证电梯机房内温度符合相关标准要求。
            </Text>, {nos:'1.4.3',},false,'机房通风降温措施'),
    ],'1.4.1视频监控设施-1.4.3机房通风降温措施');

    if (!noDefault) ari = omniCalculateDefault(ari, {iclasDefault: "A", displayDefault: false});
    return {Item: ari,} as { [key: string]: any[] };
};
