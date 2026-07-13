"use client";

import { useRef, useState } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { Button, CopyButton, Field, Textarea } from "@/components/ui";

export default function QrCodeTool() {
  const [tab, setTab] = useState<"criar" | "ler">("criar");
  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-border bg-surface p-1">
        {(["criar", "ler"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`focus-ring rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t ? "bg-brand text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {t === "criar" ? "Criar QR Code" : "Ler QR Code"}
          </button>
        ))}
      </div>
      {tab === "criar" ? <Criar /> : <Ler />}
    </div>
  );
}

function Criar() {
  const [texto, setTexto] = useState("");
  const [qr, setQr] = useState("");

  async function gerar() {
    if (!texto.trim()) return;
    try {
      const url = await QRCode.toDataURL(texto, { width: 320, margin: 1 });
      setQr(url);
    } catch {
      setQr("");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          gerar();
        }}
        className="space-y-4"
      >
        <Field label="Texto ou link" hint="URL, texto, PIX, contato, o que quiser.">
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="https://lucavero.com"
          />
        </Field>
        <Button type="submit">Gerar QR Code</Button>
      </form>
      <div>
        {qr ? (
          <div className="card space-y-4 p-5 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt="QR Code gerado"
              width={240}
              height={240}
              className="mx-auto rounded-xl border border-border"
            />
            <a
              href={qr}
              download="qrcode.png"
              className="focus-ring inline-flex items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Baixar PNG
            </a>
          </div>
        ) : (
          <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            O QR Code aparece aqui.
          </div>
        )}
      </div>
    </div>
  );
}

function Ler() {
  const [resultado, setResultado] = useState("");
  const [erro, setErro] = useState("");
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  function decodeImageData(img: ImageData): string | null {
    const code = jsQR(img.data, img.width, img.height);
    return code?.data ?? null;
  }

  async function lerArquivo(file: File) {
    setErro("");
    setResultado("");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const found = decodeImageData(data);
      if (found) setResultado(found);
      else setErro("Não encontrei um QR Code nesta imagem.");
    };
    img.onerror = () => setErro("Não consegui abrir a imagem.");
    img.src = URL.createObjectURL(file);
  }

  async function iniciarCamera() {
    setErro("");
    setResultado("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setScanning(true);
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const tick = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const found = decodeImageData(data);
          if (found) {
            setResultado(found);
            pararCamera();
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setErro("Não consegui acessar a câmera. Verifique as permissões.");
    }
  }

  function pararCamera() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  const isUrl = /^https?:\/\//i.test(resultado);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="card p-5">
          <p className="mb-3 font-medium">Enviar imagem</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && lerArquivo(e.target.files[0])}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600"
          />
        </div>
        <div className="card p-5">
          <p className="mb-3 font-medium">Usar câmera</p>
          <video
            ref={videoRef}
            className={`mb-3 w-full rounded-xl border border-border ${
              scanning ? "block" : "hidden"
            }`}
            playsInline
            muted
          />
          {scanning ? (
            <Button type="button" variant="outline" onClick={pararCamera}>
              Parar
            </Button>
          ) : (
            <Button type="button" onClick={iniciarCamera}>
              Ativar câmera
            </Button>
          )}
        </div>
      </div>

      <div>
        {erro && <p className="mb-3 text-sm text-rose-600">{erro}</p>}
        {resultado ? (
          <div className="card space-y-3 p-5">
            <p className="text-sm font-medium">Conteúdo lido</p>
            <p className="break-all rounded-xl bg-surface-muted p-3 font-mono text-sm">
              {resultado}
            </p>
            <div className="flex gap-2">
              <CopyButton text={resultado} />
              {isUrl && (
                <a
                  href={resultado}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-surface-muted"
                >
                  Abrir link
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Envie uma imagem ou use a câmera para ler um QR Code.
          </div>
        )}
      </div>
    </div>
  );
}
