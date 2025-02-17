/**
 * @generated SignedSource<<98480bb237c1c91541568893777e02a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type Ifop_Enu = "ADD" | "DEL" | "UPD" | "%future added value";
export type cudAgreementTaskEqpMutation$variables = {
  agreement: string;
  devs: ReadonlyArray<string>;
  opt: Ifop_Enu;
  task?: string | null | undefined;
};
export type cudAgreementTaskEqpMutation$data = {
  readonly cudEqpToAgreementTask: {
    readonly charge: string | null | undefined;
    readonly id: string;
    readonly mdtime: string | null | undefined;
    readonly status: string | null | undefined;
    readonly tasks: ReadonlyArray<{
      readonly charge: string | null | undefined;
      readonly eqpcnt: number | null | undefined;
      readonly feeOk: boolean | null | undefined;
      readonly id: string;
      readonly status: string | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type cudAgreementTaskEqpMutation = {
  response: cudAgreementTaskEqpMutation$data;
  variables: cudAgreementTaskEqpMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "agreement"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "devs"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "opt"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "task"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
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
  "name": "charge",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "agreement",
        "variableName": "agreement"
      },
      {
        "kind": "Variable",
        "name": "devs",
        "variableName": "devs"
      },
      {
        "kind": "Variable",
        "name": "opt",
        "variableName": "opt"
      },
      {
        "kind": "Variable",
        "name": "task",
        "variableName": "task"
      }
    ],
    "concreteType": "Agreement",
    "kind": "LinkedField",
    "name": "cudEqpToAgreementTask",
    "plural": false,
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "mdtime",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Task",
        "kind": "LinkedField",
        "name": "tasks",
        "plural": true,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "eqpcnt",
            "storageKey": null
          },
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "feeOk",
            "storageKey": null
          }
        ],
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
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "cudAgreementTaskEqpMutation",
    "selections": (v7/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "cudAgreementTaskEqpMutation",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "b46c3ba81aa37b1e2939ff3368cc5a7d",
    "id": null,
    "metadata": {},
    "name": "cudAgreementTaskEqpMutation",
    "operationKind": "mutation",
    "text": "mutation cudAgreementTaskEqpMutation(\n  $agreement: ID!\n  $opt: Ifop_Enu!\n  $devs: [ID!]!\n  $task: ID\n) {\n  cudEqpToAgreementTask(agreement: $agreement, opt: $opt, devs: $devs, task: $task) {\n    id\n    status\n    charge\n    mdtime\n    tasks {\n      id\n      status\n      eqpcnt\n      charge\n      feeOk\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "aa3d707516b884a42d6c7f4d280dab3b";

export default node;
