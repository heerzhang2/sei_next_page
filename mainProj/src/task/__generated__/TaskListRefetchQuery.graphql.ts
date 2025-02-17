/**
 * @generated SignedSource<<4541f48777966f2816d1783e2129547b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type Procedure_Enum = "APPR" | "BEGIN" | "CANCEL" | "CHECK" | "END" | "MAKE" | "OFFER" | "SIGN" | "WAITREDO" | "%future added value";
export type TaskState_Enum = "CANCEL" | "DEPART" | "DISP" | "DONE" | "HANGUP" | "INIT" | "OFFICE" | "PERSON" | "%future added value";
export type TaskInput = {
  bsTypex?: ReadonlyArray<BusinessCat_Enum | null | undefined> | null | undefined;
  date1?: any | null | undefined;
  date2?: any | null | undefined;
  dep?: string | null | undefined;
  entrust?: boolean | null | undefined;
  liabler?: string | null | undefined;
  office?: string | null | undefined;
  servu?: string | null | undefined;
  statusx?: ReadonlyArray<TaskState_Enum | null | undefined> | null | undefined;
};
export type TaskDetailInput = {
  cert?: string | null | undefined;
  cod?: string | null | undefined;
  feeOk?: boolean | null | undefined;
  fno?: string | null | undefined;
  ident?: string | null | undefined;
  lpho?: string | null | undefined;
  oid?: string | null | undefined;
  plat?: string | null | undefined;
  plno?: string | null | undefined;
  sort?: string | null | undefined;
  stmsta?: Procedure_Enum | null | undefined;
  subv?: string | null | undefined;
  type?: string | null | undefined;
  used?: any | null | undefined;
  vart?: string | null | undefined;
};
export type TaskListRefetchQuery$variables = {
  after?: string | null | undefined;
  afterdl?: string | null | undefined;
  asc?: boolean | null | undefined;
  first?: number | null | undefined;
  orderBy?: string | null | undefined;
  orderBydl?: string | null | undefined;
  twhere?: TaskInput | null | undefined;
  wheredl?: TaskDetailInput | null | undefined;
};
export type TaskListRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"TaskList">;
};
export type TaskListRefetchQuery = {
  response: TaskListRefetchQuery$data;
  variables: TaskListRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "after"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "afterdl"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "asc"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderBy"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderBydl"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "twhere"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "wheredl"
  }
],
v1 = {
  "kind": "Variable",
  "name": "first",
  "variableName": "first"
},
v2 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "asc",
    "variableName": "asc"
  },
  (v1/*: any*/),
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  },
  {
    "kind": "Variable",
    "name": "where",
    "variableName": "twhere"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  (v3/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "afterdl"
  },
  (v1/*: any*/),
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBydl"
  },
  {
    "kind": "Variable",
    "name": "where",
    "variableName": "wheredl"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
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
    "name": "TaskListRefetchQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "TaskList"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TaskListRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "TaskConnection",
        "kind": "LinkedField",
        "name": "findAllTaskFilter",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TaskConnectionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Task",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Division",
                    "kind": "LinkedField",
                    "name": "dep",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Office",
                    "kind": "LinkedField",
                    "name": "office",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "date",
                    "storageKey": null
                  },
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "bsType",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "entrust",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Unit",
                    "kind": "LinkedField",
                    "name": "servu",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "liabler",
                    "plural": false,
                    "selections": [
                      (v6/*: any*/),
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Person",
                        "kind": "LinkedField",
                        "name": "person",
                        "plural": false,
                        "selections": (v4/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "eqpcnt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v7/*: any*/),
                    "concreteType": "DetailConnection",
                    "kind": "LinkedField",
                    "name": "detail_list",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "DetailConnectionEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Detail",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v3/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "ident",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "type",
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
                                "name": "sprice",
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
                                  (v3/*: any*/),
                                  (v5/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Isp",
                                "kind": "LinkedField",
                                "name": "isp",
                                "plural": false,
                                "selections": [
                                  (v3/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Eqp",
                                    "kind": "LinkedField",
                                    "name": "dev",
                                    "plural": false,
                                    "selections": [
                                      (v3/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "oid",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "cod",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "sort",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "vart",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "address",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "Village",
                                        "kind": "LinkedField",
                                        "name": "vlg",
                                        "plural": false,
                                        "selections": (v4/*: any*/),
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "Adminunit",
                                        "kind": "LinkedField",
                                        "name": "ad",
                                        "plural": false,
                                        "selections": [
                                          (v3/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "Town",
                                            "kind": "LinkedField",
                                            "name": "town",
                                            "plural": false,
                                            "selections": (v4/*: any*/),
                                            "storageKey": null
                                          },
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "County",
                                            "kind": "LinkedField",
                                            "name": "county",
                                            "plural": false,
                                            "selections": (v4/*: any*/),
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "used",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "titl",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "plno",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "lpho",
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "report",
                                    "plural": false,
                                    "selections": [
                                      (v6/*: any*/),
                                      (v3/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "ApprovalStm",
                                        "kind": "LinkedField",
                                        "name": "stm",
                                        "plural": false,
                                        "selections": [
                                          (v3/*: any*/),
                                          {
                                            "alias": null,
                                            "args": null,
                                            "kind": "ScalarField",
                                            "name": "sta",
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
                              {
                                "kind": "ClientExtension",
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "selected",
                                    "storageKey": null
                                  }
                                ]
                              },
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v8/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v9/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v7/*: any*/),
                    "filters": [
                      "orderBy",
                      "where"
                    ],
                    "handle": "connection",
                    "key": "BoundDevices__detail_list",
                    "kind": "LinkedHandle",
                    "name": "detail_list"
                  },
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              (v8/*: any*/),
              {
                "kind": "ClientExtension",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__id",
                    "storageKey": null
                  }
                ]
              }
            ],
            "storageKey": null
          },
          (v9/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v2/*: any*/),
        "filters": [
          "where",
          "orderBy",
          "asc"
        ],
        "handle": "connection",
        "key": "Query_findAllTaskFilter",
        "kind": "LinkedHandle",
        "name": "findAllTaskFilter"
      }
    ]
  },
  "params": {
    "cacheID": "c06021f8270a54c162ad89874e9c1fdf",
    "id": null,
    "metadata": {},
    "name": "TaskListRefetchQuery",
    "operationKind": "query",
    "text": "query TaskListRefetchQuery(\n  $after: String\n  $afterdl: String\n  $asc: Boolean\n  $first: Int\n  $orderBy: String\n  $orderBydl: String\n  $twhere: TaskInput\n  $wheredl: TaskDetailInput\n) {\n  ...TaskList\n}\n\nfragment BoundDevices on Task {\n  detail_list(after: $afterdl, first: $first, orderBy: $orderBydl, where: $wheredl) {\n    edges {\n      node {\n        id\n        ...DeviceListItem\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n\nfragment DeviceListItem on Detail {\n  id\n  ident\n  type\n  feeOk\n  sprice\n  task {\n    id\n    status\n  }\n  isp {\n    id\n    dev {\n      id\n      oid\n      cod\n      sort\n      vart\n      address\n      vlg {\n        id\n        name\n      }\n      ad {\n        id\n        town {\n          id\n          name\n        }\n        county {\n          id\n          name\n        }\n      }\n      used\n      titl\n      plno\n      lpho\n    }\n    report {\n      __typename\n      id\n      stm {\n        id\n        sta\n      }\n    }\n  }\n}\n\nfragment TaskList on Query {\n  findAllTaskFilter(where: $twhere, after: $after, first: $first, orderBy: $orderBy, asc: $asc) {\n    edges {\n      node {\n        id\n        dep {\n          id\n          name\n        }\n        office {\n          id\n          name\n        }\n        date\n        status\n        bsType\n        entrust\n        servu {\n          id\n          name\n        }\n        liabler {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n        eqpcnt\n        ...BoundDevices\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1118d9f6dd12bfadb6841d4e8751fa4d";

export default node;
