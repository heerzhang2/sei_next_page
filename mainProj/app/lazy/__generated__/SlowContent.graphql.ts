/**
 * @generated SignedSource<<dd87ab681e1a7b7ab80205c33148fbd4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SlowContent$data = {
  readonly auth: string | null | undefined;
  readonly " $fragmentType": "SlowContent";
};
export type SlowContent$key = {
  readonly " $data"?: SlowContent$data;
  readonly " $fragmentSpreads": FragmentRefs<"SlowContent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SlowContent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "auth",
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "cda19fc3466a253b2dc74d37f22649db";

export default node;
