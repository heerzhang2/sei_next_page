/**
 * @generated SignedSource<<cc3b441cd0b8172782b3c61c721b3f52>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VillageChooseQuery$variables = {
  id: string;
  partial?: string | null | undefined;
};
export type VillageChooseQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly adm?: {
      readonly id: string;
      readonly name: string;
      readonly vlgs: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly id: string;
    readonly name?: string;
    readonly vlgs?: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type VillageChooseQuery = {
  response: VillageChooseQuery$data;
  variables: VillageChooseQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "partial"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "partial",
      "variableName": "partial"
    }
  ],
  "concreteType": "Village",
  "kind": "LinkedField",
  "name": "vlgs",
  "plural": true,
  "selections": [
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v4 = [
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
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "type": "Adminunit",
        "abstractKey": null
      },
      {
        "kind": "InlineFragment",
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Adminunit",
            "kind": "LinkedField",
            "name": "adm",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "type": "Town",
        "abstractKey": null
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
    "name": "VillageChooseQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VillageChooseQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "44ea4db6c1e977394125fd0b73d43c07",
    "id": null,
    "metadata": {},
    "name": "VillageChooseQuery",
    "operationKind": "query",
    "text": "query VillageChooseQuery(\n  $id: ID!\n  $partial: String\n) {\n  node(id: $id) {\n    id\n    ... on Adminunit {\n      id\n      name\n      vlgs(partial: $partial) {\n        id\n        name\n      }\n    }\n    ... on Town {\n      id\n      name\n      adm {\n        id\n        name\n        vlgs(partial: $partial) {\n          id\n          name\n        }\n      }\n    }\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "a621a61d43701edfd1d898cd9701e10e";

export default node;
