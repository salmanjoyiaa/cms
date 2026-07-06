-- System prompt templates (workspace_id NULL = global system templates)
INSERT INTO prompt_templates (workspace_id, category, name, description, template, variables, is_system) VALUES
(NULL, 'research', 'Trend Research', 'Research trending topics for a niche',
'You are a viral content research analyst. Research trending topics for the niche: {{channel.niche}}.
Target audience: {{target_audience}}
Language: {{language}}

Return a JSON array of 5 topics with: topic, trend_score (0-100), monetization_score (0-100), competition_score (0-100), difficulty_score (0-100), suggested_platform, suggested_format, rationale.',
'["channel.niche", "target_audience", "language"]'::jsonb, true),

(NULL, 'brief', 'Content Brief', 'Generate a content brief from approved topic',
'Create a detailed content brief for:
Topic: {{topic}}
Channel: {{channel.name}} ({{channel.niche}})
Target audience: {{channel.target_audience}}
Brand style: {{channel.brand_style}}
Language: {{language}}

Include: title, summary, target_audience, key_points (array), tone, call_to_action.
Return as JSON.',
'["topic", "channel.name", "channel.niche", "channel.target_audience", "channel.brand_style", "language"]'::jsonb, true),

(NULL, 'script', 'Video Script', 'Generate short-form video script',
'Write a viral short-form video script for:
Topic: {{topic}}
Hook style: attention-grabbing, first 3 seconds critical
Duration: 30-60 seconds
Platform: {{platform}}
Language: {{language}}
Brand tone: {{channel.brand_style}}

Return JSON with: hook, script_body, caption, hashtags (array), voiceover_script, duration_seconds.',
'["topic", "platform", "language", "channel.brand_style"]'::jsonb, true),

(NULL, 'blog', 'SEO Blog Post', 'Generate SEO-optimized blog article',
'Write a comprehensive SEO blog article:
Topic: {{topic}}
Title suggestion: {{title}}
Target keywords: {{topic}}
Language: {{language}}
Tone: professional yet engaging

Return JSON with: title, meta_title, meta_description, slug, content (markdown), tags (array), category.',
'["topic", "title", "language"]'::jsonb, true),

(NULL, 'caption', 'Social Caption', 'Generate platform caption',
'Write an engaging social media caption for {{platform}}:
Topic: {{topic}}
Script hook: {{hook}}
Language: {{language}}
Include CTA. Max 2200 chars for Instagram, shorter for TikTok.',
'["platform", "topic", "hook", "language"]'::jsonb, true),

(NULL, 'hashtag', 'Hashtag Generator', 'Generate relevant hashtags',
'Generate 15-20 relevant hashtags for:
Topic: {{topic}}
Platform: {{platform}}
Niche: {{channel.niche}}
Mix popular and niche-specific tags. Return JSON array.',
'["topic", "platform", "channel.niche"]'::jsonb, true),

(NULL, 'image_prompt', 'Image Prompt', 'Generate image generation prompts',
'Create detailed image prompts for AI image generation:
Topic: {{topic}}
Style: {{channel.brand_style}}
Use case: {{use_case}}

Return JSON with: thumbnail_prompt, scene_prompts (array).',
'["topic", "channel.brand_style", "use_case"]'::jsonb, true),

(NULL, 'storyboard', 'Video Storyboard', 'Generate scene-by-scene storyboard',
'Create a scene-by-scene video storyboard for:
Script: {{script_body}}
Duration: {{duration_seconds}} seconds
Platform: {{platform}}

Return JSON array of scenes with: scene_number, duration_seconds, visual_description, narration, image_prompt.',
'["script_body", "duration_seconds", "platform"]'::jsonb, true),

(NULL, 'voiceover', 'Voiceover Script', 'Generate voiceover narration',
'Convert this script into a natural voiceover narration script:
{{script_body}}

Add pacing notes, emphasis markers. Language: {{language}}.
Return plain text optimized for TTS.',
'["script_body", "language"]'::jsonb, true);
