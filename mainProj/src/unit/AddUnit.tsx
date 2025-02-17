/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Navbar,
    Toolbar,
    Text,
    Button,
    IconButton,
    MenuList,
    MenuItem,
    useTheme,
    useToast,
    LayerLoading,
    Container,
    Check,
    IconMoreVertical,
    IconArrowLeft,
    IconArrowRight,
    IconPackage,
    IconRefButton,
    Select,
    Spinner,
    TwoHalfRightPanel,
    VerticalMenu, DdMenuItem
} from "customize-easy-ui-component";
import { Link as RouterLink } from "../routing/Link";
import {useContext} from "react";
import RoutingContext from "../routing/RoutingContext";
//import useCreateDeviceMutation from "./useCreateDeviceMutation";
import {ContainLine, TransparentInput} from "../comp/base";
//import queryString from "querystring";
import useAddUnitMutation from "./useAddUnitMutation";

import queryString from "query-string";

interface AddUnitProps {
    id?: string;
    readOnly?: boolean;
    dt?:any;
}
//二级路由的；接替旧版本第三级的路由内嵌页面 【问题是】不可以直接将AddUnit嵌套到其它的二级路由主页面底下，必须提取内部公用部分出来复用！
const AddUnit = ({readOnly, id, dt=null,}:AddUnitProps) => {
    const theme = useTheme();
    const toast = useToast();
    const [editing, ] = React.useState(!readOnly|| true);
    const [ingredients, setIngredients] = React.useState<any>( dt||{} );
    const [eqp, setEqp] = React.useState(dt);    //为了更改数据用的。
    const qs= queryString.parse(window.location.search);
    const field =qs && !!qs.土建施单;
    console.log("AddUnit参数DetailedGuide路由qs field=",field, qs);

    const {history } = useContext(RoutingContext);
    const {call:addUnitfunc,doing, result:entry}= useAddUnitMutation();
    //const {result:entry, submit:submitfunc, error} = useCreateDevice({id:"1",  ...ingredients});
/*    async function saveRecipe( a : any
    ) {
        try {
            //setLoading(true);
            console.log("baochun等待之前１ ingredients=", ingredients );
            //这时才去修改submitfunc参数，已经来不及，setOptions异步执行；submitfunc会看见前面的取值。
            //setOptions({oid:"test暂且空着",  ...ingredients});
            console.log("baochun等待之前２ ingredients=", ingredients );
            await submitfunc();   //要等待正常的结果应答从后端返回。
            //submitfunc(); 立刻执行后面代码，这样不会等待后端应答的。
            /!*点击函数发送给后端服务器，即刻返回到这里了await submitfunc();　这个时候entry还不是后端的应答数据，要等到下一次entry被ＨＯＯＫ修正*!/
            //  console.log("等半天createEntry返回error=",error,"结果",entry );

            //加了await 后的　submitfunc();似乎也不能确保entry非空的，必须等待下一次render()。
            //    entry && setLocation("/device/" + entry.id, { replace: true } );
            //原型是 PushCallback = (to: Path, replace?: boolean) => void;
        } catch (err: any) {
            //setLoading(false);
            toast({
                title: "捕获errcc错",
                subtitle: err.message,
                intent: "error"
            });
            console.log("捕获err打了吗", err);
        }
    }*/

    //保存 编辑新的设备之后，要修正URL
    React.useEffect(() => {
        console.log("AddUnit useEffect## ",  "/unit/" + entry?.newUnitExternalSource.id);
        entry && ( history.push("/unit/" + entry.newUnitExternalSource.id) );
    }, [entry, history]);

    return (
        <TwoHalfRightPanel
            title={ `新增加单位-企业或个人` }
            back={
                <RouterLink href={`/unit/?&emodel=${qs.emodel}&erurl=${qs.erurl}&field=${qs.field}`}>
                    <IconButton  noBind  icon={<IconArrowLeft />}
                                 variant="ghost"
                                 label="后退"
                                 size="md"
                                 css={{
                                     marginRight: theme.spaces.sm,
                                     [theme.mediaQueries.md]: {
                                         display: "none"
                                     }
                                 }}
                    />
                </RouterLink>
            }
            menu={
                <VerticalMenu>
                    <DdMenuItem label="其它功能"
                                onClick={(e) => {
                                }}/>
                </VerticalMenu>
            }
        >
                {ingredients && (
                    <div>
                        <Text variant="h5">单位相关信息</Text>

                        <div key={1}>
                            {editing ? (
                                <div>
                                    <ContainLine display={'选择类型，是组织企业还是个人'}>
                                        <Check label={'是企业'}
                                               checked= {ingredients.unit?.company}
                                               onChange={e => {
                                                   setIngredients( {
                                                       ...ingredients,
                                                       unit: { ...ingredients.unit, company: !ingredients.unit?.company }
                                                   });
                                               }  }
                                        />
                                    </ContainLine>
                                    <ContainLine display={ingredients.unit?.company? '组织企业名称':'个人姓名'}>
                                        <TransparentInput
                                            autoFocus={true}
                                            placeholder="那一台电梯？"
                                            value={ingredients.unit?.name||''}
                                            onChange={(e:any) => {
                                                setIngredients( {
                                                    ...ingredients,
                                                    unit: { ...ingredients.unit, name: e.target.value }
                                                });
                                            }}
                                        />
                                    </ContainLine>
                                    <ContainLine display={'统一社会信用代码/身份证号码'}>
                                        <TransparentInput
                                            autoFocus={true}
                                            placeholder="导入的情形可以不填写"
                                            value={ingredients.unit?.no||''}
                                            onChange={(e:any) => {
                                                setIngredients( {
                                                    ...ingredients,
                                                    unit: {...ingredients.unit, no: e.target.value}
                                                });
                                            }}
                                        />
                                    </ContainLine>
                                </div>
                            ) : (
                                <div
                                    css={{
                                        backgroundColor: false
                                            ? theme.colors.palette.blue.lightest
                                            : "transparent",
                                        display: "flex",
                                        marginLeft: "-0.25rem",
                                        paddingLeft: "0.25rem",
                                        marginRight: "-0.25rem",
                                        paddingRight: "0.25rem",
                                        // borderRadius: "0.25rem",
                                        marginBottom: theme.spaces.xs,
                                        justifyContent: "space-between",
                                        [theme.mediaQueries.md]: {
                                            width: "500px"
                                        }
                                    }}
                                >
                                    <Text
                                        css={{
                                            paddingRight: theme.spaces.xs,
                                            backgroundColor: false
                                                ? theme.colors.palette.blue.lightest
                                                : "white"
                                        }}
                                    >
                                        单位名称：{dt?.company?.name ||dt?.person?.name}
                                    </Text>
                                    <div
                                        css={{
                                            flex: 1,
                                            borderBottom: `1px dashed ${
                                                theme.colors.border.muted
                                            }`,
                                            marginBottom: "6px"
                                        }}
                                    />
                                    <Text
                                        css={{
                                            paddingLeft: theme.spaces.xs,
                                            backgroundColor: false
                                                ? theme.colors.palette.blue.lightest
                                                : "white"
                                        }}
                                    >
                                        单位识别码：{dt?.company?.no ||dt?.person?.no}
                                    </Text>
                                </div>
                            )}
                            <br/>
                            <Text>暂时无独立单位库，待完善AU</Text>
                        </div>

                    </div>
                )}

                <Spinner doing={doing}/>
                {editing && <Button
                        intent="primary"
                        disabled={false}
                        css={{ marginLeft: theme.spaces.sm }}
                        onPress={() => {  //按钮里面看不到最新的input取值的。
                            addUnitfunc(ingredients.unit );
                        }}
                    >
                        从外部库关联生成一个单位吧AU
                    </Button>
                }
        </TwoHalfRightPanel>
    );
};


export default AddUnit;
