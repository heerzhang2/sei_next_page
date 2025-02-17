/** @jsxImportSource @emotion/react */
import { jsx } from "@emotion/react";
import * as React from "react";
import {
    useTheme,
    Layer,
    Text,
    Button,
    Link as StyledLink,
    LayerLoading,
    Alert, Spinner,
    Container, Input, InputGroup, IconArrowRight
} from "customize-easy-ui-component";
//import { useSession, useLoginToServer, useRegisterToServer } from "./auth";
//query-string是其他的基础库所依赖的，不是直接引入的。
import queryString from "query-string";
import {useContext} from "react";
import {UserContext} from "../routing/UserContext";
import useLoginMutation from "./useLoginMutation";
import useRegisterMutation from "./useRegisterMutation";
import {AloneContainer} from "../comp/AloneContainer";
//密码hash 防止在服务后台泄密
var sha256 = require('hash.js/lib/hash/sha/256');
// var sha512 = require('hash.js/lib/hash/sha/512');   128个字符版本，对于口令来讲太长了点，还是改256输出是64个字符。Hex; BCryptPasswordEncoder只能支持最大72个字符！


interface LoginProps {
}
export const Login =(props: LoginProps)  => {
    const {user, setUser} =useContext(UserContext);
    //我的身份合法吗
    const [isMeUser, setIsMeUser] =React.useState(user!==null);
  const theme = useTheme();
  const qs = queryString.parse(window.location.search);
  const [isRegistering, setIsRegistering] = React.useState(
    typeof qs.register === "string"
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({ username: "", password: "",
         mobile:'', external:'旧平台'} as any);

    const {call:submitfunc, doing:isInFlight}= useLoginMutation();
    const {call:registerfunc, isInFlight:isload, result:regOK}= useRegisterMutation();
  //const { result:regOK, submit:registerfunc, error:errReg } = useRegisterToServer(form);
  //console.log("登录机密 开始userList=",regOK,"errReg=",errReg);

  //用<form> 来提交，这样required属性就能生效了，能够验证表单的内容。
  async function doLogin(e: React.FormEvent  | Event)
  {
      e.preventDefault();
      let encodePass=sha256().update(form.password).digest('hex');
      try {
        setError("");
        setLoading(true);
        await  submitfunc(form.username, encodePass);
        //实际await不会在这里阻塞等待的！
        //setIsMeUser(false);  加上这个导致点登陆不管后端应答与否，都会被立刻跳转URL='/'
      } catch (err: any) {
        setLoading(false);
        // @ts-ignore
          setError(err.message);
      }
  }

  /*加密算法修改后，只能重新注册?*/
  async function doRegister(e: React.FormEvent  | Event)
  {
    e.preventDefault();
    if(form?.password2!==form.password)  return setError("两次输入的设置密码不一致");
    let encodePass=sha256().update(form.password).digest('hex');
    try {
      setError("");
      setLoading(true);
      await  registerfunc(form.username, encodePass, form.mobile,
                        form.external, form.eName, form.ePassword);
      setError("恭喜您，账户申请单已提交，等待审核与自动开通，或可立刻联系维护人员去开");
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
        setError(err.message);
    }
  }
    console.log("路由进入 登录伪2页面= isInFlight外部=",isInFlight,"user=",user);
    //都可能无法刷新？ <Redirect  to={from.pathname} />;  setLocation (to: Path, replace?: boolean)
    // React.useEffect(() => {
    //     if(user && !isMeUser)
    //         window.location.href = "/";       //强制刷新页面。
    //     //登录失败的？
    // }, [user,isMeUser]);

  return (
    <React.Fragment>
      <AloneContainer>
          <Layer
            css={{
              boxShadow: "none",
              marginBottom: theme.spaces.md,
              background: "white",
              [theme.mediaQueries.md]: {
                marginTop: theme.spaces.xl,
                boxShadow: theme.shadows.xl
              }
            }}
          >
            <div
              css={{
                borderBottom: "1px solid",
                borderColor: theme.colors.border.muted,
                textAlign: "center",
                padding: theme.spaces.lg,
                paddingBottom: theme.spaces.sm
              }}
            >
              <Text variant="h4">
                {isRegistering ? "我要注册一个账户" : "使用前先登陆账户"}
              </Text>

              <div
                css={{
                  textAlign: "center",
                  paddingBottom: theme.spaces.sm
                }}
              >
                {isRegistering ? (
                  <Text css={{ fontSize: theme.fontSizes[0] }}>
                    已经有账户?{" "}
                    <StyledLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setIsRegistering(false);
                      }}
                    >
                      登录.
                    </StyledLink>
                  </Text>
                ) : (
                  <Text css={{ fontSize: theme.fontSizes[0] }}>
                    若没有账户?{" "}先要
                    <StyledLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setIsRegistering(true);
                      }}
                    >
                      <Button size="xs" noBind intent="primary" iconAfter={<IconArrowRight/>}
                      >申请注册
                      </Button>
                    </StyledLink>

                  </Text>
                )}
              </div>
            </div>

            <div
              css={{
                padding: theme.spaces.lg
              }}
            >
            <form  method="post"
                   onSubmit={e =>{isRegistering ? doRegister(e) : doLogin(e) } }>
             <div   css={{  marginTop: theme.spaces.md   }}>
                {isRegistering ? (
                 <React.Fragment>
                  <Text css={{ fontSize: theme.fontSizes[0] }}>
                    首先提供旧平台的认证信息，认证通过才能申请成功。
                  </Text>
                   <InputGroup label="旧平台的账号ID">
                     <Input value={form?.eName||''} required
                         onChange={e =>setForm({ ...form, eName: e.currentTarget.value }) }
                     />
                   </InputGroup>
                   <InputGroup label="旧平台密码">
                     <Input value={form?.ePassword||''} type="password" required
                            onChange={e =>setForm({ ...form, ePassword: e.currentTarget.value }) }
                     />
                   </InputGroup>
                   <InputGroup label="留个电话吧">
                     <Input value={form?.mobile||''} required
                            onChange={e =>setForm({ ...form, mobile: e.currentTarget.value }) }
                     />
                   </InputGroup>
                 </React.Fragment>
                ) : (
                  <Text muted css={{ textAlign: "center" }} variant="subtitle">
                    请使用您的用户名密码登录:
                  </Text>
                )}
                 <InputGroup  label={isRegistering ?'申请本平台账户名字':"账户"}>
                    <Input  required
                      onChange={e => {
                        setForm({ ...form, username: e.currentTarget.value });
                      }}
                      value={form.username}
                      inputSize="md"
                      type="text"
                      //浏览器HTML5验证格式是否正确input type="email" required multiple/>
                      placeholder="账户"
                    />
                  </InputGroup>
                  <InputGroup hideLabel={!isRegistering} label={isRegistering ?'设置登录密码(强度不合格会报错)':"密sdfsd码"}>
                    <Input  required
                      onChange={e => {
                        setForm({ ...form, password: e.currentTarget.value });
                      }}
                      value={ form.password }
                      inputSize="md"
                      type="password"
                      //type={ form.password? "password":"text"}强制要求输入密码，不采用浏览器填充记住的密码。
                      placeholder="密码最少6位的复杂的 asdasdasda"
                      autoComplete="off"
                    />
                  </InputGroup>

                {isRegistering ? (
                  <React.Fragment>
                    <InputGroup label="第二次输入密码">
                      <Input required
                             value={form?.password2||''} type="password" placeholder="两次密码要相同"
                             onChange={e =>setForm({ ...form, password2: e.currentTarget.value }) }
                      />
                    </InputGroup>
                  </React.Fragment>
                ) :  null }

               {error && (
                 <Alert
                   css={{ marginTop: theme.spaces.md }}
                   intent={regOK ? 'success':"error"}
                   title={regOK ? '恭喜成功':"报ww错"}
                   subtitle={error}
                 />
               )}
                <div css={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    disabled={!form.username || !form.password || isInFlight || isload}
                    block
                    component="button"
                    css={{
                      textAlign: "center",
                      width: "100%",
                      marginTop: theme.spaces.md
                    }}
                    type="submit"
                    size="md"
                    intent="primary"
                    //onPress={e =>{isRegistering ? doRegister(e) : doLogin(e) } }
                  >
                    {isRegistering ? "注册申请" : "登录"}
                  </Button>

                </div>
              </div>
            </form>
            </div>

        {/*
            会导致页面扩展，宽度高度方向都会超出预期。去掉旧的是登录未应答会直接替换URL='/'超前并未获取后端应答的登录成功否，提前跳转页面。
              <LayerLoading loading={isInFlight || isload} />
           另外<Button   loading={isInFlight || isload}只显示出转圈圈，#能点击!
        */}

          </Layer>
      </AloneContainer>
          <Spinner doing={isInFlight || isload}/>
    </React.Fragment>
  );
};

//用于动态加载，缺省的 [小心错误]function (for composite components) but got: object. Check the render
export default Login;


/*我这<form实际没啥搞头，不能发挥其原来功能了，所以完全可以不用它。实际就剩下点击触发onPress={}完全可替代掉，reset功能也无法利用上的。
  <form  method="post"
           onSubmit={e =>{
               e.preventDefault();
               loadQuery({id: repNo, iwhere: {no: repNo}}) } }>
       <Button type="submit">搜索看</Button>
  总之：<form 完全可抛弃！
屏蔽密码的自动填充功能。
    <Input
      　setForm({ ...form, password: e.currentTarget.value });　这里后面的新属性替换顺序在前面的同名字属性。
    type={ form.password? "password":"text"}
    />
*/
//若用<RouterLink to="/login?register=true">只是在URL?号后面修改的去路由，就不会有任何动作的，因为本身已经是/login这个页面，这样问号后面不作数了。
//使用e.target时要小心，而用e.currentTarget就可放心;  https://blog.csdn.net/syleapn/article/details/81289337
