"use client";

import SlowContent from "@/app/(auth)/lazy/SlowContent";
import { SlowContentLoaderQuery } from "./__generated__/SlowContentLoaderQuery.graphql";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export function SlowContentLoader() {
  const data = useLazyLoadQuery<SlowContentLoaderQuery>(
    graphql`
      query SlowContentLoaderQuery {
        ...SlowContent
      }
    `,
    {}
  );

  return <SlowContent queryRef={data} />;
}
