/** @jsxImportSource @emotion/react */
import * as React from "react";
import {
    IconButton,
    useToast,
    InputPure,
    SuffixInput,
    Dialog,
    List,
    ListItem,Text,
    IconSearch, useTheme, InputBase,
    DialogContent, DialogHeading, DialogDescription, DialogClose,
} from "customize-easy-ui-component";
// import {DialogClose, DialogContent, DialogDescription, DialogHeading} from "@/comp/Dialog";
import {Dispatch, SetStateAction, useContext, useEffect, useRef, useState} from "react";
import RoutingContext from "../../routing/RoutingContext";

import {
    Map, Text as MapText,
    APILoader,
    ScaleControl,
    ToolBarControl,
    ControlBarControl,
    Geolocation, AutoComplete, CircleMarker, useGeolocation
} from "@uiw/react-amap";
import {floatInterception} from "../tool";


/**地位 在手机上可能超精的，电脑上差较远。
 * 会泄露使用者位置。
 * */

interface GeoMapChooseProps {
    //当前id所指向的挂接对象模型的给用户看的关键名:标题= 单位名字;
    geo?: {lat: number ,lon: number};
    onCancel?: () => void;
    //触发了点击，保存状态，返回后才能恢复啊。
    onDialog?: () => void;
    autoFocus?: boolean;
    //直接设置返回的状态变量。
    setEditorVar: Dispatch<SetStateAction<any>>;
}
//页面和数据分离后又要被迫整合在一块了？
//非高层次通用的组件。语义整合：　数据获取和规格化显示部分组合在一个文件内。前端graphql底层缓存：不见得每次都会发送请求给后端的。
//graphQL想把多个Query同时都坐在一个Hook函数里面一次性向后端读取，有许多障碍：页面分割，公用组件嵌套，父辈组件知晓子孙辈组件数据请求和参数还得传递数据，不过前端有缓存。

/**WEB端（JS API）｛不是APP端！｝；JS API Geolocation定位插件；
 App简单而且更容易做好；对比Web的就更有难度了。 ? App=java; Web=js;
 * 跟浏览器还有关系：chrome只能IP定位定位相差太远了；国产vivo浏览器可以精确定位html5定位;https://lbs.amap.com/faq/js-api/map-js-api/position-related/1060847215
 * 坐标偏差！  https://lbs.amap.com/demo/list/jsapi-v2
 * WGS84、GCJ02、百度坐标系之间进行转换 https://gitee.com/kl222/TransformCoordinate
 高德26.042673;119.25632 ，旧的百度26.048844,119.26287 ;
 地球坐标系(WGS84)，火星坐标系(GCJ02)， 百度坐标系(BD09)  https://blog.csdn.net/skh2015java/article/details/68486756
 高德地图坐标系（GCJ-02）与百度坐标系（BD-09）互相转换 https://blog.csdn.net/noob_hen/article/details/81133879?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control
 http://vdata01.amap.com/nebula/v2?key= 显示授权码状态，每个请求都得授权！！ 可能定位精度也受到后端接口过滤操纵的。
 key[]a7a90e05a37d3f6bf76d4a9032fc9129; ;
 */
export const GeoMapChoose= ({ geo, onCancel, onDialog,autoFocus,setEditorVar, ...other }:GeoMapChooseProps) =>
{
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    //const [queryReference, loadQuery] = useQueryLoader(VillageChooseQuery);
    //可输入部分名称来搜索
    const handleSelect = React.useCallback(({lat,lon}: {lat: number,lon: number}) => {
        //console.log("祖父OriginuseCallbackord辈3捕获 geo=", lat ,"lon=",lon );
        setEditorVar({lat,lon});
        setOpen(false);
    }, [setEditorVar]);

    //onChange={e => setSpart( e.currentTarget.value||undefined ) }   onSave={txt=> setSpart(txt||undefined)}
    //只要有加上onChange(),那么InputPure和InputBase实际效果一样的。 把onChange=改成onSave=()才会不同。
    //用component={InputBase}+onSave=()问题是：外部修改了状态变量无法简单的让input同步显示。 InputBase无法由外部推动input内容的改动，只能自己改。
  return (
   <React.Fragment>
    <SuffixInput  type={"search"}
            component={InputPure}  readOnly={true}
            value={ `${geo?.lat};${geo?.lon}` || '' }
            {...other}
    >
       <IconButton
          variant="ghost"
          icon={<IconSearch />}
          label="搜索吧"
          css={{
           // display: name ?  undefined : 'none'
          }}
          onClick={async (e) => {
               // loadQuery({id: parentId,        });
                setOpen(true);
                e.stopPropagation();
          } }
        />
    </SuffixInput>

       {/*对话框全屏幕： 地图紧凑模式*/}
       <Dialog open={open} onOpenChange={setOpen}>
           <DialogContent style={{
                    margin: 0,
                    width: "100vw",
                    maxWidth: "100vw",   //需要覆盖组件默认值
                    height: "100vh",
                    padding: 0,         //覆盖默认
                    border: 'none',       //默认2px 3px
                   [theme.mediaQueries.md]: {
                       border: 'none',
                   },
                   [theme.mediaQueries.lg]: {
                       maxWidth: "100vw",
                   },
               }}
              layStyle={{
                  overflowY: 'hidden',     //【极特殊情形】地图不要Y轴线的滚动了。 地图自身会就能滚动和缩放
              }}
           >
               <DialogHeading  asChild={false}
                   style={{
                       position: 'absolute',
                       width: "100vw",
                       zIndex: theme.zIndices.modal + 3,
                       pointerEvents: 'none',    //【遮盖】文字部分允许拉动地图
                       //为何再添加？组件里面已有
                       justifyContent: 'space-between',
                       display: 'flex',
                    }}
                    closeStyle={{
                        pointerEvents: 'all',
                    }}
               >
                 双击点选择定位
               </DialogHeading>
               <DialogDescription>
                    <React.Suspense fallback="等下马上来...">
{/* 【报错的，暂时屏蔽！】           <APILoader akay="a7a90e05a37d3f6bf76d4a9032fc9129">
                            <GeoMapChooseInner geo={geo} onSelect={handleSelect} />
                        </APILoader>*/}
                    </React.Suspense>
               </DialogDescription>
               <DialogClose
                   style={{
                       position: 'absolute',
                       top: `calc(100vh - 1.5rem - 4px)`,     //【严格计算】地图重叠定位；
                       zIndex: theme.zIndices.modal + 3,
                   }}
               >
                关闭
               </DialogClose>
           </DialogContent>
    </Dialog>

   </React.Fragment>
  );
}


//地图引进的
interface GeolocationResult {
    /** 定位结果 */
    position: any;
    /** 精度范围，单位：米 */
    accuracy: number;
    /** 定位结果的来源，可能的值有:'html5'=??chrome、'ip'??web、'sdk'=？？app
     * 手机上：跟浏览器还有关系：chrome只能ip定位定位相差太远了；国产vivo浏览器可以精确定位html5高精度定位;
     * */
    location_type: string;
    /** 形成当前定位结果的一些信息 */
    message: string;
    /** 是否经过坐标纠偏 */
    isConverted: boolean;
    /** 状态信息 "SUCCESS" */
    info: string;
    /** 地址信息，详情参考Geocoder */
    //addressComponent: AddressComponent;
    /** 地址 */
    formattedAddress: string;
    /** 定位点附近的POI信息，extensions等于'base'的时候为空 */
    pois: Array<any>;
    /** 定位点附近的道路信息，extensions等于'base'的时候为空 */
    roads: Array<any>;
    /** 定位点附近的道路交叉口信息，extensions等于'base'的时候为空 */
    crosses: Array<any>;
}

interface GeoMapChooseInnerProps {
    geo: any;
    onSelect: (geo: any) => void;
}
/**因为需要预加载数据的：所以构造成2层次的组件：上层的组件点击触发查询，而下层内部组件直接提取出数据。
 *不能放在同一个组件内： queryReference还未按钮点击(触发！)，还是null,下面组件的状态管理依赖于Hook,不能分叉hook,必须嵌套一层的组件render;
 *比如用 useLazyLoadQuery<typeof ProvinceChooseQuery> 只需要一层组件，但是有传统的缺点{不鼓励用那种模式},已经知道参数了就应该提前加载数据发起后端请求。
 *可关联传递调用实体模型自带的接口方法：Town(id).Adminunit.vlgs($partial)
 * */
function GeoMapChooseInner({ geo,onSelect }:GeoMapChooseInnerProps)
{
    const mapRef = useRef(null);
    const [data, setData] = useState<GeolocationResult>();
   // const {geolocation, setGeolocation}=useGeolocation({type: 'position'});
    //目标坐标是 启动显示的中心点; 后端坐标系=百度坐标。
    const obgeo= bdMapTransgdMap(geo);
    //【报错的，暂时屏蔽！】      const  posInit=obgeo ? new AMap.LngLat(obgeo.lon, obgeo.lat) : null;
    //{lat:edt.lat, lon:edt.lon}
    //const [geo, setGeo] = React.useState<any>({lat: 26.029551, lon: 119.27467});
    //let lnglat = null;
  //  console.log("祖父Ogersv23rd辈：捕获 geolocation=", geolocation );
    //lat: 26.029551 lng: 119.27467 //纬度latitude lat:26.032798 lon= 119.321531
    //<div style={{ width: "100%", height: "60vh", minHeight:"200px" }}>

    //var gps = [119.26287, 26.048844];
    function gdMapTransbdMap(geo: {lon :number, lat :number}) {
        if(!geo)  return null;
        let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
        let x = geo.lon;
        let y = geo.lat;
        let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
        let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
        let lngs = z * Math.cos(theta) + 0.0065;
        let lats = z * Math.sin(theta) + 0.006;

        return {
            lon: lngs,
            lat: lats
        }
    }
    function bdMapTransgdMap(geo: {lon :number, lat :number}) {
        if(!geo)  return null;
        let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
        let x = geo.lon - 0.0065;
        let y = geo.lat - 0.006;
        let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
        let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
        let lngs = z * Math.cos(theta);
        let lats = z * Math.sin(theta);

        return {
            lon: lngs,
            lat: lats
        }
    }

    //去掉和本地图抢占高度定位的其它元素:改成绝对定位？
    //地图特殊：<Map>自己没有内容高度的，只能依靠父辈div限制 height。
    return (
        <>
            <div style={{
                width: "100%",
                height: "100%",
                position: 'absolute',
            }}>
 {/*【报错的，暂时屏蔽！】            <Map center={posInit!}
                     ref={mapRef as any}  zoom={18}
                     onDblClick={(e) => {
                         //后端存储：统一为旧平台的坐标系，百度坐标。
                         const obgeo= gdMapTransbdMap({lat: e.lnglat.getLat!(), lon: e.lnglat?.getLng!()});
                         let lonS=floatInterception(obgeo?.lon!, 6);
                         let latS=floatInterception(obgeo?.lat!, 6);
                         onSelect({lon:lonS, lat:latS});
                     }}
                >
                    <>
                        <ScaleControl offset={[16, 30]} position="LB" />
                        <ToolBarControl offset={[16, 10]} position="RB" />
                        <ControlBarControl offset={[16, 180]} position="RB" />
                        <CircleMarker
                            center={posInit!}
                            visiable={true}
                            radius={8}
                            strokeColor="#fff"
                            strokeWeight={2}
                            strokeOpacity={0.5}
                            fillColor='rgba(125,0,255,1)'
                            fillOpacity={0.3}
                            zIndex={10}
                            bubble={true}
                            cursor='pointer'
                        />
                        <Geolocation
                            position="RB"
                            offset={[16, 80]}
                            // 是否使用高精度定位，默认:true
                            enableHighAccuracy={true}
                            maximumAge={100000}
                            // 超过10秒后停止定位，默认：5s
                            timeout={10000}
                            borderRadius="5px"
                            zoomToAccuracy={true}
                            showCircle={true}
                            onComplete={(data) => {
                                //启动时刻？ 自动发出定位当前位置。 注意浏览器Chrome手机上定位不准确。
                                console.log('Geolocation返回：', setData, data);
                                setData(data as any);
                            }}
                            onError={(err) => {
                                console.log('Geolocation报错：', err);
                            }}
                        />
                    </>
                </Map>
                */}
            </div>
            <Text
              style={{
                  display: "flex",
                  justifyContent: "center",
                  position: 'relative',
                  top: `calc(100vh - 2.5rem)`,     //【严格计算】地图重叠定位；和地图按钮关键部分重叠的。
                  pointerEvents: 'none',          //【特殊处理】按钮遮盖无法点击
              }}
            >
              {`定位:${data?.location_type}在${data?.position}`}
            </Text>
        </>
    );
}


/* 高得地图：
<Geolocation ？定位位置。
| onDblClick | 鼠标左键双击事件 | - | | onResize | 地图容器尺寸改变事件 | - onRightClick |
<div style={{ width: '100%', height: '300px' }}>
<Map ref={mapRef} zoom={14} center={[116.397637, 39.900001]}>
setCenter(center: [number, number] | LngLat, immediately: boolean = false, duration?: number):
setZoomAndCenter(zoom: number, center: [number, number] | LngLat, immediately: boolean = false, duration?: number);
                    <Geolocation
                        maximumAge={100000}
                        borderRadius="5px"
                        position="RB"
                        offset={[16, 80]}
                        zoomToAccuracy={true}
                        showCircle={true}
                    />
* 各地图API坐标系统比较与转换;
 * WGS84坐标系：即地球坐标系，国际上通用的坐标系。设备一般包含GPS芯片或者北斗芯片获取的经纬度为WGS84地理坐标系,
 * 谷歌地图采用的是WGS84地理坐标系（中国范围除外）;
 * GCJ02坐标系：即火星坐标系，是由中国国家测绘局制订的地理信息系统的坐标系统。由WGS84坐标系经加密后的坐标系。
 * 谷歌中国地图和搜搜中国地图采用的是GCJ02地理坐标系; BD09坐标系：即百度坐标系，GCJ02坐标系经加密后的坐标系;
 * 搜狗坐标系、图吧坐标系等，估计也是在GCJ02基础上加密而成的。
 腾讯和高德+微信+阿里是同一坐标系;
JSAPI Geolocation插件在移动端会优先使用H5原生geolocation定位接口，再使用IP定位。
 由于Chrome在国内没有提供服务，因此使用Chrome定位服务的浏览器，比如：Chrome、火狐、安卓原生WebView等环境的原生定位通常都会定位失败；这时候我们会通过IP定位兜底，Wifi环境下有比较高的IP定位成功率，4G网络通畅IP无法定位；
 国产浏览器或者应用通常会搭载国内厂商提供的定位能力，geolocation原生接口可以定位成功；如果是hybrid App建议可以通过bridge等手段配合高德定位SDK一起使用。
* */



//【保留】开车导航模式的：
/*

           <div id="panel"
                style={{
                    width: 130,
                    height: "83vh",
                    position: "absolute",
                    right: 0,
                    zIndex: 999,
                    textAlign: "left"
                }}
            />
            <div style={{ width: "100%", height: "83vh" }}>
                <Map center={[116.397428, 39.90923]} zoom={13}>
                    {({ AMap, map, container } :any) => {
                        if (map && AMap) {
                            AMap.plugin(["AMap.Driving"], () => {
                                //构造路线导航类
                                var driving = new AMap.Driving({
                                    map: map,
                                    panel: "panel"
                                });

                                // 根据起终点经纬度规划驾车导航路线
                                driving.search(
                                    new AMap.LngLat(116.379028, 39.865042),
                                    new AMap.LngLat(116.427281, 39.903719),
                                    {
                                        waypoints: [new AMap.LngLat(116.379028, 39.885042)]
                                    },
                                    (status :any, result: any) => {
                                        // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
                                        if (status === "complete") {
                                            // log.success('绘制驾车路线完成')
                                        } else {
                                            // log.error('获取驾车数据失败：' + result)
                                        }
                                    }
                                );
                            });
                        }
                    }}
                </Map>
            </div>
*/

