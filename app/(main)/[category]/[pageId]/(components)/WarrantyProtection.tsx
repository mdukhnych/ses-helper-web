import React from 'react'

export default function WarrantyProtection() {
  return (
    <div>WarrantyProtection</div>
  )
}



// 'use client'

// import { Card } from '@/components/ui/card';
// import { useAppSelector } from '@/store/hooks'
// import { IServiceWarranty, IWarrantyData } from '@/types/data';
// import React, { useState } from 'react';
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Pencil, Plus, Trash } from 'lucide-react';
// import WarrantyModal from '@/components/shared/WarrantyModal';

// export default function WarrantyProtection() {
//   const [devicePrice, setDevicePrice] = useState<string>('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<IWarrantyData | null>(null);

//   const addButtonHandler = () => {
//     setSelectedItem(null);
//     setIsModalOpen(true);
//   }

//   const edirButtonHandler = (item: IWarrantyData) => {
//     setSelectedItem(item);
//     setIsModalOpen(true);
//   }

//   const data = useAppSelector(state => state.data.data).find(item => item.id === "services")?.data.find(item => item.id === "warranty-protection") as IServiceWarranty;
//   const role = useAppSelector(state => state.user.role);
//   const nextId = data.data[data.data.length - 1].id + 1;

//   return (
//     <div>
//       <div className='flex items-center justify-between'>
//         <div className='flex items-center gap-2 w-[50%] '>
//           <span className=''>Вартість:</span>
//           <Input id='devicePrice' placeholder='Введіть вартість пристрою...' type='number' value={devicePrice} onChange={e => setDevicePrice(e.target.value)}/>
//         </div>
//         <div>
//           <Button type='button' className='cursor-pointer' onClick={addButtonHandler}><Plus/></Button>
//         </div>
//       </div>
//       <Accordion type="multiple" className="flex flex-wrap justify-between gap-y-3 items-start mt-3">
//         {
//           data.data.map((item,i) => (
//             <Card
//               key={i}
//               className="w-full sm:w-[48%] lg:w-[32%] p-0 relative"
//             >
//               <AccordionItem value={`item-${i}`}>
//                 <AccordionTrigger
//                   className="p-4 h-[64px] flex justify-between items-center text-left text-base hover:no-underline cursor-pointer border-b-1"
//                 >
//                   <span className="font-medium w-[70%]">{item.title}</span>
//                   <span className="text-sm opacity-80 font-bold">{devicePrice ? (+devicePrice * item.price).toFixed(2) : 0}</span>
//                 </AccordionTrigger>

//                 <AccordionContent className="text-sm leading-relaxed whitespace-pre-wrap relative">
//                   <div className="flex justify-self-end bg-[var(--chart-2)] p-1 px-2 rounded-bl-lg font-bold">{(item.price * 100).toFixed(0)}%</div>

//                   <div className='p-4 pt-2'>
//                     { item.description.replace(/<br\s*\/?>/g, '\n') }
//                   </div>
//                   {
//                     role === "admin" ? 
//                       <div className='border-t-1 mt-4 p-4 pb-0 flex gap-2 items-center justify-end'>
//                         <Button type='button' variant={'default'} className='cursor-pointer' onClick={() => edirButtonHandler(item)}><Pencil/></Button>
                        
//                         <Button type='button' variant={'destructive'} className='cursor-pointer'><Trash/></Button>
//                       </div>
//                     : null
//                   }
//                 </AccordionContent>
//               </AccordionItem>
//             </Card>
//           ))
//         }
//       </Accordion>
//       {
      
//         isModalOpen && (<WarrantyModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} data={selectedItem} nextId={nextId} />)
//       }
//     </div>
//   )
// }