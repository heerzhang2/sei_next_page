/**
 * @generated SignedSource<<12939b8ae93f9f1edcc32fcb375e1fbc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type DetailConfigQuery$variables = {
  detId: string;
};
export type DetailConfigQuery$data = {
  readonly node: {
    readonly __typename: string;
    readonly apprp?: boolean | null | undefined;
    readonly captem?: number | null | undefined;
    readonly carbon?: number | null | undefined;
    readonly ccost?: number | null | undefined;
    readonly cheap?: boolean | null | undefined;
    readonly chrion?: number | null | undefined;
    readonly conduc?: number | null | undefined;
    readonly diame?: number | null | undefined;
    readonly dioxy?: number | null | undefined;
    readonly dsolid?: number | null | undefined;
    readonly fcode?: string | null | undefined;
    readonly feeOk?: boolean | null | undefined;
    readonly hardd?: number | null | undefined;
    readonly id: string;
    readonly ident?: string | null | undefined;
    readonly impor?: boolean | null | undefined;
    readonly isp?: {
      readonly bsType: BusinessCat_Enum | null | undefined;
      readonly dev: {
        readonly id: string;
        readonly type: string;
      } | null | undefined;
      readonly id: string;
    } | null | undefined;
    readonly isum?: number | null | undefined;
    readonly meter?: string | null | undefined;
    readonly mreprc?: number | null | undefined;
    readonly nsite?: boolean | null | undefined;
    readonly ntscop?: boolean | null | undefined;
    readonly num?: number | null | undefined;
    readonly oilw?: number | null | undefined;
    readonly online?: boolean | null | undefined;
    readonly opprn?: number | null | undefined;
    readonly palka?: number | null | undefined;
    readonly phosph?: number | null | undefined;
    readonly phval?: number | null | undefined;
    readonly rebasi?: number | null | undefined;
    readonly recnt?: number | null | undefined;
    readonly rustc?: number | null | undefined;
    readonly sprice?: string | null | undefined;
    readonly sulfit?: number | null | undefined;
    readonly test?: boolean | null | undefined;
    readonly tiron?: number | null | undefined;
    readonly totalk?: number | null | undefined;
    readonly totm?: number | null | undefined;
    readonly turbi?: number | null | undefined;
    readonly type?: string | null | undefined;
    readonly varea?: number | null | undefined;
    readonly zmoney?: string | null | undefined;
  } | null | undefined;
};
export type DetailConfigQuery = {
  response: DetailConfigQuery$data;
  variables: DetailConfigQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "detId"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "detId"
      }
    ],
    "concreteType": null,
    "kind": "LinkedField",
    "name": "node",
    "plural": false,
    "selections": [
      (v1/*: any*/),
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
            "name": "ident",
            "storageKey": null
          },
          (v2/*: any*/),
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
            "kind": "ScalarField",
            "name": "recnt",
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
              (v1/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Eqp",
                "kind": "LinkedField",
                "name": "dev",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bsType",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ccost",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "fcode",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "zmoney",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "mreprc",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "nsite",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "test",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cheap",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "apprp",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "online",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "impor",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ntscop",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "varea",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "opprn",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totm",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "diame",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "rustc",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "turbi",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hardd",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "phval",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "conduc",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "palka",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "totalk",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dsolid",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "phosph",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "oilw",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "tiron",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "sulfit",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "rebasi",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "chrion",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dioxy",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "carbon",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "captem",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "num",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "isum",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "meter",
            "storageKey": null
          }
        ],
        "type": "Detail",
        "abstractKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DetailConfigQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DetailConfigQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "714b715a7b0bc71146ef6caae8b9af86",
    "id": null,
    "metadata": {},
    "name": "DetailConfigQuery",
    "operationKind": "query",
    "text": "query DetailConfigQuery(\n  $detId: ID!\n) {\n  node(id: $detId) {\n    id\n    __typename\n    ... on Detail {\n      id\n      ident\n      type\n      feeOk\n      sprice\n      recnt\n      isp {\n        id\n        dev {\n          id\n          type\n        }\n        bsType\n      }\n      ccost\n      fcode\n      zmoney\n      mreprc\n      nsite\n      test\n      cheap\n      apprp\n      online\n      impor\n      ntscop\n      varea\n      opprn\n      totm\n      diame\n      rustc\n      turbi\n      hardd\n      phval\n      conduc\n      palka\n      totalk\n      dsolid\n      phosph\n      oilw\n      tiron\n      sulfit\n      rebasi\n      chrion\n      dioxy\n      carbon\n      captem\n      num\n      isum\n      meter\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6239f4b61eb33e176070e94743f01a9c";

export default node;
