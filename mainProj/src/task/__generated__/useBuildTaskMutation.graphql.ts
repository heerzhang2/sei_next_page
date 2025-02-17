/**
 * @generated SignedSource<<5ecf8c67376078fc9fba762e9f8d3d46>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
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
export type useBuildTaskMutation$variables = {
  bsType: BusinessCat_Enum;
  date: any;
  depId?: string | null | undefined;
  devs?: ReadonlyArray<string> | null | undefined;
  entrust: boolean;
  in?: TaskDetailInput | null | undefined;
  liablerId?: string | null | undefined;
  officeId?: string | null | undefined;
  servuId: string;
};
export type useBuildTaskMutation$data = {
  readonly addTask: {
    readonly bsType: BusinessCat_Enum | null | undefined;
    readonly date: string | null | undefined;
    readonly dep: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly detail_list: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly ident: string | null | undefined;
          readonly isp: {
            readonly dev: {
              readonly cod: string | null | undefined;
              readonly id: string;
              readonly oid: string | null | undefined;
            } | null | undefined;
            readonly id: string;
          } | null | undefined;
          readonly type: string | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly entrust: boolean | null | undefined;
    readonly id: string;
    readonly liabler: {
      readonly id: string;
      readonly username: string;
    } | null | undefined;
    readonly office: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly servu: {
      readonly company: {
        readonly id: string;
      } | null | undefined;
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly type: string | null | undefined;
  } | null | undefined;
};
export type useBuildTaskMutation = {
  response: useBuildTaskMutation$data;
  variables: useBuildTaskMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "bsType"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "date"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "depId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "devs"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "entrust"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "in"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liablerId"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "officeId"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "servuId"
},
v9 = [
  {
    "kind": "Variable",
    "name": "bsType",
    "variableName": "bsType"
  },
  {
    "kind": "Variable",
    "name": "date",
    "variableName": "date"
  },
  {
    "kind": "Variable",
    "name": "depId",
    "variableName": "depId"
  },
  {
    "kind": "Variable",
    "name": "devs",
    "variableName": "devs"
  },
  {
    "kind": "Variable",
    "name": "entrust",
    "variableName": "entrust"
  },
  {
    "kind": "Variable",
    "name": "in",
    "variableName": "in"
  },
  {
    "kind": "Variable",
    "name": "liablerId",
    "variableName": "liablerId"
  },
  {
    "kind": "Variable",
    "name": "officeId",
    "variableName": "officeId"
  },
  {
    "kind": "Variable",
    "name": "servuId",
    "variableName": "servuId"
  }
],
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
  "name": "date",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v13 = [
  (v10/*: any*/),
  (v12/*: any*/)
],
v14 = {
  "alias": null,
  "args": null,
  "concreteType": "Division",
  "kind": "LinkedField",
  "name": "dep",
  "plural": false,
  "selections": (v13/*: any*/),
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "Office",
  "kind": "LinkedField",
  "name": "office",
  "plural": false,
  "selections": (v13/*: any*/),
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "servu",
  "plural": false,
  "selections": [
    (v10/*: any*/),
    (v12/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Company",
      "kind": "LinkedField",
      "name": "company",
      "plural": false,
      "selections": [
        (v10/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bsType",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entrust",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
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
            (v18/*: any*/),
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
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
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
      (v7/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useBuildTaskMutation",
    "selections": [
      {
        "alias": null,
        "args": (v9/*: any*/),
        "concreteType": "Task",
        "kind": "LinkedField",
        "name": "addTask",
        "plural": false,
        "selections": [
          (v10/*: any*/),
          (v11/*: any*/),
          (v14/*: any*/),
          (v15/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "liabler",
            "plural": false,
            "selections": [
              (v10/*: any*/),
              (v16/*: any*/)
            ],
            "storageKey": null
          },
          (v17/*: any*/),
          (v18/*: any*/),
          (v19/*: any*/),
          (v20/*: any*/),
          (v21/*: any*/)
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
      (v1/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v8/*: any*/),
      (v2/*: any*/),
      (v7/*: any*/),
      (v6/*: any*/),
      (v3/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Operation",
    "name": "useBuildTaskMutation",
    "selections": [
      {
        "alias": null,
        "args": (v9/*: any*/),
        "concreteType": "Task",
        "kind": "LinkedField",
        "name": "addTask",
        "plural": false,
        "selections": [
          (v10/*: any*/),
          (v11/*: any*/),
          (v14/*: any*/),
          (v15/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "liabler",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v10/*: any*/),
              (v16/*: any*/)
            ],
            "storageKey": null
          },
          (v17/*: any*/),
          (v18/*: any*/),
          (v19/*: any*/),
          (v20/*: any*/),
          (v21/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "248207b670949f98a015abb3fa0c6fac",
    "id": null,
    "metadata": {},
    "name": "useBuildTaskMutation",
    "operationKind": "mutation",
    "text": "mutation useBuildTaskMutation(\n  $date: Date!\n  $bsType: BusinessCat_Enum!\n  $entrust: Boolean!\n  $servuId: ID!\n  $depId: ID\n  $officeId: ID\n  $liablerId: ID\n  $devs: [ID!]\n  $in: TaskDetailInput\n) {\n  addTask(date: $date, bsType: $bsType, entrust: $entrust, servuId: $servuId, depId: $depId, officeId: $officeId, liablerId: $liablerId, devs: $devs, in: $in) {\n    id\n    date\n    dep {\n      id\n      name\n    }\n    office {\n      id\n      name\n    }\n    liabler {\n      __typename\n      id\n      username\n    }\n    servu {\n      id\n      name\n      company {\n        id\n      }\n    }\n    type\n    bsType\n    entrust\n    detail_list {\n      edges {\n        node {\n          id\n          type\n          ident\n          isp {\n            id\n            dev {\n              id\n              oid\n              cod\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a8bc405505746246dc0dffb1328393aa";

export default node;
