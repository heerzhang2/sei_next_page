/** @jsxImportSource @emotion/react */
import { jsx, css } from "@emotion/react";
import * as React from "react";
import {Container, Text, Toolbar, useMMenuBarOcup, useTheme} from "customize-easy-ui-component";
// import {Link as RouterLink} from "../routing/Link";
import Link from "next/link";
import Image from "next/image";
// import {Layout} from "../Layout";


// type ContainerProps = React.HTMLAttributes<HTMLElement>;
interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
    // component?: React.ElementType<ContainerProps>;
    //显示抬头的凭条图标哪一行工具栏
    hasBar?: boolean;
}

/**把最外层<Layout>去掉试试： 尝试打印问题？    <Layout>
 * */
export const AloneContainer: React.FunctionComponent<ContainerProps> = (
  props: ContainerProps
) => {
    const theme = useTheme();
    const { barHeight,bottomCss } = useMMenuBarOcup(false);

  return (
      <>
          <div  css={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'nowrap',
              flexDirection: 'column',
              alignItems: 'stretch',
              maxWidth: 'unset',
              boxSizing: "border-box",
              flex: "1",
              boxShadow: "none",
              position: "absolute",
              width: "100%",
              borderRadius: 0,
              minHeight: `calc(100vh - ${barHeight} - 64px)`,
              paddingBottom: `${barHeight}`,
              "@media print": {
                  justifyContent: 'flex-start',    //小于一页纸高度的就不要居中
              },
          }}>
              { props.hasBar &&
                  <Toolbar className="Alone__Toolbar"
                           css={{
                               "@media print": {
                                   display: 'none'
                               },
                           }}
                  >
                      <Link　href="/">
                          <Image
                              className="dark:invert"
                              src="/images/food.svg"
                              alt="Vercel logomark"
                              width={20}
                              height={20}
                          />
                          检验平台
                      </Link>
                      <div css={{ marginLeft: "auto" }}>
                      </div>
                  </Toolbar>
              }
              <Container css={{
                  display: 'flex',
                  alignItems: 'center',
                  //height: '100%',
                  flexDirection: 'column',
                  margin: 'auto',
                 }}

                 {...props}
              />
              <div css={{"@media print": {pageBreakBefore:'always'}}}/>
          </div>
      </>
  );
};


