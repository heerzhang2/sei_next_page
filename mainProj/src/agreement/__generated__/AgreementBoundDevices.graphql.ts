/**
 * @generated SignedSource<<7dcf35afc355bee78fc759536da46577>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgreementBoundDevices$data = {
  readonly devs: ReadonlyArray<{
    readonly id: string;
    readonly selected: boolean | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"AgreementListItem">;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "AgreementBoundDevices";
};
export type AgreementBoundDevices$key = {
  readonly " $data"?: AgreementBoundDevices$data;
  readonly " $fragmentSpreads": FragmentRefs<"AgreementBoundDevices">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AgreementBoundDevices",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "devs",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "AgreementListItem"
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
    }
  ],
  "type": "Agreement",
  "abstractKey": null
};

(node as any).hash = "7d53785ebdd6ae651c6df8f0752bfef9";

export default node;
