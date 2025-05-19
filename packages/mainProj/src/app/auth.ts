import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from "next-auth/providers/google"
import { authConfig } from '@/app/auth.config';
// import sha256 from 'hash.js/lib/hash/sha/256';
import {urqlClient} from "@/auth/urql";
import {gql} from "@urql/core";
import { createHash } from 'node:crypto';

export function sha256Sync(data: string): string {
    return createHash('sha256').update(data).digest('hex');
}

const LOGIN_MUTATION = gql`
    mutation Login($username: String!, $password: String!) {
        authenticate(username: $username, password: $password)
        { accessToken,refreshToken, user{id } }
    }
`;
class InvalidLoginError extends CredentialsSignin {
	code = 'Invalid identifier or password'
}

/*【文档】https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side
* */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
	Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
	  credentials: {
        email: {},
        password: {},
      },
      async authorize({ username, email, password }: any,request: Request) {
            try {
                // Hash the password
                // let encodedPass = sha256().update(password).digest('hex');
                const encodedPass = sha256Sync(password)
                // const encodedPass = await sha256(password)
                // Get current user session if needed for the client
                // Don't call auth() here - that would create a circular reference； const { user } = await auth() || {user:null};
                // Perform authentication request
                const result = await urqlClient(null).mutation(LOGIN_MUTATION, {
                    username: username,     // || email,
                    password: encodedPass,
                })
                // Check authentication result
                if (!result || !result.data?.authenticate) {
                    throw new InvalidLoginError()
                }
                const loginResp = result.data.authenticate
                // Return user data for successful authentication
                return {
                    id: loginResp.user.id,
                    name: username,     // || email,
                    accessToken: loginResp.accessToken,
                    refreshToken: loginResp.refreshToken,
                }
            } catch (error) {
                console.error("Authentication error:", error)
                return null
            }
      },
    }),
  ],
});
