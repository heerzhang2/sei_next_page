/**
 * @generated SignedSource<<2cdf16544f214ff4c301f843aa93be57>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type Procedure_Enum = "APPR" | "BEGIN" | "CANCEL" | "CHECK" | "END" | "MAKE" | "OFFER" | "SIGN" | "WAITREDO" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type DeviceListItem$data = {
  readonly feeOk: boolean | null | undefined;
  readonly id: string;
  readonly ident: string | null | undefined;
  readonly isp: {
    readonly dev: {
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
      readonly used: string | null | undefined;
      readonly vart: string;
      readonly vlg: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined;
    readonly id: string;
    readonly report: {
      readonly id: string;
      readonly stm: {
        readonly id: string;
        readonly sta: Procedure_Enum;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
  readonly selected: boolean | null | undefined;
  readonly sprice: string | null | undefined;
  readonly task: {
    readonly id: string;
    readonly status: string | null | undefined;
  } | null | undefined;
  readonly type: string | null | undefined;
  readonly " $fragmentType": "DeviceListItem";
};
export type DeviceListItem$key = {
  readonly " $data"?: DeviceListItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeviceListItem">;
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
  "name": "DeviceListItem",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ident",
      "storageKey": null
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
      "name": "feeOk",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "sprice",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Task",
      "kind": "LinkedField",
      "name": "task",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "status",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Isp",
      "kind": "LinkedField",
      "name": "isp",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Eqp",
          "kind": "LinkedField",
          "name": "dev",
          "plural": false,
          "selections": [
            (v0/*: any*/),
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
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "report",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ApprovalStm",
              "kind": "LinkedField",
              "name": "stm",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "sta",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
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
  "type": "Detail",
  "abstractKey": null
};
})();

(node as any).hash = "a1c532eab7898e987ceb9afb44acfcae";

export default node;
