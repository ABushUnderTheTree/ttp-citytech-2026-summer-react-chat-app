import { useRef, type ChangeEvent } from "react";

// The parent component supplies this callback so the picked file can be attached to the message.
type SendPhotoProps = {
  onFileSelect: (file: File) => void;
};

// This small picker lets the user attach an image or GIF to the current message draft.
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
      {/* This button is what the user sees in the composer; clicking it opens the file picker. */}
      <button type="button" className="ghost-button" onClick={() => inputRef.current?.click()}>
        Add image / GIF
      </button>
    </>
  );
};

export default SendPhoto;
