/**
 * @generated SignedSource<<601eed40573e23395865f59067e5ea46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type Procedure_Enum = "APPR" | "BEGIN" | "CANCEL" | "CHECK" | "END" | "MAKE" | "OFFER" | "SIGN" | "WAITREDO" | "%future added value";
export type IspEntranceQuery$variables = {
  id: string;
};
export type IspEntranceQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly id: string;
    readonly ident?: string | null | undefined;
    readonly isp?: {
      readonly bsType: BusinessCat_Enum | null | undefined;
      readonly dev: {
        readonly cod: string | null | undefined;
        readonly id: string;
      } | null | undefined;
      readonly entrust: boolean | null | undefined;
      readonly id: string;
      readonly no: string | null | undefined;
      readonly report: {
        readonly id: string;
        readonly modeltype: string | null | undefined;
        readonly stm: {
          readonly id: string;
          readonly sta: Procedure_Enum;
        } | null | undefined;
      } | null | undefined;
      readonly reps: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly id: string;
            readonly modeltype: string | null | undefined;
            readonly stm: {
              readonly id: string;
              readonly sta: Procedure_Enum;
            } | null | undefined;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      } | null | undefined;
    } | null | undefined;
    readonly task?: {
      readonly date: string | null | undefined;
      readonly dep: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly id: string;
      readonly office: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly status: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type IspEntranceQuery = {
  response: IspEntranceQuery$data;
  variables: IspEntranceQuery$variables;
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
  "name": "no",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bsType",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entrust",
  "storageKey": null
},
v8 = {
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
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "modeltype",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "ApprovalStm",
  "kind": "LinkedField",
  "name": "stm",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "sta",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v11 = [
  (v2/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/)
],
v12 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v13 = {
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
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "date",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Division",
      "kind": "LinkedField",
      "name": "dep",
      "plural": false,
      "selections": (v12/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Office",
      "kind": "LinkedField",
      "name": "office",
      "plural": false,
      "selections": (v12/*: any*/),
      "storageKey": null
    }
  ],
  "storageKey": null
},
v14 = [
  (v3/*: any*/),
  (v2/*: any*/),
  (v9/*: any*/),
  (v10/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IspEntranceQuery",
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
              {
                "alias": null,
                "args": null,
                "concreteType": "Isp",
                "kind": "LinkedField",
                "name": "isp",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "report",
                    "plural": false,
                    "selections": (v11/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SimpleReportConnection",
                    "kind": "LinkedField",
                    "name": "reps",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SimpleReportConnectionEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": (v11/*: any*/),
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
              },
              (v13/*: any*/)
            ],
            "type": "Detail",
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
    "name": "IspEntranceQuery",
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
              {
                "alias": null,
                "args": null,
                "concreteType": "Isp",
                "kind": "LinkedField",
                "name": "isp",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "report",
                    "plural": false,
                    "selections": (v14/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SimpleReportConnection",
                    "kind": "LinkedField",
                    "name": "reps",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SimpleReportConnectionEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": (v14/*: any*/),
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
              },
              (v13/*: any*/)
            ],
            "type": "Detail",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3fbcef1be57421e350bfb0b38ac3ae6f",
    "id": null,
    "metadata": {},
    "name": "IspEntranceQuery",
    "operationKind": "query",
    "text": "query IspEntranceQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on Detail {\n      id\n      ident\n      isp {\n        id\n        no\n        bsType\n        entrust\n        dev {\n          id\n          cod\n        }\n        report {\n          __typename\n          id\n          modeltype\n          stm {\n            id\n            sta\n          }\n        }\n        reps {\n          edges {\n            node {\n              __typename\n              id\n              modeltype\n              stm {\n                id\n                sta\n              }\n            }\n          }\n        }\n      }\n      task {\n        id\n        status\n        date\n        dep {\n          id\n          name\n        }\n        office {\n          id\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e4300c86472fee1c01d13634c211dfb1";

export default node;
