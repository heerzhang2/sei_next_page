import Link from 'next/link';
import {ContentSection} from "@/component/content-section";
import ReportOrRecord from "@/component/reportOrRecord";
// import { ContentSection } from "./content-section"

export default function Page() {
  let photos = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
      <ReportOrRecord id={''} />

  );
}
