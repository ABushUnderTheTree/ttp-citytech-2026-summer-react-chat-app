import { type ChangeEvent, type RefObject } from "react";
import { backgroundPresets } from "../utils/constants";

// The parent app passes these values so this panel can change the chat backdrop and bubble colors.
type BackgroundSettingsProps = {
  backgroundMode: "preset" | "image";
  selectedPreset: string;
  applyPresetBackground: (value: string) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  clearImageBackground: () => void;
  yourBubbleColor: string;
  setYourBubbleColor: (color: string) => void;
  alexBubbleColor: string;
  setAlexBubbleColor: (color: string) => void;
  backgroundMessage: string;
};

// This panel lets the user switch the chat backdrop and pick a custom image for the scene.
const BackgroundSettings = (props: BackgroundSettingsProps) => {
  return (
    <section className="background-controls" aria-label="Background options">
      {/* Show preset theme buttons that update the main background. */}
      <div className="preset-row">
        {backgroundPresets.map((preset: { name: string; value: string }) => (
          <button
            key={preset.name}
            type="button"
            className={`preset-chip ${props.selectedPreset === preset.value && props.backgroundMode === "preset" ? "active" : ""}`}
            onClick={() => props.applyPresetBackground(preset.value)}
            style={{ background: preset.value }}
          >
            {preset.name}
          </button>
        ))}
      </div>
      
      {/* Hidden file input used to pick a custom background image. */}
      <input ref={props.fileInputRef} type="file" accept="image/*" className="hidden-file-input" onChange={props.handleImageUpload} />
    </section>
  );
};

export default BackgroundSettings;