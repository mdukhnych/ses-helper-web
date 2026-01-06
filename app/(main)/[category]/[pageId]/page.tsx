import React from 'react'
import WarrantyProtection from './(components)/WarrantyProtection';
import EasyPro from './(components)/EasyPro';
import PhoneServices from './(components)/PhoneServices';

export default async function MainPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  if (pageId === "warranty-protection") return <WarrantyProtection />;
  if (pageId === "easy-pro") return <EasyPro />
  if (pageId === "phone-services") return <PhoneServices />

  return pageId
  
}