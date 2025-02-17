/**
 * @generated SignedSource<<51d085b4cac5ecfc0ce4f1ff485a1853>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgreementListItem$data = {
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
  readonly selected: boolean | null | undefined;
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
  readonly " $fragmentType": "AgreementListItem";
};
export type AgreementListItem$key = {
  readonly " $data"?: AgreementListItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgreementListItem">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = [
  (v0/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgreementListItem",
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
      "selections": (v1/*: any*/),
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
          "selections": (v1/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "County",
          "kind": "LinkedField",
          "name": "county",
          "plural": false,
          "selections": (v1/*: any*/),
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
      "selections": (v1/*: any*/),
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
  "type": "Equipment",
  "abstractKey": "__isEquipment"
};
})();

(node as any).hash = "8a1ffb14e9ab7b1b81d34743ae241ff6";

export default node;
