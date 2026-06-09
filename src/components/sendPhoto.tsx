import { useRef, type ChangeEvent } from "react";

// Props for the image/GIF picker button.
type SendPhotoProps = {
  onFileSelect: (file: File) => void;
};

// A small picker that lets the user attach an image or GIF to a message.
const SendPhoto = ({ onFileSelect }: SendPhotoProps) => {
  // Keeps a reference to the hidden file input so we can open it on button click.
  const inputRef = useRef<HTMLInputElement | null>(null);

  // When the user picks a file, pass it to the parent chat screen.
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onFileSelect(file);
    event.target.value = "";
  };

  return (
    <>
      {/* Hidden input that opens the browser file picker. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden-file-input"
        onChange={handleFileChange}
      />
      {/* Visible button shown in the composer. */}
      <button type="button" className="ghost-button" onClick={() => inputRef.current?.click()}>
        Add image / GIF
      </button>
    </>
  );
};

export default SendPhoto;
