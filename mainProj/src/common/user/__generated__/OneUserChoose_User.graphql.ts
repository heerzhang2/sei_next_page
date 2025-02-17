/**
 * @generated SignedSource<<8fe9edb94dfde19013b954320bbbfcc5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OneUserChoose_User$data = {
  readonly id: string;
  readonly person: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly username: string;
  readonly " $fragmentType": "OneUserChoose_User";
};
export type OneUserChoose_User$key = {
  readonly " $data"?: OneUserChoose_User$data;
  readonly " $fragmentSpreads": FragmentRefs<"OneUserChoose_User">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OneUserChoose_User",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
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
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

(node as any).hash = "71bb3ca83892075ea6106f2d33f4a4d3";

export default node;
