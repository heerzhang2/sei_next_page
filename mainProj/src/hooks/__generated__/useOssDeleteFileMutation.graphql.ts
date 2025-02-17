/**
 * @generated SignedSource<<bfe96dead412fa1947897b908466ae2c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useOssDeleteFileMutation$variables = {
  file: string;
  key?: string | null | undefined;
  value?: string | null | undefined;
};
export type useOssDeleteFileMutation$data = {
  readonly ossDeleteFile: string;
};
export type useOssDeleteFileMutation = {
  response: useOssDeleteFileMutation$data;
  variables: useOssDeleteFileMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "file"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "key"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "value"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "file",
        "variableName": "file"
      },
      {
        "kind": "Variable",
        "name": "key",
        "variableName": "key"
      },
      {
        "kind": "Variable",
        "name": "value",
        "variableName": "value"
      }
    ],
    "kind": "ScalarField",
    "name": "ossDeleteFile",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useOssDeleteFileMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useOssDeleteFileMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8fe21834ceb059f85ddc036caa52dadc",
    "id": null,
    "metadata": {},
    "name": "useOssDeleteFileMutation",
    "operationKind": "mutation",
    "text": "mutation useOssDeleteFileMutation(\n  $file: String!\n  $key: String\n  $value: String\n) {\n  ossDeleteFile(file: $file, key: $key, value: $value)\n}\n"
  }
};
})();

(node as any).hash = "3dacbed5b8539fa0e206a9682e644476";

export default node;
