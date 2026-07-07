import { FUNC_NAME } from "@/app/models/constants/funcs";

const DEFAULT_MODEL_ID_1 =
  process.env.NEXT_PUBLIC_ENV === "prod" ? 30163 : 38589;
const DEFAULT_MODEL_NAME_1 =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? "AnythingV5_v5PrtRE.safetensors"
    : "aZovyaRPGArtistTools_v2_47240.safetensors";
export const DEFAULT_MODEL_BASE_MODEL =
  process.env.NEXT_PUBLIC_ENV === "prod" ? "" : "";
export const DEFAULT_MODEL_IS_SDXL =
  process.env.NEXT_PUBLIC_ENV === "prod" ? true : false;

const defaultCases: { [key: string]: { [key: string]: any }[] } = {
  [FUNC_NAME.TXT2IMG]: [
    {
      model_id: DEFAULT_MODEL_ID_1,
      model_name: DEFAULT_MODEL_NAME_1,
      prompt: "Daredevil stood high, behind him, looking down.",
      result: "/case/txt2img/2.png",
      width: 877,
      height: 480,
      sampler_name: "DPM++ 2S a Karras",
      cfg_scale: 7,
      steps: 30,
    },
    {
      model_id: DEFAULT_MODEL_ID_1,
      model_name: DEFAULT_MODEL_NAME_1,
      prompt:
        "a room with a bed and a desk in it,Weathered furniture,Dilapidated wallpaper,Worn-out floorboards,Tattered curtains,Faded upholstery,Cracked window panes,Broken light fixtures,Peeling paint,Rusty metal accents,Dusty surfaces,Cobweb-covered corners,Stained bedding,Scratched desk surface,Chipped wooden frame,Frayed edges on rugs,Aged and distressed textures,Scuffed chair legs,Worn-out bookshelves,Flickering, dim lighting,Crumbling plaster on walls",
      result: "/case/txt2img/3.png",
      width: 877,
      height: 480,
      sampler_name: "DPM++ 2S a Karras",
      cfg_scale: 7,
      steps: 30,
    },
    {
      model_id: DEFAULT_MODEL_ID_1,
      model_name: DEFAULT_MODEL_NAME_1,
      prompt:
        "Luxury suite design, Spacious suite area, Luxuriously plush large bed, Refined office desk, Carefully selected furniture for the luxurious suite, High-end and opulent decor, Private office and lounge area, Comfortably luxurious office chair, Amenities for luxury travelers, Premium bedding and linens, Uniquely designed lighting fixtures, Luxurious suite curtain design, Private work corner, Luxurious amenities, Lavish lounge area, Sophisticated indoor plant, decorations, Exquisite luxury design, Exclusive services for the luxury suite, Luxury color scheme. Exclusive furniture for the luxury suite, a bedroom with a large bed and a desk,",
      result: "/case/txt2img/4.png",
      width: 877,
      height: 480,
      sampler_name: "DPM++ 2S a Karras",
      cfg_scale: 7,
      steps: 30,
    },
    {
      model_id: DEFAULT_MODEL_ID_1,
      model_name: DEFAULT_MODEL_NAME_1,
      prompt:
        "Panoramic Earth view, Advanced space hotel design, Tech-centric room layout, Futuristic-tech-style bedding, High-tech control panels, Smart room decor, Private resting area within astronaut-like cabin, Striking space window design, Space observation platform, Advanced virtual reality experiences, High-tech lighting systems, Sci-fi-themed wall decorations, Intelligent living spaces, Cutting-edge space-themed furniture, Space-station-level environmental control, Highly futuristic technological facilities, Sci-fi-inspired spatial layout, Surreal visual effects, State-of-the-art aerospace installations, Advanced technological services in the space hotel, a futuristic space station with a view of the earth, concept art by Otto Pilny, cgsociety, space art, futuristic, sci-fi, unreal engine 5,",
      result: "/case/txt2img/5.png",
      width: 877,
      height: 480,
      sampler_name: "DPM++ 2S a Karras",
      cfg_scale: 7,
      steps: 30,
    },
  ],
  [FUNC_NAME.IMG2IMG]: [
    {
      model_id: DEFAULT_MODEL_ID_1,
      model_name: DEFAULT_MODEL_NAME_1,
      init_images: ["/case/img2img/ori_1.jpeg"],
      width: 768,
      height: 1024,
      sampler_name: "DPM++ 2S a Karras",
      cfg_scale: 7.5,
      steps: 20,
      strength: 0.7,
      negative_prompt:
        "(worst quality:1.5), (low quality:1.5), (normal quality:1.5), anime, cartoon, painting, drawing, illustration, manga, sketch, nudity, young, child, hairband, headband, horns, lowres, bad anatomy, bad hands, multiple eyebrow, (cropped), extra limb, missing limbs, deformed hands, long neck, long body, long torso, (bad hands), signature, username, artist name, conjoined fingers, deformed fingers, ugly eyes, imperfect eyes, skewed eyes, unnatural face, unnatural body, error, grain, jpeg artifacts",
      prompt:
        "realistic, photograph, (masterpiece), 8k quality, (detailed eyes:1.2), (highest quality:1.1), highly detailed, majestic, top quality, best quality, newest, ai-generated, (intricate details:1.1), extremely beautiful, elegant, majestic, immersive background+, (detailed face, perfect face), In the heart of a vibrant garden, a girl with red hair and brown eyes sits in contemplation of the nature around her.",
    },
    {
      model_id: DEFAULT_MODEL_ID_1,
      model_name: DEFAULT_MODEL_NAME_1,
      init_images: ["/case/img2img/ori_2.png"],
      width: 1024,
      height: 576,
      sampler_name: "DPM++ 2S a Karras",
      cfg_scale: 5,
      steps: 20,
      negative_prompt:
        "glasses hat freckles mask necklace shine earrings weapon",
      prompt:
        "Future world, future, science fiction film, science fiction, astronauts walking in a spaceship, astronauts, close-up of upper body, open hands, equipment glowing on the wall, technologically advanced spaceships",
    },
    {
      model_id: DEFAULT_MODEL_ID_1,
      model_name: DEFAULT_MODEL_NAME_1,
      init_images: ["/case/img2img/ori_3.jpeg"],
      width: 768,
      height: 1024,
      sampler_name: "DPM++ 2S a Karras",
      cfg_scale: 6,
      steps: 20,
      strength: 0.65,
      negative_prompt:
        "(worst quality:1.5), (low quality:1.5), (normal quality:1.5), anime, cartoon, painting, drawing, illustration, manga, sketch, nudity, young, child, hairband, headband, horns, lowres, bad anatomy, bad hands, multiple eyebrow, (cropped), extra limb, missing limbs, deformed hands, long neck, long body, long torso, (bad hands), signature, username, artist name, conjoined fingers, deformed fingers, ugly eyes, imperfect eyes, skewed eyes, unnatural face, unnatural body, error, grain, jpeg artifacts",
      prompt:
        "realistic, photograph, (masterpiece), 8k quality, (detailed eyes:1.2), (highest quality:1.1), highly detailed, majestic, top quality, best quality, newest, ai-generated, (intricate details:1.1), extremely beautiful, elegant, majestic, immersive background+, (detailed face, perfect face),On the soft sand of a beach at sunset, a young couple walks holding hands, leaving footprints that blend with the waves that kiss the shore. The boy, in a linen shirt that flutters in the sea breeze, looks at the girl with a warm smile. She, wearing a light dress that reflects the pink tones of the sky, looks back with eyes bright with happiness. Around you, the world seems to stop, capturing a perfect moment of connection and serenity, full body,",
    },
  ],
  [FUNC_NAME.MERGE_FACE]: Array.from({ length: 5 }).map((_, i) => ({
    image_file: `/case/merge-face/case${i + 1}_2.png`,
    face_image_file: `/case/merge-face/case${i + 1}_1.png`,
  })),
  [FUNC_NAME.HUNYUAN_VIDEO_FAST]: [
    {
      seed: -1,
      prompt:
        "At the heart of a verdant forest, a playful otter dives into a crystal stream, sending ripples across the surface. Moments later, it pops up with water glistening on its sleek fur, bright eyes twinkling. Shot through a fish-eye lens, the scene's edges warp slightly, capturing both the otter's fluid motion and the forest's vibrant energy in intimate detail.",
      frames: 85,
    },
    {
      seed: -1,
      prompt:
        "A large sumo wrestler wearing a traditional mawashi (loincloth) performs a 360° tuck rotation from a 10-meter diving platform into a crystal-clear swimming pool. Despite his substantial size, the moment of entry creates only minimal splashes, creating a striking visual contrast. The athlete's expression shows intense focus, demonstrating a fusion of power and grace. The scene is set in an Olympic-style aquatics center, with dynamic camera movement and close-up shots.",
      frames: 85,
    },
  ],
  [FUNC_NAME.WAN_T2V]: [
    {
      seed: -1,
      prompt:
        "A large sumo wrestler wearing a traditional mawashi (loincloth) performs a 360° tuck rotation from a 10-meter diving platform into a crystal-clear swimming pool. Despite his substantial size, the moment of entry creates only minimal splashes, creating a striking visual contrast. The athlete's expression shows intense focus, demonstrating a fusion of power and grace. The scene is set in an Olympic-style aquatics center, with dynamic camera movement and close-up shots.",
      frames: 81,
    },
    {
      seed: -1,
      prompt:
        "At the heart of a verdant forest, a playful otter dives into a crystal stream, sending ripples across the surface. Moments later, it pops up with water glistening on its sleek fur, bright eyes twinkling. Shot through a fish-eye lens, the scene's edges warp slightly, capturing both the otter's fluid motion and the forest's vibrant energy in intimate detail.",
      frames: 81,
    },
  ],
  [FUNC_NAME.WAN_I2V]: [
    {
      seed: -1,
      image_url:
        "https://pub-f964a1c641c04024bce400ad128c8cd6.r2.dev/wan-i2v-input-image.jpg",
      prompt: "A cute panda is walking in the grassland slowly.",
    },
  ],
  [FUNC_NAME.WAN_2_6_T2V]: [
    {
      prompt:
        "A female detective with short blond hair, wearing a red trench coat, runs through city streets on a rainy night. The camera follows her from the side and behind, synchronizing her footsteps, the movement of her coat, raindrops, and reflections of lights. She finally stops under neon signs and looks up at the camera.",
    },
    {
      prompt:
        "In the early morning, a drone flies low across the surface of the sea, rapidly ascending after passing a nearby small island. The camera automatically shifts from shallow to deep depth of field, while the lighting gradually changes from orange-red to bluish tones.",
    },
  ],
  [FUNC_NAME.WAN_2_6_I2V]: [
    {
      image_url:
        "https://pub-f964a1c641c04024bce400ad128c8cd6.r2.dev/wan-i2v-input-image.jpg",
      prompt: "A cute panda is walking in the grassland slowly.",
    },
  ],
  [FUNC_NAME.WAN_2_6_V2V]: [
    {
      referenceVideoUrls: [
        "https://pub-f964a1c641c04024bce400ad128c8cd6.r2.dev/wan-2-6-v2v-input-01.mp4",
      ],
      prompt:
        "As the boy glides along on his skateboard, a lively and adorable dog runs by his side, sometimes speeding up and sometimes leaping, mirroring the boy's skateboarding moves in perfect sync. Their movements are fluid and rhythmically continuous throughout.",
    },
  ],
  [FUNC_NAME.KLING_V1_6_T2V]: [
    {
      mode: "Standard",
      prompt:
        "A cute dog standing up from a sitting position while wearing sunglasses",
      negative_prompt: "low quality",
      guidance_scale: 0.6,
    },
  ],
  [FUNC_NAME.KLING_V1_6_I2V]: [
    {
      mode: "Standard",
      image_url:
        "https://pub-f964a1c641c04024bce400ad128c8cd6.r2.dev/kling-v1.6-i2v-image",
      prompt:
        "A cute dog standing up from a sitting position while wearing sunglasses",
      negative_prompt: "low quality",
      guidance_scale: 0.65,
    },
  ],
  [FUNC_NAME.MINIMAX_VIDEO_01]: [
    {
      prompt: "A cute panda is walking in the grassland slowly",
      image_url:
        "https://pub-f964a1c641c04024bce400ad128c8cd6.r2.dev/minimax-video-01-image.jpg",
      enable_prompt_expansion: true,
    },
  ],
  [FUNC_NAME.MINIMAX_HAILUO_02]: [
    {
      prompt:
        "A gentleman leans on a retro-futuristic car under a streetlight, zooming out revealing classic design elements in a timeless, nostalgic style.",
      image_url:
        "https://doc-assets.novitai.com/minimax-hailuo-video-02-input-image.jpg",
      enable_prompt_expansion: true,
    },
  ],
  [FUNC_NAME.TXT2VIDEO]: [
    {
      model: "darkSushiMixMix_225D_64380.safetensors",
      prompts: [
        {
          prompt: "A girl, baby, portrait, 5 years old",
          frames: 16,
        },
        {
          prompt: "A girl, child, portrait, 10 years old",
          frames: 16,
        },
        {
          prompt: "A girl, teen, portrait, 20 years old",
          frames: 16,
        },
        {
          prompt: "A girl, woman, portrait, 30 years old",
          frames: 16,
        },
        {
          prompt: "A girl, woman, portrait, 50 years old",
          frames: 16,
        },
        {
          prompt: "A girl, old woman, portrait, 70 years old",
          frames: 16,
        },
      ],
    },
    {
      model: "darkSushiMixMix_225D_64380.safetensors",
      prompts: [
        {
          prompt: "Spider man, super hero, marvel, fighting",
          frames: 16,
        },
        {
          prompt: "Iron man, superhero, marvel, fighting",
          frames: 16,
        },
        {
          prompt: "Captain America, super hero, marvel, fighting",
          frames: 16,
        },
        {
          prompt: "Thor, super hero, marvel, fighting",
          frames: 16,
        },
        {
          prompt: "Hulk, super hero, marvel, fighting",
          frames: 16,
        },
        {
          prompt: "Black Widow, superhero, marvel, fighting",
          frames: 16,
        },
        {
          prompt: "Hawkeye, super hero, marvel, fighting",
          frames: 16,
        },
        {
          prompt: "War Machine, super hero, marvel, fighting",
          frames: 16,
        },
      ],
    },
    {
      model: "darkSushiMixMix_225D_64380.safetensors",
      prompts: [
        {
          prompt: "A portrait of a girl, upper body, 5 years old",
          frames: 16,
        },
        {
          prompt: "A portrait of a teen, school, upper body, 15 years old",
          frames: 16,
        },
        {
          prompt: "A portrait of a woman, business, upper body,  25 years old",
          frames: 16,
        },
        {
          prompt: "A portrait of a woman,  upper body, 45 years old",
          frames: 16,
        },
        {
          prompt: "A portrait of a old woman,  upper body, 70 years old",
          frames: 16,
        },
      ],
    },
    {
      model: "darkSushiMixMix_225D_64380.safetensors",
      prompts: [
        {
          prompt:
            "A portrait of a girl, child, upper body, 5 years old, masterpiece, best quality",
          frames: 16,
        },
        {
          prompt:
            "A portrait of a girl, teen, school, upper body, 15 years old",
          frames: 16,
        },
        {
          prompt:
            "A portrait of a woman, young, business, upper body,  25 years old",
          frames: 16,
        },
        {
          prompt:
            "A portrait of a woman, middle-aged, upper body, 45 years old",
          frames: 16,
        },
        {
          prompt:
            "A portrait of a woman, middle-aged and elderly,  upper body, 55 years old",
          frames: 16,
        },
        {
          prompt: "A portrait of an old woman,  upper body, 70 years old",
          frames: 16,
        },
      ],
    },
    {
      model: "darkSushiMixMix_225D_64380.safetensors",
      prompts: [
        {
          prompt:
            "A white light came on, a big earthquake broke out and the city began to collapse.",
          frames: 16,
        },
        {
          prompt:
            "The Daredevil appeared and ran to the depths of the ruins alone.",
          frames: 16,
        },
        {
          prompt: "Daredevil and Echo Fight",
          frames: 16,
        },
      ],
    },
  ],
  [FUNC_NAME.REMOVE_BACKGROUND]: [
    {
      img: "/case/remove-background/case1.png",
    },
    {
      img: "/case/remove-background/case2.jpg",
    },
    {
      img: "/case/remove-background/case3.png",
    },
    {
      img: "/case/remove-background/case4.jpg",
    },
    {
      img: "/case/remove-background/case5.png",
    },
  ],
};

export default defaultCases;
