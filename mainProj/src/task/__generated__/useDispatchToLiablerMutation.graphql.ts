/**
 * @generated SignedSource<<6adb2a7f24aef22271a77670af0ae2c1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type useDispatchToLiablerMutation$variables = {
  liabler: string;
  nos?: string | null | undefined;
  task: string;
};
export type useDispatchToLiablerMutation$data = {
  readonly dispatchToLiabler: {
    readonly bsType: BusinessCat_Enum | null | undefined;
    readonly date: string | null | undefined;
    readonly dep: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly id: string;
  } | null | undefined;
};
export type useDispatchToLiablerMutation = {
  response: useDispatchToLiablerMutation$data;
  variables: useDispatchToLiablerMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "liabler"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "nos"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "task"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "liabler",
        "variableName": "liabler"
      },
      {
        "kind": "Variable",
        "name": "nos",
        "variableName": "nos"
      },
      {
        "kind": "Variable",
        "name": "task",
        "variableName": "task"
      }
    ],
    "concreteType": "Task",
    "kind": "LinkedField",
    "name": "dispatchToLiabler",
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
        "selections": [
          (v3/*: any*/),
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
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useDispatchToLiablerMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useDispatchToLiablerMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "b834ed519fd88072116b7d45a989bb68",
    "id": null,
    "metadata": {},
    "name": "useDispatchToLiablerMutation",
    "operationKind": "mutation",
    "text": "mutation useDispatchToLiablerMutation(\n  $task: ID!\n  $liabler: ID!\n  $nos: String\n) {\n  dispatchToLiabler(task: $task, liabler: $liabler, nos: $nos) {\n    id\n    dep {\n      id\n      name\n    }\n    bsType\n    date\n  }\n}\n"
  }
};
})();

(node as any).hash = "e66135cdcdc4050a031cf02a3d1f84d2";

export default node;
