import React from 'react'
import Instructions from './(components)/Instructions';
import Motivations from './(components)/Motivations';
import Promos from './(components)/Promos';

export default async function MainPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  if (pageId === "instructions") return <Instructions />
  if (pageId === "motivations") return <Motivations />
  if (pageId === "promos") return <Promos />

  return pageId
  
}