/**
 * @generated SignedSource<<3ab067d6f705282c9b1f74bb8196ea85>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type pageUserQuery$variables = Record<PropertyKey, never>;
export type pageUserQuery$data = {
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
export type pageUserQuery = {
  response: pageUserQuery$data;
  variables: pageUserQuery$variables;
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
    "name": "pageUserQuery",
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
    "name": "pageUserQuery",
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
    "cacheID": "f3294232a058f9b580e70709cb747a53",
    "id": null,
    "metadata": {},
    "name": "pageUserQuery",
    "operationKind": "query",
    "text": "query pageUserQuery {\n  authUser {\n    id\n    username\n    person {\n      id\n      name\n    }\n    dep {\n      id\n      name\n    }\n    office {\n      id\n      name\n    }\n    unit {\n      id\n      name\n      dvs {\n        id\n        name\n      }\n    }\n    ispUnits {\n      id\n      unit {\n        id\n        name\n      }\n    }\n  }\n  ...SlowContent\n}\n\nfragment SlowContent on Query {\n  auth\n}\n"
  }
};
})();

(node as any).hash = "c05f755df63514eb36df87ac2fc81cde";

export default node;
