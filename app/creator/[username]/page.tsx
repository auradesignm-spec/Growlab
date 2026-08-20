import React from "react";
import { CreatorStorefront } from "@/components/creator/CreatorStorefront";

export function generateStaticParams() {
  return [{ username: 'demo' }, { username: 'sarah' }, { username: 'ahmed' }];
}

export default function Page({ params }: { params: { username: string } }) {
  return <CreatorStorefront username={params?.username} />;
}




