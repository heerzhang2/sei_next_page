/**
 * @generated SignedSource<<4cbfe939efff2e5f322d45c3764e156a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeeEntranceQuery$variables = {
  detId: string;
};
export type FeeEntranceQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly bus?: {
      readonly feeOk: boolean | null | undefined;
      readonly fees: ReadonlyArray<{
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"FeesListItem">;
      } | null | undefined> | null | undefined;
      readonly id: string;
      readonly ident: string | null | undefined;
      readonly isp: {
        readonly dev: {
          readonly cod: string | null | undefined;
          readonly id: string;
        } | null | undefined;
        readonly id: string;
      } | null | undefined;
      readonly sprice: string | null | undefined;
      readonly task: {
        readonly id: string;
        readonly servu: {
          readonly id: string;
          readonly name: string | null | undefined;
        } | null | undefined;
      } | null | undefined;
      readonly type: string | null | undefined;
    } | null | undefined;
    readonly feeOk?: boolean | null | undefined;
    readonly fees?: ReadonlyArray<{
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"FeesListItem">;
    } | null | undefined> | null | undefined;
    readonly id: string;
    readonly ident?: string | null | undefined;
    readonly isp?: {
      readonly dev: {
        readonly cod: string | null | undefined;
        readonly id: string;
      } | null | undefined;
      readonly id: string;
    } | null | undefined;
    readonly sprice?: string | null | undefined;
    readonly task?: {
      readonly id: string;
      readonly servu: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined;
    readonly type?: string | null | undefined;
  } | null | undefined;
};
export type FeeEntranceQuery = {
  response: FeeEntranceQuery$data;
  variables: FeeEntranceQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "detId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "detId"
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
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ident",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "feeOk",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sprice",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "Charging",
  "kind": "LinkedField",
  "name": "fees",
  "plural": true,
  "selections": [
    (v2/*: any*/),
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "FeesListItem"
    }
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "Isp",
  "kind": "LinkedField",
  "name": "isp",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Eqp",
      "kind": "LinkedField",
      "name": "dev",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "cod",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "Task",
  "kind": "LinkedField",
  "name": "task",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Unit",
      "kind": "LinkedField",
      "name": "servu",
      "plural": false,
      "selections": [
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "code",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "Charging",
  "kind": "LinkedField",
  "name": "fees",
  "plural": true,
  "selections": [
    (v2/*: any*/),
    (v11/*: any*/),
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
        (v2/*: any*/),
        (v11/*: any*/),
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
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Task",
          "kind": "LinkedField",
          "name": "task",
          "plural": false,
          "selections": [
            (v2/*: any*/)
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FeeEntranceQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/)
            ],
            "type": "Detail",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Detail",
                "kind": "LinkedField",
                "name": "bus",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Isp",
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
    "name": "FeeEntranceQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v12/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/)
            ],
            "type": "Detail",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Detail",
                "kind": "LinkedField",
                "name": "bus",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v12/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "Isp",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "230d50edebbb68bc7a88de4f55fe69a2",
    "id": null,
    "metadata": {},
    "name": "FeeEntranceQuery",
    "operationKind": "query",
    "text": "query FeeEntranceQuery(\n  $detId: ID!\n) {\n  node(id: $detId) {\n    id\n    __typename\n    ... on Detail {\n      id\n      ident\n      type\n      feeOk\n      sprice\n      fees {\n        id\n        ...FeesListItem\n      }\n      isp {\n        id\n        dev {\n          id\n          cod\n        }\n      }\n      task {\n        id\n        servu {\n          id\n          name\n        }\n      }\n    }\n    ... on Isp {\n      id\n      bus {\n        id\n        ident\n        type\n        feeOk\n        sprice\n        fees {\n          id\n          ...FeesListItem\n        }\n        isp {\n          id\n          dev {\n            id\n            cod\n          }\n        }\n        task {\n          id\n          servu {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}\n\nfragment FeesListItem on Charging {\n  id\n  code\n  manual\n  amount\n  fm\n  mnum\n  pipus {\n    id\n    code\n    rno\n    leng\n  }\n  detail {\n    id\n    task {\n      id\n    }\n  }\n  memo\n}\n"
  }
};
})();

(node as any).hash = "f2bbd138136f122169bb4e907aa839c3";

export default node;
