/**
 * @generated SignedSource<<5debada9fc128106fcf664201e3ab4d9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FeesListItem$data = {
  readonly amount: string | null | undefined;
  readonly code: string | null | undefined;
  readonly detail: {
    readonly id: string;
    readonly task: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
  readonly fm: number | null | undefined;
  readonly id: string;
  readonly manual: boolean | null | undefined;
  readonly memo: string | null | undefined;
  readonly mnum: string | null | undefined;
  readonly pipus: ReadonlyArray<{
    readonly code: string;
    readonly id: string;
    readonly leng: number | null | undefined;
    readonly rno: string | null | undefined;
  }> | null | undefined;
  readonly " $fragmentType": "FeesListItem";
};
export type FeesListItem$key = {
  readonly " $data"?: FeesListItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"FeesListItem">;
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
  "name": "code",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FeesListItem",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "manual",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "amount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fm",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mnum",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PipingUnit",
      "kind": "LinkedField",
      "name": "pipus",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "rno",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "leng",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Detail",
      "kind": "LinkedField",
      "name": "detail",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "Task",
          "kind": "LinkedField",
          "name": "task",
          "plural": false,
          "selections": [
            (v0/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "memo",
      "storageKey": null
    }
  ],
  "type": "Charging",
  "abstractKey": null
};
})();

(node as any).hash = "214226bf193c20eae3ff19794ea82c9d";

export default node;
