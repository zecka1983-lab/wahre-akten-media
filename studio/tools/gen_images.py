"""Генерация кадров открытой нейросетью (Stable Diffusion 1.5 / DreamShaper 8 + LCM, на процессоре).

Запуск:  python gen_images.py <styles.json> <папка_вывода> [стиль ...]
styles.json: {"styles": {"имя": {"prefix": "...", "negative": "..."}}, "hero": "...", "shots": [{"id": "...", "prompt": "..."}]}
Лицензия модели CreativeML OpenRAIL-M разрешает коммерческое использование.
"""
import json, sys, time
from pathlib import Path
import torch
from diffusers import StableDiffusionPipeline, LCMScheduler

cfg = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
only = sys.argv[3:] or list(cfg["styles"])
torch.set_num_threads(4)

pipe = StableDiffusionPipeline.from_pretrained("Lykon/dreamshaper-8", torch_dtype=torch.float32, safety_checker=None)
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
pipe.fuse_lora()

for sname in only:
    st = cfg["styles"][sname]
    for k, shot in enumerate(cfg["shots"]):
        f = out / f"{sname}_{shot['id']}.png"
        if f.exists():
            continue
        prompt = f"{st['prefix']}, {shot['prompt']}"
        if shot.get("hero"):
            prompt += f", {cfg['hero']}"
        g = torch.Generator().manual_seed(1000 + k)
        t0 = time.time()
        img = pipe(prompt, negative_prompt=st["negative"], num_inference_steps=6, guidance_scale=1.5,
                   width=512, height=896, generator=g).images[0]
        img.save(f)
        print(f"{f.name}  {time.time() - t0:.0f} c", flush=True)
