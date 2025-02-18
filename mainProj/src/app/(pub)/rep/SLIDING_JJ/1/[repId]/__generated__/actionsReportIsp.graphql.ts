/**
 * @generated SignedSource<<41cd9d6156709a2996bc01263da4372b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type Procedure_Enum = "APPR" | "BEGIN" | "CANCEL" | "CHECK" | "END" | "MAKE" | "OFFER" | "SIGN" | "WAITREDO" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type actionsReportIsp$data = {
  readonly id: string;
  readonly isp: {
    readonly bsType: BusinessCat_Enum | null | undefined;
    readonly bus: {
      readonly id: string;
      readonly pipus: ReadonlyArray<{
        readonly code: string;
        readonly crDate: string | null | undefined;
        readonly id: string;
        readonly lay: string | null | undefined;
        readonly leng: number | null | undefined;
        readonly level: string | null | undefined;
        readonly name: string | null | undefined;
        readonly nxtd1: string | null | undefined;
        readonly nxtd2: string | null | undefined;
        readonly pa: string | null | undefined;
        readonly rno: string | null | undefined;
        readonly safe: string | null | undefined;
        readonly start: string | null | undefined;
        readonly stop: string | null | undefined;
        readonly svp: string | null | undefined;
      }> | null | undefined;
    } | null | undefined;
    readonly checkMen: {
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly username: string;
    } | null | undefined;
    readonly dev: {
      readonly cod: string | null | undefined;
      readonly id: string;
    } | null | undefined;
    readonly id: string;
    readonly ispMen: ReadonlyArray<{
      readonly id: string;
      readonly person: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly username: string;
    } | null | undefined> | null | undefined;
    readonly ispu: {
      readonly agency: {
        readonly apno: string | null | undefined;
        readonly bjtel: string | null | undefined;
        readonly bjurl: string | null | undefined;
        readonly id: string;
      } | null | undefined;
      readonly id: string;
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly no: string | null | undefined;
    readonly report: {
      readonly id: string;
    } | null | undefined;
    readonly reps: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly data: string | null | undefined;
          readonly id: string;
          readonly modeltype: string | null | undefined;
          readonly modelversion: number | null | undefined;
          readonly stm: {
            readonly authr: ReadonlyArray<{
              readonly id: string;
              readonly person: {
                readonly id: string;
                readonly name: string;
              } | null | undefined;
              readonly username: string;
            } | null | undefined> | null | undefined;
            readonly id: string;
            readonly reviewer: {
              readonly id: string;
              readonly person: {
                readonly id: string;
                readonly name: string;
              } | null | undefined;
              readonly username: string;
            } | null | undefined;
            readonly sta: Procedure_Enum;
          } | null | undefined;
        } | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | null | undefined;
  readonly modeltype: string | null | undefined;
  readonly modelversion: number | null | undefined;
  readonly tzFields: ReadonlyArray<string> | null | undefined;
  readonly " $fragmentType": "actionsReportIsp";
};
export type actionsReportIsp$key = {
  readonly " $data"?: actionsReportIsp$data;
  readonly " $fragmentSpreads": FragmentRefs<"actionsReportIsp">;
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
  "name": "modeltype",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "modelversion",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = [
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
      (v3/*: any*/)
    ],
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "actionsReportIsp",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "tzFields",
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
          "kind": "ScalarField",
          "name": "no",
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
            (v0/*: any*/)
          ],
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
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cod",
              "storageKey": null
            }
          ],
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
          "concreteType": "SimpleReportConnection",
          "kind": "LinkedField",
          "name": "reps",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "SimpleReportConnectionEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    (v0/*: any*/),
                    (v1/*: any*/),
                    (v2/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "data",
                      "storageKey": null
                    },
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
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "ispMen",
          "plural": true,
          "selections": (v4/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "checkMen",
          "plural": false,
          "selections": (v4/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Unit",
          "kind": "LinkedField",
          "name": "ispu",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "IspAgency",
              "kind": "LinkedField",
              "name": "agency",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "apno",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "bjtel",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "bjurl",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            (v3/*: any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Detail",
          "kind": "LinkedField",
          "name": "bus",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "PipingUnit",
              "kind": "LinkedField",
              "name": "pipus",
              "plural": true,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "crDate",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "code",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "rno",
                  "storageKey": null
                },
                (v3/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "start",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "stop",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "nxtd1",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "nxtd2",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "leng",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "level",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "lay",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "safe",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "svp",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "pa",
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
  "type": "Report",
  "abstractKey": null
};
})();

(node as any).hash = "6850b6654d35b3c0162b162ca58c1580";

export default node;
