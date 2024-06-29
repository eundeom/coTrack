import { FileInput } from "@mantine/core";

interface UploadFileComponentProps {
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
}

const UploadFileComponent: React.FC<UploadFileComponentProps> = ({
  onFileChange,
  selectedFile,
}) => {
  return (
    <div
      style={{
        backgroundColor: "#F9F9F9",
        width: 200,
        height: 200,
        borderRadius: 14,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 30,
      }}
    >
      <FileInput
        style={{ width: 130 }}
        accept={"image/*"}
        onChange={onFileChange}
        value={selectedFile}
      />
    </div>
  );
};

export default UploadFileComponent;
