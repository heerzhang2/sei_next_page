/**
 * @generated SignedSource<<303117c66bcbc346b88f6e72c66a7394>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useCancellationTaskMutation$variables = {
  reason?: string | null | undefined;
  task: string;
};
export type useCancellationTaskMutation$data = {
  readonly cancellationTask: string | null | undefined;
};
export type useCancellationTaskMutation = {
  response: useCancellationTaskMutation$data;
  variables: useCancellationTaskMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "reason"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "task"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "reason",
        "variableName": "reason"
      },
      {
        "kind": "Variable",
        "name": "task",
        "variableName": "task"
      }
    ],
    "kind": "ScalarField",
    "name": "cancellationTask",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCancellationTaskMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useCancellationTaskMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "bd18dd0fd687480dd4e4735c89261322",
    "id": null,
    "metadata": {},
    "name": "useCancellationTaskMutation",
    "operationKind": "mutation",
    "text": "mutation useCancellationTaskMutation(\n  $task: ID!\n  $reason: String\n) {\n  cancellationTask(task: $task, reason: $reason)\n}\n"
  }
};
})();

(node as any).hash = "96a37b1e7dac3b6008af7ba9936cee3f";

export default node;
