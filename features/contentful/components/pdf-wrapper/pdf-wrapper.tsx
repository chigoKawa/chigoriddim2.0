import React from "react";
import { IPdfWrapper } from "../../type";
import { extractContentfulAssetUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const PdfWrapper = ({ entry }: { entry: IPdfWrapper }) => {
  const title = entry?.fields?.title as string;
  const file = entry?.fields?.file;
  const pdfUrl = extractContentfulAssetUrl(file);

  const handlePdfClick = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = title || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!pdfUrl) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-red-600">PDF file not available</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="font-semibold text-lg">{title || "PDF Document"}</h3>
            <p className="text-sm text-muted-foreground">
              Click to open in new tab
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>

          <Button
            onClick={handlePdfClick}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>View PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PdfWrapper;
