import React from "react";

interface PdfViewerProps {
  src: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  src,
}) => {
  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
      <iframe
        src={src}
        className="flex-1 w-full"
        style={{ border: "none" }}
        title="PDF Viewer"
      />
    </div>
  );
};

export default PdfViewer;
