// import { drizzle } from "drizzle-orm/vercel-postgres";
// import { sql } from "@vercel/postgres";
// import { eq } from 'drizzle-orm';
// import { users } from "../db/schema";
// import * as schema from "../db/schema";
import { genSaltSync, hashSync } from "bcrypt-ts";
import {performLoginMutation} from "@/action/performLoginMutation";
import {createStaticRelayEnvironment} from "@/relay/environment/staticServer";
import {commitMutation} from "relay-runtime";
import yourMutation from "@/action/__generated__/performLoginMutation.graphql";

//密码hash 防止在服务后台泄密
var sha256 = require('hash.js/lib/hash/sha/256');


// export const db = drizzle(sql, { schema });

/* Drizzle ORM 对接》CRDB;
* */
export async function userLoginPassed(username: string,password: string ) {
    let encodePass=sha256().update(password).digest('hex');
    let result;
    try {
        //await db.select().from(users).where(eq(users.email, email));
        result= await performLoginMutation({username, password: encodePass});
    } catch (error: any) {
        console.log("getUser报错:", error);
    }
    console.log("getUser后续继续:已死等的result=", result);
	return  result;
}
/*Mock:
* */
export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return {email:'sd3f',};//await db.insert(users).values({ email: email, password: hash });
}


