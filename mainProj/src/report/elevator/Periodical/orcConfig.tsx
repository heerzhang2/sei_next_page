/** @jsxImportSource @emotion/react */
import * as React from "react";
import { IndentationLayText, SelectHookfork } from "../../common/base";
import { InputLine, SuffixInput, Touchable,
  Table,  TableBody, TableRow, Cell, CCell, TableHead,
} from "customize-easy-ui-component";
import { Link as RouterLink, DirectLink } from "../../../routing/Link";
//方便管理： 目录 分离。组件越来越多，不好查找管理。
//【原始记录】检验内容通用格式部分：这个是可以跟随检验记录数据变化的可配置部分。 inspectionContent：subItems要么null要么必须和inspectionContent：names数组配套大小。
//【特点】抽象化，归一处理：procedure操作说明新的 文本或组件，变量编辑注入，details[,]附加的可扩展变通组件，配置details有可能是inspectionContent：subItems 否则依据inspectionContent：names来配套的。
//底下details的内嵌可扩展组件所需变量注入来源于 inspectionContent： addNames[]配置文件的对应的[X.Y]对应声明。details必须和names数组配套大小。details组件嵌入在子项目位置前面显示。
//模板的配套正式报告的显示打印； 版本号要相同的。 details[]和repConfig.subItems[]相同的顺序。
//下一个版本实际可以和这版本共用大部分配置，可直接引入generalFormat再做动态修改的方案也可考虑，在差别不大的情况？。版本号启动和消亡？
//通用的格式显示。 X.Y下标转数组表示：有些空缺的索引序号。
export const useGeneralFormat= ( {verId, repId} :{verId:string, repId:string}
) => {
  const generalFormat =React.useMemo(() => {
    const arr =
      [
        {
          //bigNo: 1,
          items:[
            null,null,null,
            {
              // item:1.4,
              procedure:  <div>
                使用单位提供了以下资料：<br/>
                （1）使用登记资料，内容与实物相符；
                <IndentationLayText title={'（2）安全技术档案至少包括：'}>
                  安全技术档案，至少包括1.1、1.2、1.3所述文件资
                  料[1.3(5)项除外]，以及监督检验报告、定期检验报告、日
                  常检查与使用状况记录、日常维护保养记录、年度自行检
                  查记录或者报告、应急救援演习记录、运行故障和事故记
                  录等，保存完好（本规则实施前已经完成安装、改造或重
                  大修理的，1.1、1.2、1.3项所述文件资料如有缺陷，应当
                  由使用单位联系相关单位予以完善，可不作为本项审核结
                  论的否决内容）；
                </IndentationLayText>
                <IndentationLayText title={'（3）以岗位责任制为核心的电梯运行管理规章制度，包括：'}>
                  ①事故与故障的应急措施和救援预案；<br/>
                  ②电梯钥匙使用管理制度等；
                </IndentationLayText>
                （4）与取得相应资质单位签订的日常维护保养合同；<br/>
                （5）按照规定配备的电梯安全管理和作业人员的特种设备作业人员证。
              </div>,
              details:[],
            }
          ]
        },
        {
          //bigNo: 2,
          items:[
            {
              //item:2.1,
              procedure: <div>
                （1）应当在任何情况下均能够安全方便地使用通道。采用梯子作为通道时，必须符合以下条件：
                <IndentationLayText >
                  ①通往机房(机器设备间)的通道不应当高出楼梯所到平面4m；<br/>
                  ②梯子必须固定在通道上而不能被移动；<br/>
                  ③梯子高度超过1.50m时，其与水平方向的夹角应当在65°～75°之间，并不易滑动或者翻转；<br/>
                  ④靠近梯子顶端应当设置容易握到的把手。
                </IndentationLayText>
                （2）通道应当设置永久性电气照明；<br/>
                （3）机房通道门的宽度应当不小于0.60m，高度应当不小于1.80m，并且门不得向机房内开启。门应当装有带钥匙的锁，并且可以从机房内不用钥匙打开。门外侧有下述或者类似的警示标志：“电梯机器——危险 未经允许禁止入内”
              </div>,
              details:[ (inp:any,setInp:(a:any)=>void)=>{
                return <React.Fragment>
                  采用梯子作为通道时
                  <InputLine label={`机房高出平面`}>
                    <SuffixInput  placeholder="请输入测量数" value={ inp?.机房高出 ||''}
                      onSave={txt => setInp({ ...inp, 机房高出: txt||undefined}) }
                    >m</SuffixInput>
                  </InputLine>
                  <InputLine label={`水平方向夹角`}>
                    <SuffixInput placeholder="请输入测量数" value={ inp?.梯子夹角 ||''}
                      onSave={txt => setInp({ ...inp, 梯子夹角: txt||undefined}) }
                    >(°)</SuffixInput>
                  </InputLine>
                  <InputLine  label='用梯子作为通道时，测量结果判定'>
                    <SelectHookfork value={ inp?.梯子判定 ||''}
                                    onChange={e => setInp({ ...inp, 梯子判定: e.currentTarget.value||undefined}) }
                    />
                  </InputLine>
                </React.Fragment>
              },
                null,
                (inp:any,setInp:(a:any)=>void)=>{
                  return  <React.Fragment>
                    机房通道门-观测数据及测量
                    <InputLine label={`宽度`}>
                      <SuffixInput placeholder="请输入测量数" value={ inp?.通道门宽 ||''}
                        onSave={txt => setInp({ ...inp, 通道门宽: txt||undefined}) }
                      >m</SuffixInput>
                    </InputLine>
                    <InputLine label={`高度`}>
                      <SuffixInput placeholder="请输入测量数" value={ inp?.通道门高 ||''}
                        onSave={txt => setInp({ ...inp, 通道门高: txt||undefined}) }
                      >m</SuffixInput>
                    </InputLine>
                    <InputLine  label='机房通道门的测量结果判定'>
                      <SelectHookfork value={ inp?.通道判定 ||''}
                                      onChange={e => setInp({ ...inp, 通道判定: e.currentTarget.value||undefined}) }
                      />
                    </InputLine>
                  </React.Fragment>
                }
              ]
            },
            null,null,null,
            {
              // item:2.5,
              procedure:  <div>
                （1）机房(机器设备间)设有永久性电气照明；在靠近入口(或多个入口)处的适当高度设置一个开关，控制机房(机器设备间)照明
              </div>,
              details:[]
            },
            {
              //item:2.6,
              procedure:  <div>
                （2）主开关不得切断轿厢照明和通风、机房（机器设备间）照明和电源插座、轿顶与底坑的电源插座、电梯井道照明、报警装置的供电电路
              </div>,
              details:[]
            },
            {
              // item:2.7,
              procedure:  <div>
                （2）驱动主机工作时无异常噪声和振动；<br/>
                （3）曳引轮轮槽不得有缺损或者不正常磨损；如果轮槽的磨损可能影响曳引能力时，进行曳引能力验证试验；<br/>
                （4）制动器动作灵活，制动时制动闸瓦(制动钳)紧密、均匀地贴合在制动轮(制动盘)上，电梯运行时制动闸瓦(制动钳)与制动轮(制动盘)不发生摩擦，制动闸瓦(制动钳)以及制动轮(制动盘)工作面上没有油污；<br/>
                <IndentationLayText title={'（5）手动紧急操作装置符合以下要求：'}>
                  ①对于可拆卸盘车手轮，设有一个电气安全装置，最迟在盘车手轮装上电梯驱动主机时动作；<br/>
                  ②松闸扳手涂成红色，盘车手轮是无辐条的并且涂成黄色，可拆卸盘车手轮放置在机房内容易接近的明显部位；<br/>
                  ③在电梯驱动主机上接近盘车手轮处，明显标出轿厢运行方向，如果手轮是不可拆卸的，可以在手轮上标出；<br/>
                  ④能够通过操纵手动松闸装置松开制动器，并且需要以一个持续力保持其松开状态；<br/>
                  ⑤进行手动紧急操作时，易于观察到轿厢是否在开锁区
                </IndentationLayText>
              </div>,
              details:[]
            },
            {
              //item:2.8,
              procedure:  <div>
                (2)断相、错相保护功能有效；电梯运行与相序无关时，可以不设错相保护。
                <IndentationLayText title={'(4)紧急电动运行装置应当符合以下要求：'}>
                  ①依靠持续揿压按钮来控制轿厢运行，此按钮有防止误操作的保护，按钮上或其近旁标出 相应的运行方向<br/>
                  ②一旦进入检修运行，紧急电动运行装置控制轿厢运行的功能由检修控制装置所取代；<br/>
                  ③进行紧急电动运行操作时，易于观察到轿厢是否在开锁区。
                </IndentationLayText>
                <IndentationLayText title={'(6)层门和轿门旁路装置应当符合以下要求：'}>
                  ①在层门和轿门旁路装置上或者其附近标明“旁路”字样,并且标明旁路装置的“旁路”状态或者“关”状态;<br/>
                  ②旁路时取消正常运行(包括动力操作的自动门的任何运行);只有在检修运行或者紧急电动运行状态下,轿厢才能够运行;运行期间,轿厢上的听觉信号和轿底的闪烁灯起作用;<br/>
                  ③能够旁路层门关闭触点、层门门锁触点、轿门关闭触点、轿门门锁触点;不能同时旁路层门和轿门的触点;对于手动层门,不能同时旁路层门关闭触点和层门门锁触点;<br/>
                  ④提供独立的监控信号证实轿门处于关闭位置。
                </IndentationLayText>
                (7)应当具有门回路检测功能,当轿厢在开锁区域内、轿门开启并且层门门锁释放时,监测检查
                轿门关闭位置的电气安全装置、检查层门门锁锁紧位置的电气安全装置和轿门监控信号的正确动
                作;如果监测到上述装置的故障,能够防止电梯的正常运行。<br/>
                (8)应当具有制动器故障保护功能,当监测到制动器的提起(或者释放)失效时,能够防止电梯的正常启动。
                <IndentationLayText title={'(9)自动救援操作装置(如果有)应该符合以下要求:'}>
                  ②在外电网断电至少等待3s后自动投入救援运行,电梯自动平层并且开门;<br/>
                  ③当电梯处于检修运行、紧急电动运行、电气安全装置动作或者主开关断开时,不得投入救援运行;<br/>
                  ④设有一个非自动复位的开关,当该开关处于关闭状态时,该装置不能启动救援运行。
                </IndentationLayText>
              </div>,
              details:[]
            },
            {
              //item:2.9,
              procedure:  <div>
                （2）限速器或者其他装置上设有在轿厢上行或者下行速度达到限速器动作速度之前动作的电气安全装置，以及验证限速器复位状态的电气安全装置<br/>
                （3）限速器各调节部位封记完好，运转时不得出现碰擦、卡阻、转动不灵活等现象，动作正常<br/>
                （4）受检电梯的维护保养单位应当每2年(对于使用年限不超过15年的限速器)或者每年(对于使用年限超过15年的限速器)进行一次限速器动作速度校验，校验结果应当符合要求
              </div>,
              details:[]
            },
            {
              // item:2.10,
              procedure:  <div>
                （2）所有电气设备及线管、线槽的外露可以导电部分应当与保护导体（PE，地线）可靠连接
              </div>,
              details:[]
            },
            {
              // item:2.11,
              procedure:  <div>
                （1）动力电路、照明电路和电气安全装置电路的绝缘电阻应当符合下述要求：
                <Table css={{borderCollapse:'collapse'}}>
                  <TableBody>
                    <TableRow >
                      <CCell >标称电压/V</CCell>
                      <CCell >测试电压 (直流)/V  </CCell>
                      <CCell>绝缘电阻/MΩ</CCell>
                    </TableRow>
                    <TableRow >
                      <CCell>安全电压</CCell>
                      <CCell>250</CCell>
                      <CCell>≥0.25</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell>≤500</CCell>
                      <CCell>500</CCell><CCell>≥0.50</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell>＞500</CCell>
                      <CCell>1000</CCell><CCell>≥1.00</CCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>,
              details:[(inp:any,setInp:(a:any)=>void)=>{
                return <React.Fragment>
                  数据测量
                  <InputLine  label='动力电路' >
                    <SuffixInput value={inp?.动力电阻 ||''}
                      onSave={txt => setInp({ ...inp, 动力电阻: txt||undefined}) }
                      inputSize="md" type="text" placeholder="请输入测量数"
                    >MΩ</SuffixInput>
                  </InputLine>
                  <InputLine  label='照明电路' >
                    <SuffixInput value={inp?.照明电阻 ||''}
                      onSave={txt => setInp({ ...inp, 照明电阻: txt||undefined}) }
                      inputSize="md" type="text" placeholder="请输入测量数"
                    >MΩ</SuffixInput>
                  </InputLine>
                  <InputLine  label='安全装置电路' >
                    <SuffixInput value={inp?.安全装置电阻 ||''}
                      onSave={txt => setInp({ ...inp, 安全装置电阻: txt||undefined}) }
                      inputSize="md" type="text" placeholder="请输入测量数"
                    >MΩ</SuffixInput>
                  </InputLine>
                </React.Fragment>
              }
              ]
            }
          ]
        },
        {
          // bigNo: 3,
          items:[
            null,null,null,
            {
              //item:3.4,
              procedure:  <div>
                （3）门上应当装设用钥匙开启的锁，当门开启后不用钥匙能够将其关闭和锁住，在门锁住后，不用钥匙能够从井道内将门打开；<br/>
                （4）应当设置电气安全装置以验证门的关闭状态。
              </div>,
              details:[]
            },
            {
              //item:3.5,
              procedure:  <div>
                （3）应当装设用钥匙开启的锁，当门开启后不用钥匙能够将其关闭和锁住，在门锁住后，不用钥匙能够从井道内将门打开；<br/>
                （4）应当设置电气安全装置以验证门的关闭状态。
              </div>,
              details:[]
            },
            null,
            {
              //item:3.7,
              procedure:  <div>
                （1）轿厢与面对轿厢入口的井道壁的间距不大于0.15m，对于局部高度不大于0.50m或者采用垂直滑动门的载货电梯，该间距可以增加到0.20m。如果轿厢装有机械锁紧的门并且门只能在开锁区内打开时，则上述间距不受限制。
              </div>,
              details:[(inp:any,setInp:(a:any)=>void)=>{
                return <React.Fragment>
                  数据及测量
                  <InputLine label={`局部高度>0.5m时，间距：`}>
                    <SuffixInput placeholder="请输入测量数" value={ inp?.轿井间距 ||''}
                      onSave={txt => setInp({ ...inp, 轿井间距: txt||undefined}) }
                    >m</SuffixInput>
                  </InputLine>
                  <InputLine label={`局部高度≤0.5m时或采用垂直滑动门的载货电梯时，间距：`}>
                    <SuffixInput placeholder="请输入测量数" value={ inp?.轿井间距x ||''}
                                 onSave={txt => setInp({ ...inp, 轿井间距x: txt||undefined}) }
                    >m</SuffixInput>
                  </InputLine>
                </React.Fragment>
              }]
            },
            null,null,
            {
              //item:3.10,
              procedure:  <div>
                （1）井道上下两端应当装设极限开关，该开关在轿厢或者对重接触缓冲器前起作用，并且在缓冲器被压缩期间保持其动作状态。
              </div>,
              details:[]
            },
            {
              //item:3.11,
              procedure:  <div>
                （1）井道应当装设永久性电气照明。对于部分封闭井道，如果井道附近有足够的电气照明，井道内可以不设照明
              </div>,
              details:[]
            },
            {
              // item:3.12,
              procedure:  <div>
                （1）底坑底部应当光滑平整，不得渗水、漏水；<br/>
                （3）底坑内应当设置在进入底坑时和底坑地面上均能方便操作的停止装置，停止装置的操作装置为双稳态、红色、标以“停止”字样，并且有防止误操作的保护
              </div>,
              details:[]
            },
            null,
            {
              //item:3.14,
              procedure:  <div>
                （2）当限速器绳断裂或者过分伸长时，应当通过一个电气安全装置的作用，使电梯停止运转
              </div>,
              details:[]
            },
            {
              //item:3.15,
              procedure:  <div>
                （3）缓冲器应当固定可靠、无明显倾斜，并且无断裂、塑性变形、剥落、破损等现象；<br/>
                （4）耗能型缓冲器液位应当正确，有验证柱塞复位的电气安全装置。<br/>
                （5）对重缓冲器附近应当设置永久性的明显标识，标明当轿厢位于顶层端站平层位置时，对重装置撞板与其缓冲器顶面间的最大允许垂直距离；并且该垂直距离不超过最大允许值
              </div>,
              details:[null,null,
                (inp:any,setInp:(a:any)=>void)=>{
                  return <React.Fragment>
                    (5)对重越程距离<br/>观测数据及测量
                    <InputLine label={`最大允许值`}>
                      <SuffixInput placeholder="请输入测量数" value={ inp?.对重越程最大 ||''}
                        onSave={txt => setInp({ ...inp, 对重越程最大: txt||undefined}) }
                      >mm</SuffixInput>
                    </InputLine>
                    <InputLine label={`测量值`}>
                      <SuffixInput placeholder="请输入测量数" value={ inp?.对重越程 ||''}
                        onSave={txt => setInp({ ...inp, 对重越程: txt||undefined}) }
                      >mm</SuffixInput>
                    </InputLine>
                  </React.Fragment>
                }
              ]
            },
          ]
        },
        {
          //bigNo: 4,
          items:[
            {
              //item:4.1,
              procedure:  <div>
                <IndentationLayText title={'（1）轿顶应当装设一个易于接近的检修运行控制装置，并且符合以下要求:'}>
                  ①由一个符合电气安全装置要求，能够防止误操作的双稳态开关（检修开关）进行操作；<br/>
                  ②一经进入检修运行时，即取消正常运行（包括任何自动门操作）、紧急电动运行、对接操作运行，只有再一次操作检修开关，才能使电梯恢复正常工作；<br/>
                  ③依靠持续揿压按钮来控制轿厢运行，此按钮有防止误操作的保护，按钮上或其近旁标出相应的运行方向；<br/>
                  ④该装置上设有一个停止装置，停止装置的操作装置为双稳态、红色、并标以“停止”字样，并且有防止误操作的保护；<br/>
                  ⑤检修运行时，安全装置仍然起作用。
                </IndentationLayText>
                （2）轿顶应当装设一个从入口处易于接近的停止装置，停止装置的操作装置为双稳态、红色、并标以“停止”字样，并且有防止误操作的保护。如果检修运行控制装置设在从入口处易于接近的位置，该停止装置也可以设在检修运行控制装置上
              </div>,
              details:[]
            },
            null,
            {
              //item:4.3,
              procedure:  <div>
                如果轿厢设有安全窗（门），应当符合以下要求：<br/>
                （3）其锁紧由电气安全装置予以验证。
              </div>,
              details:[]
            },
            null,
            {
              //item:4.5,
              procedure:  <div>
                （1）对重(平衡重)块可靠固定；<br/>
                （2）具有能够快速识别对重(平衡重)块数量的措施(例如标明对重块的数量或者总高度)
              </div>,
              details:[]
            },
            {
              //item:4.6,
              procedure:  <div>
                （2）对于为了满足使用要求而轿厢面积超出上述规定的载货电梯，必须满足以下条件：<br/>
                ①在从层站装卸区域总可看见的位置上设置标志，表明该载货电梯的额定载重量；<br/>
                ②该电梯专用于运送特定轻质货物，其体积可保证在装满轿厢情况下，该货物的总质量不会超过额定载重量；<br/>
                ③该电梯由专职司机操作，并严格限制人员进入。
              </div>,
              details:[]
            },
            null,
            {
              //item:4.8,
              procedure:  <div>
                轿厢内应当装设符合下述要求的紧急报警装置和紧急照：<br/>
                （1）正常照明电源中断时，能够自动接通紧急照明电源；<br/>
                （2）紧急报警装置采用对讲系统以便与救援服务持续联系，当电梯行程大于30m时，在轿厢和机房（或者紧急操作地点）之间也设置对讲系统，紧急报警装置的供电来自本条（1）所述的紧急照明电源或者等效电源；在启动对讲系统后，被困乘客不必再做其他操作
              </div>,
              details:[]
            },
            {
              //item:4.9,
              procedure:  <div>
                （1）轿厢地坎下应当装设护脚板，其垂直部分的高度不小于0.75m，宽度不小于层站入口宽度
              </div>,
              details:[(inp:any,setInp:(a:any)=>void)=>{
                return <React.Fragment>
                  数据及测量
                  <InputLine label={`护脚板高度`}>
                    <SuffixInput placeholder="请输入测量数" value={ inp?.护脚板高 ||''}
                      onSave={txt => setInp({ ...inp, 护脚板高: txt||undefined}) }
                    >m</SuffixInput>
                  </InputLine>
                  <InputLine  label='测量结果判定'>
                    <SelectHookfork value={ inp?.护脚板高判定 ||''}
                                    onChange={e => setInp({ ...inp, 护脚板高判定: e.currentTarget.value||undefined}) }
                    />
                  </InputLine>
                </React.Fragment>
              }
              ]
            },
            {
              //item:4.10,
              procedure:  <div>
                （1）设置当轿厢内的载荷超过额定载重量时，能够发出警示信号，并且使轿厢不能运行的超载保护装置。该装置最迟在轿厢内的载荷达到110％额定载重量(对于额定载重量小于750kg的电梯，最迟在超载量达到75kg)时动作，防止电梯正常启动及再平层，并且轿内有音响或者发光信号提示，动力驱动的自动门完全打开，手动门保持在未锁状态
              </div>,
              details:[]
            }
          ]
        },
        {
          //bigNo: 5,
          items:[
            {
              //item:5.1,
              procedure:  <div>
                出现下列情况之一时，悬挂钢丝绳和补偿钢丝绳应当报废：<br/>
                ①出现笼状畸变、绳股挤出、扭结、部分压扁、弯折；<br/>
                ②一个捻距内出现的断丝数大于下表列出的数值时：
                <Table lrBoder minWidth={'140px'} css={{borderCollapse:'collapse'}}>
                  <TableBody>
                    <TableRow>
                      <CCell rowSpan={2}>断丝的形式</CCell>
                      <CCell colSpan={3}>钢丝绳的类型</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell>6×19</CCell><CCell>8×9</CCell><CCell>9×19</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell>均布在外层绳股上</CCell>
                      <CCell>24</CCell><CCell>30</CCell><CCell>34</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell>集中在一或者两根外层绳股上</CCell>
                      <CCell>8</CCell><CCell>10</CCell><CCell>11</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell>一根外绳股上相邻的断丝</CCell>
                      <CCell>4</CCell><CCell>4</CCell><CCell>4</CCell>
                    </TableRow>
                    <TableRow>
                      <CCell>股谷（缝）断丝 </CCell>
                      <CCell>1</CCell><CCell>1</CCell><CCell>1</CCell>
                    </TableRow>
                    <TableRow>
                      <Cell colSpan={4}>注：上述断丝数参考长度为一个捻距，约为6d(d表示钢丝绳的公称直径，mm）</Cell>
                    </TableRow>
                  </TableBody>
                </Table>
                ③钢丝绳直径小于其公称直径的90%；<br/>
                ④钢丝绳严重锈蚀，铁锈填满绳股间隙。<br/>
                采用其他类型悬挂装置的，悬挂装置的磨损、变形等不得超过制造单位设定的报废指标
              </div>,
              details:[(inp:any,setInp:(a:any)=>void)=>{
                return <React.Fragment>
                  数据及测量
                  <InputLine label={`②断丝数`}>
                    <SuffixInput placeholder="请输入测量数" value={ inp?.断丝数 ||''}
                      onSave={txt => setInp({ ...inp, 断丝数: txt||undefined}) }
                    >根</SuffixInput>
                  </InputLine>
                  <InputLine  label='②一个捻距断丝数,结果判定'>
                    <SelectHookfork value={ inp?.断丝判定  ||''}
                                    onChange={e => setInp({ ...inp, 断丝判定: e.currentTarget.value||undefined}) }
                    />
                  </InputLine>
                  <InputLine label={`③钢丝绳直径`}>
                    <SuffixInput placeholder="请输入测量数" value={ inp?.钢绳直径 ||''}
                      onSave={txt => setInp({ ...inp, 钢绳直径: txt||undefined}) }
                    >mm</SuffixInput>
                  </InputLine>
                  <InputLine label={`③公称直径`}>
                    <SuffixInput placeholder="请输入测量数" value={ inp?.钢绳公称 ||''}
                      onSave={txt => setInp({ ...inp, 钢绳公称: txt||undefined}) }
                    >mm</SuffixInput>
                  </InputLine>
                  <InputLine  label='③钢丝绳直径小于公称90%,结果判定'>
                    <SelectHookfork value={ inp?.钢绳判定 ||''}
                                    onChange={e => setInp({ ...inp, 钢绳判定: e.currentTarget.value||undefined}) }
                    />
                  </InputLine>
                </React.Fragment>
              }
              ]
            },
            {
              //item:5.2,
              procedure:  <div>
                （1）悬挂钢丝绳绳端固定应当可靠，弹簧、螺母、开口销等连接部件无缺损。<br/>
                采用其他类型悬挂装置的，其端部固定应当符合制造单位的规定。
              </div>,
              details:[]
            },
            {
              //item:5.3,
              procedure:  <div>
                （1）补偿绳（链）端固定应当可靠；<br/>
                （2）应当使用电气安全装置来检查补偿绳的最小张紧位置；<br/>
                （3）当电梯的额定速度大于3.5m/s时，还应当设置补偿绳防跳装置，该装置动作时应当有一个电气安全装置使电梯驱动主机停止运转。
              </div>,
              details:[]
            },
            null,
            {
              //item:5.5,
              procedure:  <div>
                （1）如果轿厢悬挂在两根钢丝绳或者链条上，则应当设置检查绳(链)松弛的电气安全装置，当其中一根钢丝绳(链条)发生异常相对伸长时，电梯应当停止运行
              </div>,
              details:[]
            },
            {
              //item:5.6,
              procedure:  <div>
                （1）在机房（机器设备间）内的曳引轮、滑轮、链轮、限速器，在井道内的曳引轮、滑轮、链轮、限速器及张紧轮、补偿绳张紧轮，在轿厢上的滑轮、链轮等与钢丝绳、链条形成传动的旋转部件，均应当设置防护装置，以避免人身伤害、钢丝绳或链条因松弛而脱离绳槽或链轮、异物进入绳与绳槽或链与链轮之间；<br/>
                对于允许按照GB 7588—1995及更早期标准生产的电梯，可以按照以下要求检验：<br/>
                ①采用悬臂式曳引轮或者链轮时，有防止钢丝绳脱离绳槽或者链条脱离链轮的装置，并且当驱动主机不装设在井道上部时，有防止异物进入绳与绳槽之间或者链条与链轮之间的装置；<br/>
                ②井道内的导向滑轮、曳引轮、轿架上固定的反绳轮和补偿绳张紧轮，有防止钢丝绳脱离绳槽和进入异物的防护装置
              </div>,
              details:[]
            },
          ]
        },
        {
          //bigNo: 6,
          items:[
            null,null,
            {
              //item:6.3,
              procedure:  <div>
                <IndentationLayText title={'门关闭后,应当符合以下要求:'}>
                  (1) 门扇之间及门扇与立柱、门楣和地坎之间的间的间隙,对于乘客电梯不大于6mm;对于载货电梯不大于8mm,使用过程中由于磨损,允许达10mm;<br />
                  (2) 在水平移动门和折叠门主动门扇的开启方向,以150N的人力施加在一个最不利的点，前条所述的间
                  隙允许增大，但对于旁开门不大于30mm，对于中分门其总和不大于45mm
                </IndentationLayText>
              </div>,
              details:[(inp:any,setInp:(a:any)=>void)=>{
                return <React.Fragment>
                  点击下方标题修改(单位：mm)
                  <Table css={{borderCollapse:'collapse'}}>
                    <TableBody>
                      <DirectLink href={`/report/EL-DJ/ver/${verId}/${repId}/gap?&from=6.3`}>
                        <TableRow >
                          <CCell>层</CCell>
                          <CCell>层门门扇间间隙</CCell>
                          <CCell>层门门扇与门套间隙</CCell>
                          <CCell>层门扇与地坎间隙</CCell>
                          <CCell>层门扇间施力间隙</CCell>
                        </TableRow>
                        <TableRow >
                          <CCell>判断标准</CCell>
                          <CCell colSpan={3}>新安装检验：
                            客梯：x≤6，
                            货梯：x≤8；<br/>
                            非首次检验货梯：x≤10</CCell>
                          <CCell>旁开门：x≤30<br/>中分门总和：x≤45</CCell>
                        </TableRow>
                      </DirectLink>
                      {inp?.层站?.map((a:string,i:number)=>{
                        return <TableRow key={i}>
                          <CCell>{a}</CCell>
                          <CCell>{inp?.门扇隙?.[a]||''}</CCell>
                          <CCell>{inp?.门套隙?.[a]||''}</CCell>
                          <CCell>{inp?.地坎隙?.[a]||''}</CCell>
                          <CCell>{inp?.施力隙?.[a]||''}</CCell>
                        </TableRow>
                      }) }
                    </TableBody>
                  </Table>
                </React.Fragment>
              }, null
              ]
            },
            {
              //item:6.4,
              procedure:  <div>
                （1）层门和轿门采用玻璃门时，应当有防止儿童的手被拖曳的措施
              </div>,
              details:[]
            },
            {
              //item:6.5,
              procedure:  <div>
                （1）动力驱动的自动水平滑动门应当设置防止门夹人的保护装置，当人员通过层门入口被正在关闭的门扇撞击或者将被撞击时，该装置应当自动使门重新开启
              </div>,
              details:[]
            },
            {
              //item:6.6,
              procedure:  <div>
                （1）层门和轿门正常运行时不得出现脱轨、机械卡阻或者在行程终端时错位；由于磨损、锈蚀或者火灾可能造成层门导向装置失效时，应当设置应急导向装置，使层门保持在原有位置
              </div>,
              details:[]
            },
            {
              //item:6.7,
              procedure:  <div>
                （1）在轿门驱动层门的情况下，当轿厢在开锁区域之外时，如果层门开启（无论何种原因），应当有一种装置能够确保该层门自动关闭。自动关闭装置采用重块时，应当有防止重块坠落的措施
              </div>,
              details:[]
            },
            {
              //item:6.8,
              procedure:  <div>
                （1）每个层门均应当能够被一把符合要求的钥匙从外面开启；紧急开锁后，在层门闭合时门锁装置不应当保持开锁位置
              </div>,
              details:[]
            },
            {
              //item:6.9,
              procedure:  <div>
                <IndentationLayText title={'(1)每个层门都应当设有符合下述要求的门锁装置:'}>
                  ②锁紧动作由重力、永久磁铁或者弹簧来产生和保持，即使永久磁铁或者弹簧失效，重力亦不能导致开锁；<br/>
                  ③轿厢在锁紧元件啮合不小于7mm时才能启动；<br/>
                  ④门的锁紧由一个电气安全装置来验证，该装置由锁紧元件强制操作而没有任何中间机构，并且能够防止误动作；
                </IndentationLayText>
                (2)如果轿门采用了门锁装置,该装置也应当符合本条(1)的要求。
              </div>,
              details:[(inp:any,setInp:(a:any)=>void)=>{
                let  toothUnquf=inp?.层站?.find((f:string,i:number)=>{
                  return parseFloat(inp?.层锁啮深?.[f])<7;
                });
                return <React.Fragment>
                  <RouterLink  href={`/report/EL-DJ/ver/${verId}/${repId}/gap?&from=6.9`}>
                    (点击修改)已检门锁啮合长度:
                  </RouterLink>
                  <div>
                    {inp?.层站?.map((a :string)=>{
                      return ` ${a}层:${inp?.层锁啮深?.[a]||''};`
                    }) }
                  </div>
                  <InputLine  label='(1)③门锁啮合长度{自动填}'>
                    <SelectHookfork value={toothUnquf? '×': inp?.层站?.length>=1? '√':''} disabled/>
                  </InputLine>
                </React.Fragment>
              },
              (inp:any,setInp:(a:any)=>void)=>{
                  let  toothUnquf=!(inp?.轿锁啮深) || inp?.轿锁啮深<7;
                  return <React.Fragment>
                    <br/>电梯层门间隙、门锁啮合深度等检验记录-6.9(2):
                    <InputLine label={`轿门锁啮合深度:`}>
                      <SuffixInput placeholder="请输入测量数" value={ (inp?.轿锁啮深 ) || ''}
                                   onSave={txt => setInp({ ...inp, 轿锁啮深: txt||undefined}) }
                      >mm</SuffixInput>
                    </InputLine>
                    <InputLine  label='轿门锁啮合深度判定{自动填}'>
                      <SelectHookfork value={toothUnquf? '×': '√'} disabled/>
                    </InputLine>
                  </React.Fragment>
                },
              ]
            },
            {
              //item:6.10,
              procedure:  <div>
                （1）正常运行时应当不能打开层门，除非轿厢在该层门的开锁区域内停止或停站；如果一个层门或者轿门（或者多扇门中的任何一扇门）开着，在正常操作情况下，应当不能启动电梯或者不能保持继续运行；<br/>
                （2）每个层门和轿门的闭合都应当由电气安全装置来验证，如果滑动门是由数个间接机械连接的门扇组成，则未被锁住的门扇上也应当设置电气安全装置以验证其闭合状态
              </div>,
              details:[]
            },
            {
              //item:6.11,
              procedure:  <div>
                （1）应当设置轿门开门限制装置，当轿厢停在开锁区域外时，能够防止轿厢内的人员打开轿门离开轿厢；<br/>
                （2）在轿厢意外移动保护装置允许的最大制停距离范围内，打开对应的层门后，能够不用工具(三角钥匙或者永久性设置在现场的工具除外)从层站处打开轿门
              </div>,
              details:[]
            },
            {
              //item:6.12,
              procedure:  <div>
                1）轿门门刀与层门地坎，层门锁滚轮与轿厢地坎的间隙应当不小于5mm；电梯运行时不得互相碰擦
              </div>,
              details:[(inp:any,setInp:(a:any)=>void)=>{
                let  knifeUnquf=inp?.层站?.find((f:string,i:number)=>{
                  return parseFloat(inp?.刀坎距?.[f])<5;
                });
                let  rollerUnquf=inp?.层站?.find((f:string,i:number)=>{
                  return parseFloat(inp?.轮坎距?.[f])<5;
                });
                return <React.Fragment>
                  <RouterLink  href={`/report/EL-DJ/ver/${verId}/${repId}/gap?&from=6.12`}>
                    <Touchable  component={'div'} >
                      (点击修改):
                      <div>
                        轿门门刀与层门地坎间距:
                        {inp?.层站?.map((a:string)=>{
                          return ` ${a}层:${inp?.刀坎距?.[a]||''};`
                        }) }
                      </div>
                      <div>
                        门锁滚轮与轿门地坎间距:
                        {inp?.层站?.map((a:string)=>{
                          return ` ${a}层:${inp?.轮坎距?.[a]||''};`
                        }) }
                      </div>
                    </Touchable>
                  </RouterLink>
                  <InputLine  label='间隙应当不小于5mm{自动填}'>
                    <SelectHookfork value={knifeUnquf||rollerUnquf? '×': inp?.层站?.length>=1? '√':''} disabled/>
                  </InputLine>
                </React.Fragment>
              }
              ]
            }
          ]
        },
        null,
        {
          //bigNo: 8,
          items:[
            {
              //item:8.1,
              procedure:  <div>
                （1）曳引电梯的平衡系数应当在0.40～0.50之间，或者符合制造（改造）单位的设计值
              </div>,
              details:[]
            },
            {
              //item:8.2,
              procedure:  <div>
                （1）当轿厢上行速度失控时，轿厢上行超速保护装置应当动作，使轿厢制停或者至少使其速度降低至对重缓冲器的设计范围；该装置动作时，应当使一个电气安全装置动作
              </div>,
              details:[]
            },
            {
              //item:8.3,
              procedure:  <div>
                （1）轿厢在井道上部空载，以型式试验证书所给出的试验速度上行并触发制停部件，仅使用制停部件能够使电梯停止，轿厢的移动距离在型式试验证书给出的范围内；<br/>
                （2）如果电梯采用存在内部冗余的制动器作为制停部件，则当制动器提起(或者释放)失效，或者制动力不足时，应当关闭轿门和层门，并且防止电梯的正常启动
              </div>,
              details:[]
            },
            {
              //item:8.4,
              procedure:  <div>
                （2）定期检验：轿厢空载，以检修速度下行，进行限速器-安全钳联动试验，限速器－安全钳动作应当可靠
              </div>,
              details:[]
            },
            {
              //item:8.5,
              procedure:  <div>
                （1）轿厢空载，以检修速度上行，进行限速器-安全钳联动试验，限速器－安全钳动作应当可靠
              </div>,
              details:[]
            },
            {
              //item:8.6,
              procedure:  <div>
                （1）轿厢分别空载、满载，以正常运行速度上、下运行，呼梯、楼层显示等信号系统功能有效、指示正确、动作无误，轿厢平层良好，无异常现象发生；对于设有IC卡系统的电梯，轿厢内的人员无需通过IC卡系统即可到达建筑物的出口层，并且在电梯退出正常服务时，自动退出IC卡功能
              </div>,
              details:[]
            },
            {
              //item:8.7,
              procedure:  <div>
                （1）在机房内或者紧急操作和动态测试装置上设有明晰的应急救援程序；<br/>
                （2）建筑物内的救援通道保持通畅，以便相关人员无阻碍地抵达实施紧急操作的位置和层站等处；<br/>
                （3）在各种载荷工况下，按照本条(1)所述的应急救援程序实施操作，能够安全、及时地解救被困人员
              </div>,
              details:[]
            },
            null,
            {
              //item:8.9,
              procedure:  <div>
                （1）当对重压在缓冲器上而曳引机按电梯上行方向旋转时，应当不能提升空载轿厢
              </div>,
              details:[]
            },
            {
              //item:8.10,
              procedure:  <div>
                （1）轿厢空载以正常运行速度上行至行程上部，切断电动机与制动器供电，轿厢应当完全停止
              </div>,
              details:[]
            },
            {
              //item:8.11,
              procedure:  <div>
                （1）轿厢装载125%额定载重量，以正常运行速度下行至行程下部，切断电动机与制动器供电，轿厢应当完全停止
              </div>,
              details:[]
            },
            {
              //item:8.12,
              procedure:  <div>
                （1）对于轿厢面积超过规定的载货电梯，以轿厢实际面积所对应的125%额定载重量进行静态曳引试验；对于额定载重量按照单位轿厢有效面积不小于200kg/m2计算的汽车电梯，以150%额定载重量做静态曳引试验；历时10min，曳引绳应当没有打滑现象
              </div>,
              details:[]
            },
            {
              //item:8.13,
              procedure:  <div>
                （1）轿厢装载125%额定载重量，以正常运行速度下行时，切断电动机和制动器供电，制动器应当能够使驱动主机停止运转，试验后轿厢应无明显变形和损坏
              </div>,
              details:[]
            }
          ]
        },
        {
          //bigNo: 9,
          items:[
            {
              //item:9.1,
              procedure:  <div>
                （1）公众聚集场所的电梯和住宅小区的电梯，应当配备符合有关规定和标准的视频监控设施。
              </div>,
              details:[]
            },
            {
              //item:9.2,
              procedure:  <div>
                （2）乘客电梯应当配备能够实现远程监测功能的装置，并提供标准数据接口。
              </div>,
              details:[]
            },
            {
              //item:9.3,
              procedure:  <div>
                （3）采取在机房安装空调等通风降温措施，保证电梯机房内温度符合相关标准要求。
              </div>,
              details:[]
            },
          ]
        },
      ];
    //根据版本号verId小调整。
    //下一个版本generalFormat实际可选择以旧版generalFormat做js动态的修改，或者另外再定义新变量输出。

    return  arr;
  }, [verId, repId]);
  return { generalFormat };
};






