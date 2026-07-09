-- dumpdates — question bank seed (45 questions, final)
-- Run this AFTER schema.sql creates the question_bank table.
-- Table shape (see schema.sql): id serial primary key, text text not null unique.
-- The unique constraint + "on conflict do nothing" below make this safe to
-- re-run — it won't create duplicate rows if run twice by accident.
-- Fallback logic: when a cycle's nomination pool locks empty,
-- pick 5 at random, e.g.:
--   select text from question_bank order by random() limit 5;

insert into question_bank (text) values
  ('What''s something small that made you happy this month?'),
  ('What''s on your nightstand right now?'),
  ('What have you been listening to on repeat lately?'),
  ('Show us the last photo you took (no cheating).'),
  ('What''s a tiny win you''re proud of this month?'),
  ('What''s the best thing you ate recently?'),
  ('What''s your current comfort watch or comfort read?'),
  ('What''s a place near you that you love right now?'),
  ('What''s something you''re looking forward to?'),
  ('What did your morning look like today?'),
  ('What''s a song that would go on this month''s soundtrack?'),
  ('What''s something you learned or figured out recently?'),
  ('Show us your view right now.'),
  ('What''s been your go-to snack lately?'),
  ('What made you laugh this month?'),
  ('What''s a small thing you want to do more of?'),
  ('What''s the most-used app on your phone this month? Be honest.'),
  ('What''s a memory from this month you want to keep?'),
  ('What''s something you''re weirdly into right now?'),
  ('If this month had a color, what would it be and why?'),
  ('What''s a small act of kindness you gave or received?'),
  ('What''s your current desktop or lock screen?'),
  ('What''s something you''ve been putting off (no judgment)?'),
  ('What''s the last thing that surprised you?'),
  ('Show us something in your space that has a story.'),
  ('What''s a habit or ritual getting you through lately?'),
  ('What would you tell yourself from the start of this month?'),
  ('What''s the best message or text you got recently?'),
  ('What''s something you want to remember about right now?'),
  ('What''s a tiny luxury you''ve been enjoying?'),
  ('Where did you go this month, even somewhere small?'),
  ('What''s a question you''ve been sitting with lately?'),
  ('What''s your current uniform (the thing you keep wearing)?'),
  ('What''s something you made or fixed recently?'),
  ('Who or what are you grateful for this month?'),
  ('What''s the vibe of your month in three words?'),
  ('What''s a recommendation you''d give the group right now?'),
  ('Show us your happy place this month.'),
  ('What''s something that felt hard but you got through?'),
  ('What''s the last thing you saved, screenshotted, or bookmarked?'),
  ('What''s a smell, taste, or sound that defined this month?'),
  ('What''s changed for you since last month?'),
  ('What''s a small thing you want to say to the group?'),
  ('What''s been living in your camera roll this month?'),
  ('What''s something you''re curious about right now?')
on conflict (text) do nothing;
