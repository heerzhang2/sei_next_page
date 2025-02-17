/**
 * @generated SignedSource<<a9f2b15efd898ed718e2d0885d016f61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type Ifop_Enu = "ADD" | "DEL" | "UPD" | "%future added value";
export type FeeItemInput = {
  amount?: string | null | undefined;
  code?: string | null | undefined;
  fm?: number | null | undefined;
  id?: string | null | undefined;
  memo?: string | null | undefined;
  mnum?: string | null | undefined;
};
export type useCudChargingFeeMutation$variables = {
  busTaskId: string;
  inp: FeeItemInput;
  opt: Ifop_Enu;
};
export type useCudChargingFeeMutation$data = {
  readonly cudChargingFee: {
    readonly fee: {
      readonly amount: string | null | undefined;
      readonly code: string | null | undefined;
      readonly fm: number | null | undefined;
      readonly id: string;
      readonly manual: boolean | null | undefined;
      readonly memo: string | null | undefined;
      readonly mnum: string | null | undefined;
    } | null | undefined;
    readonly warn: string | null | undefined;
  };
};
export type useCudChargingFeeMutation = {
  response: useCudChargingFeeMutation$data;
  variables: useCudChargingFeeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "busTaskId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inp"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "opt"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "busTaskId",
        "variableName": "busTaskId"
      },
      {
        "kind": "Variable",
        "name": "inp",
        "variableName": "inp"
      },
      {
        "kind": "Variable",
        "name": "opt",
        "variableName": "opt"
      }
    ],
    "concreteType": "CudFeeItemResp",
    "kind": "LinkedField",
    "name": "cudChargingFee",
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
        "concreteType": "Charging",
        "kind": "LinkedField",
        "name": "fee",
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
            "name": "code",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "manual",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "amount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "fm",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "mnum",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "memo",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCudChargingFeeMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useCudChargingFeeMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "1d0d5cac269bfb77094b764d18471930",
    "id": null,
    "metadata": {},
    "name": "useCudChargingFeeMutation",
    "operationKind": "mutation",
    "text": "mutation useCudChargingFeeMutation(\n  $busTaskId: ID!\n  $opt: Ifop_Enu!\n  $inp: FeeItemInput!\n) {\n  cudChargingFee(busTaskId: $busTaskId, opt: $opt, inp: $inp) {\n    warn\n    fee {\n      id\n      code\n      manual\n      amount\n      fm\n      mnum\n      memo\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e5b00a12544a2dcbd30a3e3ec884897b";

export default node;
