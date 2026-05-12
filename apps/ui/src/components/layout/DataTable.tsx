import React, { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  width?: number; // px
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, any>[];
  onRowClick?: (row: any) => void;
  selectedRowId?: number | string;
  emptyMessage?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  rows,
  onRowClick,
  selectedRowId,
  emptyMessage = "No data available",
  sortKey,
  sortDir,
  onSort
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[#1a1d26] sticky top-0 z-10">
          <tr className="border-b border-[#ffffff12]">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && onSort?.(col.key)}
                className={`
                  px-3 py-2 text-[11px] font-bold text-[var(--text-2)] uppercase tracking-[0.1em] whitespace-nowrap
                  ${col.sortable ? 'cursor-pointer hover:text-[var(--text-1)] select-none' : ''}
                `}
                style={{
                  width: col.width ? `${col.width}px` : 'auto',
                  textAlign: col.align || 'left'
                }}
              >
                <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}`}>
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-[var(--accent)] font-black">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[#e8eaf0]">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-[#5a6070] italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const isSelected = selectedRowId !== undefined && (row.id === selectedRowId);
              return (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    group h-[34px] transition-colors border-l-2
                    ${idx % 2 === 0 ? 'bg-[#ffffff03]' : ''}
                    ${onRowClick ? 'cursor-pointer hover:bg-[#21253a]' : ''}
                    ${isSelected ? 'bg-[#21253a] border-[#3b82f6]' : 'border-transparent'}
                  `}
                >
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`px-3 py-1 text-[13px] whitespace-nowrap overflow-hidden text-ellipsis`}
                        style={{ textAlign: col.align || 'left' }}
                      >
                        {col.render ? col.render(value, row) : (
                          typeof value === 'number' && !col.align ? (
                            <span className="font-mono">{value.toLocaleString()}</span>
                          ) : value
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
