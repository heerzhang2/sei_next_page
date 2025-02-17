/**
 * @generated SignedSource<<bdb2189b3effbde0d55ac74b13a051e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type TaskList$data = {
  readonly findAllTaskFilter: {
    readonly edges: ReadonlyArray<{
      readonly __id: string;
      readonly node: {
        readonly bsType: BusinessCat_Enum | null | undefined;
        readonly date: string | null | undefined;
        readonly dep: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly entrust: boolean | null | undefined;
        readonly eqpcnt: number | null | undefined;
        readonly id: string;
        readonly liabler: {
          readonly id: string;
          readonly person: {
            readonly id: string;
            readonly name: string;
          } | null | undefined;
        } | null | undefined;
        readonly office: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly servu: {
          readonly id: string;
          readonly name: string | null | undefined;
        } | null | undefined;
        readonly status: string | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"BoundDevices">;
      } | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "TaskList";
};
export type TaskList$key = {
  readonly " $data"?: TaskList$data;
  readonly " $fragmentSpreads": FragmentRefs<"TaskList">;
};

const node: ReaderFragment = (function(){
var v0 = [
  "findAllTaskFilter"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "after"
    },
    {
      "kind": "RootArgument",
      "name": "afterdl"
    },
    {
      "kind": "RootArgument",
      "name": "asc"
    },
    {
      "kind": "RootArgument",
      "name": "first"
    },
    {
      "kind": "RootArgument",
      "name": "orderBy"
    },
    {
      "kind": "RootArgument",
      "name": "orderBydl"
    },
    {
      "kind": "RootArgument",
      "name": "twhere"
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
        "cursor": "after",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [],
      "operation": require('./TaskListRefetchQuery.graphql')
    }
  },
  "name": "TaskList",
  "selections": [
    {
      "alias": "findAllTaskFilter",
      "args": [
        {
          "kind": "Variable",
          "name": "asc",
          "variableName": "asc"
        },
        {
          "kind": "Variable",
          "name": "orderBy",
          "variableName": "orderBy"
        },
        {
          "kind": "Variable",
          "name": "where",
          "variableName": "twhere"
        }
      ],
      "concreteType": "TaskConnection",
      "kind": "LinkedField",
      "name": "__Query_findAllTaskFilter_connection",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "TaskConnectionEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "Task",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*: any*/),
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
                  "kind": "ScalarField",
                  "name": "date",
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
                  "kind": "ScalarField",
                  "name": "bsType",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "entrust",
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
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "liabler",
                  "plural": false,
                  "selections": [
                    (v1/*: any*/),
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
                  "name": "eqpcnt",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "BoundDevices"
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
            },
            {
              "kind": "ClientExtension",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__id",
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
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "1118d9f6dd12bfadb6841d4e8751fa4d";

export default node;
