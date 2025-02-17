/**
 * @generated SignedSource<<7e67cf2f146720f4469d7a61515650e8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OneAgreementMain$data = {
  readonly node: {
    readonly __typename: string;
    readonly aux?: string | null | undefined;
    readonly bsType?: BusinessCat_Enum | null | undefined;
    readonly charge?: string | null | undefined;
    readonly complDate?: string | null | undefined;
    readonly crman?: {
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined;
    readonly devs?: ReadonlyArray<{
      readonly ad: {
        readonly county: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly id: string;
        readonly town: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
      } | null | undefined;
      readonly address: string | null | undefined;
      readonly cod: string | null | undefined;
      readonly id: string;
      readonly lpho: string | null | undefined;
      readonly oid: string | null | undefined;
      readonly plno: string | null | undefined;
      readonly sort: string;
      readonly titl: string | null | undefined;
      readonly type: string;
      readonly used: string | null | undefined;
      readonly useu: {
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
      readonly vart: string;
      readonly vlg: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined> | null | undefined;
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
        readonly phone: string | null | undefined;
      } | null | undefined;
    } | null | undefined;
    readonly id: string;
    readonly ispu?: {
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly mdtime?: string | null | undefined;
    readonly ptno?: string | null | undefined;
    readonly pttype?: string | null | undefined;
    readonly servu?: {
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly status?: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"AgreementBoundDevices">;
  } | null | undefined;
  readonly " $fragmentType": "OneAgreementMain";
};
export type OneAgreementMain$key = {
  readonly " $data"?: OneAgreementMain$data;
  readonly " $fragmentSpreads": FragmentRefs<"OneAgreementMain">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v0/*: any*/),
  (v1/*: any*/)
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "modId"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": require('./OneAgreementMainRefetchQuery.graphql')
    }
  },
  "name": "OneAgreementMain",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "modId"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "node",
      "plural": false,
      "selections": [
        (v0/*: any*/),
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
              "concreteType": "Unit",
              "kind": "LinkedField",
              "name": "servu",
              "plural": false,
              "selections": (v2/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Unit",
              "kind": "LinkedField",
              "name": "ispu",
              "plural": false,
              "selections": (v2/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "dispatcher",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Division",
                  "kind": "LinkedField",
                  "name": "dep",
                  "plural": false,
                  "selections": (v2/*: any*/),
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Office",
                  "kind": "LinkedField",
                  "name": "office",
                  "plural": false,
                  "selections": (v2/*: any*/),
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Person",
                  "kind": "LinkedField",
                  "name": "person",
                  "plural": false,
                  "selections": [
                    (v0/*: any*/),
                    (v1/*: any*/),
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
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Person",
                  "kind": "LinkedField",
                  "name": "person",
                  "plural": false,
                  "selections": (v2/*: any*/),
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "complDate",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "aux",
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
              "concreteType": null,
              "kind": "LinkedField",
              "name": "devs",
              "plural": true,
              "selections": [
                (v0/*: any*/),
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
                  "selections": (v2/*: any*/),
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
                    (v0/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "Town",
                      "kind": "LinkedField",
                      "name": "town",
                      "plural": false,
                      "selections": (v2/*: any*/),
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": "County",
                      "kind": "LinkedField",
                      "name": "county",
                      "plural": false,
                      "selections": (v2/*: any*/),
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
                  "selections": (v2/*: any*/),
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
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
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "eda457952d50d57b4f180abb2aa3072e";

export default node;
