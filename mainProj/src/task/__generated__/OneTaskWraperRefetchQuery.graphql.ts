/**
 * @generated SignedSource<<8fab58d9c9250dfef9ca0887b48af456>>
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
export type OneTaskWraperRefetchQuery$variables = {
  afterdl?: string | null | undefined;
  first?: number | null | undefined;
  orderBydl?: string | null | undefined;
  taskId?: string | null | undefined;
  wheredl?: TaskDetailInput | null | undefined;
};
export type OneTaskWraperRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"OneTaskWraper">;
};
export type OneTaskWraperRefetchQuery = {
  response: OneTaskWraperRefetchQuery$data;
  variables: OneTaskWraperRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "afterdl"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderBydl"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "taskId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "wheredl"
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "feeOk",
  "storageKey": null
},
v5 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "Person",
  "kind": "LinkedField",
  "name": "person",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": null
},
v7 = [
  (v1/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "Division",
  "kind": "LinkedField",
  "name": "dep",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "Office",
  "kind": "LinkedField",
  "name": "office",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v10 = [
  (v1/*: any*/),
  (v6/*: any*/),
  (v8/*: any*/),
  (v9/*: any*/)
],
v11 = [
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
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "OneTaskWraperRefetchQuery",
    "selections": [
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "OneTaskWraperRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "taskId"
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
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
              (v3/*: any*/),
              (v4/*: any*/),
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
                  (v2/*: any*/),
                  (v1/*: any*/),
                  (v6/*: any*/)
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
                  (v2/*: any*/),
                  (v1/*: any*/),
                  (v6/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/)
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
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "master",
                    "plural": false,
                    "selections": (v10/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "reviewer",
                    "plural": false,
                    "selections": (v10/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "approver",
                    "plural": false,
                    "selections": (v10/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "authr",
                    "plural": true,
                    "selections": (v10/*: any*/),
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
                "selections": (v5/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Division",
                "kind": "LinkedField",
                "name": "dep",
                "plural": false,
                "selections": (v5/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Unit",
                "kind": "LinkedField",
                "name": "servu",
                "plural": false,
                "selections": (v5/*: any*/),
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
                "args": (v11/*: any*/),
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
                          (v1/*: any*/),
                          (v12/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Isp",
                            "kind": "LinkedField",
                            "name": "isp",
                            "plural": false,
                            "selections": [
                              (v1/*: any*/),
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
                                  (v1/*: any*/),
                                  (v12/*: any*/),
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
                                    "selections": (v5/*: any*/),
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
                                      (v1/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "Town",
                                        "kind": "LinkedField",
                                        "name": "town",
                                        "plural": false,
                                        "selections": (v5/*: any*/),
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "County",
                                        "kind": "LinkedField",
                                        "name": "county",
                                        "plural": false,
                                        "selections": (v5/*: any*/),
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
                                  (v2/*: any*/),
                                  (v1/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "ApprovalStm",
                                    "kind": "LinkedField",
                                    "name": "stm",
                                    "plural": false,
                                    "selections": [
                                      (v1/*: any*/),
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
                          (v4/*: any*/),
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
                              (v1/*: any*/),
                              (v3/*: any*/)
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
                          (v2/*: any*/)
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
                "args": (v11/*: any*/),
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
                  (v1/*: any*/),
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
    "cacheID": "96f972d1e03ded15996e98ed4e57ae0a",
    "id": null,
    "metadata": {},
    "name": "OneTaskWraperRefetchQuery",
    "operationKind": "query",
    "text": "query OneTaskWraperRefetchQuery(\n  $afterdl: String\n  $first: Int\n  $orderBydl: String\n  $taskId: ID\n  $wheredl: TaskDetailInput\n) {\n  ...OneTaskWraper\n}\n\nfragment BoundDevices on Task {\n  detail_list(after: $afterdl, first: $first, orderBy: $orderBydl, where: $wheredl) {\n    edges {\n      node {\n        id\n        ...DeviceListItem\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n\nfragment DeviceListItem on Detail {\n  id\n  ident\n  type\n  feeOk\n  sprice\n  task {\n    id\n    status\n  }\n  isp {\n    id\n    dev {\n      id\n      oid\n      cod\n      sort\n      vart\n      address\n      vlg {\n        id\n        name\n      }\n      ad {\n        id\n        town {\n          id\n          name\n        }\n        county {\n          id\n          name\n        }\n      }\n      used\n      titl\n      plno\n      lpho\n    }\n    report {\n      __typename\n      id\n      stm {\n        id\n        sta\n      }\n    }\n  }\n}\n\nfragment OneTaskWraper on Query {\n  node(id: $taskId) {\n    id\n    __typename\n    ... on Task {\n      bsType\n      entrust\n      date\n      status\n      feeOk\n      charge\n      crman {\n        __typename\n        id\n        person {\n          id\n          name\n        }\n      }\n      liabler {\n        __typename\n        id\n        person {\n          id\n          name\n        }\n        dep {\n          id\n        }\n        office {\n          id\n        }\n      }\n      typicstm {\n        id\n        master {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n        reviewer {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n        approver {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n        authr {\n          id\n          person {\n            id\n            name\n          }\n          dep {\n            id\n          }\n          office {\n            id\n          }\n        }\n      }\n      office {\n        id\n        name\n      }\n      dep {\n        id\n        name\n      }\n      servu {\n        id\n        name\n      }\n      eqpcnt\n      detail_list(after: $afterdl, first: $first, orderBy: $orderBydl, where: $wheredl) {\n        edges {\n          node {\n            id\n            type\n            isp {\n              id\n              no\n              dev {\n                id\n                type\n                sort\n                vart\n                subv\n              }\n            }\n          }\n        }\n      }\n      agreement {\n        id\n        pttype\n      }\n    }\n    ...BoundDevices\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c64718e1612481ceefa043fc8460fbc";

export default node;
