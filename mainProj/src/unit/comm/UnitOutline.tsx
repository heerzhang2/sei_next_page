/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    Text,
    useTheme,
} from "customize-easy-ui-component";
import { Link as RouterLink } from "../../routing/Link";
import {useContext} from "react";
import RoutingContext from "../../routing/RoutingContext";
//import useCreateDeviceMutation from "./useCreateDeviceMutation";
import {ContainLine, TransparentInput} from "../../comp/base";
//import queryString from "querystring";
import queryString from "query-string";

interface UnitOutlineProps {
    id?: string;
    dt?: any;    //unit:
}
//二级路由的；接替旧版本第三级的路由内嵌页面 【问题是】不可以直接将AddUnit嵌套到其它的二级路由主页面底下，必须提取内部公用部分出来复用！
export const UnitOutline: React.FunctionComponent<UnitOutlineProps> = ({
    id,
    dt=null,
}) => {
    const theme = useTheme();
    const qs= queryString.parse(window.location.search);
    const field =qs && !!qs.土建施单;
    const {history } = useContext(RoutingContext);

    return (
        <div>
            <Text variant="h5">单位相关信息</Text>
            <div key={1}>
                    <div
                        css={{
                            backgroundColor: false
                                ? theme.colors.palette.blue.lightest
                                : "transparent",
                            //display: "flex",
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
                                paddingLeft: theme.spaces.xs,
                                backgroundColor: false
                                    ? theme.colors.palette.blue.lightest
                                    : "white"
                            }}
                        >
                            {dt.company? '企业':'个人'}名称：{dt?.company?.name ||dt?.person?.name}
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
                            {dt.company? '统一社会信用代码':'身份证号码'}：{dt?.company?.no ||dt?.person?.no}
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
                            {dt.company? '单位办公':'常住'}地址：{dt?.company?.address ||dt?.person?.address}
                        </Text>
                    </div>

                <br/>
                <Text>多数单位来自监察单位，部分单位来自检验机构</Text>
            </div>

        </div>
    );
};

