import React from "react";
import { CreatorStorefront } from "@/components/creator/CreatorStorefront";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { username: "demo" },
    { username: "sarah" },
    { username: "ahmed" },
    { username: "layla" },
    { username: "omar" },
    { username: "nour" },
    { username: "creator" },
  ];
}

export default function Page({ params }: { params: { username: string } }) {
  return <CreatorStorefront username={params?.username} />;
}







