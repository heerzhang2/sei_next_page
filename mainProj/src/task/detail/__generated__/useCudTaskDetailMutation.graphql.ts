/**
 * @generated SignedSource<<facf4fb395136572bb41fb48b8c1d1c3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Ifop_Enu = "ADD" | "DEL" | "UPD" | "%future added value";
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
export type useCudTaskDetailMutation$variables = {
  afterdl?: string | null | undefined;
  dets: ReadonlyArray<string>;
  first?: number | null | undefined;
  id: string;
  newId?: string | null | undefined;
  opt: Ifop_Enu;
  orderBydl?: string | null | undefined;
  wheredl?: TaskDetailInput | null | undefined;
};
export type useCudTaskDetailMutation$data = {
  readonly cudTaskDetails: {
    readonly newTask: {
      readonly eqpcnt: number | null | undefined;
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"BoundDevices">;
    } | null | undefined;
    readonly task: {
      readonly eqpcnt: number | null | undefined;
      readonly id: string;
      readonly " $fragmentSpreads": FragmentRefs<"BoundDevices">;
    } | null | undefined;
    readonly warn: string | null | undefined;
  };
};
export type useCudTaskDetailMutation = {
  response: useCudTaskDetailMutation$data;
  variables: useCudTaskDetailMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "afterdl"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "dets"
},
v2 = {
  "defaultValue": 30,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "newId"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "opt"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBydl"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "wheredl"
},
v8 = [
  {
    "kind": "Variable",
    "name": "dets",
    "variableName": "dets"
  },
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "newId",
    "variableName": "newId"
  },
  {
    "kind": "Variable",
    "name": "opt",
    "variableName": "opt"
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "warn",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "eqpcnt",
  "storageKey": null
},
v12 = [
  (v10/*: any*/),
  (v11/*: any*/),
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "BoundDevices"
  }
],
v13 = [
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
v14 = [
  (v10/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v16 = [
  (v10/*: any*/),
  (v11/*: any*/),
  {
    "alias": null,
    "args": (v13/*: any*/),
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
              (v10/*: any*/),
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
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  }
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
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Eqp",
                    "kind": "LinkedField",
                    "name": "dev",
                    "plural": false,
                    "selections": [
                      (v10/*: any*/),
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
                        "selections": (v14/*: any*/),
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
                          (v10/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Town",
                            "kind": "LinkedField",
                            "name": "town",
                            "plural": false,
                            "selections": (v14/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "County",
                            "kind": "LinkedField",
                            "name": "county",
                            "plural": false,
                            "selections": (v14/*: any*/),
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
                      (v15/*: any*/),
                      (v10/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ApprovalStm",
                        "kind": "LinkedField",
                        "name": "stm",
                        "plural": false,
                        "selections": [
                          (v10/*: any*/),
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
              (v15/*: any*/)
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
    "args": (v13/*: any*/),
    "filters": [
      "orderBy",
      "where"
    ],
    "handle": "connection",
    "key": "BoundDevices__detail_list",
    "kind": "LinkedHandle",
    "name": "detail_list"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCudTaskDetailMutation",
    "selections": [
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "TaskComResp",
        "kind": "LinkedField",
        "name": "cudTaskDetails",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Task",
            "kind": "LinkedField",
            "name": "task",
            "plural": false,
            "selections": (v12/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Task",
            "kind": "LinkedField",
            "name": "newTask",
            "plural": false,
            "selections": (v12/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v5/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Operation",
    "name": "useCudTaskDetailMutation",
    "selections": [
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "TaskComResp",
        "kind": "LinkedField",
        "name": "cudTaskDetails",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Task",
            "kind": "LinkedField",
            "name": "task",
            "plural": false,
            "selections": (v16/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Task",
            "kind": "LinkedField",
            "name": "newTask",
            "plural": false,
            "selections": (v16/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "100a4d0c287513cc01354449225ec42b",
    "id": null,
    "metadata": {},
    "name": "useCudTaskDetailMutation",
    "operationKind": "mutation",
    "text": "mutation useCudTaskDetailMutation(\n  $id: ID!\n  $opt: Ifop_Enu!\n  $dets: [ID!]!\n  $newId: ID\n  $afterdl: String\n  $first: Int = 30\n  $orderBydl: String\n  $wheredl: TaskDetailInput\n) {\n  cudTaskDetails(id: $id, opt: $opt, dets: $dets, newId: $newId) {\n    warn\n    task {\n      id\n      eqpcnt\n      ...BoundDevices\n    }\n    newTask {\n      id\n      eqpcnt\n      ...BoundDevices\n    }\n  }\n}\n\nfragment BoundDevices on Task {\n  detail_list(after: $afterdl, first: $first, orderBy: $orderBydl, where: $wheredl) {\n    edges {\n      node {\n        id\n        ...DeviceListItem\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n\nfragment DeviceListItem on Detail {\n  id\n  ident\n  type\n  feeOk\n  sprice\n  task {\n    id\n    status\n  }\n  isp {\n    id\n    dev {\n      id\n      oid\n      cod\n      sort\n      vart\n      address\n      vlg {\n        id\n        name\n      }\n      ad {\n        id\n        town {\n          id\n          name\n        }\n        county {\n          id\n          name\n        }\n      }\n      used\n      titl\n      plno\n      lpho\n    }\n    report {\n      __typename\n      id\n      stm {\n        id\n        sta\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "81347f4f9bece8a0a75393f0fcfead50";

export default node;
