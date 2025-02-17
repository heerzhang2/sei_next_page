/**
 * @generated SignedSource<<8fe35680e63cfa3868afd495295108ad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AddressDetailQuery$variables = {
  id: string;
};
export type AddressDetailQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly id: string;
  } | null | undefined;
};
export type AddressDetailQuery = {
  response: AddressDetailQuery$data;
  variables: AddressDetailQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AddressDetailQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AddressDetailQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ba15c37d33eae78cf02e029a4a238503",
    "id": null,
    "metadata": {},
    "name": "AddressDetailQuery",
    "operationKind": "query",
    "text": "query AddressDetailQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "e5ffe433e40dc47fed9972c25caa43ac";

export default node;
