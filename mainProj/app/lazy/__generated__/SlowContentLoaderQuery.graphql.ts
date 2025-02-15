/**
 * @generated SignedSource<<e7808ab444acd61611731b24797d2929>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SlowContentLoaderQuery$variables = Record<PropertyKey, never>;
export type SlowContentLoaderQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"SlowContent">;
};
export type SlowContentLoaderQuery = {
  response: SlowContentLoaderQuery$data;
  variables: SlowContentLoaderQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SlowContentLoaderQuery",
    "selections": [
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
    "name": "SlowContentLoaderQuery",
    "selections": [
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
    "cacheID": "db666144260cc373d0036f6f011765e0",
    "id": null,
    "metadata": {},
    "name": "SlowContentLoaderQuery",
    "operationKind": "query",
    "text": "query SlowContentLoaderQuery {\n  ...SlowContent\n}\n\nfragment SlowContent on Query {\n  auth\n}\n"
  }
};

(node as any).hash = "92535a959475e61d330431119688d878";

export default node;
