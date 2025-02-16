import { SlowContent$key } from "./__generated__/SlowContent.graphql";
import { graphql, useFragment } from "react-relay";

interface Props {
  queryRef: SlowContent$key;
}

export default function SlowContent(props: Props) {
  const data = useFragment(
    graphql`
      fragment SlowContent on Query {
        auth
      }
    `,
    props.queryRef
  );

  return <div className="text-yellow-500">Slow data: {data.auth}</div>;
}
