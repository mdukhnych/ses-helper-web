import React from 'react'
import Instructions from './(components)/Instructions';
import Motivations from './(components)/Motivations';

export default async function MainPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  if (pageId === "instructions") return <Instructions />
  if (pageId === "motivations") return <Motivations />

  return pageId
  
}