dump dates 🌱
A monthly zine for friends. Answer questions, share photos, read everyone's responses compiled into a little digital magazine.
what it does

question garden — a shared bank of prompts. add your own, generate ideas with AI, or pick from the suggestions. choose which ones go in this month's issue.
your answers — answer each question with text and/or a photo. answers save to the database.
read the zine — everyone's responses compiled into a browsable zine, with past issues saved on a shelf.

stack

Plain HTML/CSS/JS — no framework
Supabase for auth, database, and storage
Hosted on GitHub Pages

how friends join

Sign up at the site URL
On first login, choose "join with an invite code"
Get the 8-character invite code from someone already in the group (click your initials in the top right → "copy invite code")

database tables
tabledescriptiongroupsa friend groupgroup_memberswho's in each group, with display namesquestionsthe question gardenissuesone per monthissue_questionswhich questions are in each issueanswerseach person's responses
local development
Just open index.html in a browser — no build step needed.
to update the site
Replace index.html in this repo. GitHub Pages rebuilds automatically within a minute or two.
