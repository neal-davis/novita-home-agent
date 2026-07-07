/**
 * Configures which Playground parameters are shown and their order
 */
export const VISIBLE_PARAMETERS = [
  "prompt",
  "text",
  "style",
  "model",
  "model_name",
  "image_no",
  "task_id",
  "remix_prompt",
  "type",
  "url",
  "images",
  "image",
  "image_urls",
  "img_url",
  "image_base64s",
  "end_image_url",
  "end_image",
  "audio",
  "audio_url",
  "reference_video_urls",
  "mode",
  "fast_mode",
  "num_images",
  "duration",
  "size",
  "width",
  "height",
  "scale",
  "speed",
  "quality",
  "resolution",
  "max_images",
  "n",
  "steps",
  "aspect_ratio",
  "loras",
  "mask",
  "area",
  "watermark",
  "watermark_enabled",
  "seed",
];

/**
 * Hidden parameters; used to exclude sub-parameters from VISIBLE_PARAMETERS in specific scenarios
 */
export const HIDDEN_PARAMETERS = [
  "sequential_image_generation_options.max_images",
  "voice_settings.style",
];
