import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import { useToast } from "../../context/ToastContext";
import { invalidateQueries } from "../../api/queryClient";
import api from "../../api/client";

export function NewTicketModal({ isOpen, onClose, prefillOrderId = "" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [subject, setSubject] = useState("Delay");
  const [orderId, setOrderId] = useState(prefillOrderId || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setOrderId(prefillOrderId || "");
      setMessage("");
      setSubject("Delay");
    }
  }, [isOpen, prefillOrderId]);

  const subjectOptions = [
    { value: "Delay", label: t("support.subjectDelay") || "Delivery delay" },
    { value: "Damaged item", label: t("support.subjectDamaged") || "Damaged item" },
    { value: "Wrong item", label: t("support.subjectWrong") || "Wrong item" },
    { value: "Payment issue", label: t("support.subjectPayment") || "Payment issue" },
    { value: "Other", label: t("support.subjectOther") || "Other" },
  ];

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        subject,
        message: message.trim(),
        text: message.trim(),
      };
      if (orderId.trim()) {
        payload.orderId = orderId.trim();
      }
      return await api.post("/support/tickets", payload);
    },
    onSuccess: (res) => {
      invalidateQueries.ticket();
      toast.success(t("support.ticketCreated"));
      onClose?.();
      const ticketId = res?._id || res?.id || res?.data?._id || res?.data?.id;
      if (ticketId) {
        navigate(`/support/${ticketId}`);
      }
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to create support ticket");
    },
  });

  const isMessageValid = message.trim().length >= 10;
  const canSubmit = subject && isMessageValid && !createMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("support.newTicket")}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit}
            loading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {t("common.submit")}
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) createMutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <Select
          label={t("support.subject")}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={subjectOptions}
          required
        />

        <Input
          label={t("support.relatedOrder")}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. ORD-10023 or Order ID"
        />

        <div>
          <Textarea
            label={t("support.message")}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("support.message")}
            required
            helperText={
              message.trim().length > 0 && !isMessageValid
                ? "Minimum 10 characters required"
                : undefined
            }
            error={message.trim().length > 0 && !isMessageValid ? "Min 10 characters required" : undefined}
          />
          <p className="text-right text-[11px] text-nr-ink-2 mt-1">
            {message.trim().length}/10 min characters
          </p>
        </div>
      </form>
    </Modal>
  );
}

export default NewTicketModal;
