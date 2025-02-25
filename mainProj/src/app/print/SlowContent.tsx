import {Global} from "@emotion/react";

interface Props {
}

export default function SlowContent(props: Props) {

  return <div>
    <Global
        styles={{
          html: {
            "@page": {
              // size: 'A4 portrait',
              size: 'A4 landscape',
            },
            "#root #floormenu": {
              // display: 'none',
              opacity: '0.3' //: 'unset',
            }
          }
        }}
    />
      <div className="text-yellow-500">Slow data:<br/> woxian想做横版本打印的开始部分<br/>竖rrrree</div>
  </div>
}
