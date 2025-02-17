/** @jsxImportSource @emotion/react */
import { jsx, css } from "@emotion/react";
import * as React from "react";
// import {useMediaLayout} from "use-media";
import {
    useTheme,
    IconAlertCircle, IconChevronDown,
    getHeight,
    Text, LabelText,
} from "customize-easy-ui-component";
// import {Dispatch, SetStateAction} from "react";


interface MainMenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

//依据基础组件库配置的按钮 最小高度MOBILE_HEIGHT="30px"; DESKTOP_HEIGHT="48px";
const MOBILE_HEIGHT = getHeight("sm");
const DESKTOP_HEIGHT = getHeight("lg");


/**报告的快捷菜单:
* */
export const LeftTopMenuBar: React.FunctionComponent<MainMenuBarProps> =
({
     children,
  ...other
}) => {
    const theme = useTheme();
    //左右两个半页面独立分级路由形式的折叠型框架形态切换的临界点"629px"宽度方向临界点啊。
    // const isWideSrc = useMediaLayout({ minWidth: `${breakpoints.md}` });
    // const touchScr = useMediaLayout(`(any-pointer: coarse)`);

  return (
      <nav
          css={[
            {
              background: theme.colors.background.default,
              zIndex: theme.zIndices.fixed,
              boxShadow: theme.shadows.sm,
                "@media print": {
                    boxShadow: 'unset',
                },
            },
            css({
                position: "fixed",
                // bottom: 0,
                top: 0,         //【不加上】差别：只能跟随文档的原点，不是父辈的。
                left: 0,
                // width: isWideSrc? "50%" : touchScr? "100%" : `calc(100% - ${theme.iconSizes.md} - 0.3rem)`,
            }),
          ]}
          {...other}
      >
        <div
            css={[
              {
                minHeight: MOBILE_HEIGHT,
                display: "flex",
                position: "relative",
                alignItems: "center",
                justifyContent: "space-between",
                [theme.mediaQueries.big] : {
                    minHeight: DESKTOP_HEIGHT,
                },
              },
            ]}
        >
        { children }
        </div>
      </nav>
  );
};


