"use client"
import Link from 'next/link';
import {ContentSection} from "@/component/content-section";
import ReportOrRecord from "@/component/reportOrRecord";
// import { ContentSection } from "./content-section"
import {TableOfContents} from "@/component/table-of-contents";
import {Button} from "@/components/ui/button";
import React, {useEffect, useRef, useState} from "react";
import {Drawer} from "vaul";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {X} from "lucide-react";
import Sidebar from "@/app/rep/SLIDING_JJ/1/[repId]/sidebar";
import Report from "@/app/rep/SLIDING_JJ/1/[repId]/report";


export default function Page() {
  return (
       <Report items={tableOfContentsItems}/>
  );
}

export const tableOfContentsItems = [
  { title: "Creating a page", url: "#creating-a-page" },
  { title: "Creating a layout", url: "#creating-a-layout" },
  { title: "Creating a nested route", url: "#creating-a-nested-route" },
  { title: "Nesting layouts", url: "#nesting-layouts" },
  { title: "Linking between pages", url: "#linking-between-pages" },
  { title: "API Reference", url: "#api-reference" },
  { title: "editfor-area-23", url: "#editfor-area-23" },
]
