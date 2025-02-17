/**
 * @generated SignedSource<<2232beabca8ee460f0fc0475994cfba5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useConfirmIspFeeMutation$variables = {
  id: string;
};
export type useConfirmIspFeeMutation$data = {
  readonly confirmIspFee: {
    readonly bus: {
      readonly __typename: "Detail";
      readonly feeOk: boolean | null | undefined;
      readonly id: string;
    };
  };
};
export type useConfirmIspFeeMutation = {
  response: useConfirmIspFeeMutation$data;
  variables: useConfirmIspFeeMutation$variables;
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
    "concreteType": "CalcFeeResp",
    "kind": "LinkedField",
    "name": "confirmIspFee",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Detail",
        "kind": "LinkedField",
        "name": "bus",
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
            "name": "__typename",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "feeOk",
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
    "name": "useConfirmIspFeeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useConfirmIspFeeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f8e6315b0b0a2730650f6d07d4731030",
    "id": null,
    "metadata": {},
    "name": "useConfirmIspFeeMutation",
    "operationKind": "mutation",
    "text": "mutation useConfirmIspFeeMutation(\n  $id: ID!\n) {\n  confirmIspFee(id: $id) {\n    bus {\n      id\n      __typename\n      feeOk\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2ce76adc6be1cdf66ed388f4164e9441";

export default node;
