import { SlowContent$key } from "./__generated__/SlowContent.graphql";

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
