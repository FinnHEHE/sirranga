import { FileText } from "lucide-react"

interface DownloadCardProps {
  fileName: string
  fileSize: string
  subject: string
}

export function DownloadCard({ fileName, fileSize, subject }: DownloadCardProps) {
  return (
    <div className="aspect-square flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-teal bg-card p-6 transition-all duration-300 hover:border-orange hover:shadow-[0_0_30px_rgba(0,128,128,0.15)] hover:scale-[1.03]">
      <div className="text-teal">
        <FileText className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-sans text-foreground text-center">{fileName}</h3>
      <p className="text-sm text-muted-foreground text-center">{subject}</p>
      <p className="text-xs text-muted-foreground">{fileSize}</p>
      <button className="mt-auto rounded-lg bg-orange px-6 py-2 text-sm font-sans text-primary-foreground transition-all duration-300 hover:brightness-110 hover:scale-105">
        Download
      </button>
    </div>
  )
}
