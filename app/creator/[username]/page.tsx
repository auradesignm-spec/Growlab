"use client";

import React from "react";
import { useParams } from "next/navigation";
import { CreatorStorefront } from "@/components/creator/CreatorStorefront";

export default function Page() {
  const params = useParams();
  const rawUsername = params?.username;
  const username = typeof rawUsername === "string" ? rawUsername : Array.isArray(rawUsername) ? rawUsername[0] : "";
  
  return <CreatorStorefront username={username} />;
}





