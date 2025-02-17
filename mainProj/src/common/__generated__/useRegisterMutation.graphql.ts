/**
 * @generated SignedSource<<4b728e78d47a5da3eac365c1c1aa0f31>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useRegisterMutation$variables = {
  eName?: string | null | undefined;
  ePassword?: string | null | undefined;
  external?: string | null | undefined;
  mobile: string;
  password: string;
  username: string;
};
export type useRegisterMutation$data = {
  readonly newUser: boolean;
};
export type useRegisterMutation = {
  response: useRegisterMutation$data;
  variables: useRegisterMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "eName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ePassword"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "external"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mobile"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "password"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "username"
},
v6 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "eName",
        "variableName": "eName"
      },
      {
        "kind": "Variable",
        "name": "ePassword",
        "variableName": "ePassword"
      },
      {
        "kind": "Variable",
        "name": "external",
        "variableName": "external"
      },
      {
        "kind": "Variable",
        "name": "mobile",
        "variableName": "mobile"
      },
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
    "kind": "ScalarField",
    "name": "newUser",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useRegisterMutation",
    "selections": (v6/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v5/*: any*/),
      (v4/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useRegisterMutation",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "2ba59da66ded342ca4a929b4eeb1e8aa",
    "id": null,
    "metadata": {},
    "name": "useRegisterMutation",
    "operationKind": "mutation",
    "text": "mutation useRegisterMutation(\n  $username: String!\n  $password: String!\n  $mobile: String!\n  $external: String\n  $eName: String\n  $ePassword: String\n) {\n  newUser(username: $username, password: $password, mobile: $mobile, external: $external, eName: $eName, ePassword: $ePassword)\n}\n"
  }
};
})();

(node as any).hash = "80caeeb1bab3dd813ea5584cc76f4c41";

export default node;
