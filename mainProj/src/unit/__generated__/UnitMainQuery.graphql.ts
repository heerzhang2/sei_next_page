/**
 * @generated SignedSource<<bf67b06618eec4d8445cb43ba1a9b3c9>>
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
export type UnitMainQuery$variables = {
  after?: string | null | undefined;
  asc?: boolean | null | undefined;
  first?: number | null | undefined;
  orderBy?: string | null | undefined;
  uwhere?: UnitCommonInput | null | undefined;
};
export type UnitMainQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"UnitList">;
};
export type UnitMainQuery = {
  response: UnitMainQuery$data;
  variables: UnitMainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": true,
  "kind": "LocalArgument",
  "name": "asc"
},
v2 = {
  "defaultValue": 10,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "uwhere"
},
v5 = [
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "no",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "address",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UnitMainQuery",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "UnitMainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
                      (v6/*: any*/),
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
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
                      (v6/*: any*/),
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
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
        "args": (v5/*: any*/),
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
    "cacheID": "310dd99840387fe590e3d6594c404976",
    "id": null,
    "metadata": {},
    "name": "UnitMainQuery",
    "operationKind": "query",
    "text": "query UnitMainQuery(\n  $after: String\n  $first: Int = 10\n  $orderBy: String\n  $asc: Boolean = true\n  $uwhere: UnitCommonInput\n) {\n  ...UnitList\n}\n\nfragment UnitList on Query {\n  getUnitEsFilter(where: $uwhere, after: $after, first: $first, orderBy: $orderBy, asc: $asc) {\n    edges {\n      node {\n        __typename\n        ... on CompanyEs {\n          id\n          name\n          no\n          address\n          linkMen\n        }\n        ... on PersonEs {\n          id\n          name\n          no\n          address\n          phone\n        }\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "32a959b053b42cc625a14516c271ea9e";

export default node;
