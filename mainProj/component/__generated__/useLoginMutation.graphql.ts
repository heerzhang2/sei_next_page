/**
 * @generated SignedSource<<fb9ae1c9ff3c8c2151ccdc643df022cf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useLoginMutation$variables = {
  password: string;
  username: string;
};
export type useLoginMutation$data = {
  readonly authenticate: boolean;
};
export type useLoginMutation = {
  response: useLoginMutation$data;
  variables: useLoginMutation$variables;
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
    "name": "useLoginMutation",
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
    "name": "useLoginMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "c485b5b691660769ee90adde4a73b769",
    "id": null,
    "metadata": {},
    "name": "useLoginMutation",
    "operationKind": "mutation",
    "text": "mutation useLoginMutation(\n  $username: String!\n  $password: String!\n) {\n  authenticate(username: $username, password: $password)\n}\n"
  }
};
})();

(node as any).hash = "3b10d1e800307e6aeb4a5bf4cebaa791";

export default node;
