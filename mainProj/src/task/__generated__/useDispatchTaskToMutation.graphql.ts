/**
 * @generated SignedSource<<df74d9ceacd5fdd37692e9a65c9dcb30>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type useDispatchTaskToMutation$variables = {
  approver: string;
  date: any;
  ispmen: ReadonlyArray<string>;
  modeltype?: string | null | undefined;
  modelversion?: number | null | undefined;
  reviewer: string;
  task: string;
  verify: string;
};
export type useDispatchTaskToMutation$data = {
  readonly dispatchTaskTo: {
    readonly bsType: BusinessCat_Enum | null | undefined;
    readonly date: string | null | undefined;
    readonly dep: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly id: string;
  } | null | undefined;
};
export type useDispatchTaskToMutation = {
  response: useDispatchTaskToMutation$data;
  variables: useDispatchTaskToMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "approver"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "date"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ispmen"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "modeltype"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "modelversion"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "reviewer"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "task"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "verify"
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "approverId",
        "variableName": "approver"
      },
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "task"
      },
      {
        "kind": "Variable",
        "name": "ispmen",
        "variableName": "ispmen"
      },
      {
        "kind": "Variable",
        "name": "modeltype",
        "variableName": "modeltype"
      },
      {
        "kind": "Variable",
        "name": "modelversion",
        "variableName": "modelversion"
      },
      {
        "kind": "Variable",
        "name": "reviewerId",
        "variableName": "reviewer"
      },
      {
        "kind": "Variable",
        "name": "taskDate",
        "variableName": "date"
      },
      {
        "kind": "Variable",
        "name": "verify",
        "variableName": "verify"
      }
    ],
    "concreteType": "Task",
    "kind": "LinkedField",
    "name": "dispatchTaskTo",
    "plural": false,
    "selections": [
      (v8/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Division",
        "kind": "LinkedField",
        "name": "dep",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
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
        "name": "date",
        "storageKey": null
      }
    ],
    "storageKey": null
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
    "name": "useDispatchTaskToMutation",
    "selections": (v9/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v6/*: any*/),
      (v1/*: any*/),
      (v7/*: any*/),
      (v2/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "useDispatchTaskToMutation",
    "selections": (v9/*: any*/)
  },
  "params": {
    "cacheID": "f9fd7d3937b162049000bcc850fcc8a1",
    "id": null,
    "metadata": {},
    "name": "useDispatchTaskToMutation",
    "operationKind": "mutation",
    "text": "mutation useDispatchTaskToMutation(\n  $task: ID!\n  $date: Date!\n  $verify: ID!\n  $ispmen: [ID!]!\n  $reviewer: ID!\n  $approver: ID!\n  $modeltype: String\n  $modelversion: Int\n) {\n  dispatchTaskTo(id: $task, taskDate: $date, verify: $verify, ispmen: $ispmen, reviewerId: $reviewer, approverId: $approver, modeltype: $modeltype, modelversion: $modelversion) {\n    id\n    dep {\n      id\n      name\n    }\n    bsType\n    date\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d184e80908c12c94d7817be9179f847";

export default node;
