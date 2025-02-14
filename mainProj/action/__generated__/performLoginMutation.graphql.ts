/**
 * @generated SignedSource<<60b4b5628fd459f52f261e925b24617a>>
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
  readonly authenticate: boolean;
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
    "alias": null,
    "args": [
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
    "name": "authenticate",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "performLoginMutation",
    "selections": (v2/*: any*/),
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
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "757834ae437a23460648bf0e03226ff2",
    "id": null,
    "metadata": {},
    "name": "performLoginMutation",
    "operationKind": "mutation",
    "text": "mutation performLoginMutation(\n  $username: String!\n  $password: String!\n) {\n  authenticate(username: $username, password: $password)\n}\n"
  }
};
})();

(node as any).hash = "a229becfbfcdcd8c6a7b6fe412118fea";

export default node;
