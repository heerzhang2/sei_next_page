/**
 * @generated SignedSource<<5463765ecd40ec4983aeb1ca853f74fe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BusinessCat_Enum = "ANNUAL" | "DELIVERY" | "ESTIMATE" | "EXPERIMENT" | "FIRST" | "IDENTIFIC" | "INSTA" | "MANUFACT" | "OTHER" | "PRESSURE" | "PRODUCT" | "REFORM" | "REGUL" | "REPAIR" | "SAFETYINS" | "TEST" | "THERMAL" | "TYPETST" | "%future added value";
export type Ifop_Enu = "ADD" | "DEL" | "UPD" | "%future added value";
export type ProtocolSta_Enum = "CANCEL" | "CHECK" | "END" | "INIT" | "SIGNED" | "SIGNING" | "SUBMIT" | "%future added value";
export type AgreementInput = {
  ad?: string | null | undefined;
  auditor?: string | null | undefined;
  aux?: string | null | undefined;
  bsType?: BusinessCat_Enum | null | undefined;
  charge?: string | null | undefined;
  complDate?: any | null | undefined;
  crman?: string | null | undefined;
  date1?: any | null | undefined;
  date2?: any | null | undefined;
  dep?: string | null | undefined;
  devs?: ReadonlyArray<string | null | undefined> | null | undefined;
  dispatcher?: string | null | undefined;
  entrust?: boolean | null | undefined;
  ispu?: string | null | undefined;
  mdtime?: any | null | undefined;
  mecrman?: boolean | null | undefined;
  office?: string | null | undefined;
  promoter?: string | null | undefined;
  ptno?: string | null | undefined;
  pttype?: string | null | undefined;
  qdate1?: any | null | undefined;
  qdate2?: any | null | undefined;
  reason?: string | null | undefined;
  servu?: string | null | undefined;
  status?: ProtocolSta_Enum | null | undefined;
  statusx?: ReadonlyArray<ProtocolSta_Enum | null | undefined> | null | undefined;
  transferor?: string | null | undefined;
};
export type useBuildAgreementMutation$variables = {
  id?: string | null | undefined;
  inp: AgreementInput;
  opt: Ifop_Enu;
};
export type useBuildAgreementMutation$data = {
  readonly cudAgreement: {
    readonly me: {
      readonly auditor: {
        readonly id: string;
        readonly username: string;
      } | null | undefined;
      readonly bsType: BusinessCat_Enum | null | undefined;
      readonly entrust: boolean | null | undefined;
      readonly id: string;
      readonly servu: {
        readonly company: {
          readonly id: string;
        } | null | undefined;
        readonly id: string;
        readonly name: string | null | undefined;
      } | null | undefined;
      readonly status: string | null | undefined;
    } | null | undefined;
    readonly warn: string | null | undefined;
  };
};
export type useBuildAgreementMutation = {
  response: useBuildAgreementMutation$data;
  variables: useBuildAgreementMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inp"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "opt"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "inp",
    "variableName": "inp"
  },
  {
    "kind": "Variable",
    "name": "opt",
    "variableName": "opt"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "warn",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "username",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "Unit",
  "kind": "LinkedField",
  "name": "servu",
  "plural": false,
  "selections": [
    (v5/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Company",
      "kind": "LinkedField",
      "name": "company",
      "plural": false,
      "selections": [
        (v5/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bsType",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entrust",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useBuildAgreementMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "AgreementCudResp",
        "kind": "LinkedField",
        "name": "cudAgreement",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Agreement",
            "kind": "LinkedField",
            "name": "me",
            "plural": false,
            "selections": [
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "auditor",
                "plural": false,
                "selections": [
                  (v5/*: any*/),
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useBuildAgreementMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "AgreementCudResp",
        "kind": "LinkedField",
        "name": "cudAgreement",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Agreement",
            "kind": "LinkedField",
            "name": "me",
            "plural": false,
            "selections": [
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "auditor",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "__typename",
                    "storageKey": null
                  },
                  (v5/*: any*/),
                  (v6/*: any*/)
                ],
                "storageKey": null
              },
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "62a63655501892f333392de322722a34",
    "id": null,
    "metadata": {},
    "name": "useBuildAgreementMutation",
    "operationKind": "mutation",
    "text": "mutation useBuildAgreementMutation(\n  $id: ID\n  $opt: Ifop_Enu!\n  $inp: AgreementInput!\n) {\n  cudAgreement(id: $id, opt: $opt, inp: $inp) {\n    warn\n    me {\n      id\n      auditor {\n        __typename\n        id\n        username\n      }\n      servu {\n        id\n        name\n        company {\n          id\n        }\n      }\n      bsType\n      entrust\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "80ee7103c535df939e91dcd8a2b4658f";

export default node;
