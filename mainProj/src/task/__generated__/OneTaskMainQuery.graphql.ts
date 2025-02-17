/**
 * @generated SignedSource<<3e1791951a37e9f992b7a68b14675945>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Procedure_Enum = "APPR" | "BEGIN" | "CANCEL" | "CHECK" | "END" | "MAKE" | "OFFER" | "SIGN" | "WAITREDO" | "%future added value";
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
export type OneTaskMainQuery$variables = {
  afterdl?: string | null | undefined;
  first?: number | null | undefined;
  orderBydl?: string | null | undefined;
  taskId: string;
  wheredl?: TaskDetailInput | null | undefined;
};
export type OneTaskMainQuery$data = {
  readonly node: {
    readonly id: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"OneTaskWraper">;
};
export type OneTaskMainQuery = {
  response: OneTaskMainQuery$data;
  variables: OneTaskMainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "afterdl"
},
v1 = {
  "defaultValue": 30,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBydl"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "taskId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "wheredl"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "taskId"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = [
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "feeOk",
  "storageKey": null
},
v11 = [
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "Person",
  "kind": "LinkedField",
  "name": "person",
  "plural": false,
  "selections": (v11/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "concreteType": "Division",
  "kind": "LinkedField",
  "name": "dep",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "concreteType": "Office",
  "kind": "LinkedField",
  "name": "office",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v15 = [
  (v6/*: any*/),
  (v12/*: any*/),
  (v13/*: any*/),
  (v14/*: any*/)
],
v16 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "afterdl"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
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
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "OneTaskMainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": (v7/*: any*/),
        "storageKey": null
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "OneTaskWraper"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "OneTaskMainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          (v6/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
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
                "kind": "ScalarField",
                "name": "date",
                "storageKey": null
              },
              (v9/*: any*/),
              (v10/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "charge",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "crman",
                "plural": false,
                "selections": [
                  (v8/*: any*/),
                  (v6/*: any*/),
                  (v12/*: any*/)
                ],
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
                  (v8/*: any*/),
                  (v6/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ApprovalStm",
                "kind": "LinkedField",
                "name": "typicstm",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "master",
                    "plural": false,
                    "selections": (v15/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "reviewer",
                    "plural": false,
                    "selections": (v15/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "approver",
                    "plural": false,
                    "selections": (v15/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "authr",
                    "plural": true,
                    "selections": (v15/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Office",
                "kind": "LinkedField",
                "name": "office",
                "plural": false,
                "selections": (v11/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Division",
                "kind": "LinkedField",
                "name": "dep",
                "plural": false,
                "selections": (v11/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Unit",
                "kind": "LinkedField",
                "name": "servu",
                "plural": false,
                "selections": (v11/*: any*/),
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
                "args": (v16/*: any*/),
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
                          (v6/*: any*/),
                          (v17/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Isp",
                            "kind": "LinkedField",
                            "name": "isp",
                            "plural": false,
                            "selections": [
                              (v6/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "no",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Eqp",
                                "kind": "LinkedField",
                                "name": "dev",
                                "plural": false,
                                "selections": [
                                  (v6/*: any*/),
                                  (v17/*: any*/),
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
                                    "name": "subv",
                                    "storageKey": null
                                  },
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
                                    "selections": (v11/*: any*/),
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
                                      (v6/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "Town",
                                        "kind": "LinkedField",
                                        "name": "town",
                                        "plural": false,
                                        "selections": (v11/*: any*/),
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "County",
                                        "kind": "LinkedField",
                                        "name": "county",
                                        "plural": false,
                                        "selections": (v11/*: any*/),
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
                                  (v8/*: any*/),
                                  (v6/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "ApprovalStm",
                                    "kind": "LinkedField",
                                    "name": "stm",
                                    "plural": false,
                                    "selections": [
                                      (v6/*: any*/),
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
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "ident",
                            "storageKey": null
                          },
                          (v10/*: any*/),
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
                              (v6/*: any*/),
                              (v9/*: any*/)
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
                          (v8/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
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
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v16/*: any*/),
                "filters": [
                  "orderBy",
                  "where"
                ],
                "handle": "connection",
                "key": "BoundDevices__detail_list",
                "kind": "LinkedHandle",
                "name": "detail_list"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Agreement",
                "kind": "LinkedField",
                "name": "agreement",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "pttype",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "Task",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "713f120589ac9df81da038e5b6bc39e9",
    "id": null,
    "metadata": {},
    "name": "OneTaskMainQuery",
    "operationKind": "query",
    "text": "query OneTaskMainQuery(\n  $taskId: ID!\n  $afterdl: String\n  $first: Int = 30\n  $orderBydl: String\n  $wheredl: TaskDetailInput\n) {\n  node(id: $taskId) {\n    __typename\n    id\n  }\n  ...OneTaskWraper\n}\n\nfragment BoundDevices on Task {\n  detail_list(after: $afterdl, first: $first, orderBy: $orderBydl, where: $wheredl) {\n    edges {\n      node {\n        id\n        ...DeviceListItem\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n\nfragment DeviceListItem on Detail {\n  id\n  ident\n  type\n  feeOk\n  sprice\n  task {\n    id\n    status\n  }\n  isp {\n    id\n    dev {\n      id\n      oid\n      cod\n      sort\n      vart\n      address\n      vlg {\n        id\n        name\n      }\n      ad {\n        id\n        town {\n          id\n          name\n        }\n        county {\n          id\n          name\n        }\n      }\n      used\n      titl\n      plno\n      lpho\n    }\n    report {\n      __typename\n      id\n      stm {\n        id\n        sta\n      }\n    }\n  }\n}\n\nfragment OneTaskWraper on Query {\n  node(id: $taskId) {\n    id\n    __typename\n    ... on Task {\n      bsType\n      entrust\n      date\n      status\n      feeOk\n      charge\n      crman {\n        __typename\n        id\n        person {\n          id\n          name\n        }\n      }\n      liabler {\n        __typename\n        id\n        person {\n          id\n          name\n        }\n        dep {\n          id\n        }\n        office {\n          id\n        }\n      }\n      typicstm {\n        id\n        master {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n        reviewer {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n        approver {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n        authr {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n      }\n      office {\n        id\n        name\n      }\n      dep {\n        id\n        name\n      }\n      servu {\n        id\n        name\n      }\n      eqpcnt\n      detail_list(after: $afterdl, first: $first, orderBy: $orderBydl, where: $wheredl) {\n        edges {\n          node {\n            id\n            type\n            isp {\n              id\n              no\n              dev {\n                id\n                type\n                sort\n                vart\n                subv\n              }\n            }\n          }\n        }\n      }\n      agreement {\n        id\n        pttype\n      }\n    }\n    ...BoundDevices\n  }\n}\n"
  }
};
})();

(node as any).hash = "8a79149b2a06486c0d994bfd76084a25";

export default node;
