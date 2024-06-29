import { Button, CloseButton, FileInput, Flex, Image } from "@mantine/core";
import { getVisionZFile } from "@visionz/upload-helper-react";
import { RefObject, useState } from "react";

interface UploadFileComponentProps {
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
  preCover: RefObject<string>;
}

const UploadFileComponent: React.FC<UploadFileComponentProps> = ({
  onFileChange,
  selectedFile,
  preCover,
}) => {
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [coverEdit, setCoverEdit] = useState<Boolean>(false);

  const convertToSrc = async (playlistCover: string | null) => {
    if (!playlistCover) return null;

    try {
      const imageSrc = await getVisionZFile(`${window.location.origin}/api/upload`, playlistCover);
      return imageSrc;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const fetchCoverSrc = async () => {
    const src = await convertToSrc(preCover.current);
    setCoverSrc(src);
  };

  if (preCover.current) fetchCoverSrc();

  return (
    <div
      style={{
        position: "relative",
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
      {coverSrc ? (
        <>
          {coverEdit ? (
            <>
              <Flex justify="space-between" align="center">
                <FileInput
                  style={{ width: 130 }}
                  accept={"image/*"}
                  onChange={onFileChange}
                  value={selectedFile}
                />
                <CloseButton
                  variant="transparent"
                  onClick={() => {
                    setCoverEdit(false);
                  }}
                />
              </Flex>
            </>
          ) : (
            <>
              <Image radius="lg" src={coverSrc} alt="Playlist Cover" />
              <Button
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                variant="filled"
                color="#FB00A3"
                size="sm"
                radius="xl"
                onClick={() => {
                  setCoverEdit(true);
                }}
              >
                Edit
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <FileInput
            style={{ width: 130 }}
            accept={"image/*"}
            onChange={onFileChange}
            value={selectedFile}
          />
        </>
      )}
    </div>
  );
};

export default UploadFileComponent;
