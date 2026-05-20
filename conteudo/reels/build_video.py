#!/usr/bin/env python3
"""
Montador de vídeo Tini Tiny — Reels A03 Whimsical v4
Gera MP4 1080x1920 com fotos reais + slides de marca + xfade entre cenas.
"""
import subprocess, os, sys

FOTOS_DIR  = r"C:\Users\Bia\OneDrive\Documentos\Pic Nic\Claude\Marketing\fotos\__classificacao\Dia das mães"
AI_DIR     = r"C:\Users\Bia\OneDrive\Documentos\Pic Nic\Claude\Marketing\conteudo\reels\Whimsical_A03_frames"
OUTPUT     = r"C:\Users\Bia\OneDrive\Documentos\Pic Nic\Claude\Marketing\conteudo\reels\whimsical_a03_v4.mp4"

# Fonte: Poppins Bold (brand font) em caminho sem espaços para o ffmpeg
FONT       = r"C\:/tmp/PoppinsBold.ttf"

FPS        = 24
TRANS      = 0.5    # crossfade em segundos
KEN_BURNS  = False  # True = slow zoom nas fotos (renderização ~2x mais lenta)

# Áudio
NARRATION  = r"C:\Users\Bia\OneDrive\Documentos\Pic Nic\Claude\Marketing\conteudo\reels\narracao_a03.mp3"
MUSIC      = None   # adicionar trilha quando disponível
MUSIC_VOL  = 0.12

# (pasta, arquivo, duração_seg, [linhas de texto], aplicar_ken_burns)
FRAMES = [
    (FOTOS_DIR, "IMG_1578.jpg",  4.0,
        ["Por que esse tapete", "leva 30-40 dias pra ficar pronto?"], True),
    (AI_DIR,    "brand_slide_motiv.png",    1.5, [], False),
    (FOTOS_DIR, "IMG_1615.jpg",  4.0,
        ["Feito a m\u00e3o."], True),
    (FOTOS_DIR, "IMG_1617.jpg",  4.0,
        ["Um de cada vez.", "S\u00f3 pra voc\u00ea."], True),
    (FOTOS_DIR, "IMG_1629.jpg",  4.0,
        ["Tecnologia exclusiva.", "Patente pendente no Brasil."], True),
    (AI_DIR,    "brand_slide_coolmoms.png", 1.5, [], False),
    (FOTOS_DIR, "IMG_1619.jpg",  4.0, [], True),
    (AI_DIR,    "frame5_cta_sage.png", 4.0, [], False),
]

N           = len(FRAMES)
FONT_SIZE   = 64
LINE_H      = 80
TEXT_Y_BOT  = 720    # texto no terço superior (invertido: 720 = ~37% de 1920)
SHADOW_OFF  = 3

SIGBAR_TEXT = "tini tiny | @tini.tiny.shop"
SIGBAR_SIZE = 36
SIGBAR_Y    = 1830   # próximo ao rodapé


def escape(text):
    return (text
            .replace("\\", "\\\\")
            .replace("'",  "\\'")
            .replace(":",  "\\:")
            .replace(",",  "\\,"))


def build_drawtext(lines):
    """Texto principal centralizado no terço superior do frame."""
    if not lines:
        return ""
    n_lines = len(lines)
    y_first = TEXT_Y_BOT - (n_lines - 1) * LINE_H
    parts = []
    for i, line in enumerate(lines):
        y = y_first + i * LINE_H
        txt = escape(line)
        parts.append(
            f"drawtext=fontfile='{FONT}'"
            f":text='{txt}'"
            f":fontcolor=white"
            f":fontsize={FONT_SIZE}"
            f":x=(w-text_w)/2"
            f":y={y}"
            f":shadowcolor=black@0.70"
            f":shadowx={SHADOW_OFF}"
            f":shadowy={SHADOW_OFF}"
        )
    return "," + ",".join(parts)


def build_sigbar():
    """Barra de assinatura no rodapé — presente em todos os frames."""
    txt = escape(SIGBAR_TEXT)
    return (
        f",drawtext=fontfile='{FONT}'"
        f":text='{txt}'"
        f":fontcolor=0xC1D9D7"
        f":fontsize={SIGBAR_SIZE}"
        f":x=(w-text_w)/2"
        f":y={SIGBAR_Y}"
        f":shadowcolor=black@0.55"
        f":shadowx=2"
        f":shadowy=2"
    )


def build_zoompan(dur, is_last):
    """Ken Burns suave: zoom lento de 1.0 → ~1.06 centrado."""
    total_dur = dur if is_last else dur + TRANS
    d = int(total_dur * FPS)
    rate = 0.06 / max(d, 1)
    return (
        f",zoompan=z='min(zoom+{rate:.6f}\\,1.06)'"
        f":x='iw/2-(iw/zoom/2)'"
        f":y='ih/2-(ih/zoom/2)'"
        f":d={d}:s=1080x1920:fps={FPS}"
    )


def main():
    # --- Inputs de vídeo ---
    cmd = ["ffmpeg", "-y"]
    for idx, (folder, fname, dur, _lines, _kb) in enumerate(FRAMES):
        t = dur + TRANS if idx < N - 1 else dur
        cmd += ["-loop", "1", "-t", str(t),
                "-i", os.path.join(folder, fname)]

    # --- Inputs de áudio ---
    audio_idx = N
    has_narration = NARRATION and os.path.exists(NARRATION)
    has_music     = MUSIC     and os.path.exists(MUSIC)
    if has_narration:
        cmd += ["-i", NARRATION]
        narration_idx = audio_idx; audio_idx += 1
    if has_music:
        cmd += ["-i", MUSIC]
        music_idx = audio_idx; audio_idx += 1

    # --- Filter complex: vídeo ---
    parts = []
    for i, (_, _, dur, lines, kb) in enumerate(FRAMES):
        is_last = (i == N - 1)
        scale = (f"[{i}:v]"
                 f"scale=1080:1920:force_original_aspect_ratio=decrease,"
                 f"pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=white,"
                 f"setsar=1,fps={FPS}")
        zoom  = build_zoompan(dur, is_last) if (KEN_BURNS and kb) else ""
        text  = build_drawtext(lines)
        sig   = build_sigbar()
        parts.append(f"{scale}{zoom}{text}{sig}[v{i}]")

    # Encadear xfades
    acc = 0.0
    prev_label = "[v0]"
    for i in range(1, N):
        acc += FRAMES[i-1][2]
        offset = acc - TRANS
        out_label = "[vout]" if i == N - 1 else f"[t{i}]"
        parts.append(
            f"{prev_label}[v{i}]"
            f"xfade=transition=fade:duration={TRANS}:offset={offset}"
            f"{out_label}"
        )
        prev_label = f"[t{i}]"

    # --- Filter complex: áudio ---
    total_dur = sum(f[2] for f in FRAMES) - TRANS * (N - 1)
    audio_out = None

    if has_narration and has_music:
        parts.append(
            f"[{music_idx}:a]aloop=loop=-1:size=2e+09,atrim=duration={total_dur},"
            f"volume={MUSIC_VOL}[music];"
            f"[{narration_idx}:a]atrim=duration={total_dur}[narr];"
            f"[narr][music]amix=inputs=2:duration=first[aout]"
        )
        audio_out = "[aout]"
    elif has_narration:
        parts.append(
            f"[{narration_idx}:a]atrim=duration={total_dur},asetpts=PTS-STARTPTS[aout]"
        )
        audio_out = "[aout]"
    elif has_music:
        parts.append(
            f"[{music_idx}:a]aloop=loop=-1:size=2e+09,atrim=duration={total_dur},"
            f"volume={MUSIC_VOL}[aout]"
        )
        audio_out = "[aout]"

    filter_complex = ";".join(parts)

    cmd += ["-filter_complex", filter_complex, "-map", "[vout]"]
    if audio_out:
        cmd += ["-map", audio_out,
                "-c:a", "aac", "-b:a", "192k"]
    cmd += ["-c:v", "libx264", "-preset", "fast",
            "-crf", "18", "-pix_fmt", "yuv420p", OUTPUT]

    print("Renderizando vídeo v4…")
    print(f"Output: {OUTPUT}")
    print(f"Frames: {N}  |  Ken Burns: {KEN_BURNS}  |  Narração: {has_narration}")
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")

    if result.returncode == 0:
        size = os.path.getsize(OUTPUT) / 1024 / 1024
        print(f"\nSucesso! {OUTPUT} ({size:.1f} MB)")
    else:
        print("\nErro no ffmpeg:")
        lines = result.stderr.strip().split("\n")
        print("\n".join(lines[-60:]))
        sys.exit(1)


if __name__ == "__main__":
    main()
