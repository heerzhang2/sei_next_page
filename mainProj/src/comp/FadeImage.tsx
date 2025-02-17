/** @jsxImportSource @emotion/react */
////import { jsx } from "@emotion/react";
import * as React from "react";
import { useTheme } from "customize-easy-ui-component";

/**
 * Fade in an image when it loads. Note, this needs to go
 * within an 'Embed' container to work properly
 * @param param0
 */

export interface FadeImageProps {
  src?: string;
  alt?: string;
  hidden?: boolean;
}

export const FadeImage: React.FunctionComponent<FadeImageProps> = ({
  alt,
  src,
  hidden,
  ...other
}) => {
  const theme = useTheme();
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  function onLoad() {
    setLoaded(true);
  }

  function onError() {
    setError(true);
  }
//【加载错误的】直接省略掉render
  if (error) {
    return null;
  }
  //给<img的src若不是真正的图片格式的，就不会真的去下载。
  //<img src="http://localhost:8083/files作废/30/load"　，不是真图片的情况，浏览器看不到<img >，自动剔除？？
//type CrossOrigin = 'anonymous' | 'use-credentials' | '' | undefined;

  return src ? (
    <img
      onLoad={onLoad}
      onError={onError}
      crossOrigin= 'use-credentials'
      aria-hidden={hidden}
      css={{
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.1s ease",
        "@media print": {
          transition: 'unset',
        },
      }}
      src={src}
      {...other}
      alt={alt}
    />
  ) : (
    <div css={{ background: theme.colors.background.tint1 }} />
  );
};


/*例子：
<ListItem
   contentBefore={
          <React.Fragment>
            <Avatar size="xs" name={'曳'}/>
            <Avatar size="xs" name={'有'}/>
          </React.Fragment>
        }
   contentAfter={
      det?.isp?.dev && !error ? (
      <Embed css={{ width: "60px" }} width={75} height={50}>
          <FadeImage src={src} hidden />
      </Embed>
      ) : (  det?.isp?.dev?.oid  )
    }
@父辈div高度规定死的场合: 完全没必要使用<Embed组件的:
<div css={{
       display: 'flex',justifyContent: 'space-around',alignItems: 'center',height: '30vh',
       [theme.mediaQueries.lg+', print']: {height: '6.5cm'}
   }}>
       <Embed css={{width: "80px",margin: "auto"}}  width={300} height={400} >
           <FadeImage src={'http://127.0.0.1:9000/ywmast/202310/15/6a174a75-1d78-4bff-ae10-ee30d25c95e8'}

                      alt={'sdfsdf投入了'} />
       </Embed>
       <FadeImage src={'http://127.0.0.1:9000/ywmast/202310/15/6a174a75-1d78-4bff-ae10-ee30d25c95e8'}

                  alt={'sdfsdf投入了'}
                  css={{width: "1490px",height: "100%",margin: "auto"}}
       />
   </div>
* */
