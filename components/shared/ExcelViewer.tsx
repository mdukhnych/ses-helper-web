import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Spinner } from '@/components/ui/spinner';

interface MergeCell {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

type CellValue = string | number | boolean | null | undefined;

const ExcelViewer = ({ url }: { url: string }) => {
  const [data, setData] = useState<CellValue[][]>([]);
  const [merges, setMerges] = useState<MergeCell[]>([]);
  const [rowOffset, setRowOffset] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndParseExcel = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        setRowOffset(range.s.r); 

        setMerges(worksheet['!merges'] || []);
        const jsonData = XLSX.utils.sheet_to_json<CellValue[]>(worksheet, { 
          header: 1, 
          defval: '',
          blankrows: true 
        });
        
        setData(jsonData);
      } catch (err) {
        console.error("Помилка читання Excel:", err);
        setError("Не вдалося завантажити таблицю.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndParseExcel();
  }, [url]);

  const getCellDisplayProps = (localRowIndex: number, localColIndex: number) => {
    const excelRow = localRowIndex + rowOffset; 
    const excelCol = localColIndex; 

    const props = { render: true, rowSpan: 1, colSpan: 1 };
    
    for (let i = 0; i < merges.length; i++) {
      const m = merges[i];
      if (excelRow >= m.s.r && excelRow <= m.e.r && excelCol >= m.s.c && excelCol <= m.e.c) {
        if (excelRow === m.s.r && excelCol === m.s.c) {
          props.rowSpan = m.e.r - m.s.r + 1;
          props.colSpan = m.e.c - m.s.c + 1;
        } else {
          props.render = false;
        }
        break;
      }
    }
    return props;
  };

  if (isLoading) {
    return (
      <div className="relative mt-4 w-full min-h-[200px] flex items-center justify-center rounded-md border bg-muted/10">
        <Spinner />
      </div>
    );
  }

  if (error) return <div className="mt-4 text-red-500">{error}</div>;
  if (!data || data.length === 0) return <div className="mt-4">Таблиця порожня</div>;

  const maxColsCount = Math.max(...data.map(row => row.length));
  const columnsArray = Array.from({ length: maxColsCount });

  return (
    <div className="mt-4 w-full overflow-hidden rounded-md border border-border bg-background text-foreground shadow-sm">
      <div className="overflow-x-auto max-w-full max-h-[500px]"> 
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              {columnsArray.map((_, colIndex: number) => {
                const { render, rowSpan, colSpan } = getCellDisplayProps(0, colIndex);
                if (!render) return null;

                return (
                  <th 
                    key={colIndex} 
                    rowSpan={rowSpan}
                    colSpan={colSpan}
                    className="px-4 py-2 font-semibold border-b border-r border-border last:border-r-0 align-middle text-center min-w-[120px]"
                  >
                    {data[0]?.[colIndex] !== undefined && data[0]?.[colIndex] !== '' 
                      ? data[0][colIndex] 
                      : <span className="text-muted-foreground/50 italic">Колонка {colIndex + 1}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row: CellValue[], rowIndex: number) => {
              const localRowIndex = rowIndex + 1;
              return (
                <tr key={localRowIndex} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  {columnsArray.map((_, colIndex: number) => {
                    const { render, rowSpan, colSpan } = getCellDisplayProps(localRowIndex, colIndex);
                    if (!render) return null;
                    return (
                      <td 
                        key={colIndex} 
                        rowSpan={rowSpan}
                        colSpan={colSpan}
                        className={`px-4 py-3 border-r border-border last:border-r-0 align-middle whitespace-pre-wrap min-w-[150px] ${
                          rowSpan > 1 ? 'bg-muted/10' : '' 
                        }`}
                      >
                        {row[colIndex] !== undefined ? row[colIndex] : ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelViewer;