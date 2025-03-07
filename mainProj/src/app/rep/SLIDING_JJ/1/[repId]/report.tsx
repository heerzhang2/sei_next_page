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

interface ReportProps {
    items: {
        title: string
        url: string
    }[]
}

export default function Report({ items }: ReportProps) {
  // let photos = Array.from({ length: 6 }, (_, i) => i + 1);
  return (
      <>
          <div className="flex-1 overflow-auto">
              <div className="mx-auto px-6 py-8">
                  <div  className="flex flex-col min-h-screen">
                      <header className="border-b">
                          <div className="container flex items-center justify-between h-14">
                              <h1 className="text-xl font-bold">Split View Demo</h1>

                          </div>
                      </header>
                      <ReportOrRecord id={''} />
                  </div>
              </div>
          </div>
          <Sidebar items={items}/>
      </>
  );
}
