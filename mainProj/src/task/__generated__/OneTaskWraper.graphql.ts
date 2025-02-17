/**
 * @generated SignedSource<<27b8aa1c7863e9b668ba32ef3d582169>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type OneTaskWraper$data = {
  readonly node: {
    readonly __typename: string;
    readonly agreement?: {
      readonly id: string;
      readonly pttype: string | null | undefined;
    } | null | undefined;
    readonly bsType?: BusinessCat_Enum | null | undefined;
    readonly charge?: string | null | undefined;
    readonly crman?: {
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined;
    readonly date?: string | null | undefined;
    readonly dep?: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly detail_list?: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly isp: {
            readonly dev: {
              readonly id: string;
              readonly sort: string;
              readonly subv: string | null | undefined;
              readonly type: string;
              readonly vart: string;
            } | null | undefined;
            readonly id: string;
            readonly no: string | null | undefined;
          } | null | undefined;
          readonly type: string | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
    readonly entrust?: boolean | null | undefined;
    readonly eqpcnt?: number | null | undefined;
    readonly feeOk?: boolean | null | undefined;
    readonly id: string;
    readonly liabler?: {
      readonly dep: {
        readonly id: string;
      } | null | undefined;
      readonly id: string;
      readonly office: {
        readonly id: string;
      } | null | undefined;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
    } | null | undefined;
    readonly office?: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly servu?: {
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly status?: string | null | undefined;
    readonly typicstm?: {
      readonly approver: {
        readonly dep: {
          readonly id: string;
        } | null | undefined;
        readonly id: string;
        readonly office: {
          readonly id: string;
        } | null | undefined;
        readonly person: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
      } | null | undefined;
      readonly authr: ReadonlyArray<{
        readonly dep: {
          readonly id: string;
        } | null | undefined;
        readonly id: string;
        readonly office: {
          readonly id: string;
        } | null | undefined;
        readonly person: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
      } | null | undefined> | null | undefined;
      readonly id: string;
      readonly master: {
        readonly dep: {
          readonly id: string;
        } | null | undefined;
        readonly id: string;
        readonly office: {
          readonly id: string;
        } | null | undefined;
        readonly person: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
      } | null | undefined;
      readonly reviewer: {
        readonly dep: {
          readonly id: string;
        } | null | undefined;
        readonly id: string;
        readonly office: {
          readonly id: string;
        } | null | undefined;
        readonly person: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
      } | null | undefined;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"BoundDevices">;
  } | null | undefined;
  readonly " $fragmentType": "OneTaskWraper";
};
export type OneTaskWraper$key = {
  readonly " $data"?: OneTaskWraper$data;
  readonly " $fragmentSpreads": FragmentRefs<"OneTaskWraper">;
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
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "Person",
  "kind": "LinkedField",
  "name": "person",
  "plural": false,
  "selections": (v1/*: any*/),
  "storageKey": null
},
v3 = [
  (v0/*: any*/)
],
v4 = [
  (v0/*: any*/),
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": "Division",
    "kind": "LinkedField",
    "name": "dep",
    "plural": false,
    "selections": (v3/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "Office",
    "kind": "LinkedField",
    "name": "office",
    "plural": false,
    "selections": (v3/*: any*/),
    "storageKey": null
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
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
      "name": "taskId"
    },
    {
      "kind": "RootArgument",
      "name": "wheredl"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": require('./OneTaskWraperRefetchQuery.graphql')
    }
  },
  "name": "OneTaskWraper",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "taskId"
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
              "name": "feeOk",
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
              "concreteType": null,
              "kind": "LinkedField",
              "name": "crman",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                (v2/*: any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "liabler",
              "plural": false,
              "selections": (v4/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "ApprovalStm",
              "kind": "LinkedField",
              "name": "typicstm",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "master",
                  "plural": false,
                  "selections": (v4/*: any*/),
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "reviewer",
                  "plural": false,
                  "selections": (v4/*: any*/),
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "approver",
                  "plural": false,
                  "selections": (v4/*: any*/),
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "authr",
                  "plural": true,
                  "selections": (v4/*: any*/),
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Office",
              "kind": "LinkedField",
              "name": "office",
              "plural": false,
              "selections": (v1/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Division",
              "kind": "LinkedField",
              "name": "dep",
              "plural": false,
              "selections": (v1/*: any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Unit",
              "kind": "LinkedField",
              "name": "servu",
              "plural": false,
              "selections": (v1/*: any*/),
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
              "alias": null,
              "args": [
                {
                  "kind": "Variable",
                  "name": "after",
                  "variableName": "afterdl"
                },
                {
                  "kind": "Variable",
                  "name": "first",
                  "variableName": "first"
                },
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
              "name": "detail_list",
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
                        (v0/*: any*/),
                        (v5/*: any*/),
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
                              "kind": "ScalarField",
                              "name": "no",
                              "storageKey": null
                            },
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "Eqp",
                              "kind": "LinkedField",
                              "name": "dev",
                              "plural": false,
                              "selections": [
                                (v0/*: any*/),
                                (v5/*: any*/),
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
                                  "name": "subv",
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
              "concreteType": "Agreement",
              "kind": "LinkedField",
              "name": "agreement",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "pttype",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "Task",
          "abstractKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "BoundDevices"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};
})();

(node as any).hash = "0c64718e1612481ceefa043fc8460fbc";

export default node;
