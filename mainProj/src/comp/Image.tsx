/** @jsxImportSource @emotion/react */
import * as React from "react";
import {useTheme} from "customize-easy-ui-component";

//<Embed>能根据上级div宽度高度来自动调整下一级的图片的输出大小。
//一个Image嵌套好几层组件才能到　<img src="" alt="" class="css-11nysj5-FadeImage">。
//缩略图和完整图都是同一个图片的数据内容，　不做差异化处理！
//图片文件要：　根据id, prefix在此生成src及 URL的？


interface Props {
  url: string;
  alt?: string;
}
//<Embed>能根据上级div宽度高度来自动调整下一级的图片的输出大小。
//一个Image嵌套好几层组件才能到　<img src="" alt="" class="css-11nysj5-FadeImage">。
//缩略图和完整图都是同一个图片的数据内容，　不做差异化处理！
//图片文件要：　根据id, prefix在此生成src及 URL的？
//可以外部组件上增加 <SimpleImg url={Img_Jgd} css={{width: '100%',maxWidth: '60rem'}}/>
export const SimpleImg = ({ url,alt='图示', ...other }: Props) => {
  const theme = useTheme();
  //注意 若连续两个图片的，后面哪一个没有设置width: '100%',的话，那么前面一张图片也不生效width: '100%' 就会导致超出100%的宽度；
  //但是添加了width: '100%'就导致了高度上面的突破限制 maxHeight。
  return (
      <div css={{
        display: 'flex',justifyContent: 'space-around', alignItems: 'center', margin: 'auto',
        //width: '100%',
        // height: '30vh',
        // [theme.mediaQueries.lg+', print']: {height: '6.5cm'}
        }}
      {...other}
      >
        <img src={url} alt={alt}
             css={{
               width: 'inherit',
               maxHeight: '14cm',   //在这个元素的上一级元素可以自己加一个固定高度值，就像一张纸打印的应该多高的取值。这个用固定高度会导致图片自动的横竖比例不均衡压缩=会变形啊！24cm是纸张大约最多高度=报告最大图片高。
               //上面这个maxHeight对打印可能没影响，宽度大的图片情况：maxWidth限制了打印，同时同比例地限制高度大小了，原始图片宽度大的，maxHeight就没用。我这里打印图片的不考虑占满纸张高度。
               maxWidth: '-webkit-fill-available',
               "@media print": {maxHeight: '26cm', maxWidth: '705px'},         //对A4纸张竖版的高度26cm基本都是图片整张纸，这里没考虑多个图片在宽度方向上的并排布局：可用软件合并。
               //不能用这个 ['print']: {maxHeight: '24cm', maxWidth: '705px'},
               [theme.mediaQueries.lg]: {maxHeight: '18cm', maxWidth: undefined}           //普通图片+大屏幕限制高度才是关键的。
               //合计不能超过A4纸张的竖排默认的px数合计715px；需考虑剪掉相邻元素<td/>占位=10px; A4打印和预览报告的对宽度要求不一致，原始记录编制左半边显示只有一半要求宽度。需要依据printing判别。
             }}
        />
      </div>
  );
};



/*例子：
import {useFirebaseImage} from "../comp/Image";
  缩略图thumb-sm@ 和完整图片thumb@的 url不一样的；后端支持缩略？　没必要做；
  const { src, error } = useFirebaseImage("thumb-sm@", det?.isp?.dev?.cod!);
* */
