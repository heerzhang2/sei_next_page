/**
 * @generated SignedSource<<4deff3fbc1f0da4711b81f52c904c3fb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useReckonIspFeeMutation$variables = {
  id: string;
};
export type useReckonIspFeeMutation$data = {
  readonly reckonIspFee: {
    readonly bus: {
      readonly __typename: "Detail";
      readonly feeOk: boolean | null | undefined;
      readonly fees: ReadonlyArray<{
        readonly amount: string | null | undefined;
        readonly code: string | null | undefined;
        readonly detail: {
          readonly id: string;
          readonly task: {
            readonly id: string;
          } | null | undefined;
        } | null | undefined;
        readonly fm: number | null | undefined;
        readonly id: string;
        readonly manual: boolean | null | undefined;
        readonly memo: string | null | undefined;
        readonly mnum: string | null | undefined;
        readonly pipus: ReadonlyArray<{
          readonly code: string;
          readonly id: string;
          readonly leng: number | null | undefined;
          readonly rno: string | null | undefined;
        }> | null | undefined;
      } | null | undefined> | null | undefined;
      readonly id: string;
    };
    readonly parms: ReadonlyArray<string> | null | undefined;
  };
};
export type useReckonIspFeeMutation = {
  response: useReckonIspFeeMutation$data;
  variables: useReckonIspFeeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v3 = [
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
    "name": "reckonIspFee",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "parms",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Detail",
        "kind": "LinkedField",
        "name": "bus",
        "plural": false,
        "selections": [
          (v1/*: any*/),
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
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Charging",
            "kind": "LinkedField",
            "name": "fees",
            "plural": true,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
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
                "concreteType": "PipingUnit",
                "kind": "LinkedField",
                "name": "pipus",
                "plural": true,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rno",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "leng",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Detail",
                "kind": "LinkedField",
                "name": "detail",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Task",
                    "kind": "LinkedField",
                    "name": "task",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useReckonIspFeeMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useReckonIspFeeMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "5bfc0f588f8ffcf67461aa0e6cd1d977",
    "id": null,
    "metadata": {},
    "name": "useReckonIspFeeMutation",
    "operationKind": "mutation",
    "text": "mutation useReckonIspFeeMutation(\n  $id: ID!\n) {\n  reckonIspFee(id: $id) {\n    parms\n    bus {\n      id\n      __typename\n      feeOk\n      fees {\n        id\n        code\n        manual\n        amount\n        fm\n        mnum\n        pipus {\n          id\n          code\n          rno\n          leng\n        }\n        detail {\n          id\n          task {\n            id\n          }\n        }\n        memo\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ca6f7061f1fddcde6f47f0d511fae660";

export default node;
