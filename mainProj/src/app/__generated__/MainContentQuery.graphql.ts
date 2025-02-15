/**
 * @generated SignedSource<<1f273186a85bf3a9f86ce55a2db83920>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MainContentQuery$variables = Record<PropertyKey, never>;
export type MainContentQuery$data = {
  readonly authUser: {
    readonly dep: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly id: string;
    readonly ispUnits: ReadonlyArray<{
      readonly id: string;
      readonly unit: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined> | null | undefined;
    readonly office: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly person: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly unit: {
      readonly dvs: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
      } | null | undefined> | null | undefined;
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly username: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"SlowContent">;
};
export type MainContentQuery = {
  response: MainContentQuery$data;
  variables: MainContentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v0/*: any*/),
  (v1/*: any*/)
],
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "authUser",
  "plural": false,
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Person",
      "kind": "LinkedField",
      "name": "person",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Division",
      "kind": "LinkedField",
      "name": "dep",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Office",
      "kind": "LinkedField",
      "name": "office",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Unit",
      "kind": "LinkedField",
      "name": "unit",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Division",
          "kind": "LinkedField",
          "name": "dvs",
          "plural": true,
          "selections": (v2/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "IspAgency",
      "kind": "LinkedField",
      "name": "ispUnits",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Unit",
          "kind": "LinkedField",
          "name": "unit",
          "plural": false,
          "selections": (v2/*: any*/),
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "MainContentQuery",
    "selections": [
      (v3/*: any*/),
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "SlowContent"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "MainContentQuery",
    "selections": [
      (v3/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "auth",
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2512450c7566e559edb25d2817c4ed3f",
    "id": null,
    "metadata": {},
    "name": "MainContentQuery",
    "operationKind": "query",
    "text": "query MainContentQuery {\n  authUser {\n    id\n    username\n    person {\n      id\n      name\n    }\n    dep {\n      id\n      name\n    }\n    office {\n      id\n      name\n    }\n    unit {\n      id\n      name\n      dvs {\n        id\n        name\n      }\n    }\n    ispUnits {\n      id\n      unit {\n        id\n        name\n      }\n    }\n  }\n  ...SlowContent\n}\n\nfragment SlowContent on Query {\n  auth\n}\n"
  }
};
})();

(node as any).hash = "022978b72eaf9a3a4045580dd5546a0a";

export default node;
