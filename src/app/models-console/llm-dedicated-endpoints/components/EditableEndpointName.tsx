import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { message } from "@/components/ui/standard/notify";
import styles from "./EditableEndpointName.module.scss";

interface EditableEndpointNameProps {
  endpointName: string;
  onSave: (newName: string) => Promise<void>;
  syncEndpointData: () => Promise<void>;
}

export default function EditableEndpointName({
  endpointName,
  onSave,
  syncEndpointData,
}: EditableEndpointNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(endpointName);
  const [displayName, setDisplayName] = useState(endpointName);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(displayName);
  };

  const handleSave = async () => {
    // TODO validate name
    if (editValue.trim() && editValue !== displayName) {
      setIsSaving(true);
      const trimmedValue = editValue.trim();
      const originalName = displayName;

      try {
        setDisplayName(trimmedValue);
        setIsEditing(false);
        await onSave(trimmedValue);
        syncEndpointData();
      } catch (error) {
        message.error("Save failed, please try again");
        setDisplayName(originalName);
        setEditValue(originalName);
        setIsEditing(true);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(displayName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className={`${styles.endpoint_name_edit} flex items-center gap-2 h-[29px]`}
      >
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-7 w-[200px]"
          autoFocus
          disabled={isSaving}
        />
        <Button
          variant="secondary"
          size="sm"
          className="h-7"
          onClick={handleSave}
          disabled={!editValue.trim() || isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`${styles.endpoint_name} flex items-center gap-2 h-[29px]`}
      >
        <h5>{displayName}</h5>
        <button onClick={handleEdit} title="Edit name">
          <span className="iconfont icon-pencil-line"></span>
        </button>
      </div>
    </div>
  );
}
