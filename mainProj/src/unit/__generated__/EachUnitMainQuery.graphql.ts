/**
 * @generated SignedSource<<ddcbfbf856ffc208564f5d1dd6f3780b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EachUnitMainQuery$variables = {
  company?: boolean | null | undefined;
  id: string;
};
export type EachUnitMainQuery$data = {
  readonly getUnit: {
    readonly address: string | null | undefined;
    readonly company: {
      readonly address: string | null | undefined;
      readonly id: string;
      readonly name: string;
      readonly no: string | null | undefined;
    } | null | undefined;
    readonly crDate: string | null | undefined;
    readonly id: string;
    readonly linkMen: string | null | undefined;
    readonly name: string | null | undefined;
    readonly person: {
      readonly address: string | null | undefined;
      readonly id: string;
      readonly name: string;
      readonly no: string | null | undefined;
    } | null | undefined;
    readonly phone: string | null | undefined;
  } | null | undefined;
};
export type EachUnitMainQuery = {
  response: EachUnitMainQuery$data;
  variables: EachUnitMainQuery$variables;
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
v6 = [
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
        "selections": (v5/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Person",
        "kind": "LinkedField",
        "name": "person",
        "plural": false,
        "selections": (v5/*: any*/),
        "storageKey": null
      },
      (v3/*: any*/),
      (v4/*: any*/),
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "crDate",
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
    "name": "EachUnitMainQuery",
    "selections": (v6/*: any*/),
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
    "name": "EachUnitMainQuery",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "f10e6d4d6f67372626b9208a29430940",
    "id": null,
    "metadata": {},
    "name": "EachUnitMainQuery",
    "operationKind": "query",
    "text": "query EachUnitMainQuery(\n  $id: ID!\n  $company: Boolean\n) {\n  getUnit(esid: $id, company: $company) {\n    id\n    company {\n      id\n      name\n      no\n      address\n    }\n    person {\n      id\n      name\n      no\n      address\n    }\n    name\n    address\n    linkMen\n    phone\n    crDate\n  }\n}\n"
  }
};
})();

(node as any).hash = "295ac064c6460fcb26f91f81955b6288";

export default node;
