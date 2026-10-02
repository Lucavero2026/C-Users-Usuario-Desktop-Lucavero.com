import { AdminGate } from "@/components/admin/AdminGate";
import { PostEditor } from "@/components/admin/PostEditor";
import { emptyPost } from "@/lib/blog-shared";
import { storeMode } from "@/lib/blog-store";

export default function NovoArtigoPage() {
  return (
    <AdminGate>
      <div className="container-page py-8">
        <PostEditor initial={emptyPost()} isNew mode={storeMode()} />
      </div>
    </AdminGate>
  );
}
