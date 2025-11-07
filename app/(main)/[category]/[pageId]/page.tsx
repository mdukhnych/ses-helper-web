import React from 'react'
import WarrantyProtection from './(components)/WarrantyProtection';
import EasyPro from './(components)/EasyPro';

export default async function MainPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  if (pageId === "warranty-protection") return <WarrantyProtection />;
  if (pageId === "easypro") return <EasyPro />

  return pageId
  
}