/**
 * @generated SignedSource<<3a51c911d3b974f633cfd6edfcb7300b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OneAgreementMainQuery$variables = {
  modId: string;
};
export type OneAgreementMainQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly aux?: string | null | undefined;
    readonly complDate?: string | null | undefined;
    readonly crman?: {
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined;
    readonly dispatcher?: {
      readonly dep: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly id: string;
      readonly office: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined;
    readonly id: string;
    readonly ispu?: {
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly ptno?: string | null | undefined;
    readonly pttype?: string | null | undefined;
    readonly servu?: {
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly status?: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"AgreementBoundDevices">;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"OneAgreementMain">;
};
export type OneAgreementMainQuery = {
  response: OneAgreementMainQuery$data;
  variables: OneAgreementMainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "modId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "modId"
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
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ptno",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = [
  (v2/*: any*/),
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "servu",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "ispu",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "Division",
  "kind": "LinkedField",
  "name": "dep",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "concreteType": "Office",
  "kind": "LinkedField",
  "name": "office",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "Person",
  "kind": "LinkedField",
  "name": "person",
  "plural": false,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "complDate",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "aux",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pttype",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "OneAgreementMainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "dispatcher",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "crman",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v12/*: any*/)
                ],
                "storageKey": null
              },
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "AgreementBoundDevices"
              }
            ],
            "type": "Agreement",
            "abstractKey": null
          }
        ],
        "storageKey": null
      },
      {
        "args": null,
        "kind": "FragmentSpread",
        "name": "OneAgreementMain"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "OneAgreementMainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "dispatcher",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v2/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Person",
                    "kind": "LinkedField",
                    "name": "person",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v6/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "phone",
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
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "crman",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v2/*: any*/),
                  (v12/*: any*/)
                ],
                "storageKey": null
              },
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "devs",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
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
                      (v2/*: any*/),
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
                "name": "charge",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mdtime",
                "storageKey": null
              }
            ],
            "type": "Agreement",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fa042a567423db74100c6cc5d806522a",
    "id": null,
    "metadata": {},
    "name": "OneAgreementMainQuery",
    "operationKind": "query",
    "text": "query OneAgreementMainQuery(\n  $modId: ID!\n) {\n  node(id: $modId) {\n    id\n    __typename\n    ... on Agreement {\n      id\n      ptno\n      status\n      servu {\n        id\n        name\n      }\n      ispu {\n        id\n        name\n      }\n      dispatcher {\n        __typename\n        id\n        dep {\n          id\n          name\n        }\n        office {\n          id\n          name\n        }\n        person {\n          id\n          name\n        }\n      }\n      crman {\n        __typename\n        id\n        person {\n          id\n          name\n        }\n      }\n      complDate\n      aux\n      pttype\n      ...AgreementBoundDevices\n    }\n  }\n  ...OneAgreementMain\n}\n\nfragment AgreementBoundDevices on Agreement {\n  devs {\n    __typename\n    id\n    ...AgreementListItem\n  }\n}\n\nfragment AgreementListItem on Equipment {\n  __isEquipment: __typename\n  id\n  type\n  oid\n  cod\n  sort\n  vart\n  address\n  vlg {\n    id\n    name\n  }\n  ad {\n    id\n    town {\n      id\n      name\n    }\n    county {\n      id\n      name\n    }\n  }\n  used\n  titl\n  plno\n  lpho\n  useu {\n    id\n    name\n  }\n}\n\nfragment OneAgreementMain on Query {\n  node(id: $modId) {\n    id\n    __typename\n    ... on Agreement {\n      id\n      ptno\n      status\n      servu {\n        id\n        name\n      }\n      ispu {\n        id\n        name\n      }\n      dispatcher {\n        __typename\n        id\n        dep {\n          id\n          name\n        }\n        office {\n          id\n          name\n        }\n        person {\n          id\n          name\n          phone\n        }\n      }\n      crman {\n        __typename\n        id\n        person {\n          id\n          name\n        }\n      }\n      complDate\n      aux\n      bsType\n      charge\n      mdtime\n      pttype\n      devs {\n        __typename\n        id\n        type\n        oid\n        cod\n        sort\n        vart\n        address\n        vlg {\n          id\n          name\n        }\n        ad {\n          id\n          town {\n            id\n            name\n          }\n          county {\n            id\n            name\n          }\n        }\n        used\n        titl\n        plno\n        lpho\n        useu {\n          id\n          name\n        }\n      }\n      ...AgreementBoundDevices\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8047430d74d244fa5bfaf1a95bb21a85";

export default node;
