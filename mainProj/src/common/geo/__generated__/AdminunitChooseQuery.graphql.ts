/**
 * @generated SignedSource<<91344d450cd65162afa4862a451465d1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminunitChooseQuery$variables = {
  id?: string | null | undefined;
};
export type AdminunitChooseQuery$data = {
  readonly getAllCountries: ReadonlyArray<{
    readonly __typename: "Country";
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
    readonly collapse: boolean | null | undefined;
    readonly continent: string | null | undefined;
    readonly id: string;
    readonly name: string;
  } | null | undefined> | null | undefined;
};
export type AdminunitChooseQuery = {
  response: AdminunitChooseQuery$data;
  variables: AdminunitChooseQuery$variables;
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
        "name": "continent",
        "variableName": "id"
      }
    ],
    "concreteType": "Country",
    "kind": "LinkedField",
    "name": "getAllCountries",
    "plural": true,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "continent",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "collapse",
        "storageKey": null
      },
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
    "name": "AdminunitChooseQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminunitChooseQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "b197558c16e59ad66aea8aaf226e015e",
    "id": null,
    "metadata": {},
    "name": "AdminunitChooseQuery",
    "operationKind": "query",
    "text": "query AdminunitChooseQuery(\n  $id: String\n) {\n  getAllCountries(continent: $id) {\n    id\n    name\n    continent\n    collapse\n    adm {\n      id\n      prefix\n      name\n      country {\n        id\n      }\n      province {\n        id\n      }\n      city {\n        id\n      }\n      county {\n        id\n      }\n      town {\n        id\n      }\n    }\n    __typename\n  }\n}\n"
  }
};
})();

(node as any).hash = "612fbea89d76a35a73fe08930700964d";

export default node;
