"use client";

import { useRef, useState } from "react";
import { PlusIcon } from "@/components/icons/plus-icon";
import { MicIcon } from "@/components/icons/mic-icon";
import { ChartColumnIcon } from "@/components/icons/chart-column-icon";
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { ImageIcon } from "@/components/icons/image-icon";
import { PaperclipIcon } from "@/components/icons/paperclip-icon";
import { PollDialog } from "@/components/community/poll-dialog";
import { PencilIcon } from "@/components/icons/pencil-icon";
import { ReplyIcon } from "@/components/icons/reply-icon";
import { IconButton } from "@/components/ui/icon-button";
import { useAttachmentUploads } from "@/lib/hooks/use-attachment-uploads";
import { useVoiceRecorder, voiceRecordingSupported } from "@/lib/hooks/use-voice-recorder";
import { uploadFile } from "@/lib/uploads-client";
import { firstName, messageSnippet } from "@/lib/utils/messages";
import { fileAccept, imageAccept } from "@/lib/validation/uploads";
import { Composer } from "./composer";
import { ComposerBanner } from "./composer-banner";
import { ActionMenu, type MenuItem } from "./action-menu";
import { ComposerNotice } from "./composer-notice";
import { useConversation } from "./conversation-provider";
import { PendingUploads } from "./pending-uploads";
import { RecordingBar } from "./recording-bar";

function lockedReason(blocked: "none" | "by-me" | "by-them", onlyAdmins: boolean) {
  if (blocked === "by-me") return "You blocked this contact. Unblock them to send a message.";
  if (blocked === "by-them") return "You can no longer send messages to this contact.";
  if (onlyAdmins) return "Only admins can send messages here.";
  return "You can't send messages here.";
}

export function ConversationComposer() {
  const { conversation, me, replyingTo, setReplyingTo, editing, setEditing, send, saveEdit, signalTyping, notify, dispatch } =
    useConversation();
  const fileInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const attachments = useAttachmentUploads((message) => notify(message));
  const recorder = useVoiceRecorder();
  const [sendingVoice, setSendingVoice] = useState(false);
  const [creatingPoll, setCreatingPoll] = useState(false);

  if (!conversation.canPost) {
    return <ComposerNotice text={lockedReason(conversation.blocked, conversation.onlyAdminsCanPost)} />;
  }

  async function startRecording() {
    if (!voiceRecordingSupported()) {
      notify("Voice messages aren't supported in this browser.");
      return;
    }
    try {
      await recorder.start();
    } catch {
      notify("Microphone access is blocked. Allow it in your browser settings to record voice messages.");
    }
  }

  async function sendVoice() {
    setSendingVoice(true);
    const recording = await recorder.stop();
    if (!recording || recording.durationMs < 600) {
      setSendingVoice(false);
      notify("That voice message was too short.");
      return;
    }
    const file = new File([recording.blob], "Voice message.webm", { type: "audio/webm" });
    const result = await uploadFile(file, "voice", { durationMs: recording.durationMs, waveform: recording.waveform });
    setSendingVoice(false);
    if (result.ok) send("", { attachments: [result.data] });
    else notify(result.error.message);
  }

  if (recorder.state === "recording" || sendingVoice) {
    return (
      <RecordingBar
        elapsedMs={recorder.elapsedMs}
        onCancel={() => {
          recorder.cancel();
          setSendingVoice(false);
        }}
        onSend={() => void sendVoice()}
      />
    );
  }

  function pickImages() {
    imageInput.current?.click();
  }

  function pickFiles() {
    fileInput.current?.click();
  }

  const addItems: MenuItem[] = [
    { label: "Photos", icon: <ImageIcon size={16} />, onSelect: pickImages },
    { label: "Document", icon: <FileTextIcon size={16} />, onSelect: pickFiles },
    ...(conversation.kind === "direct"
      ? []
      : [{ label: "Poll", icon: <ChartColumnIcon size={16} />, onSelect: () => setCreatingPoll(true) }]),
  ];

  const placeholder =
    conversation.kind === "direct"
      ? `Message ${firstName(conversation.title)}…`
      : conversation.kind === "room"
        ? `Message #${conversation.title}`
        : `Message ${conversation.title}…`;

  const banner = editing ? (
    <ComposerBanner
      icon={<PencilIcon size={18} />}
      title="Edit message"
      text={editing.body}
      onCancel={() => setEditing(null)}
    />
  ) : replyingTo ? (
    <ComposerBanner
      icon={<ReplyIcon size={18} />}
      title={`Replying to ${replyingTo.sender?.id === me.id ? "yourself" : (replyingTo.sender?.name ?? "message")}`}
      text={messageSnippet(replyingTo)}
      onCancel={() => setReplyingTo(null)}
    />
  ) : null;

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={fileAccept}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) attachments.add(event.target.files, "file");
          event.target.value = "";
        }}
      />
      <input
        ref={imageInput}
        type="file"
        multiple
        accept={imageAccept}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) attachments.add(event.target.files, "image");
          event.target.value = "";
        }}
      />
      <Composer
        key={editing?.id ?? "compose"}
        placeholder={placeholder}
        initialValue={editing?.body ?? ""}
        banner={banner}
        attachments={editing ? null : <PendingUploads uploads={attachments.uploads} onRemove={attachments.remove} />}
        canSendEmpty={!editing && attachments.ready.length > 0}
        busy={attachments.uploading}
        onCancel={editing ? () => setEditing(null) : replyingTo ? () => setReplyingTo(null) : undefined}
        onTyping={editing ? undefined : signalTyping}
        leading={
          editing ? (
            <span className="w-1" />
          ) : (
            <ActionMenu
              label="Add attachment"
              icon={<PlusIcon size={20} />}
              items={addItems}
              align="start"
              placement="top"
              buttonClassName="size-10"
            />
          )
        }
        trailing={
          editing ? null : (
            <>
              <IconButton label="Attach file" onClick={() => fileInput.current?.click()} className="max-sm:hidden">
                <PaperclipIcon size={20} />
              </IconButton>
              <IconButton label="Record voice message" onClick={() => void startRecording()}>
                <MicIcon size={20} />
              </IconButton>
            </>
          )
        }
        onSend={(body) => {
          if (editing) {
            saveEdit(editing.id, body);
            return;
          }
          send(body, { attachments: attachments.ready });
          attachments.clear();
        }}
      />
      {creatingPoll ? (
        <PollDialog
          conversationId={conversation.id}
          onClose={() => setCreatingPoll(false)}
          onCreated={(message) => dispatch({ type: "upsert", message })}
        />
      ) : null}
    </>
  );
}
