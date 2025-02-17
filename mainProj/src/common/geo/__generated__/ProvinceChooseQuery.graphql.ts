/**
 * @generated SignedSource<<0d568a794cbeeb81a4a1f89748f8811a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProvinceChooseQuery$variables = {
  id: string;
};
export type ProvinceChooseQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly id: string;
    readonly name?: string;
    readonly provinces?: ReadonlyArray<{
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
export type ProvinceChooseQuery = {
  response: ProvinceChooseQuery$data;
  variables: ProvinceChooseQuery$variables;
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
            "concreteType": "Province",
            "kind": "LinkedField",
            "name": "provinces",
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
        "type": "Country",
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
    "name": "ProvinceChooseQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProvinceChooseQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "dffc24fd29a0f62689266ea70f3a28a6",
    "id": null,
    "metadata": {},
    "name": "ProvinceChooseQuery",
    "operationKind": "query",
    "text": "query ProvinceChooseQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    id\n    ... on Country {\n      id\n      name\n      provinces {\n        id\n        name\n        adm {\n          id\n          prefix\n          name\n          country {\n            id\n          }\n          province {\n            id\n          }\n          city {\n            id\n          }\n          county {\n            id\n          }\n          town {\n            id\n          }\n        }\n      }\n    }\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "a073f444c0b13837656aee1bcf7ec65f";

export default node;
