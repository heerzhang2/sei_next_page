/**
 * @generated SignedSource<<830ec26b56ee0c424dd1e834153c2a06>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TaskFeeSummQuery$variables = {
  taskId: string;
};
export type TaskFeeSummQuery$data = {
  readonly node: {
    readonly charge?: string | null | undefined;
    readonly disfee?: string | null | undefined;
    readonly dreason?: string | null | undefined;
    readonly feeOk?: boolean | null | undefined;
    readonly id?: string;
  } | null | undefined;
};
export type TaskFeeSummQuery = {
  response: TaskFeeSummQuery$data;
  variables: TaskFeeSummQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "taskId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "taskId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "feeOk",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dreason",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "disfee",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "charge",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TaskFeeSummQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/)
            ],
            "type": "Task",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TaskFeeSummQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/)
            ],
            "type": "Task",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "343f506a4cd29f85541ad9a6f41c8b82",
    "id": null,
    "metadata": {},
    "name": "TaskFeeSummQuery",
    "operationKind": "query",
    "text": "query TaskFeeSummQuery(\n  $taskId: ID!\n) {\n  node(id: $taskId) {\n    __typename\n    ... on Task {\n      id\n      feeOk\n      dreason\n      disfee\n      charge\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0b9fe8f313bf2676136c9f11e839ecb7";

export default node;
