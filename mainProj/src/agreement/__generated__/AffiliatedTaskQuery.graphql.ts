/**
 * @generated SignedSource<<a9192f83ba62629bd3230b50807b11cb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type AffiliatedTaskQuery$variables = {
  ptId: string;
};
export type AffiliatedTaskQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly aux?: string | null | undefined;
    readonly charge?: string | null | undefined;
    readonly complDate?: string | null | undefined;
    readonly crman?: {
      readonly id: string;
      readonly username: string;
    } | null | undefined;
    readonly id: string;
    readonly ispu?: {
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly mdtime?: string | null | undefined;
    readonly promoter?: {
      readonly id: string;
      readonly username: string;
    } | null | undefined;
    readonly ptno?: string | null | undefined;
    readonly pttype?: string | null | undefined;
    readonly servu?: {
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly status?: string | null | undefined;
    readonly tasks?: ReadonlyArray<{
      readonly bsType: BusinessCat_Enum | null | undefined;
      readonly charge: string | null | undefined;
      readonly date: string | null | undefined;
      readonly dep: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly entrust: boolean | null | undefined;
      readonly eqpcnt: number | null | undefined;
      readonly feeOk: boolean | null | undefined;
      readonly id: string;
      readonly liabler: {
        readonly id: string;
        readonly person: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
      } | null | undefined;
      readonly office: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly status: string | null | undefined;
      readonly type: string | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type AffiliatedTaskQuery = {
  response: AffiliatedTaskQuery$data;
  variables: AffiliatedTaskQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ptId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "ptId"
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
  "name": "status",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ptno",
  "storageKey": null
},
v6 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "ispu",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "servu",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v10 = [
  (v2/*: any*/),
  (v9/*: any*/)
],
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "complDate",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "charge",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mdtime",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "aux",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pttype",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "date",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bsType",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entrust",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "feeOk",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "eqpcnt",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "concreteType": "Division",
  "kind": "LinkedField",
  "name": "dep",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "concreteType": "Office",
  "kind": "LinkedField",
  "name": "office",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "concreteType": "Person",
  "kind": "LinkedField",
  "name": "person",
  "plural": false,
  "selections": (v6/*: any*/),
  "storageKey": null
},
v25 = [
  (v3/*: any*/),
  (v2/*: any*/),
  (v9/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AffiliatedTaskQuery",
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
              (v7/*: any*/),
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "crman",
                "plural": false,
                "selections": (v10/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "promoter",
                "plural": false,
                "selections": (v10/*: any*/),
                "storageKey": null
              },
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Task",
                "kind": "LinkedField",
                "name": "tasks",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  (v16/*: any*/),
                  (v4/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v12/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v21/*: any*/),
                  (v22/*: any*/),
                  (v23/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "liabler",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v24/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Agreement",
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
    "name": "AffiliatedTaskQuery",
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
              (v7/*: any*/),
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "crman",
                "plural": false,
                "selections": (v25/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "promoter",
                "plural": false,
                "selections": (v25/*: any*/),
                "storageKey": null
              },
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Task",
                "kind": "LinkedField",
                "name": "tasks",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  (v16/*: any*/),
                  (v4/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v12/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v21/*: any*/),
                  (v22/*: any*/),
                  (v23/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "liabler",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v2/*: any*/),
                      (v24/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Agreement",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7e43de94640f2f9109837ba4d4e01576",
    "id": null,
    "metadata": {},
    "name": "AffiliatedTaskQuery",
    "operationKind": "query",
    "text": "query AffiliatedTaskQuery(\n  $ptId: ID!\n) {\n  node(id: $ptId) {\n    id\n    __typename\n    ... on Agreement {\n      id\n      status\n      ptno\n      ispu {\n        id\n        name\n      }\n      servu {\n        id\n        name\n      }\n      crman {\n        __typename\n        id\n        username\n      }\n      promoter {\n        __typename\n        id\n        username\n      }\n      complDate\n      charge\n      mdtime\n      aux\n      pttype\n      tasks {\n        id\n        date\n        status\n        bsType\n        entrust\n        charge\n        feeOk\n        type\n        eqpcnt\n        dep {\n          id\n          name\n        }\n        office {\n          id\n          name\n        }\n        liabler {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0d55242fdec4966ecf280160219c3365";

export default node;
