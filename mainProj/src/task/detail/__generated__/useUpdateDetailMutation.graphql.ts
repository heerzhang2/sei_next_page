/**
 * @generated SignedSource<<ae2f49a5cfd93dff54be716b62f39221>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DetailInput = {
  apprp?: boolean | null | undefined;
  captem?: number | null | undefined;
  carbon?: number | null | undefined;
  ccost?: number | null | undefined;
  cheap?: boolean | null | undefined;
  chrion?: number | null | undefined;
  conduc?: number | null | undefined;
  diame?: number | null | undefined;
  dioxy?: number | null | undefined;
  dsolid?: number | null | undefined;
  fcode?: string | null | undefined;
  hardd?: number | null | undefined;
  ident?: string | null | undefined;
  impor?: boolean | null | undefined;
  isum?: number | null | undefined;
  meter?: string | null | undefined;
  mreprc?: number | null | undefined;
  nsite?: boolean | null | undefined;
  ntscop?: boolean | null | undefined;
  num?: number | null | undefined;
  oilw?: number | null | undefined;
  online?: boolean | null | undefined;
  opprn?: number | null | undefined;
  palka?: number | null | undefined;
  phosph?: number | null | undefined;
  phval?: number | null | undefined;
  rebasi?: number | null | undefined;
  rustc?: number | null | undefined;
  sulfit?: number | null | undefined;
  test?: boolean | null | undefined;
  tiron?: number | null | undefined;
  totalk?: number | null | undefined;
  totm?: number | null | undefined;
  turbi?: number | null | undefined;
  varea?: number | null | undefined;
  zmoney?: string | null | undefined;
};
export type useUpdateDetailMutation$variables = {
  id: string;
  inp: DetailInput;
};
export type useUpdateDetailMutation$data = {
  readonly updateDetail: {
    readonly ccost: number | null | undefined;
    readonly fcode: string | null | undefined;
    readonly feeOk: boolean | null | undefined;
    readonly id: string;
    readonly ident: string | null | undefined;
    readonly isp: {
      readonly dev: {
        readonly id: string;
      } | null | undefined;
      readonly id: string;
    } | null | undefined;
    readonly sprice: string | null | undefined;
    readonly totm: number | null | undefined;
    readonly type: string | null | undefined;
    readonly zmoney: string | null | undefined;
  } | null | undefined;
};
export type useUpdateDetailMutation = {
  response: useUpdateDetailMutation$data;
  variables: useUpdateDetailMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "inp"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "inp",
        "variableName": "inp"
      }
    ],
    "concreteType": "Detail",
    "kind": "LinkedField",
    "name": "updateDetail",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ident",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "type",
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
        "name": "sprice",
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
              (v1/*: any*/)
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
        "name": "totm",
        "storageKey": null
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
    "name": "useUpdateDetailMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useUpdateDetailMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "bafdf58dfabd34c517acbb312eca90e7",
    "id": null,
    "metadata": {},
    "name": "useUpdateDetailMutation",
    "operationKind": "mutation",
    "text": "mutation useUpdateDetailMutation(\n  $id: ID!\n  $inp: DetailInput!\n) {\n  updateDetail(id: $id, inp: $inp) {\n    id\n    ident\n    type\n    feeOk\n    sprice\n    isp {\n      id\n      dev {\n        id\n      }\n    }\n    ccost\n    fcode\n    zmoney\n    totm\n  }\n}\n"
  }
};
})();

(node as any).hash = "747e0956468249c23638d658da58b703";

export default node;
