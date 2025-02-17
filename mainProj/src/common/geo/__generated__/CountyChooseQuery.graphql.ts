/**
 * @generated SignedSource<<b040a7b4891374f79cdc1ac4322ea2af>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CountyChooseQuery$variables = {
  id: string;
};
export type CountyChooseQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly counties?: ReadonlyArray<{
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
    readonly id: string;
    readonly name?: string;
  } | null | undefined;
};
export type CountyChooseQuery = {
  response: CountyChooseQuery$data;
  variables: CountyChooseQuery$variables;
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
            "concreteType": "County",
            "kind": "LinkedField",
            "name": "counties",
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
        "type": "City",
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
    "name": "CountyChooseQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CountyChooseQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "7fb1b5f8c6a0d3f79839c9d3f928ad58",
    "id": null,
    "metadata": {},
    "name": "CountyChooseQuery",
    "operationKind": "query",
    "text": "query CountyChooseQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    ... on City {\n      id\n      name\n      counties {\n        id\n        name\n        adm {\n          id\n          prefix\n          name\n          country {\n            id\n          }\n          province {\n            id\n          }\n          city {\n            id\n          }\n          county {\n            id\n          }\n          town {\n            id\n          }\n        }\n      }\n    }\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "f67a874ed10445e9b2fe55145885e5f7";

export default node;
