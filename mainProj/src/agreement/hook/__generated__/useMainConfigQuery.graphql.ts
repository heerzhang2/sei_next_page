/**
 * @generated SignedSource<<140432807cbefec3a5fde004dbb0101b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type UseState_Enum = "DELETE" | "DEMOLISH" | "DISCARD" | "MOVEOUT" | "NOTINUSE" | "REMOVESUPV" | "STOP" | "USE" | "USENOTREG" | "%future added value";
export type useMainConfigQuery$variables = {
  ptId: string;
};
export type useMainConfigQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly ad?: {
      readonly city: {
        readonly id: string;
      } | null | undefined;
      readonly country: {
        readonly id: string;
      } | null | undefined;
      readonly county: {
        readonly id: string;
      } | null | undefined;
      readonly id: string;
      readonly name: string;
      readonly prefix: string | null | undefined;
      readonly province: {
        readonly id: string;
      } | null | undefined;
      readonly town: {
        readonly id: string;
      } | null | undefined;
    } | null | undefined;
    readonly auditor?: {
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly username: string;
    } | null | undefined;
    readonly aux?: string | null | undefined;
    readonly bsType?: BusinessCat_Enum | null | undefined;
    readonly charge?: string | null | undefined;
    readonly complDate?: string | null | undefined;
    readonly crman?: {
      readonly id: string;
      readonly username: string;
    } | null | undefined;
    readonly devs?: ReadonlyArray<{
      readonly ad: {
        readonly id: string;
        readonly name: string;
        readonly prefix: string | null | undefined;
      } | null | undefined;
      readonly address: string | null | undefined;
      readonly cert: string | null | undefined;
      readonly cod: string | null | undefined;
      readonly fno: string | null | undefined;
      readonly id: string;
      readonly ispu: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
      readonly ispud: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly lpho: string | null | undefined;
      readonly nxtd1: string | null | undefined;
      readonly nxtd2: string | null | undefined;
      readonly oid: string | null | undefined;
      readonly plat: string | null | undefined;
      readonly plno: string | null | undefined;
      readonly titl: string | null | undefined;
      readonly used: string | null | undefined;
      readonly useu: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
      readonly ust: UseState_Enum;
      readonly vart: string;
      readonly vlg: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly dispatcher?: {
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly username: string;
    } | null | undefined;
    readonly entrust?: boolean | null | undefined;
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
    readonly transferor?: string | null | undefined;
  } | null | undefined;
};
export type useMainConfigQuery = {
  response: useMainConfigQuery$data;
  variables: useMainConfigQuery$variables;
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
  (v2/*: any*/),
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "ispu",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "servu",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v11 = [
  (v2/*: any*/),
  (v10/*: any*/)
],
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "Person",
  "kind": "LinkedField",
  "name": "person",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v13 = [
  (v2/*: any*/),
  (v10/*: any*/),
  (v12/*: any*/)
],
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entrust",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bsType",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "prefix",
  "storageKey": null
},
v17 = [
  (v2/*: any*/)
],
v18 = {
  "alias": null,
  "args": null,
  "concreteType": "Adminunit",
  "kind": "LinkedField",
  "name": "ad",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v16/*: any*/),
    (v6/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Country",
      "kind": "LinkedField",
      "name": "country",
      "plural": false,
      "selections": (v17/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Province",
      "kind": "LinkedField",
      "name": "province",
      "plural": false,
      "selections": (v17/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "City",
      "kind": "LinkedField",
      "name": "city",
      "plural": false,
      "selections": (v17/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "County",
      "kind": "LinkedField",
      "name": "county",
      "plural": false,
      "selections": (v17/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Town",
      "kind": "LinkedField",
      "name": "town",
      "plural": false,
      "selections": (v17/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "transferor",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "complDate",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "charge",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "mdtime",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "aux",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pttype",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cod",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "plno",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "useu",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "address",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "concreteType": "Village",
  "kind": "LinkedField",
  "name": "vlg",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "concreteType": "Adminunit",
  "kind": "LinkedField",
  "name": "ad",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v16/*: any*/),
    (v6/*: any*/)
  ],
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lpho",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "fno",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "titl",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "plat",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ust",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "vart",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cert",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "used",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nxtd1",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nxtd2",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "concreteType": "Division",
  "kind": "LinkedField",
  "name": "ispud",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v43 = [
  (v3/*: any*/),
  (v2/*: any*/),
  (v10/*: any*/)
],
v44 = [
  (v3/*: any*/),
  (v2/*: any*/),
  (v10/*: any*/),
  (v12/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useMainConfigQuery",
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
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "crman",
                "plural": false,
                "selections": (v11/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "promoter",
                "plural": false,
                "selections": (v11/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "auditor",
                "plural": false,
                "selections": (v13/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "dispatcher",
                "plural": false,
                "selections": (v13/*: any*/),
                "storageKey": null
              },
              (v14/*: any*/),
              (v15/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
              (v23/*: any*/),
              (v24/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "devs",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  (v25/*: any*/),
                  (v26/*: any*/),
                  (v27/*: any*/),
                  (v28/*: any*/),
                  (v29/*: any*/),
                  (v30/*: any*/),
                  (v31/*: any*/),
                  (v32/*: any*/),
                  (v33/*: any*/),
                  (v34/*: any*/),
                  (v35/*: any*/),
                  (v36/*: any*/),
                  (v37/*: any*/),
                  (v38/*: any*/),
                  (v39/*: any*/),
                  (v40/*: any*/),
                  (v41/*: any*/),
                  (v8/*: any*/),
                  (v42/*: any*/)
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
    "name": "useMainConfigQuery",
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
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "crman",
                "plural": false,
                "selections": (v43/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "promoter",
                "plural": false,
                "selections": (v43/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "auditor",
                "plural": false,
                "selections": (v44/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "dispatcher",
                "plural": false,
                "selections": (v44/*: any*/),
                "storageKey": null
              },
              (v14/*: any*/),
              (v15/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              (v20/*: any*/),
              (v21/*: any*/),
              (v22/*: any*/),
              (v23/*: any*/),
              (v24/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "devs",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v2/*: any*/),
                  (v25/*: any*/),
                  (v26/*: any*/),
                  (v27/*: any*/),
                  (v28/*: any*/),
                  (v29/*: any*/),
                  (v30/*: any*/),
                  (v31/*: any*/),
                  (v32/*: any*/),
                  (v33/*: any*/),
                  (v34/*: any*/),
                  (v35/*: any*/),
                  (v36/*: any*/),
                  (v37/*: any*/),
                  (v38/*: any*/),
                  (v39/*: any*/),
                  (v40/*: any*/),
                  (v41/*: any*/),
                  (v8/*: any*/),
                  (v42/*: any*/)
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
    "cacheID": "14e476068d97a6d5af1235b2f518b70f",
    "id": null,
    "metadata": {},
    "name": "useMainConfigQuery",
    "operationKind": "query",
    "text": "query useMainConfigQuery(\n  $ptId: ID!\n) {\n  node(id: $ptId) {\n    id\n    __typename\n    ... on Agreement {\n      id\n      status\n      ptno\n      ispu {\n        id\n        name\n      }\n      servu {\n        id\n        name\n      }\n      crman {\n        __typename\n        id\n        username\n      }\n      promoter {\n        __typename\n        id\n        username\n      }\n      auditor {\n        __typename\n        id\n        username\n        person {\n          id\n          name\n        }\n      }\n      dispatcher {\n        __typename\n        id\n        username\n        person {\n          id\n          name\n        }\n      }\n      entrust\n      bsType\n      ad {\n        id\n        prefix\n        name\n        country {\n          id\n        }\n        province {\n          id\n        }\n        city {\n          id\n        }\n        county {\n          id\n        }\n        town {\n          id\n        }\n      }\n      transferor\n      complDate\n      charge\n      mdtime\n      aux\n      pttype\n      devs {\n        __typename\n        id\n        cod\n        oid\n        plno\n        useu {\n          id\n          name\n        }\n        address\n        vlg {\n          id\n          name\n        }\n        ad {\n          id\n          prefix\n          name\n        }\n        lpho\n        fno\n        titl\n        plat\n        ust\n        vart\n        cert\n        used\n        nxtd1\n        nxtd2\n        ispu {\n          id\n          name\n        }\n        ispud {\n          id\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "121d585919b1e9f0fabb32eeb8332b2c";

export default node;
