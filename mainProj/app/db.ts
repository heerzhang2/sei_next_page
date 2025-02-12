// import { drizzle } from "drizzle-orm/vercel-postgres";
// import { sql } from "@vercel/postgres";
// import { eq } from 'drizzle-orm';
// import { users } from "../db/schema";
// import * as schema from "../db/schema";
import { genSaltSync, hashSync } from "bcrypt-ts";


// export const db = drizzle(sql, { schema });

/* Drizzle ORM 对接》CRDB;
* */
export async function getUser(email: string) {
    let result;
    const salt = genSaltSync(10);
    const hashPassowrd = hashSync('ss2Add', salt);
    try {
        result=[{email:'sdREf',password: hashPassowrd}]; //await db.select().from(users).where(eq(users.email, email));
    } catch (error: any) {
        console.log("getUser用户:", error);
    }
    if(['herzhang@163.com',''].includes(email)) {
        return [{email,password: hashPassowrd}];
    }
    else if(['testHez@163.com',''].includes(email)) {
        return [{email,password: hashPassowrd}];
    }
	return  null;
}
/*Mock:
* */
export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return {email:'sd3f',};//await db.insert(users).values({ email: email, password: hash });
}