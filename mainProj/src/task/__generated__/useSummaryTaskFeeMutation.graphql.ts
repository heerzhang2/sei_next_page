/**
 * @generated SignedSource<<3590674c3bf0109de753d4a9e8121ae1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useSummaryTaskFeeMutation$variables = {
  id: string;
};
export type useSummaryTaskFeeMutation$data = {
  readonly summaryTaskFee: {
    readonly task: {
      readonly charge: string | null | undefined;
      readonly disfee: string | null | undefined;
      readonly dreason: string | null | undefined;
      readonly feeOk: boolean | null | undefined;
      readonly id: string;
    } | null | undefined;
    readonly warn: string | null | undefined;
  };
};
export type useSummaryTaskFeeMutation = {
  response: useSummaryTaskFeeMutation$data;
  variables: useSummaryTaskFeeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "TaskComResp",
    "kind": "LinkedField",
    "name": "summaryTaskFee",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "warn",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Task",
        "kind": "LinkedField",
        "name": "task",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "feeOk",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dreason",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "disfee",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "charge",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useSummaryTaskFeeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useSummaryTaskFeeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f839ed656f256e8c247a9d8c03ae0587",
    "id": null,
    "metadata": {},
    "name": "useSummaryTaskFeeMutation",
    "operationKind": "mutation",
    "text": "mutation useSummaryTaskFeeMutation(\n  $id: ID!\n) {\n  summaryTaskFee(id: $id) {\n    warn\n    task {\n      id\n      feeOk\n      dreason\n      disfee\n      charge\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "947b9ea1542c3386c6ce02cf6497d8c7";

export default node;
