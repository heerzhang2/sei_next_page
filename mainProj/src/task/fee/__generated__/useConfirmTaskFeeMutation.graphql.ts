/**
 * @generated SignedSource<<a595520e47e67f5adbbfcc8334f00af2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FeeItemInput = {
  amount?: string | null | undefined;
  code?: string | null | undefined;
  fm?: number | null | undefined;
  id?: string | null | undefined;
  memo?: string | null | undefined;
  mnum?: string | null | undefined;
};
export type useConfirmTaskFeeMutation$variables = {
  id: string;
  inp: FeeItemInput;
};
export type useConfirmTaskFeeMutation$data = {
  readonly confirmTaskFee: {
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
export type useConfirmTaskFeeMutation = {
  response: useConfirmTaskFeeMutation$data;
  variables: useConfirmTaskFeeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "inp"
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
      },
      {
        "kind": "Variable",
        "name": "inp",
        "variableName": "inp"
      }
    ],
    "concreteType": "TaskComResp",
    "kind": "LinkedField",
    "name": "confirmTaskFee",
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
    "name": "useConfirmTaskFeeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useConfirmTaskFeeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "39c3df4409b51f53fbb3b4cc5f3b7ef7",
    "id": null,
    "metadata": {},
    "name": "useConfirmTaskFeeMutation",
    "operationKind": "mutation",
    "text": "mutation useConfirmTaskFeeMutation(\n  $id: ID!\n  $inp: FeeItemInput!\n) {\n  confirmTaskFee(id: $id, inp: $inp) {\n    warn\n    task {\n      id\n      feeOk\n      dreason\n      disfee\n      charge\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0e7b9774543ba5e28c94f1b98ea5a8cd";

export default node;
