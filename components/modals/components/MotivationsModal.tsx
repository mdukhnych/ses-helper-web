import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import FileUploader from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import useMotivations from '@/hooks/useMotivations';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal } from '@/store/slices/modalSlice';
import { MotivationsItem } from '@/types/information';
import React, { useState } from 'react'

export default function MotivationsModal() {
  const payload = useAppSelector(state => state.modal.payload) as MotivationsItem;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localItem, setLocalItem] = useState<MotivationsItem>(payload ? payload : {
    id: "",
    title: "",
    url: ""
  });

  const {isLoading, addMotivation, updateMotivation} = useMotivations();
  const dispatch = useAppDispatch();

  return (
    <>
      <DialogHeader className='border-b pb-2'>
        <DialogTitle>{ payload ? "Внесіть зміни до мотивації" : "Додайте нову мотивацію" }</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="py-2 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2">
          <Label className=' pl-1' htmlFor='title'>Найменування:</Label>
          <Input id="title" className='col-span-3' placeholder='Введіть найменування...' value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))} />
        </div>

        <FileUploader
          accept='application/pdf'
          allowedExtensions={['PDF']}
          description={localItem.url}
          selectedFile={selectedFile}
          onFileSelect={(file) => setSelectedFile(file)}
          onClear={() => {
            setLocalItem(prev => ({ ...prev, url: "" }));
            setSelectedFile(null);
          }}
        />
      </div>
      <DialogFooter className='border-t pt-2'>
        <Button disabled={isLoading} onClick={() => payload ? updateMotivation({item: localItem, file: selectedFile}) : addMotivation({item: localItem, file: selectedFile})} className='cursor-pointer'>
          {isLoading && <Spinner className="w-4 h-4" />}
          {isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        <Button type='button' onClick={() => dispatch(closeModal())}>Відміна</Button>
      </DialogFooter>
    </>
  )
}
