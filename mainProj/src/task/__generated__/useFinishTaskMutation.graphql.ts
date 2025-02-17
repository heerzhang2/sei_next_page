/**
 * @generated SignedSource<<cdcf601f19d3fde8ef5851575e038180>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useFinishTaskMutation$variables = {
  taskId: string;
};
export type useFinishTaskMutation$data = {
  readonly finishTask: {
    readonly id: string;
    readonly status: string | null | undefined;
  } | null | undefined;
};
export type useFinishTaskMutation = {
  response: useFinishTaskMutation$data;
  variables: useFinishTaskMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "taskId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "taskId",
        "variableName": "taskId"
      }
    ],
    "concreteType": "Task",
    "kind": "LinkedField",
    "name": "finishTask",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "status",
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
    "name": "useFinishTaskMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useFinishTaskMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b7fbe339e3908ff7271efd3de8cbfb5b",
    "id": null,
    "metadata": {},
    "name": "useFinishTaskMutation",
    "operationKind": "mutation",
    "text": "mutation useFinishTaskMutation(\n  $taskId: ID!\n) {\n  finishTask(taskId: $taskId) {\n    id\n    status\n  }\n}\n"
  }
};
})();

(node as any).hash = "e592bd013c23d38c94bef9353f1f7f5c";

export default node;
