import { Download } from 'lucide-react';
import Button from '../../components/common/Button.jsx';

const HEADERS = ['disease', 'crop', 'district', 'case_count', 'period_start', 'period_end'];
const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function ReportExport({ rows = [] }) {
  const download = () => {
    const csv = [HEADERS.join(','), ...rows.map((r) => HEADERS.map((h) => cell(r[h])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmai-outbreaks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button variant="secondary" icon={Download} onClick={download} disabled={!rows.length}>
      Download CSV
    </Button>
  );
}
