/**
 * @generated SignedSource<<6c221bd6e5fcf8faa11b9afe8d5c5f7f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type pagegetReportQuery$variables = {
  id: string;
};
export type pagegetReportQuery$data = {
  readonly getReport: {
    readonly data: string | null | undefined;
    readonly id: string;
    readonly isp: {
      readonly id: string;
      readonly no: string | null | undefined;
    } | null | undefined;
    readonly modeltype: string | null | undefined;
    readonly modelversion: number | null | undefined;
    readonly snapshot: string | null | undefined;
  } | null | undefined;
};
export type pagegetReportQuery = {
  response: pagegetReportQuery$data;
  variables: pagegetReportQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
      }
    ],
    "concreteType": "Report",
    "kind": "LinkedField",
    "name": "getReport",
    "plural": false,
    "selections": [
      (v1/*: any*/),
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
        "kind": "ScalarField",
        "name": "snapshot",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "modeltype",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "modelversion",
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
            "kind": "ScalarField",
            "name": "no",
            "storageKey": null
          }
        ],
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
    "name": "pagegetReportQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "pagegetReportQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "c43edba42bcb731a27d968a55f731db9",
    "id": null,
    "metadata": {},
    "name": "pagegetReportQuery",
    "operationKind": "query",
    "text": "query pagegetReportQuery(\n  $id: ID!\n) {\n  getReport(id: $id) {\n    id\n    data\n    snapshot\n    modeltype\n    modelversion\n    isp {\n      id\n      no\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a301c53e093f8f48ad10de7fa079ccd0";

export default node;
