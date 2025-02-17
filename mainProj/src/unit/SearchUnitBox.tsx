/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    InputGroup,
    useTheme,
    VisuallyHidden,
    Button,
    IconLayers,
    IconButton,
    Dialog,
    Text,
    CommitInput,
    ButtonRefComp,
    InputLine,
    DialogContent, DialogHeading, DialogDescription, DialogClose,
    useResponsiveContainerPadding
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import { ContainLine, TransparentInput } from "../comp/base";
import {MutableRefObject, useCallback, useEffect, useState} from "react";


//import FocusLock from 'react-focus-lock';
//import { useFocusElement } from "customize-easy-ui-component/esm/Hooks/use-focus-trap";


export interface SearchUnitBoxProps {
  setQuery: React.Dispatch<React.SetStateAction<any>>;
  //企业和个人的过滤器参数字段，可以混合共用一个存储结构，后端接口，前端临时存储sessionStorage['单位选择']；
  query: any;
  label?: string;
    company: boolean      //我的页面是为了企业而展示的。
}

export const SearchUnitBox: React.FunctionComponent<SearchUnitBoxProps> = ({
  query,
  label = "搜索所有单位",
   setQuery,
   company,
   ...other
}) => {
  const theme = useTheme();
  const responsiveContainerPadding = useResponsiveContainerPadding();
    const [open, setOpen] = React.useState(false);
    const commitBlurRef =React.useRef(null);
    const [filter, setFilter] = React.useState<any>( {...query} );
    useEffect( () => {
        //必须加上，否则：两个共同用同一个变量编辑框数据不同！焦点找不回来！
        setFilter({...query});
    },[query, setFilter])

  //即刻搜索模式Input只能使用英文字母，不能上中文的onChange+Suspense导致失去焦点。除非改成CommitInput多步骤单个汉语接续确认方式。
  return (
    <React.Fragment>
    <form
      css={{
        margin: 0,
        position: "relative"
      }}
      onSubmit={e => e.preventDefault()}
    >

      <InputGroup
        css={{ margin: 0, position: "relative" }}
        hideLabel
        label={label}
      >
        <CommitInput  className="unitsearch"
          type="search"
          inputSize="md"
          css={[
            {
              height: "50px",
              width: `calc(100% - ${theme.iconSizes.md} - 2 * ${theme.spaces.sm})`,
              textAlign: "left",
              border: "none",
              borderBottom: "1px solid",
              borderColor: theme.colors.border.default,
              borderRadius: 0,
              WebkitAppearance: "none",
              // background: "transparent",
              boxShadow: "none",
              ":focus": {
                boxShadow: "none",
                backgroundColor: theme.colors.background.tint1
              }
            },
            responsiveContainerPadding
          ]}
          {...other}
           value={ filter.name ||''}
           onSave={(text: string) => {
               setQuery({...filter, name:text } )
             }
           }
           placeholder={label}
        />
      </InputGroup>

      <VisuallyHidden>
        <Button type="submit">搜索没用</Button>
      </VisuallyHidden>
      <IconButton
        onPress={() => setOpen(true)}
        variant="ghost"
        label="定制单位选择范围"
        size="lg"
        icon={<IconLayers />}
        css={{
          display:  "block",
          position: "absolute",
          right: theme.spaces.sm,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          height: 'unset',
          width: 'unset'
        }}
      />

    </form>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent >
                <DialogHeading>
                    选择参数缩小查询的范围
                </DialogHeading>
                <DialogDescription>
                    <div css={{ padding: theme.spaces.xs }}>
                        <Text>为了减少查询结果集的数量</Text>
                        <div>
                            <InputLine label={`名字:`}>
                                <CommitInput type="search" placeholder="搜索,可模糊"
                                             value={filter.name || ''}  onSave={txt => setFilter( { ...filter, name: txt }) }
                                />
                            </InputLine>
                            <InputLine label={`地址:`}>
                                <CommitInput type="search" placeholder="搜索,可模糊"
                                             value={filter.address || ''}  onSave={txt => setFilter( { ...filter, address: txt }) }
                                />
                            </InputLine>
                            { !company && <InputLine label={`手机号码:`}>
                                <CommitInput type="search" placeholder="精确查询"
                                             value={filter.phone || ''}  onSave={txt => setFilter( { ...filter, phone: txt }) }
                                />
                            </InputLine>
                            }
                            <InputLine label={`${company? '社会信用代码':'身份证号'}:`}>
                                <CommitInput type="search" placeholder="精确查询"
                                             value={filter.no || ''}  onSave={txt => setFilter( { ...filter, no: txt }) }
                                />
                            </InputLine>
                        </div>
                        <div
                            css={{
                                display: "flex",
                                marginTop: theme.spaces.lg,
                                justifyContent: "flex-end"
                            }}
                        >
                            <ButtonRefComp intent="primary"
                                           ref={commitBlurRef}
                                           onPointerOver={(e :any) => {
                                               //这个是CommitInput组件引进的要求!：很可能直接就点击提交按钮，没经过onBlur()，必须完成输入的保存功能。
                                               // @ts-ignore
                                               commitBlurRef!.current!.focus();
                                           }}
                                           onPress={ (e :any) => {
                                               setQuery({...filter})
                                               setOpen(false);
                                           }}
                            >
                                参数设置好了
                            </ButtonRefComp>
                        </div>

                    </div>
                </DialogDescription>
                <DialogClose>关闭</DialogClose>
            </DialogContent>
        </Dialog>
    </React.Fragment>
  );
};

