/**
 * @generated SignedSource<<e733ebd49b8ca513955fc993cc17e629>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type Opinion_Enum = "ABST" | "BACK" | "NO" | "YES" | "%future added value";
export type useApplicationFlowToMutation$variables = {
  allow?: Opinion_Enum | null | undefined;
  calcfee?: boolean | null | undefined;
  days?: number | null | undefined;
  entId: string;
  memo?: string | null | undefined;
  men?: string | null | undefined;
  uri?: string | null | undefined;
  userTaskId: string;
};
export type useApplicationFlowToMutation$data = {
  readonly applicationFlowTo: string | null | undefined;
};
export type useApplicationFlowToMutation = {
  response: useApplicationFlowToMutation$data;
  variables: useApplicationFlowToMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": "YES",
  "kind": "LocalArgument",
  "name": "allow"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "calcfee"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "days"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "entId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memo"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "men"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "uri"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userTaskId"
},
v8 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "allow",
        "variableName": "allow"
      },
      {
        "kind": "Variable",
        "name": "calcfee",
        "variableName": "calcfee"
      },
      {
        "kind": "Variable",
        "name": "days",
        "variableName": "days"
      },
      {
        "kind": "Variable",
        "name": "entId",
        "variableName": "entId"
      },
      {
        "kind": "Variable",
        "name": "memo",
        "variableName": "memo"
      },
      {
        "kind": "Variable",
        "name": "men",
        "variableName": "men"
      },
      {
        "kind": "Variable",
        "name": "uri",
        "variableName": "uri"
      },
      {
        "kind": "Variable",
        "name": "userTaskId",
        "variableName": "userTaskId"
      }
    ],
    "kind": "ScalarField",
    "name": "applicationFlowTo",
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
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useApplicationFlowToMutation",
    "selections": (v8/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v7/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v2/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useApplicationFlowToMutation",
    "selections": (v8/*: any*/)
  },
  "params": {
    "cacheID": "01ca47be11b53a4c322c72c1f766c6ee",
    "id": null,
    "metadata": {},
    "name": "useApplicationFlowToMutation",
    "operationKind": "mutation",
    "text": "mutation useApplicationFlowToMutation(\n  $userTaskId: String!\n  $entId: ID!\n  $allow: Opinion_Enum = YES\n  $memo: String\n  $days: Int\n  $men: ID\n  $uri: String\n  $calcfee: Boolean\n) {\n  applicationFlowTo(entId: $entId, userTaskId: $userTaskId, allow: $allow, memo: $memo, men: $men, days: $days, uri: $uri, calcfee: $calcfee)\n}\n"
  }
};
})();

(node as any).hash = "f75160625d93dca23dd1afff00712fb8";

export default node;
