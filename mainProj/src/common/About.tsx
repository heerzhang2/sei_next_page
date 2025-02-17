/** @jsxImportSource @emotion/react */
import {  Global } from "@emotion/react";
import * as React from "react";
//import { Link as RouterLink } from "@reach/router";
//使用RouterLink不会强制刷新页面的。
//import { Link as RouterLink } from "wouter";
import { Link as RouterLink } from "../routing/Link";
import food from "../images/food.svg";
import {
    Navbar,
    Toolbar,
    Text, Button,
    useTheme,
    useResponsiveBodyPadding,
    Container,DragablePinner,
    //Link,这里sancho的Link等同于基础的<a><a/>，会跳转重新刷新页面；
    IconArrowRight, IconKey, Embed, useMMenuBarOcup, Spinner
} from "customize-easy-ui-component";
import { FadeImage } from "../comp/FadeImage";
import { 首页末尾链接 } from "../comp/rootRarelyVary";

import cutting_board_knife from '../images/cutting-board-knife.jpg';
import Img_Readme1 from '../images/readme1.png';
import Img_Readme2 from '../images/readme2.png';
import Img_Readme2_1 from '../images/readme2-1.png';
import Img_Readme3 from '../images/readme3.png';
import Img_Readme4 from '../images/readme4.png';
import Img_Readme5 from '../images/readme5.png';
import Img_Readme6 from '../images/readme6.png';
import Img_Readme7 from '../images/readme7.png';
import Img_Readme8 from '../images/readme8.png';
import Img_Readme9 from '../images/readme9.png';
import Img_Readme10 from '../images/readme10.png';
import Img_Readme11 from '../images/readme11.png';


//说明书，操作手册。
export const About = () => {
  const theme = useTheme();
  //const showingRecipe = props["*"];   　　 //"这个是问号前的除已预定义部分的剩余路径lo/gins/ds？
    const {bottomCss,} = useMMenuBarOcup(false);
    const [isOpen, setIsOpen] = React.useState(true);
    const onPinnerHandler = React.useCallback(() => {
        console.log("DragablePinner点击处理回调：");
        setIsOpen(false);       //useCallback也没法解决onClosePinner实际会变动的问题，造成依赖+副作用的死循环。
    }, []);
    const containerRef = React.useRef(null);


  return (
    <main   ref={containerRef}
        css={[
            {
              //  height: '100vh',
              //  overflowY: 'auto',
            },
            bottomCss,
        ]}
    >
      <Global
        styles={{
          html: {
            backgroundColor: theme.colors.background.tint1
          }
        }}
      />

      <div
        css={[
          {
            paddingBottom: theme.spaces.xl,
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            background: "white",
            [theme.mediaQueries.md]: {
              backgroundSize: "cover",
              backgroundImage: `url(${cutting_board_knife})`
            }
          },
        ]}
      >
        <Text
          css={{
            paddingTop: theme.spaces.lg,
            paddingLeft: theme.spaces.md,
            paddingRight: theme.spaces.md,
            marginBottom: theme.spaces.lg,
            textAlign: "center",
            marginTop: theme.spaces.lg,
            marginBotttom: theme.spaces.xl,
            color: theme.colors.palette.gray.base,
            [theme.mediaQueries.sm]: {
              maxWidth: "46rem"
            }
          }}
          variant="h2"
        >
         平台操作说明书
        </Text>

        <div
          css={{
            fontSize: theme.fontSizes[0],
            maxWidth: "64rem",
            position: "relative",
            padding: "8px 15px",
            background: theme.colors.background.tint1,
            marginLeft: theme.spaces.md,
            marginRight: theme.spaces.md,
            borderRadius: theme.radii.lg,
            display: "inline-block",
            [theme.mediaQueries.md]: {
              background: "white",
              padding: "12px 18px",
              marginLeft: "60px",
              marginTop: theme.spaces.md,
              marginBottom: theme.spaces.md
            }
          }}
        >
          <div
            css={{
              content: "''",
              position: "absolute",
              zIndex: 0,
              display: "none",
              bottom: 0,
              left: "-7px",
              height: "20px",
              width: "20px",
              background: "white",
              backgroundAttachment: "fixed",
              borderBottomRightRadius: "15px",
              [theme.mediaQueries.md]: {
                display: "block"
              }
            }}
          />
          <Text
            css={{
              fontSize: theme.fontSizes[1],
              display: "flex",
              textAlign: "center",
              justifyContent: "center",
              alignItems: "flex-end",
              [theme.mediaQueries.md]: {
                textAlign: "left"
              }
            }}
          >
      本平台主要演示手机做报告。要做报告首先就得有设备号，设备导入后，要为设备生成任务号；任务生成了就轮到派工，
      任务派工界面成功后会得到ISP检验号，然后就能在本人检验任务列表中找到已经生成的ISP检验号；下面一步根据检验号
      去增加检验报告了；报告生成界面将会获得新编制的报告ID，这报告ID和旧平台的报告编号不是一回事，ID是平台内部用的，
      报告编号是对外给客户看的编码。<br/>
      报告初始化后，就可以进入编制了，录入或修改原始记录；编制记录过程要注意保存和确认两个概念。保存时发送给后端
      服务器存储报告数据的。确认这个概念是客户浏览器上的内存存储含义，一般要求先确认，而保存只需要切换网页之前进行
      一次就可以咯，列表形式的多条数据可能还要求一条条的确认增加。<br/>
      有提修改建议的可直接联系；维护人QQ的号码  1736273864  。
          </Text>
          <div
            css={{
              content: "''",
              position: "absolute",
              zIndex: 1,
              bottom: 0,
              left: "-10px",
              height: "20px",
              width: "10px",
              display: "none",
              [theme.mediaQueries.md]: {
                display: "block"
              },
              background: "#e0dbd8d1",
              borderBottomRightRadius: "10px"
            }}
          />
        </div>


        <svg
          css={{
            position: "absolute",
            bottom: 0,
            pointerEvents: "none",
            fill: theme.colors.background.tint1
          }}
          fillRule="evenodd"
          clipRule="evenodd"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 240"
        >
          <g>
            <path d="M1920,144.5l0,95.5l-1920,0l0,-65.5c196,-36 452.146,-15.726 657.5,8.5c229.698,27.098 870,57 1262.5,-38.5Z" />
          </g>
        </svg>
      </div>

      <div
        css={{
          background: theme.colors.background.tint1,
          paddingTop: theme.spaces.lg,
          paddingBottom: theme.spaces.lg,
          width: "100%",
          overflow: "hidden"
        }}
      >
        <Container css={{
          "@media print and (min-width:551px)and (max-width:849px)": {
            display: "none",
          }
        }}>
          <div
            css={{
              display: "block",
              textAlign: "center",
              "& > div": {        　//作用面较广泛，表示本身的直接子代div元素；
                marginBottom: theme.spaces.xl,
                maxWidth: "20rem",
                marginLeft: "auto",
                marginRight: "auto"
              },
              [theme.mediaQueries.lg]: {
                display: "flex",
                justifyContent: "space-between",
                flexWrap: 'wrap',
                "& > div": {
                  margin: theme.spaces.lg,
                  maxWidth: "30rem",
                  minWidth: "20rem"
                }
              },
            }}
          >
            <div>
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M22 2v22h-20v-22h3c1.23 0 2.181-1.084 3-2h8c.82.916 1.771 2 3 2h3zm-11 1c0 .552.448 1 1 1 .553 0 1-.448 1-1s-.447-1-1-1c-.552 0-1 .448-1 1zm9 1h-4l-2 2h-3.897l-2.103-2h-4v18h16v-18zm-13 9.729l.855-.791c1 .484 1.635.852 2.76 1.654 2.113-2.399 3.511-3.616 6.106-5.231l.279.64c-2.141 1.869-3.709 3.949-5.967 7.999-1.393-1.64-2.322-2.686-4.033-4.271z" />
              </svg>
              <Text variant="h4">设备界面</Text>
              <Text>
              点 + 号增加设备，竖三点是菜单，这里点击＂生成新任务＂，有了任务才能做报告。
              </Text>
              <div>
                <Embed css={{margin: "auto"}} width={10} height={9}>
                  <FadeImage  src={Img_Readme1}/>
                </Embed>
              </div>
            </div>

            <div>
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M20 3c0-1.657-1.344-3-3-3s-3 1.343-3 3c0 .312.061.606.149.889l-4.21 3.157c.473.471.878 1.01 1.201 1.599l4.197-3.148c.477.316 1.048.503 1.663.503 1.656 0 3-1.343 3-3zm-2 0c0 .551-.448 1-1 1s-1-.449-1-1 .448-1 1-1 1 .449 1 1zm3 12.062c1.656 0 3-1.343 3-3s-1.344-3-3-3c-1.281 0-2.367.807-2.797 1.938h-6.283c.047.328.08.66.08 1s-.033.672-.08 1h6.244c.396 1.195 1.509 2.062 2.836 2.062zm-1-3c0-.551.448-1 1-1s1 .449 1 1-.448 1-1 1-1-.448-1-1zm-20-.062c0 2.761 2.238 5 5 5s5-2.239 5-5-2.238-5-5-5-5 2.239-5 5zm2 0c0-1.654 1.346-3 3-3s3 1.346 3 3-1.346 3-3 3-3-1.346-3-3zm7.939 4.955l4.21 3.157c-.088.282-.149.576-.149.888 0 1.657 1.344 3 3 3s3-1.343 3-3-1.344-3-3-3c-.615 0-1.186.187-1.662.504l-4.197-3.148c-.324.589-.729 1.127-1.202 1.599zm6.061 4.045c0-.551.448-1 1-1s1 .449 1 1-.448 1-1 1-1-.449-1-1z" />
              </svg>
              <Text variant="h4">任务页面</Text>
              <Text>
               点击　中间竖三点下拉菜单　可刷新列表，点击任务列表沉入展示任务底下的挂接设备，再点击设备显示检验ISP,若未派工会转入派工页面。
              </Text>
              <div>
                <Embed css={{margin: "auto"}} width={10} height={7}>
                  <FadeImage src={Img_Readme2}/>
                </Embed><br/>
                <Embed css={{margin: "auto"}} width={10} height={4}>
                  <FadeImage src={Img_Readme2_1}/>
                </Embed>
              </div>
            </div>

            <div
              css={{
                [theme.mediaQueries.md]: {
                  marginBottom:　theme.spaces.xl, 　　//其实无效theme.mediaQueries.xl　＝ @media (min-width:1200px);
                }
              }}
            >
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M13 8h-8v-1h8v1zm0 2h-8v-1h8v1zm-3 2h-5v-1h5v1zm11.172 12l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7z" />
              </svg>
              <Text variant="h4">检验页面</Text>
              <Text>
               派工后，所指派检验员的账户进入后，就能在“我参与的检验”列表当中发现新的检验号。点击某条设备沉入报告列表界面，就能增加
               新的检验报告以便后续编制。
              </Text>
              <div>
                <Embed css={{margin: "auto"}} width={10} height={7}>
                  <FadeImage src={Img_Readme3}/>
                </Embed><br/>
                <Embed css={{margin: "auto"}} width={10} height={7}>
                  <FadeImage src={Img_Readme4}/>
                </Embed>
              </div>
            </div>

            <div>
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M22 2v22h-20v-22h3c1.23 0 2.181-1.084 3-2h8c.82.916 1.771 2 3 2h3zm-11 1c0 .552.448 1 1 1 .553 0 1-.448 1-1s-.447-1-1-1c-.552 0-1 .448-1 1zm9 1h-4l-2 2h-3.897l-2.103-2h-4v18h16v-18zm-13 9.729l.855-.791c1 .484 1.635.852 2.76 1.654 2.113-2.399 3.511-3.616 6.106-5.231l.279.64c-2.141 1.869-3.709 3.949-5.967 7.999-1.393-1.64-2.322-2.686-4.033-4.271z" />
              </svg>
              <Text variant="h4">报告生成界面</Text>
              <Text>
                点中间大按钮增加一份报告，生成后再点击＂进入报告编制＂，沉入式列表会显示某个检验ISP的底下已添加报告。
                原始记录可以复制，输入已经做的报告ID号，点击拷贝并保存即可。
              </Text>
              <div>
                <Embed css={{margin: "auto"}} width={10} height={7}>
                  <FadeImage src={Img_Readme5}/>
                </Embed><br/>
                <Embed css={{margin: "auto"}} width={10} height={5}>
                  <FadeImage src={Img_Readme6}/>
                </Embed>
              </div>
            </div>

            <div>
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M20 3c0-1.657-1.344-3-3-3s-3 1.343-3 3c0 .312.061.606.149.889l-4.21 3.157c.473.471.878 1.01 1.201 1.599l4.197-3.148c.477.316 1.048.503 1.663.503 1.656 0 3-1.343 3-3zm-2 0c0 .551-.448 1-1 1s-1-.449-1-1 .448-1 1-1 1 .449 1 1zm3 12.062c1.656 0 3-1.343 3-3s-1.344-3-3-3c-1.281 0-2.367.807-2.797 1.938h-6.283c.047.328.08.66.08 1s-.033.672-.08 1h6.244c.396 1.195 1.509 2.062 2.836 2.062zm-1-3c0-.551.448-1 1-1s1 .449 1 1-.448 1-1 1-1-.448-1-1zm-20-.062c0 2.761 2.238 5 5 5s5-2.239 5-5-2.238-5-5-5-5 2.239-5 5zm2 0c0-1.654 1.346-3 3-3s3 1.346 3 3-1.346 3-3 3-3-1.346-3-3zm7.939 4.955l4.21 3.157c-.088.282-.149.576-.149.888 0 1.657 1.344 3 3 3s3-1.343 3-3-1.344-3-3-3c-.615 0-1.186.187-1.662.504l-4.197-3.148c-.324.589-.729 1.127-1.202 1.599zm6.061 4.045c0-.551.448-1 1-1s1 .449 1 1-.448 1-1 1-1-.449-1-1z" />
              </svg>
              <Text variant="h4">原始记录页面</Text>
              <Text>
                点击任意可点的条目小块进入编辑状态，改完了记得点击“修改确认”按钮，表格列表形式数据需要按条点击“新增”或“删除”；
                比如输入各个层站具体数，上面详情文字自动同步。最后记得保存。
              </Text>
              <div>
                <Embed css={{margin: "auto"}} width={10} height={6}>
                  <FadeImage src={Img_Readme7}/>
                </Embed><br/>
                <Embed css={{margin: "auto"}} width={10} height={7}>
                  <FadeImage src={Img_Readme8}/>
                </Embed><br/>
                <Embed css={{margin: "auto"}} width={10} height={9}>
                  <FadeImage src={Img_Readme9}/>
                </Embed>
              </div>
            </div>

            <div
              css={{
                marginBottom: "0 !important",   　 //最高级别指示的。覆盖上面的"& > div": { }甚至下面的[theme.mediaQueries.md] 。
                [theme.mediaQueries.md]: {
                  marginBottom:　theme.spaces.xl, 　　//其实无效theme.mediaQueries.xl　＝ @media (min-width:1200px);
                }
              }}
            >
              <svg
                css={{ marginBottom: theme.spaces.md }}
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
              >
                <path d="M13 8h-8v-1h8v1zm0 2h-8v-1h8v1zm-3 2h-5v-1h5v1zm11.172 12l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7z" />
              </svg>
              <Text variant="h4">报告打印页面</Text>
              <Text>
                点击或滑入右侧标签页“检验报告”，浏览器工具栏点打印功能，就能预览并打印检验报告，谷歌Chrome最新浏览器打印的效果才最完美。
                若需要也能将目标打印机选择“另存为PDF”，输出PDF后用软件再改和打印。
              </Text>
              <div>
                <Embed css={{margin: "auto"}} width={10} height={7}>
                  <FadeImage src={Img_Readme10}/>
                </Embed><br/>
                <Embed css={{margin: "auto"}} width={10} height={6}>
                  <FadeImage src={Img_Readme11}/>
                </Embed>
              </div>
            </div>
          </div>
        </Container>
      </div>

    <DragablePinner doing={isOpen} label={'到处拖拽它'}
                    onRequestPress={ onPinnerHandler }
    />

      {首页末尾链接()}
    </main>
  );
};

export default About;
