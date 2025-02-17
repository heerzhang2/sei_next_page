/**
 * @generated SignedSource<<4b09a154cbb4b8620c8b912acc2c67e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BoundDevices$data = {
  readonly detail_list: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly selected: boolean | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"DeviceListItem">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "BoundDevices";
};
export type BoundDevices$key = {
  readonly " $data"?: BoundDevices$data;
  readonly " $fragmentSpreads": FragmentRefs<"BoundDevices">;
};

const node: ReaderFragment = (function(){
var v0 = [
  "detail_list"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "afterdl"
    },
    {
      "kind": "RootArgument",
      "name": "first"
    },
    {
      "kind": "RootArgument",
      "name": "orderBydl"
    },
    {
      "kind": "RootArgument",
      "name": "wheredl"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "afterdl",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "afterdl"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./BoundDevices_DetlistRefetch.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "BoundDevices",
  "selections": [
    {
      "alias": "detail_list",
      "args": [
        {
          "kind": "Variable",
          "name": "orderBy",
          "variableName": "orderBydl"
        },
        {
          "kind": "Variable",
          "name": "where",
          "variableName": "wheredl"
        }
      ],
      "concreteType": "DetailConnection",
      "kind": "LinkedField",
      "name": "__BoundDevices__detail_list_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "DetailConnectionEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Detail",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "DeviceListItem"
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
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
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
    (v1/*: any*/)
  ],
  "type": "Task",
  "abstractKey": null
};
})();

(node as any).hash = "02cc3ff6c7857c564b23bbef17266d47";

export default node;
