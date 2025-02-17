/** @jsxImportSource @emotion/react */
import {  Global } from "@emotion/react";
import * as React from "react";
import { useTheme } from "customize-easy-ui-component";
import cutting_board_knife from '../images/cutting-board-knife.jpg';
//骨架-背景
//各个子网站和子路由的Layout可以分开单独；做不一样的。

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FunctionComponent<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <React.Fragment>
      <Global
        styles={{
          html: {
            [theme.mediaQueries.md]: {
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundImage: `url(${cutting_board_knife})`
            }
          }
        }}
      />
      {children}
    </React.Fragment>
  );
};


