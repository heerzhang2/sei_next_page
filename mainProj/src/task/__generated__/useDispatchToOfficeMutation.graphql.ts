/**
 * @generated SignedSource<<68cf13aad0cc91b61c9ad3e1a372deb6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type useDispatchToOfficeMutation$variables = {
  office: string;
  task: string;
};
export type useDispatchToOfficeMutation$data = {
  readonly dispatchToOffice: {
    readonly bsType: BusinessCat_Enum | null | undefined;
    readonly date: string | null | undefined;
    readonly dep: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly id: string;
  } | null | undefined;
};
export type useDispatchToOfficeMutation = {
  response: useDispatchToOfficeMutation$data;
  variables: useDispatchToOfficeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "office"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "task"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "office",
        "variableName": "office"
      },
      {
        "kind": "Variable",
        "name": "task",
        "variableName": "task"
      }
    ],
    "concreteType": "Task",
    "kind": "LinkedField",
    "name": "dispatchToOffice",
    "plural": false,
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Division",
        "kind": "LinkedField",
        "name": "dep",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useDispatchToOfficeMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useDispatchToOfficeMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "ff2320b59fb883da58cedea079e8a4f0",
    "id": null,
    "metadata": {},
    "name": "useDispatchToOfficeMutation",
    "operationKind": "mutation",
    "text": "mutation useDispatchToOfficeMutation(\n  $task: ID!\n  $office: String!\n) {\n  dispatchToOffice(task: $task, office: $office) {\n    id\n    dep {\n      id\n      name\n    }\n    bsType\n    date\n  }\n}\n"
  }
};
})();

(node as any).hash = "3b84eb0993cd1ad12222de59a004f76c";

export default node;
