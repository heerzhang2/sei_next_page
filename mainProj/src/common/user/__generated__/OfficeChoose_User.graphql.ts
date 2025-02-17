/**
 * @generated SignedSource<<8a1011efe1df0b228ea182b0485631bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OfficeChoose_User$data = {
  readonly id: string;
  readonly person: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly username: string;
  readonly " $fragmentType": "OfficeChoose_User";
};
export type OfficeChoose_User$key = {
  readonly " $data"?: OfficeChoose_User$data;
  readonly " $fragmentSpreads": FragmentRefs<"OfficeChoose_User">;
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
  "name": "OfficeChoose_User",
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

(node as any).hash = "e6417186ffab14858aa3faffa306123e";

export default node;
