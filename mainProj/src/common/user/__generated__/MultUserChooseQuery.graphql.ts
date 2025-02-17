/**
 * @generated SignedSource<<bc546769500de14c8ee4dd0ceaa32723>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MultUserChooseQuery$variables = {
  id?: string | null | undefined;
};
export type MultUserChooseQuery$data = {
  readonly node: {
    readonly __typename: "Unit";
    readonly dvs: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly offices: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
        readonly staff: ReadonlyArray<{
          readonly id: string;
          readonly person: {
            readonly id: string;
            readonly name: string;
          } | null | undefined;
          readonly username: string;
        } | null | undefined> | null | undefined;
      } | null | undefined> | null | undefined;
      readonly staff: ReadonlyArray<{
        readonly id: string;
        readonly person: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly username: string;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
    readonly id: string;
    readonly name: string | null | undefined;
    readonly staff: ReadonlyArray<{
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly username: string;
    } | null | undefined> | null | undefined;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
};
export type MultUserChooseQuery = {
  response: MultUserChooseQuery$data;
  variables: MultUserChooseQuery$variables;
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
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
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "staff",
  "plural": true,
  "selections": [
    (v2/*: any*/),
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
      "selections": [
        (v2/*: any*/),
        (v3/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v5 = {
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
      "concreteType": "Office",
      "kind": "LinkedField",
      "name": "offices",
      "plural": true,
      "selections": [
        (v2/*: any*/),
        (v3/*: any*/),
        (v4/*: any*/)
      ],
      "storageKey": null
    },
    (v4/*: any*/)
  ],
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MultUserChooseQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
              (v5/*: any*/),
              (v4/*: any*/)
            ],
            "type": "Unit",
            "abstractKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MultUserChooseQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              (v5/*: any*/),
              (v4/*: any*/)
            ],
            "type": "Unit",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ad0fb64e03efc325684dc7988314f4bb",
    "id": null,
    "metadata": {},
    "name": "MultUserChooseQuery",
    "operationKind": "query",
    "text": "query MultUserChooseQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    ... on Unit {\n      id\n      name\n      dvs {\n        id\n        name\n        offices {\n          id\n          name\n          staff {\n            id\n            username\n            person {\n              id\n              name\n            }\n          }\n        }\n        staff {\n          id\n          username\n          person {\n            id\n            name\n          }\n        }\n      }\n      staff {\n        id\n        username\n        person {\n          id\n          name\n        }\n      }\n    }\n    __typename\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "47f98ab8ccb89076067f6684a61c1e05";

export default node;
