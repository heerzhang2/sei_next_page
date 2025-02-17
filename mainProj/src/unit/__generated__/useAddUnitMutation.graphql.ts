/**
 * @generated SignedSource<<bdf2dd56f08e5be31b5382179dc78f5a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UnitCommonInput = {
  address?: string | null | undefined;
  company?: boolean | null | undefined;
  linkMen?: string | null | undefined;
  name?: string | null | undefined;
  no?: string | null | undefined;
  phone?: string | null | undefined;
};
export type useAddUnitMutation$variables = {
  unit: UnitCommonInput;
};
export type useAddUnitMutation$data = {
  readonly newUnitExternalSource: {
    readonly company: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
    readonly id: string;
    readonly person: {
      readonly id: string;
      readonly name: string;
    } | null | undefined;
  };
};
export type useAddUnitMutation = {
  response: useAddUnitMutation$data;
  variables: useAddUnitMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "unit"
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
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "unit",
        "variableName": "unit"
      }
    ],
    "concreteType": "Unit",
    "kind": "LinkedField",
    "name": "newUnitExternalSource",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Company",
        "kind": "LinkedField",
        "name": "company",
        "plural": false,
        "selections": (v2/*: any*/),
        "storageKey": null
      },
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useAddUnitMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAddUnitMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "0d8cbff7f1593bc46ba775ddd8127f16",
    "id": null,
    "metadata": {},
    "name": "useAddUnitMutation",
    "operationKind": "mutation",
    "text": "mutation useAddUnitMutation(\n  $unit: UnitCommonInput!\n) {\n  newUnitExternalSource(unit: $unit) {\n    id\n    company {\n      id\n      name\n    }\n    person {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d97fdbaef61ab24f7d2f072e4fe98be";

export default node;
