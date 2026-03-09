import React from 'react'
import WarrantyProtection from './(components)/WarrantyProtection';
import EasyPro from './(components)/EasyPro';
import PhoneServices from './(components)/PhoneServices';
import EktaService from './(components)/EktaService';
import Instructions from './(components)/Instructions';

export default async function MainPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;

  if (pageId === "warranty-protection") return <WarrantyProtection />;
  if (pageId === "easy-pro") return <EasyPro />
  if (pageId === "phone-services") return <PhoneServices />
  if (pageId === "ekta-services") return <EktaService />
  if (pageId === "instructions") return <Instructions />

  return pageId
  
}