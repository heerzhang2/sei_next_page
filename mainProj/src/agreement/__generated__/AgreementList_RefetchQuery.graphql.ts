/**
 * @generated SignedSource<<20406c3198b880943bf433190593bf95>>
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
export type AgreementList_RefetchQuery$variables = {
  after?: string | null | undefined;
  asc?: boolean | null | undefined;
  first?: number | null | undefined;
  orderBy?: string | null | undefined;
  twhere?: AgreementInput | null | undefined;
};
export type AgreementList_RefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"AgreementList">;
};
export type AgreementList_RefetchQuery = {
  response: AgreementList_RefetchQuery$data;
  variables: AgreementList_RefetchQuery$variables;
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
    "name": "twhere"
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
    "variableName": "twhere"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v5 = [
  (v4/*: any*/),
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Person",
    "kind": "LinkedField",
    "name": "person",
    "plural": false,
    "selections": (v3/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AgreementList_RefetchQuery",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AgreementList_RefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
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
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "auditor",
                    "plural": false,
                    "selections": (v5/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "crman",
                    "plural": false,
                    "selections": (v5/*: any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "dispatcher",
                    "plural": false,
                    "selections": (v5/*: any*/),
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
                      (v4/*: any*/),
                      (v2/*: any*/),
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
                        "selections": (v3/*: any*/),
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
                          (v2/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Town",
                            "kind": "LinkedField",
                            "name": "town",
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
                        "selections": (v3/*: any*/),
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
                  (v4/*: any*/)
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
        "args": (v1/*: any*/),
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
    "cacheID": "717da8c2dea8569e9d908ead17b8fecf",
    "id": null,
    "metadata": {},
    "name": "AgreementList_RefetchQuery",
    "operationKind": "query",
    "text": "query AgreementList_RefetchQuery(\n  $after: String\n  $asc: Boolean\n  $first: Int\n  $orderBy: String\n  $twhere: AgreementInput\n) {\n  ...AgreementList\n}\n\nfragment AgreementBoundDevices on Agreement {\n  devs {\n    __typename\n    id\n    ...AgreementListItem\n  }\n}\n\nfragment AgreementList on Query {\n  findAgreementFilter(where: $twhere, after: $after, first: $first, orderBy: $orderBy, asc: $asc) {\n    edges {\n      node {\n        id\n        ptno\n        status\n        pttype\n        bsType\n        entrust\n        mdtime\n        servu {\n          id\n          name\n        }\n        auditor {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n        crman {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n        dispatcher {\n          __typename\n          id\n          person {\n            id\n            name\n          }\n        }\n        ...AgreementBoundDevices\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment AgreementListItem on Equipment {\n  __isEquipment: __typename\n  id\n  type\n  oid\n  cod\n  sort\n  vart\n  address\n  vlg {\n    id\n    name\n  }\n  ad {\n    id\n    town {\n      id\n      name\n    }\n    county {\n      id\n      name\n    }\n  }\n  used\n  titl\n  plno\n  lpho\n  useu {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "76f9d70fef51ee29ebd4354c85b15640";

export default node;
