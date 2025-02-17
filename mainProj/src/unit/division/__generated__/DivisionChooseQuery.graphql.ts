/**
 * @generated SignedSource<<bf51103120f8af439eebc27817abb51b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DivisionChooseQuery$variables = {
  company?: boolean | null | undefined;
  id: string;
};
export type DivisionChooseQuery$data = {
  readonly getUnit: {
    readonly company: {
      readonly address: string | null | undefined;
      readonly id: string;
      readonly name: string;
      readonly no: string | null | undefined;
    } | null | undefined;
    readonly dvs: ReadonlyArray<{
      readonly address: string | null | undefined;
      readonly id: string;
      readonly linkMen: string | null | undefined;
      readonly name: string;
      readonly phone: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly id: string;
  } | null | undefined;
};
export type DivisionChooseQuery = {
  response: DivisionChooseQuery$data;
  variables: DivisionChooseQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "company"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "address",
  "storageKey": null
},
v5 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "company",
        "variableName": "company"
      },
      {
        "kind": "Variable",
        "name": "esid",
        "variableName": "id"
      }
    ],
    "concreteType": "Unit",
    "kind": "LinkedField",
    "name": "getUnit",
    "plural": false,
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Company",
        "kind": "LinkedField",
        "name": "company",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "no",
            "storageKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Division",
        "kind": "LinkedField",
        "name": "dvs",
        "plural": true,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "linkMen",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "phone",
            "storageKey": null
          },
          (v4/*: any*/)
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DivisionChooseQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "DivisionChooseQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "806fc574b6c05fe67df711d0a9e582a4",
    "id": null,
    "metadata": {},
    "name": "DivisionChooseQuery",
    "operationKind": "query",
    "text": "query DivisionChooseQuery(\n  $id: ID!\n  $company: Boolean\n) {\n  getUnit(esid: $id, company: $company) {\n    id\n    company {\n      id\n      name\n      no\n      address\n    }\n    dvs {\n      id\n      name\n      linkMen\n      phone\n      address\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a2d870498ded38426ecf635c4129a17d";

export default node;
