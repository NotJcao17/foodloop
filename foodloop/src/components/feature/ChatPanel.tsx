"use client";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface Props {
  claimId: string;
  currentUserId: string;
  initialMessages: (Message & { profiles: { name: string; avatar_url: string | null } | null })[];
}

export function ChatPanel({ claimId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel("chat-" + claimId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `claim_id=eq.${claimId}`,
      }, async (payload) => {
        // Fetch the profile for the new message
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq("id", payload.new.sender_id)
          .single();
        setMessages(prev => [...prev, { ...payload.new as any, profiles: profile }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [claimId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    await supabase.from("messages").insert({
      claim_id: claimId,
      sender_id: currentUserId,
      content: text.trim(),
    });
    setText("");
    setSending(false);
  }

  return (
    <div className="flex flex-col flex-1 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted text-sm text-center">Coordinad la entrega aquí 🤝<br/><span className="text-xs">Sé el primero en escribir</span></p>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                isMine ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-text rounded-bl-sm"
              }`}>
                <p className="leading-snug">{msg.content}</p>
                <p className={`text-[10px] mt-0.5 ${isMine ? "text-white/70" : "text-muted"} text-right`}>
                  {formatTime(msg.sent_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-border p-3 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
