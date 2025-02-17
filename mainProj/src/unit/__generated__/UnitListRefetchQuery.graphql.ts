/**
 * @generated SignedSource<<416518990c03c16a9cdbbfd80718115c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UnitCommonInput = {
  address?: string | null | undefined;
  company?: boolean | null | undefined;
  linkMen?: string | null | undefined;
  name?: string | null | undefined;
  no?: string | null | undefined;
  phone?: string | null | undefined;
};
export type UnitListRefetchQuery$variables = {
  after?: string | null | undefined;
  asc?: boolean | null | undefined;
  first?: number | null | undefined;
  orderBy?: string | null | undefined;
  uwhere?: UnitCommonInput | null | undefined;
};
export type UnitListRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"UnitList">;
};
export type UnitListRefetchQuery = {
  response: UnitListRefetchQuery$data;
  variables: UnitListRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "after"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "asc"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderBy"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "uwhere"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "asc",
    "variableName": "asc"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  },
  {
    "kind": "Variable",
    "name": "where",
    "variableName": "uwhere"
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
  "kind": "ScalarField",
  "name": "no",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "address",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UnitListRefetchQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "UnitList"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UnitListRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UnitEsConnection",
        "kind": "LinkedField",
        "name": "getUnitEsFilter",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UnitEsConnectionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
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
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "linkMen",
                        "storageKey": null
                      }
                    ],
                    "type": "CompanyEs",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "phone",
                        "storageKey": null
                      }
                    ],
                    "type": "PersonEs",
                    "abstractKey": null
                  },
                  {
                    "kind": "ClientExtension",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "__id",
                        "storageKey": null
                      }
                    ]
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PageInfo",
            "kind": "LinkedField",
            "name": "pageInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "endCursor",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasNextPage",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "filters": [
          "where",
          "orderBy",
          "asc"
        ],
        "handle": "connection",
        "key": "Query_getUnitEsFilter",
        "kind": "LinkedHandle",
        "name": "getUnitEsFilter"
      }
    ]
  },
  "params": {
    "cacheID": "bcca6d5b900630c4ed8323c42dc39638",
    "id": null,
    "metadata": {},
    "name": "UnitListRefetchQuery",
    "operationKind": "query",
    "text": "query UnitListRefetchQuery(\n  $after: String\n  $asc: Boolean\n  $first: Int\n  $orderBy: String\n  $uwhere: UnitCommonInput\n) {\n  ...UnitList\n}\n\nfragment UnitList on Query {\n  getUnitEsFilter(where: $uwhere, after: $after, first: $first, orderBy: $orderBy, asc: $asc) {\n    edges {\n      node {\n        __typename\n        ... on CompanyEs {\n          id\n          name\n          no\n          address\n          linkMen\n        }\n        ... on PersonEs {\n          id\n          name\n          no\n          address\n          phone\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "50b30a8e3d47589c86611003daf0b50b";

export default node;
