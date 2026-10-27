import React, { ReactElement } from "react";
import Modal from "../Modal/Modal";
import { Title } from "../Title/Title";
import Button from "../Button/Button";

type ConfirmModalProps = {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmModal = ({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: ConfirmModalProps): ReactElement => {
  return (
    <Modal onClose={onClose} width={360} height={200}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Title style={{ fontSize: 18, textAlign: "center" }}>{title}</Title>

        {description && (
          <p style={{ color: "#959D99", textAlign: "center", marginTop: 0 }}>
            {description}
          </p>
        )}

        <div style={{ display: "flex", width: "100%", gap: 8, marginTop: 10 }}>
          <Button
            variant="secondary"
            style={{ flex: 1, margin: 0 }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button style={{ flex: 1, margin: 0 }} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
