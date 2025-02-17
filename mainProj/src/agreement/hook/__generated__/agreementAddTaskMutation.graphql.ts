/**
 * @generated SignedSource<<be54d73b784f60ff2e586ad19207de04>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type agreementAddTaskMutation$variables = {
  agreId: string;
  bsType: BusinessCat_Enum;
  date: any;
  devs?: ReadonlyArray<string> | null | undefined;
  entrust?: boolean | null | undefined;
};
export type agreementAddTaskMutation$data = {
  readonly agreementAddTask: {
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
export type agreementAddTaskMutation = {
  response: agreementAddTaskMutation$data;
  variables: agreementAddTaskMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "agreId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "bsType"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "date"
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
v5 = [
  {
    "kind": "Variable",
    "name": "agreId",
    "variableName": "agreId"
  },
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
    "name": "devs",
    "variableName": "devs"
  },
  {
    "kind": "Variable",
    "name": "entrust",
    "variableName": "entrust"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "date",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v9 = [
  (v6/*: any*/),
  (v8/*: any*/)
],
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "Division",
  "kind": "LinkedField",
  "name": "dep",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "Office",
  "kind": "LinkedField",
  "name": "office",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "servu",
  "plural": false,
  "selections": [
    (v6/*: any*/),
    (v8/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Company",
      "kind": "LinkedField",
      "name": "company",
      "plural": false,
      "selections": [
        (v6/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
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
  "name": "entrust",
  "storageKey": null
},
v17 = {
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
            (v6/*: any*/),
            (v14/*: any*/),
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
                (v6/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Eqp",
                  "kind": "LinkedField",
                  "name": "dev",
                  "plural": false,
                  "selections": [
                    (v6/*: any*/),
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
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "agreementAddTaskMutation",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "Task",
        "kind": "LinkedField",
        "name": "agreementAddTask",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "liabler",
            "plural": false,
            "selections": [
              (v6/*: any*/),
              (v12/*: any*/)
            ],
            "storageKey": null
          },
          (v13/*: any*/),
          (v14/*: any*/),
          (v15/*: any*/),
          (v16/*: any*/),
          (v17/*: any*/)
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
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "agreementAddTaskMutation",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "Task",
        "kind": "LinkedField",
        "name": "agreementAddTask",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/),
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
              (v6/*: any*/),
              (v12/*: any*/)
            ],
            "storageKey": null
          },
          (v13/*: any*/),
          (v14/*: any*/),
          (v15/*: any*/),
          (v16/*: any*/),
          (v17/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "07e1844c699cab8321855e32d56822bd",
    "id": null,
    "metadata": {},
    "name": "agreementAddTaskMutation",
    "operationKind": "mutation",
    "text": "mutation agreementAddTaskMutation(\n  $agreId: ID!\n  $date: Date!\n  $bsType: BusinessCat_Enum!\n  $entrust: Boolean\n  $devs: [ID!]\n) {\n  agreementAddTask(agreId: $agreId, date: $date, bsType: $bsType, entrust: $entrust, devs: $devs) {\n    id\n    date\n    dep {\n      id\n      name\n    }\n    office {\n      id\n      name\n    }\n    liabler {\n      __typename\n      id\n      username\n    }\n    servu {\n      id\n      name\n      company {\n        id\n      }\n    }\n    type\n    bsType\n    entrust\n    detail_list {\n      edges {\n        node {\n          id\n          type\n          ident\n          isp {\n            id\n            dev {\n              id\n              oid\n              cod\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "71ea14f3b80dda1de6af0e1e02ef3f00";

export default node;
