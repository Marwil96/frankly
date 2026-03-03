interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  className = "",
}: TableProps<T>) {
  return (
    <div className={`shadow-win95-sunken bg-white overflow-auto ${className}`}>
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="bg-win95-bg">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-2 py-1 font-bold border-r border-win95-dark last:border-r-0"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-t border-win95-light hover:bg-win95-blue hover:text-win95-white"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-2 py-1">
                  {col.render
                    ? col.render(row)
                    : (row[col.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-2 py-4 text-center text-win95-dark"
              >
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
