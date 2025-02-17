/**
 * @generated SignedSource<<886eb6b613e113b11b37d9f3a879ca9c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useLogin3Mutation$variables = {
  password: string;
  username: string;
};
export type useLogin3Mutation$data = {
  readonly authenticate: {
    readonly accessToken: string;
    readonly user: {
      readonly id: string;
      readonly username: string;
    };
  } | null | undefined;
};
export type useLogin3Mutation = {
  response: useLogin3Mutation$data;
  variables: useLogin3Mutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "password"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "username"
},
v2 = [
  {
    "kind": "Variable",
    "name": "password",
    "variableName": "password"
  },
  {
    "kind": "Variable",
    "name": "username",
    "variableName": "username"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "accessToken",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useLogin3Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "LoginResp",
        "kind": "LinkedField",
        "name": "authenticate",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useLogin3Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "LoginResp",
        "kind": "LinkedField",
        "name": "authenticate",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "24ca9621b02db056fab2c1c7314eb224",
    "id": null,
    "metadata": {},
    "name": "useLogin3Mutation",
    "operationKind": "mutation",
    "text": "mutation useLogin3Mutation(\n  $username: String!\n  $password: String!\n) {\n  authenticate(username: $username, password: $password) {\n    accessToken\n    user {\n      __typename\n      id\n      username\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fc17627f2670db0041e3f4fb1b40b434";

export default node;
