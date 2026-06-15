import { MessageCircle } from "lucide-react";
import type { RoastResult } from "../types/roast";
import { formatThreadsPosts } from "../utils/formatReport";
import { CopyButton } from "./CopyButton";

type ThreadsPostsProps = {
  result: RoastResult;
};

export function ThreadsPosts({ result }: ThreadsPostsProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-[#20262b]/44" />
            <span className="technical-label">THREADS OUTPUT</span>
          </div>
          <h2 className="font-editorial mt-2 text-4xl font-medium tracking-[-0.05em] text-[#101418]">
            Посты, которые не звучат как пресс-релиз
          </h2>
        </div>
        <CopyButton value={formatThreadsPosts(result)} label="Скопировать все" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {result.threadsPosts.map((post, index) => (
          <article
            key={post.title}
            className="group rounded-[2rem] border border-black/10 bg-[#f8f8f6]/78 p-5 shadow-[0_24px_70px_rgba(16,20,24,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] transition duration-300 hover:-translate-y-1"
          >
            <div className="mb-8 flex items-center justify-between gap-3">
              <span className="rounded-full border border-black/10 bg-white/58 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#20262b]/50">
                POST {String(index + 1).padStart(2, "0")}
              </span>
              <CopyButton
                value={`${post.title}\n${post.text}`}
                label="Копировать"
                compact
                ariaLabel={`Скопировать пост ${String(index + 1).padStart(2, "0")}`}
              />
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.035em] text-[#101418]">{post.title}</h3>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-[#20262b]/68">
              {post.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
