/**
 * @generated SignedSource<<b2237cf5480e455be1d5ab48d50f352d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TownChooseQuery$variables = {
  id: string;
};
export type TownChooseQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly id: string;
    readonly name?: string;
    readonly towns?: ReadonlyArray<{
      readonly adm: {
        readonly city: {
          readonly id: string;
        } | null | undefined;
        readonly country: {
          readonly id: string;
        } | null | undefined;
        readonly county: {
          readonly id: string;
        } | null | undefined;
        readonly id: string;
        readonly name: string;
        readonly prefix: string | null | undefined;
        readonly province: {
          readonly id: string;
        } | null | undefined;
        readonly town: {
          readonly id: string;
        } | null | undefined;
      } | null | undefined;
      readonly id: string;
      readonly name: string;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type TownChooseQuery = {
  response: TownChooseQuery$data;
  variables: TownChooseQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
v3 = [
  (v1/*: any*/)
],
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
          {
            "alias": null,
            "args": null,
            "concreteType": "Town",
            "kind": "LinkedField",
            "name": "towns",
            "plural": true,
            "selections": [
              (v1/*: any*/),
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "prefix",
                    "storageKey": null
                  },
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Country",
                    "kind": "LinkedField",
                    "name": "country",
                    "plural": false,
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Province",
                    "kind": "LinkedField",
                    "name": "province",
                    "plural": false,
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "City",
                    "kind": "LinkedField",
                    "name": "city",
                    "plural": false,
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "County",
                    "kind": "LinkedField",
                    "name": "county",
                    "plural": false,
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Town",
                    "kind": "LinkedField",
                    "name": "town",
                    "plural": false,
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "type": "County",
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
    "name": "TownChooseQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TownChooseQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "ac681fe038f6e1e61db6268a34edeed4",
    "id": null,
    "metadata": {},
    "name": "TownChooseQuery",
    "operationKind": "query",
    "text": "query TownChooseQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    ... on County {\n      id\n      name\n      towns {\n        id\n        name\n        adm {\n          id\n          prefix\n          name\n          country {\n            id\n          }\n          province {\n            id\n          }\n          city {\n            id\n          }\n          county {\n            id\n          }\n          town {\n            id\n          }\n        }\n      }\n    }\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "8c295f1ff8d17f5b8f0aee2f2631cd29";

export default node;
