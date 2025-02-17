/**
 * @generated SignedSource<<3170e3b9d881fb11ff858a8258aa72c1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type ProtocolSta_Enum = "CANCEL" | "CHECK" | "END" | "INIT" | "SIGNED" | "SIGNING" | "SUBMIT" | "%future added value";
export type AgreementInput = {
  ad?: string | null | undefined;
  auditor?: string | null | undefined;
  aux?: string | null | undefined;
  bsType?: BusinessCat_Enum | null | undefined;
  charge?: string | null | undefined;
  complDate?: any | null | undefined;
  crman?: string | null | undefined;
  date1?: any | null | undefined;
  date2?: any | null | undefined;
  dep?: string | null | undefined;
  devs?: ReadonlyArray<string | null | undefined> | null | undefined;
  dispatcher?: string | null | undefined;
  entrust?: boolean | null | undefined;
  ispu?: string | null | undefined;
  mdtime?: any | null | undefined;
  mecrman?: boolean | null | undefined;
  office?: string | null | undefined;
  promoter?: string | null | undefined;
  ptno?: string | null | undefined;
  pttype?: string | null | undefined;
  qdate1?: any | null | undefined;
  qdate2?: any | null | undefined;
  reason?: string | null | undefined;
  servu?: string | null | undefined;
  status?: ProtocolSta_Enum | null | undefined;
  statusx?: ReadonlyArray<ProtocolSta_Enum | null | undefined> | null | undefined;
  transferor?: string | null | undefined;
};
export type AgreementMainQuery$variables = {
  after?: string | null | undefined;
  asc?: boolean | null | undefined;
  first?: number | null | undefined;
  orderBy?: string | null | undefined;
  twhere?: AgreementInput | null | undefined;
};
export type AgreementMainQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AgreementList">;
};
export type AgreementMainQuery = {
  response: AgreementMainQuery$data;
  variables: AgreementMainQuery$variables;
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
  "defaultValue": "mdtime",
  "kind": "LocalArgument",
  "name": "orderBy"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "twhere"
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
    "variableName": "twhere"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = [
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = [
  (v8/*: any*/),
  (v6/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Person",
    "kind": "LinkedField",
    "name": "person",
    "plural": false,
    "selections": (v7/*: any*/),
    "storageKey": null
  }
];
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
    "name": "AgreementMainQuery",
    "selections": [
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "AgreementList"
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
    "name": "AgreementMainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "AgreementConnection",
        "kind": "LinkedField",
        "name": "findAgreementFilter",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AgreementConnectionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Agreement",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "ptno",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "pttype",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "bsType",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "entrust",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mdtime",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Unit",
                    "kind": "LinkedField",
                    "name": "servu",
                    "plural": false,
                    "selections": (v7/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "auditor",
                    "plural": false,
                    "selections": (v9/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "crman",
                    "plural": false,
                    "selections": (v9/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "dispatcher",
                    "plural": false,
                    "selections": (v9/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "devs",
                    "plural": true,
                    "selections": [
                      (v8/*: any*/),
                      (v6/*: any*/),
                      {
                        "kind": "TypeDiscriminator",
                        "abstractKey": "__isEquipment"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "type",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "oid",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cod",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "sort",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "vart",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "address",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Village",
                        "kind": "LinkedField",
                        "name": "vlg",
                        "plural": false,
                        "selections": (v7/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Adminunit",
                        "kind": "LinkedField",
                        "name": "ad",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Town",
                            "kind": "LinkedField",
                            "name": "town",
                            "plural": false,
                            "selections": (v7/*: any*/),
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "County",
                            "kind": "LinkedField",
                            "name": "county",
                            "plural": false,
                            "selections": (v7/*: any*/),
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "used",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "titl",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "plno",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "lpho",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Unit",
                        "kind": "LinkedField",
                        "name": "useu",
                        "plural": false,
                        "selections": (v7/*: any*/),
                        "storageKey": null
                      },
                      {
                        "kind": "ClientExtension",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "selected",
                            "storageKey": null
                          }
                        ]
                      }
                    ],
                    "storageKey": null
                  },
                  (v8/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cursor",
                "storageKey": null
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
        "key": "Query__findAgreementFilter",
        "kind": "LinkedHandle",
        "name": "findAgreementFilter"
      }
    ]
  },
  "params": {
    "cacheID": "79eadff759b697e5501a0d983dc214d4",
    "id": null,
    "metadata": {},
    "name": "AgreementMainQuery",
    "operationKind": "query",
    "text": "query AgreementMainQuery(\n  $after: String\n  $first: Int = 10\n  $orderBy: String = \"mdtime\"\n  $asc: Boolean = true\n  $twhere: AgreementInput\n) {\n  ...AgreementList\n}\n\nfragment AgreementBoundDevices on Agreement {\n  devs {\n    __typename\n    id\n    ...AgreementListItem\n  }\n}\n\nfragment AgreementList on Query {\n  findAgreementFilter(where: $twhere, after: $after, first: $first, orderBy: $orderBy, asc: $asc) {\n    edges {\n      node {\n        id\n        ptno\n        status\n        pttype\n        bsType\n        entrust\n        mdtime\n        servu {\n          id\n          name\n        }\n        auditor {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n        crman {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n        dispatcher {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n        ...AgreementBoundDevices\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment AgreementListItem on Equipment {\n  __isEquipment: __typename\n  id\n  type\n  oid\n  cod\n  sort\n  vart\n  address\n  vlg {\n    id\n    name\n  }\n  ad {\n    id\n    town {\n      id\n      name\n    }\n    county {\n      id\n      name\n    }\n  }\n  used\n  titl\n  plno\n  lpho\n  useu {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "fb995e7044da9e58e68ffdeff03f6a79";

export default node;
