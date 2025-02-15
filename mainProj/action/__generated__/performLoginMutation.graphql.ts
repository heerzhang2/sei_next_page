/**
 * @generated SignedSource<<fe72f9d7e8d1b9d29e94eada028a7bef>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type performLoginMutation$variables = {
  password: string;
  username: string;
};
export type performLoginMutation$data = {
  readonly authenticate: {
    readonly accessToken: string;
    readonly user: {
      readonly id: string;
      readonly username: string;
    };
  } | null | undefined;
};
export type performLoginMutation = {
  response: performLoginMutation$data;
  variables: performLoginMutation$variables;
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
    "name": "performLoginMutation",
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
    "name": "performLoginMutation",
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
    "cacheID": "d3073771ae9cfe7d62507398f28bfc3d",
    "id": null,
    "metadata": {},
    "name": "performLoginMutation",
    "operationKind": "mutation",
    "text": "mutation performLoginMutation(\n  $username: String!\n  $password: String!\n) {\n  authenticate(username: $username, password: $password) {\n    accessToken\n    user {\n      __typename\n      id\n      username\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cf3f8bbb481d95a88afe06c48c56c1f3";

export default node;
