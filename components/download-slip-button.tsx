'use client'

import { Download } from 'lucide-react'

interface Props {
  name: string
}

export default function DownloadSlipButton({ name }: Props) {
  function handleDownload() {
    const original = document.title
    document.title = `Salary-Slip-${name.replace(/\s+/g, '-')}`
    window.print()
    document.title = original
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 print:hidden"
    >
      <Download size={14} />
      Download PDF
    </button>
  )
}
