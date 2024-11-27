import { title } from "@/components/primitives";
import GoogleAiRequester from "@/components/googleAi/GoogleAiRequester";

export default function DocsPage() {
  return (
    <div>
      <h1 className={title()}>Docs</h1>
      <GoogleAiRequester prompt="tell a joke" />
    </div>
  );
}
